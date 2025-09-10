"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

interface VoteResult {
  choice: string;
  count: number;
  percentage: number;
}

interface PollResults {
  poll: {
    id: string;
    room_id: string;
    question: string;
    poll_type: string;
    options: Record<string, string | number>;
    is_active: boolean;
    created_at: string;
  };
  results: VoteResult[];
  totalVotes: number;
}

export function useRealtimeVotes(pollId: string) {
  const [results, setResults] = useState<PollResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResults = useCallback(async () => {
    try {
      const response = await fetch(`/api/polls/${pollId}/results`);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to fetch results");
      }

      setResults(result.data);
      setError(null);
    } catch (error) {
      console.error("Error fetching results:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load results"
      );
    } finally {
      setLoading(false);
    }
  }, [pollId]);

  useEffect(() => {
    if (!pollId) return;

    // Initial fetch
    fetchResults();

    // Set up real-time subscription
    const realtimeChannel = supabase
      .channel(`poll-votes-${pollId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "votes",
          filter: `poll_id=eq.${pollId}`,
        },
        (payload) => {
          console.log("New vote received:", payload);
          // Refetch results when a new vote is added
          fetchResults();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "votes",
          filter: `poll_id=eq.${pollId}`,
        },
        (payload) => {
          console.log("Vote updated:", payload);
          // Refetch results when a vote is updated
          fetchResults();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "votes",
          filter: `poll_id=eq.${pollId}`,
        },
        (payload) => {
          console.log("Vote deleted:", payload);
          // Refetch results when a vote is deleted
          fetchResults();
        }
      )
      .subscribe((status) => {
        console.log("Realtime subscription status:", status);
        if (status === "SUBSCRIBED") {
          console.log("Successfully subscribed to real-time vote updates");
        } else if (status === "CHANNEL_ERROR") {
          console.error("Error subscribing to real-time updates");
          setError("Failed to connect to real-time updates");
        }
      });

    // Cleanup function
    return () => {
      console.log("Cleaning up real-time subscription");
      realtimeChannel.unsubscribe();
    };
  }, [pollId, fetchResults]);

  return {
    results,
    loading,
    error,
    refetch: fetchResults,
  };
}
