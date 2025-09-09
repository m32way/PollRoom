import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { generateRoomCode, getRoomExpirationTime } from "@/lib/utils";
import { SessionManager } from "@/lib/kv";

export async function POST(request: NextRequest) {
  try {
    console.log("🏠 Creating new room...");

    // Parse request body
    const body = await request.json();
    const { name } = body;

    // Validate input
    if (name && typeof name !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid input",
          details: "Room name must be a string",
        },
        { status: 400 }
      );
    }

    // Generate unique room code with collision detection
    let roomCode: string;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      roomCode = generateRoomCode();
      attempts++;

      // Check if room code already exists
      const { data: existingRoom } = await supabase
        .from("rooms")
        .select("code")
        .eq("code", roomCode)
        .single();

      if (!existingRoom) {
        break; // Room code is unique
      }

      if (attempts >= maxAttempts) {
        return NextResponse.json(
          {
            success: false,
            error: "Room creation failed",
            details: "Unable to generate unique room code after multiple attempts",
          },
          { status: 500 }
        );
      }
    } while (attempts < maxAttempts);

    // Create room with 24-hour expiration
    const expiresAt = getRoomExpirationTime();

    const { data: room, error } = await supabase
      .from("rooms")
      .insert({
        code: roomCode,
        name: name || null,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Database error creating room:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Database error",
          details: "Failed to create room in database",
        },
        { status: 500 }
      );
    }

    // Create session for room creator
    const sessionId = request.headers.get("x-session-id") || crypto.randomUUID();
    await SessionManager.createSession(sessionId, {
      roomCode: roomCode,
      role: "creator",
    });

    console.log(`✅ Room created successfully: ${roomCode}`);

    return NextResponse.json(
      {
        success: true,
        data: {
          id: room.id,
          code: room.code,
          name: room.name,
          created_at: room.created_at,
          expires_at: room.expires_at,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating room:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: "An unexpected error occurred while creating the room",
      },
      { status: 500 }
    );
  }
}
