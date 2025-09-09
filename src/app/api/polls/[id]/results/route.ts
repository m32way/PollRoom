import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log(`📊 Getting results for poll: ${id}`);

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

    // Look up poll and validate it exists
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

    // Get all votes for this poll
    const { data: votes, error: votesError } = await supabase
      .from("votes")
      .select("choice, created_at")
      .eq("poll_id", id);

    if (votesError) {
      console.error("Database error getting votes:", votesError);
      return NextResponse.json(
        {
          success: false,
          error: "Database error",
          details: "Failed to get poll results from database",
        },
        { status: 500 }
      );
    }

    // Calculate results
    const options = poll.options as Record<string, string | number>;
    const totalVotes = votes.length;
    
    // Initialize vote counts for all options
    const voteCounts: Record<string, number> = {};
    const votePercentages: Record<string, number> = {};
    
    // Initialize based on poll type
    switch (poll.poll_type) {
      case 'yes_no':
        voteCounts['yes'] = 0;
        voteCounts['no'] = 0;
        votePercentages['yes'] = 0;
        votePercentages['no'] = 0;
        break;
      case 'rating':
        const min = Number(options.min) || 1;
        const max = Number(options.max) || 5;
        for (let i = min; i <= max; i++) {
          const key = i.toString();
          voteCounts[key] = 0;
          votePercentages[key] = 0;
        }
        break;
      case 'multiple_choice':
        Object.keys(options).forEach(option => {
          voteCounts[option] = 0;
          votePercentages[option] = 0;
        });
        break;
      default:
        Object.keys(options).forEach(option => {
          voteCounts[option] = 0;
          votePercentages[option] = 0;
        });
    }

    // Count votes
    votes.forEach(vote => {
      if (voteCounts.hasOwnProperty(vote.choice)) {
        voteCounts[vote.choice]++;
      }
    });

    // Calculate percentages
    if (totalVotes > 0) {
      Object.keys(voteCounts).forEach(option => {
        votePercentages[option] = Math.round((voteCounts[option] / totalVotes) * 100);
      });
    }

    // Format results based on poll type
    let formattedResults: Record<string, { label: string; count: number; percentage: number }> = {};

    switch (poll.poll_type) {
      case 'yes_no':
        formattedResults = {
          yes: {
            label: String(options.yes || 'Yes'),
            count: voteCounts.yes || 0,
            percentage: votePercentages.yes || 0
          },
          no: {
            label: String(options.no || 'No'),
            count: voteCounts.no || 0,
            percentage: votePercentages.no || 0
          }
        };
        break;
        
      case 'rating':
        formattedResults = {};
        const min = Number(options.min) || 1;
        const max = Number(options.max) || 5;
        
        for (let i = min; i <= max; i++) {
          const key = i.toString();
          formattedResults[key] = {
            label: i.toString(),
            count: voteCounts[key] || 0,
            percentage: votePercentages[key] || 0
          };
        }
        break;
        
      case 'multiple_choice':
        formattedResults = {};
        Object.keys(options).forEach(option => {
          formattedResults[option] = {
            label: String(options[option]),
            count: voteCounts[option] || 0,
            percentage: votePercentages[option] || 0
          };
        });
        break;
        
      default:
        formattedResults = {};
        Object.keys(options).forEach(option => {
          formattedResults[option] = {
            label: String(options[option]),
            count: voteCounts[option] || 0,
            percentage: votePercentages[option] || 0
          };
        });
    }

    console.log(`✅ Results calculated for poll: ${id} (${totalVotes} votes)`);

    return NextResponse.json({
      success: true,
      data: {
        poll_id: id,
        question: poll.question,
        poll_type: poll.poll_type,
        total_votes: totalVotes,
        results: formattedResults,
        last_updated: new Date().toISOString(),
        room: {
          id: poll.rooms.id,
          code: poll.rooms.code,
          name: poll.rooms.name,
        },
      },
    });
  } catch (error) {
    console.error("Error getting poll results:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: "An unexpected error occurred while getting poll results",
      },
      { status: 500 }
    );
  }
}
