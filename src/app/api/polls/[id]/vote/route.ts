import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { SessionManager } from "@/lib/kv";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log(`🗳️ Processing vote for poll: ${id}`);

    // Parse request body
    const body = await request.json();
    const { choice } = body;

    // Validate poll ID format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid poll ID",
          details: "Poll ID must be a valid UUID",
        },
        { status: 400 }
      );
    }

    // Validate choice
    if (!choice || typeof choice !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid choice",
          details: "Choice is required and must be a string",
        },
        { status: 400 }
      );
    }

    // Get session ID
    const sessionId = request.headers.get("x-session-id") || crypto.randomUUID();

    // Look up poll and validate it exists and is active
    const { data: poll, error: pollError } = await supabase
      .from("polls")
      .select(`
        *,
        rooms!inner(
          id,
          code,
          name,
          expires_at
        )
      `)
      .eq("id", id)
      .single();

    if (pollError) {
      if (pollError.code === "PGRST116") {
        return NextResponse.json(
          {
            success: false,
            error: "Poll not found",
            details: "No poll exists with this ID",
          },
          { status: 404 }
        );
      }

      console.error("Database error looking up poll:", pollError);
      return NextResponse.json(
        {
          success: false,
          error: "Database error",
          details: "Failed to look up poll in database",
        },
        { status: 500 }
      );
    }

    // Check if poll is active
    if (!poll.is_active) {
      return NextResponse.json(
        {
          success: false,
          error: "Poll inactive",
          details: "This poll is no longer accepting votes",
        },
        { status: 410 }
      );
    }

    // Check if room has expired
    const now = new Date();
    if (!poll.rooms.expires_at) {
      return NextResponse.json(
        {
          success: false,
          error: "Room expired",
          details: "The room containing this poll has expired",
        },
        { status: 410 }
      );
    }
    
    const roomExpiresAt = new Date(poll.rooms.expires_at);
    if (now > roomExpiresAt) {
      return NextResponse.json(
        {
          success: false,
          error: "Room expired",
          details: "The room containing this poll has expired",
        },
        { status: 410 }
      );
    }

    // Validate choice against poll options
    const options = poll.options as Record<string, string | number>;
    let validChoices: string[] = [];
    
    switch (poll.poll_type) {
      case 'yes_no':
        validChoices = ['yes', 'no'];
        break;
      case 'rating':
        const min = Number(options.min) || 1;
        const max = Number(options.max) || 5;
        validChoices = [];
        for (let i = min; i <= max; i++) {
          validChoices.push(i.toString());
        }
        break;
      case 'multiple_choice':
        validChoices = Object.keys(options);
        break;
      default:
        validChoices = Object.keys(options);
    }
    
    if (!validChoices.includes(choice)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid choice",
          details: `Choice must be one of: ${validChoices.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Check if user has already voted (deduplication)
    const { data: existingVote, error: voteCheckError } = await supabase
      .from("votes")
      .select("id")
      .eq("poll_id", id)
      .eq("session_id", sessionId)
      .single();

    if (voteCheckError && voteCheckError.code !== "PGRST116") {
      console.error("Database error checking existing vote:", voteCheckError);
      return NextResponse.json(
        {
          success: false,
          error: "Database error",
          details: "Failed to check existing vote",
        },
        { status: 500 }
      );
    }

    if (existingVote) {
      return NextResponse.json(
        {
          success: false,
          error: "Already voted",
          details: "You have already voted on this poll",
        },
        { status: 409 } // Conflict
      );
    }

    // Create vote
    const { data: vote, error: voteError } = await supabase
      .from("votes")
      .insert({
        poll_id: id,
        session_id: sessionId,
        choice: choice,
      })
      .select()
      .single();

    if (voteError) {
      console.error("Database error creating vote:", voteError);
      return NextResponse.json(
        {
          success: false,
          error: "Database error",
          details: "Failed to create vote in database",
        },
        { status: 500 }
      );
    }

    // Update session with room information
    await SessionManager.createSession(sessionId, {
      roomCode: poll.rooms.code,
      role: "participant",
    });

    console.log(`✅ Vote recorded successfully: ${vote.id}`);

    return NextResponse.json(
      {
        success: true,
        data: {
          id: vote.id,
          poll_id: vote.poll_id,
          choice: vote.choice,
          created_at: vote.created_at,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error processing vote:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: "An unexpected error occurred while processing the vote",
      },
      { status: 500 }
    );
  }
}
