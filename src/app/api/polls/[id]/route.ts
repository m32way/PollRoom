import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { SessionManager } from "@/lib/kv";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log(`🔍 Looking up poll: ${id}`);

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

    // Look up poll in database
    const { data: poll, error } = await supabase
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

    if (error) {
      if (error.code === "PGRST116") {
        // No rows returned
        return NextResponse.json(
          {
            success: false,
            error: "Poll not found",
            details: "No poll exists with this ID",
          },
          { status: 404 }
        );
      }

      console.error("Database error looking up poll:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Database error",
          details: "Failed to look up poll in database",
        },
        { status: 500 }
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
        { status: 410 } // Gone
      );
    }

    // Create or update session for poll viewer
    const sessionId = request.headers.get("x-session-id") || crypto.randomUUID();
    await SessionManager.createSession(sessionId, {
      roomCode: poll.rooms.code,
      role: "participant",
    });

    console.log(`✅ Poll found: ${id}`);

    return NextResponse.json({
      success: true,
      data: {
        id: poll.id,
        room_id: poll.room_id,
        question: poll.question,
        poll_type: poll.poll_type,
        options: poll.options,
        is_active: poll.is_active,
        created_at: poll.created_at,
        room: {
          id: poll.rooms.id,
          code: poll.rooms.code,
          name: poll.rooms.name,
          expires_at: poll.rooms.expires_at,
        },
      },
    });
  } catch (error) {
    console.error("Error looking up poll:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: "An unexpected error occurred while looking up the poll",
      },
      { status: 500 }
    );
  }
}
