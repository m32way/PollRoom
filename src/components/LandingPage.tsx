"use client";

import React, { useState } from "react";
import { createRoomSchema, joinRoomSchema } from "@/lib/validation";

interface CreateRoomResponse {
  success: boolean;
  data?: {
    id: string;
    code: string;
    name?: string;
    created_at: string;
  };
  error?: string;
}

interface JoinRoomResponse {
  success: boolean;
  data?: {
    id: string;
    code: string;
    name?: string;
    expires_at: string;
  };
  error?: string;
  details?: string;
}

export default function LandingPage() {
  const [createRoomData, setCreateRoomData] = useState({ name: "" });
  const [joinRoomData, setJoinRoomData] = useState({ code: "" });
  const [createLoading, setCreateLoading] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [createValidationError, setCreateValidationError] = useState<
    string | null
  >(null);
  const [joinValidationError, setJoinValidationError] = useState<string | null>(
    null
  );

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    setCreateValidationError(null);

    try {
      // Clean up empty strings
      const cleanData = {
        name: createRoomData.name?.trim() || undefined,
      };

      // Validate input
      const validatedData = createRoomSchema.parse(cleanData);

      setCreateLoading(true);

      const response = await fetch("/api/rooms/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validatedData),
      });

      const result: CreateRoomResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to create room");
      }

      // Redirect to room page
      if (result.data) {
        window.location.href = `/room/${result.data.code}`;
      }
    } catch (error: unknown) {
      if (
        error &&
        typeof error === "object" &&
        "name" in error &&
        error.name === "ZodError"
      ) {
        // Handle Zod validation errors - don't make API call
        const firstError = (error as { issues?: Array<{ message?: string }> })
          .issues?.[0];
        setCreateValidationError(firstError?.message || "Validation error");
        return; // Exit early on validation error
      } else {
        setCreateError(
          error instanceof Error ? error.message : "Failed to create room"
        );
      }
    } finally {
      setCreateLoading(false);
    }
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setJoinError(null);
    setJoinValidationError(null);

    try {
      // Validate input first
      const validatedData = joinRoomSchema.parse(joinRoomData);

      setJoinLoading(true);

      const response = await fetch(`/api/rooms/${validatedData.code}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result: JoinRoomResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to join room");
      }

      // Redirect to room page
      if (result.data) {
        window.location.href = `/room/${result.data.code}`;
      }
    } catch (error: unknown) {
      if (
        error &&
        typeof error === "object" &&
        "name" in error &&
        error.name === "ZodError"
      ) {
        // Handle Zod validation errors - don't make API call
        const firstError = (error as { issues?: Array<{ message?: string }> })
          .issues?.[0];
        setJoinValidationError(firstError?.message || "Validation error");
        return; // Exit early on validation error
      } else {
        setJoinError(
          error instanceof Error ? error.message : "Failed to join room"
        );
      }
    } finally {
      setJoinLoading(false);
    }
  };

  return (
    <div
      data-testid="landing-page"
      className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8"
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            Welcome to PollRoom
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Create instant polls for your audience. Get real-time feedback
            during presentations, meetings, and events.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Create Room Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Create a Room
            </h2>
            <p className="text-gray-600 mb-6">
              Start a new polling session and share the room code with your
              audience.
            </p>

            <form onSubmit={handleCreateRoom} className="space-y-4">
              <div>
                <label
                  htmlFor="room-name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Room Name (Optional)
                </label>
                <input
                  id="room-name"
                  type="text"
                  value={createRoomData.name}
                  onChange={(e) => setCreateRoomData({ name: e.target.value })}
                  placeholder="Enter room name..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  maxLength={50}
                />
                {createValidationError && (
                  <p className="mt-1 text-sm text-red-600">
                    {createValidationError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={createLoading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {createLoading ? "Creating..." : "Create Room"}
              </button>

              {createError && (
                <p className="text-sm text-red-600 text-center">
                  {createError}
                </p>
              )}
            </form>
          </div>

          {/* Join Room Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Join a Room
            </h2>
            <p className="text-gray-600 mb-6">
              Enter a room code to join an existing polling session.
            </p>

            <form onSubmit={handleJoinRoom} className="space-y-4">
              <div>
                <label
                  htmlFor="room-code"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Room Code
                </label>
                <input
                  id="room-code"
                  type="text"
                  value={joinRoomData.code}
                  onChange={(e) =>
                    setJoinRoomData({ code: e.target.value.toUpperCase() })
                  }
                  placeholder="Enter 6-character code..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-center text-lg tracking-wider"
                  maxLength={6}
                />
                {joinValidationError && (
                  <p className="mt-1 text-sm text-red-600">
                    {joinValidationError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={joinLoading}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {joinLoading ? "Joining..." : "Join Room"}
              </button>

              {joinError && (
                <p className="text-sm text-red-600 text-center">{joinError}</p>
              )}
            </form>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-semibold text-gray-900 mb-8">
            Why Choose PollRoom?
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="text-3xl mb-4">⚡</div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Instant Setup
              </h4>
              <p className="text-gray-600">
                Create a room in seconds and start polling immediately.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="text-3xl mb-4">📱</div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Mobile Friendly
              </h4>
              <p className="text-gray-600">
                Works perfectly on any device - no app download required.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="text-3xl mb-4">📊</div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Real-time Results
              </h4>
              <p className="text-gray-600">
                See results update live as people vote.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
