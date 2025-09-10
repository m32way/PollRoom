"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { PollType, PollOptions } from "@/app/api/polls/create/route";

interface Poll {
  id: string;
  room_id: string;
  question: string;
  poll_type: PollType;
  options: PollOptions;
  is_active: boolean;
  created_at: string;
}

interface VoteRequest {
  pollId: string;
  choice: string;
}

export default function PollVotingPage() {
  const params = useParams();
  const pollId = params.id as string;

  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [voting, setVoting] = useState(false);
  const [voteError, setVoteError] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);

  const fetchPoll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/polls/${pollId}`);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to fetch poll");
      }

      setPoll(result.data);
    } catch (error) {
      console.error("Error fetching poll:", error);
      setError(error instanceof Error ? error.message : "Failed to load poll");
    } finally {
      setLoading(false);
    }
  }, [pollId]);

  useEffect(() => {
    if (pollId) {
      fetchPoll();
    }
  }, [pollId, fetchPoll]);

  const handleVote = async (choice: string) => {
    if (!poll || hasVoted) return;

    try {
      setVoting(true);
      setVoteError(null);
      setSelectedChoice(choice);

      const voteData: VoteRequest = {
        pollId: poll.id,
        choice: choice,
      };

      const response = await fetch(`/api/polls/${poll.id}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(voteData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to submit vote");
      }

      setHasVoted(true);
    } catch (error) {
      console.error("Error voting:", error);
      setVoteError(
        error instanceof Error ? error.message : "Failed to submit vote"
      );
      setSelectedChoice(null);
    } finally {
      setVoting(false);
    }
  };

  const renderVotingInterface = () => {
    if (!poll) return null;

    switch (poll.poll_type) {
      case "yes_no":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleVote("yes")}
                disabled={voting || hasVoted}
                className={`p-6 rounded-lg border-2 transition-all ${
                  selectedChoice === "yes"
                    ? "border-green-500 bg-green-50 text-green-700"
                    : hasVoted
                    ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                    : "border-gray-300 hover:border-green-500 hover:bg-green-50"
                }`}
              >
                <div className="text-4xl mb-2">✅</div>
                <div className="font-semibold">{poll.options.yes || "Yes"}</div>
              </button>
              <button
                onClick={() => handleVote("no")}
                disabled={voting || hasVoted}
                className={`p-6 rounded-lg border-2 transition-all ${
                  selectedChoice === "no"
                    ? "border-red-500 bg-red-50 text-red-700"
                    : hasVoted
                    ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                    : "border-gray-300 hover:border-red-500 hover:bg-red-50"
                }`}
              >
                <div className="text-4xl mb-2">❌</div>
                <div className="font-semibold">{poll.options.no || "No"}</div>
              </button>
            </div>
          </div>
        );

      case "rating":
        const min = poll.options.min || 1;
        const max = poll.options.max || 5;
        const ratingOptions = Array.from(
          { length: max - min + 1 },
          (_, i) => min + i
        );

        return (
          <div className="space-y-4">
            <div className="grid grid-cols-5 gap-3">
              {ratingOptions.map((rating) => (
                <button
                  key={rating}
                  onClick={() => handleVote(rating.toString())}
                  disabled={voting || hasVoted}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedChoice === rating.toString()
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : hasVoted
                      ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                      : "border-gray-300 hover:border-blue-500 hover:bg-blue-50"
                  }`}
                >
                  <div className="text-2xl font-bold">{rating}</div>
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-600 text-center">
              Rate from {min} to {max}
            </p>
          </div>
        );

      case "multiple_choice":
        const options = Object.entries(poll.options).filter(
          ([_, value]) => value
        );
        const optionLetters = ["A", "B", "C", "D", "E"];

        return (
          <div className="space-y-3">
            {options.map(([key, value], index) => (
              <button
                key={key}
                onClick={() => handleVote(key)}
                disabled={voting || hasVoted}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  selectedChoice === key
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : hasVoted
                    ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                    : "border-gray-300 hover:border-blue-500 hover:bg-blue-50"
                }`}
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center mr-3 text-sm font-bold">
                    {optionLetters[index]}
                  </div>
                  <div className="font-medium">{value}</div>
                </div>
              </button>
            ))}
          </div>
        );

      default:
        return <div>Unsupported poll type</div>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading poll...</p>
        </div>
      </div>
    );
  }

  if (error || !poll) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Poll Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            {error || "The poll you're looking for doesn't exist."}
          </p>
          <Link
            href="/"
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {poll.question}
          </h1>
          <p className="text-sm text-gray-500">
            Poll Type: {poll.poll_type.replace("_", " ")} • Created:{" "}
            {new Date(poll.created_at).toLocaleString()}
          </p>
        </div>

        {/* Voting Interface */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          {hasVoted ? (
            <div className="text-center">
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Vote Submitted!
              </h2>
              <p className="text-gray-600 mb-6">
                Thank you for participating in this poll.
              </p>
              <div className="flex gap-3 justify-center">
                <Link
                  href={`/poll/${poll.id}/results`}
                  className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors"
                >
                  View Results
                </Link>
                <Link
                  href="/"
                  className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 transition-colors"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-gray-900 mb-6 text-center">
                Cast Your Vote
              </h2>

              {renderVotingInterface()}

              {voting && (
                <div className="mt-6 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600">
                    Submitting your vote...
                  </p>
                </div>
              )}

              {voteError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{voteError}</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Navigation */}
        <div className="mt-6 text-center">
          <Link href="/" className="text-blue-600 hover:text-blue-700 text-sm">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
