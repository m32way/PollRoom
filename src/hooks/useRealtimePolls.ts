"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

interface Poll {
  id: string;
  room_id: string;
  question: string;
  poll_type: string;
  options: Record<string, string | number>;
  is_active: boolean;
  created_at: string;
}

export function useRealtimePolls(roomId: string) {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPolls = useCallback(async () => {
    try {
      // We need to get the room code first to use the existing API
      const roomResponse = await fetch(`/api/rooms/${roomId}`);
      const roomResult = await roomResponse.json();

      if (!roomResponse.ok || !roomResult.success) {
        throw new Error(roomResult.error || "Failed to fetch room");
      }

      const pollsResponse = await fetch(`/api/rooms/${roomId}/polls`);
      const pollsResult = await pollsResponse.json();

      if (pollsResponse.ok && pollsResult.success) {
        setPolls(pollsResult.data || []);
      } else {
        throw new Error(pollsResult.error || "Failed to fetch polls");
      }

      setError(null);
    } catch (error) {
      console.error("Error fetching polls:", error);
      setError(error instanceof Error ? error.message : "Failed to load polls");
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    if (!roomId) return;

    // Initial fetch
    fetchPolls();

    // Set up real-time subscription for polls
    const realtimeChannel = supabase
      .channel(`room-polls-${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "polls",
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          console.log("New poll created:", payload);
          // Add the new poll to the list
          setPolls((prev) => [payload.new as Poll, ...prev]);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "polls",
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          console.log("Poll updated:", payload);
          // Update the poll in the list
          setPolls((prev) =>
            prev.map((poll) =>
              poll.id === payload.new.id ? (payload.new as Poll) : poll
            )
          );
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "polls",
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          console.log("Poll deleted:", payload);
          // Remove the poll from the list
          setPolls((prev) => prev.filter((poll) => poll.id !== payload.old.id));
        }
      )
      .subscribe((status) => {
        console.log("Realtime polls subscription status:", status);
        if (status === "SUBSCRIBED") {
          console.log("Successfully subscribed to real-time poll updates");
        } else if (status === "CHANNEL_ERROR") {
          console.error("Error subscribing to real-time poll updates");
          setError("Failed to connect to real-time updates");
        }
      });

    // Cleanup function
    return () => {
      console.log("Cleaning up real-time polls subscription");
      realtimeChannel.unsubscribe();
    };
  }, [roomId, fetchPolls]);

  return {
    polls,
    loading,
    error,
    refetch: fetchPolls,
  };
}
