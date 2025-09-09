import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { SessionManager } from "@/lib/kv";

// Poll type definitions
export type PollType = 'yes_no' | 'rating' | 'multiple_choice';

export interface PollOptions {
  // For yes_no polls
  yes?: string;
  no?: string;
  
  // For rating polls
  min?: number;
  max?: number;
  
  // For multiple choice polls
  a?: string;
  b?: string;
  c?: string;
  d?: string;
  e?: string;
  
  // Index signature for JSON compatibility
  [key: string]: string | number | undefined;
}

export interface CreatePollRequest {
  roomId: string;
  question: string;
  pollType: PollType;
  options: PollOptions | null;
}

export async function POST(request: NextRequest) {
  try {
    console.log("📊 Creating new poll...");

    // Parse request body
    const body: CreatePollRequest = await request.json();
    const { roomId, question, pollType, options } = body;

    // Validate required fields
    if (!roomId || !question || !pollType) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid input",
          details: "roomId, question, and pollType are required",
        },
        { status: 400 }
      );
    }

    // Validate poll type
    const validPollTypes: PollType[] = ['yes_no', 'rating', 'multiple_choice'];
    if (!validPollTypes.includes(pollType)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid poll type",
          details: "pollType must be one of: yes_no, rating, multiple_choice",
        },
        { status: 400 }
      );
    }

    // Validate options based on poll type
    let validatedOptions: PollOptions;
    
    switch (pollType) {
      case 'yes_no':
        validatedOptions = {
          yes: options?.yes || 'Yes',
          no: options?.no || 'No'
        };
        break;
        
      case 'rating':
        if (!options?.min || !options?.max) {
          return NextResponse.json(
            {
              success: false,
              error: "Invalid options",
              details: "rating polls require min and max values",
            },
            { status: 400 }
          );
        }
        if (options.min >= options.max) {
          return NextResponse.json(
            {
              success: false,
              error: "Invalid options",
              details: "min value must be less than max value",
            },
            { status: 400 }
          );
        }
        validatedOptions = {
          min: options.min,
          max: options.max
        };
        break;
        
      case 'multiple_choice':
        if (!options || Object.keys(options).length < 2) {
          return NextResponse.json(
            {
              success: false,
              error: "Invalid options",
              details: "multiple_choice polls require at least 2 options",
            },
            { status: 400 }
          );
        }
        validatedOptions = options;
        break;
        
      default:
        return NextResponse.json(
          {
            success: false,
            error: "Invalid poll type",
            details: "Unknown poll type",
          },
          { status: 400 }
        );
    }

    // Verify room exists
    const { data: room, error: roomError } = await supabase
      .from("rooms")
      .select("id, code")
      .eq("id", roomId)
      .single();

    if (roomError || !room) {
      return NextResponse.json(
        {
          success: false,
          error: "Room not found",
          details: "The specified room does not exist",
        },
        { status: 404 }
      );
    }

    // Create poll
    const { data: poll, error } = await supabase
      .from("polls")
      .insert({
        room_id: roomId,
        question: question.trim(),
        poll_type: pollType,
        options: validatedOptions,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error("Database error creating poll:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Database error",
          details: "Failed to create poll in database",
        },
        { status: 500 }
      );
    }

    // Create session for poll creator
    const sessionId = request.headers.get("x-session-id") || crypto.randomUUID();
    await SessionManager.createSession(sessionId, {
      roomCode: room.code,
      role: "creator",
    });

    console.log(`✅ Poll created successfully: ${poll.id}`);

    return NextResponse.json(
      {
        success: true,
        data: {
          id: poll.id,
          room_id: poll.room_id,
          question: poll.question,
          poll_type: poll.poll_type,
          options: poll.options,
          is_active: poll.is_active,
          created_at: poll.created_at,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating poll:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: "An unexpected error occurred while creating the poll",
      },
      { status: 500 }
    );
  }
}
