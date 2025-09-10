import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    console.log(`📊 Fetching polls for room: ${code}`);

    // First, verify the room exists
    const { data: room, error: roomError } = await supabase
      .from("rooms")
      .select("id, code, expires_at")
      .eq("code", code.toUpperCase())
      .single();

    if (roomError || !room) {
      return NextResponse.json(
        {
          success: false,
          error: "Room not found",
          details: "The specified room does not exist or has expired",
        },
        { status: 404 }
      );
    }

    // Check if room has expired
    const now = new Date();
    if (!room.expires_at) {
      return NextResponse.json(
        {
          success: false,
          error: "Room expired",
          details: "This room has expired and is no longer accessible",
        },
        { status: 410 }
      );
    }
    const expiresAt = new Date(room.expires_at);
    if (now > expiresAt) {
      return NextResponse.json(
        {
          success: false,
          error: "Room expired",
          details: "This room has expired and is no longer accessible",
        },
        { status: 410 }
      );
    }

    // Fetch polls for this room
    const { data: polls, error } = await supabase
      .from("polls")
      .select("*")
      .eq("room_id", room.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Database error fetching polls:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Database error",
          details: "Failed to fetch polls from database",
        },
        { status: 500 }
      );
    }

    console.log(`✅ Found ${polls?.length || 0} polls for room ${code}`);

    return NextResponse.json(
      {
        success: true,
        data: polls || [],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching polls:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: "An unexpected error occurred while fetching polls",
      },
      { status: 500 }
    );
  }
}
