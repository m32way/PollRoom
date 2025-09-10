"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { PollType, PollOptions } from "@/app/api/polls/create/route";
import { useRealtimePolls } from "@/hooks/useRealtimePolls";

interface Room {
  id: string;
  code: string;
  name?: string;
  expires_at: string;
}

interface CreatePollRequest {
  roomId: string;
  question: string;
  pollType: PollType;
  options: PollOptions | null;
}

export default function RoomPage() {
  const params = useParams();
  const roomCode = params.code as string;

  const [room, setRoom] = useState<Room | null>(null);
  const [roomLoading, setRoomLoading] = useState(true);
  const [roomError, setRoomError] = useState<string | null>(null);

  // Use real-time polls hook
  const { polls, refetch: refetchPolls } = useRealtimePolls(room?.id || "");

  // Poll creation state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createValidationError, setCreateValidationError] = useState<
    string | null
  >(null);

  // Form state
  const [pollType, setPollType] = useState<PollType>("yes_no");
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<PollOptions>({});

  useEffect(() => {
    if (roomCode) {
      fetchRoomData();
    }
  }, [roomCode]);

  const fetchRoomData = useCallback(async () => {
    try {
      setRoomLoading(true);
      setRoomError(null);

      // Fetch room details
      const roomResponse = await fetch(`/api/rooms/${roomCode}`);
      const roomResult = await roomResponse.json();

      if (!roomResponse.ok || !roomResult.success) {
        throw new Error(roomResult.error || "Failed to fetch room");
      }

      setRoom(roomResult.data);
    } catch (error) {
      console.error("Error fetching room data:", error);
      setRoomError(
        error instanceof Error ? error.message : "Failed to load room"
      );
    } finally {
      setRoomLoading(false);
    }
  }, [roomCode]);

  useEffect(() => {
    if (roomCode) {
      fetchRoomData();
    }
  }, [roomCode, fetchRoomData]);

  const handleCreatePoll = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    setCreateValidationError(null);

    if (!room) return;

    try {
      // Prepare poll data based on type
      let pollData: CreatePollRequest;

      switch (pollType) {
        case "yes_no":
          pollData = {
            roomId: room.id,
            question: question.trim(),
            pollType: "yes_no",
            options: {
              yes: options.yes || "Yes",
              no: options.no || "No",
            },
          };
          break;

        case "rating":
          pollData = {
            roomId: room.id,
            question: question.trim(),
            pollType: "rating",
            options: {
              min: options.min || 1,
              max: options.max || 5,
            },
          };
          break;

        case "multiple_choice":
          const choiceOptions: PollOptions = {};
          if (options.a) choiceOptions.a = options.a;
          if (options.b) choiceOptions.b = options.b;
          if (options.c) choiceOptions.c = options.c;
          if (options.d) choiceOptions.d = options.d;
          if (options.e) choiceOptions.e = options.e;

          if (Object.keys(choiceOptions).length < 2) {
            setCreateValidationError(
              "At least 2 options are required for multiple choice polls"
            );
            return;
          }

          pollData = {
            roomId: room.id,
            question: question.trim(),
            pollType: "multiple_choice",
            options: choiceOptions,
          };
          break;

        default:
          throw new Error("Invalid poll type");
      }

      setCreateLoading(true);

      const response = await fetch("/api/polls/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pollData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to create poll");
      }

      // Reset form and refresh polls
      setQuestion("");
      setOptions({});
      setShowCreateForm(false);
      await refetchPolls();
    } catch (error: unknown) {
      if (
        error &&
        typeof error === "object" &&
        "name" in error &&
        error.name === "ZodError"
      ) {
        const firstError = (error as { issues?: Array<{ message?: string }> })
          .issues?.[0];
        setCreateValidationError(firstError?.message || "Validation error");
      } else {
        setCreateError(
          error instanceof Error ? error.message : "Failed to create poll"
        );
      }
    } finally {
      setCreateLoading(false);
    }
  };

  const resetForm = () => {
    setQuestion("");
    setOptions({});
    setPollType("yes_no");
    setCreateError(null);
    setCreateValidationError(null);
  };

  if (roomLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading room...</p>
        </div>
      </div>
    );
  }

  if (roomError || !room) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Room Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            {roomError ||
              "The room you're looking for doesn't exist or has expired."}
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
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {room.name || "PollRoom"}
              </h1>
              <p className="text-lg text-gray-600 font-mono">
                Room Code:{" "}
                <span className="font-bold text-blue-600">{room.code}</span>
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Expires: {new Date(room.expires_at).toLocaleString()}
              </p>
            </div>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
            >
              {showCreateForm ? "Cancel" : "Create Poll"}
            </button>
          </div>
        </div>

        {/* Create Poll Form */}
        {showCreateForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Create New Poll
            </h2>

            <form onSubmit={handleCreatePoll} className="space-y-4">
              {/* Poll Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Poll Type
                </label>
                <select
                  value={pollType}
                  onChange={(e) => {
                    setPollType(e.target.value as PollType);
                    setOptions({});
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="yes_no">Yes/No</option>
                  <option value="rating">Rating (1-10)</option>
                  <option value="multiple_choice">Multiple Choice</option>
                </select>
              </div>

              {/* Question */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question
                </label>
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Enter your poll question..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  maxLength={200}
                  required
                />
              </div>

              {/* Options based on poll type */}
              {pollType === "yes_no" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Yes Option
                    </label>
                    <input
                      type="text"
                      value={options.yes || "Yes"}
                      onChange={(e) =>
                        setOptions({ ...options, yes: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      No Option
                    </label>
                    <input
                      type="text"
                      value={options.no || "No"}
                      onChange={(e) =>
                        setOptions({ ...options, no: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {pollType === "rating" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Rating
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={options.min || 1}
                      onChange={(e) =>
                        setOptions({
                          ...options,
                          min: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maximum Rating
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={options.max || 5}
                      onChange={(e) =>
                        setOptions({
                          ...options,
                          max: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {pollType === "multiple_choice" && (
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Options (at least 2 required)
                  </label>
                  {["a", "b", "c", "d", "e"].map((letter) => (
                    <div key={letter}>
                      <label className="block text-sm text-gray-600 mb-1">
                        Option {letter.toUpperCase()}
                      </label>
                      <input
                        type="text"
                        value={options[letter as keyof PollOptions] || ""}
                        onChange={(e) =>
                          setOptions({ ...options, [letter]: e.target.value })
                        }
                        placeholder={`Enter option ${letter.toUpperCase()}...`}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        maxLength={50}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Error Messages */}
              {createValidationError && (
                <p className="text-sm text-red-600">{createValidationError}</p>
              )}
              {createError && (
                <p className="text-sm text-red-600">{createError}</p>
              )}

              {/* Submit Button */}
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={createLoading}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {createLoading ? "Creating..." : "Create Poll"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 transition-colors"
                >
                  Reset
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Polls List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900">
            Active Polls ({polls.length})
          </h2>

          {polls.length === 0 ? (
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No polls yet
              </h3>
              <p className="text-gray-600 mb-4">
                Create your first poll to get started!
              </p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Create Poll
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {polls.map((poll) => (
                <div
                  key={poll.id}
                  className="bg-white rounded-lg shadow-lg p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {poll.question}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Type: {poll.poll_type.replace("_", " ")} • Created:{" "}
                        {new Date(poll.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <a
                        href={`/poll/${poll.id}`}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                      >
                        Vote
                      </a>
                      <a
                        href={`/poll/${poll.id}/results`}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                      >
                        Results
                      </a>
                    </div>
                  </div>

                  {/* Poll Options Preview */}
                  <div className="text-sm text-gray-600">
                    {poll.poll_type === "yes_no" && (
                      <p>
                        Options: {poll.options.yes || "Yes"} /{" "}
                        {poll.options.no || "No"}
                      </p>
                    )}
                    {poll.poll_type === "rating" && (
                      <p>
                        Scale: {poll.options.min || 1} to{" "}
                        {poll.options.max || 5}
                      </p>
                    )}
                    {poll.poll_type === "multiple_choice" && (
                      <p>
                        Options:{" "}
                        {Object.values(poll.options).filter(Boolean).join(", ")}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
