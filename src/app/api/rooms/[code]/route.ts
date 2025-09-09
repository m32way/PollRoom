import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { SessionManager } from "@/lib/kv";
import { validateRoomCode, normalizeRoomCode, isRoomExpired } from "@/lib/utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    console.log(`🔍 Looking up room: ${code}`);

    // Validate room code format
    if (!validateRoomCode(code)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid room code",
          details: "Room code must be exactly 6 alphanumeric characters",
        },
        { status: 400 }
      );
    }

    const normalizedCode = normalizeRoomCode(code);

    // Look up room in database
    const { data: room, error } = await supabase
      .from("rooms")
      .select("*")
      .eq("code", normalizedCode)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No rows returned
        return NextResponse.json(
          {
            success: false,
            error: "Room not found",
            details: "No room exists with this code",
          },
          { status: 404 }
        );
      }

      console.error("Database error looking up room:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Database error",
          details: "Failed to look up room in database",
        },
        { status: 500 }
      );
    }

    // Check if room has expired
    if (isRoomExpired(room.expires_at)) {
      return NextResponse.json(
        {
          success: false,
          error: "Room expired",
          details: "This room has expired and is no longer accessible",
        },
        { status: 410 } // Gone
      );
    }

    // Create or update session for room visitor
    const sessionId = request.headers.get("x-session-id") || crypto.randomUUID();
    await SessionManager.createSession(sessionId, {
      roomCode: normalizedCode,
      role: "participant",
    });

    console.log(`✅ Room found: ${code}`);

    return NextResponse.json({
      success: true,
      data: {
        id: room.id,
        code: room.code,
        name: room.name,
        created_at: room.created_at,
        expires_at: room.expires_at,
        is_expired: false,
      },
    });
  } catch (error) {
    console.error("Error looking up room:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: "An unexpected error occurred while looking up the room",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    console.log(`🗑️ Deleting room: ${code}`);

    // Validate room code format
    if (!validateRoomCode(code)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid room code",
          details: "Room code must be exactly 6 alphanumeric characters",
        },
        { status: 400 }
      );
    }

    const normalizedCode = normalizeRoomCode(code);

    // Check if room exists
    const { data: room, error: lookupError } = await supabase
      .from("rooms")
      .select("id, code")
      .eq("code", normalizedCode)
      .single();

    if (lookupError) {
      if (lookupError.code === "PGRST116") {
        return NextResponse.json(
          {
            success: false,
            error: "Room not found",
            details: "No room exists with this code",
          },
          { status: 404 }
        );
      }

      console.error("Database error looking up room for deletion:", lookupError);
      return NextResponse.json(
        {
          success: false,
          error: "Database error",
          details: "Failed to look up room in database",
        },
        { status: 500 }
      );
    }

    // Delete room and all associated data
    const { error: deleteError } = await supabase
      .from("rooms")
      .delete()
      .eq("id", room.id);

    if (deleteError) {
      console.error("Database error deleting room:", deleteError);
      return NextResponse.json(
        {
          success: false,
          error: "Database error",
          details: "Failed to delete room from database",
        },
        { status: 500 }
      );
    }

    console.log(`✅ Room deleted successfully: ${code}`);

    return NextResponse.json({
      success: true,
      message: "Room deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting room:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: "An unexpected error occurred while deleting the room",
      },
      { status: 500 }
    );
  }
}
