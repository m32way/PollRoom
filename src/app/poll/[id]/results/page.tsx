"use client";

import React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { PollType, PollOptions } from "@/app/api/polls/create/route";
import { useRealtimeVotes } from "@/hooks/useRealtimeVotes";

export default function PollResultsPage() {
  const params = useParams();
  const pollId = params.id as string;

  const { results: pollResults, loading, error } = useRealtimeVotes(pollId);

  const renderResults = () => {
    if (!pollResults) return null;

    const { poll, results, totalVotes } = pollResults;

    if (totalVotes === 0) {
      return (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No votes yet
          </h3>
          <p className="text-gray-600">Be the first to vote on this poll!</p>
        </div>
      );
    }

    switch (poll.poll_type) {
      case "yes_no":
        return (
          <div className="space-y-4">
            {results.map((result) => (
              <div key={result.choice} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900">
                    {result.choice === "yes"
                      ? poll.options.yes || "Yes"
                      : poll.options.no || "No"}
                  </span>
                  <span className="text-sm text-gray-600">
                    {result.count} vote{result.count !== 1 ? "s" : ""} (
                    {result.percentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className={`h-4 rounded-full transition-all duration-500 ${
                      result.choice === "yes" ? "bg-green-500" : "bg-red-500"
                    }`}
                    style={{ width: `${result.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        );

      case "rating":
        const min = Number(poll.options.min) || 1;
        const max = Number(poll.options.max) || 5;
        const ratingResults = Array.from({ length: max - min + 1 }, (_, i) => {
          const rating = (min + i).toString();
          const result = results.find((r) => r.choice === rating);
          return {
            rating,
            count: result?.count || 0,
            percentage: result?.percentage || 0,
          };
        });

        return (
          <div className="space-y-3">
            {ratingResults.map((result) => (
              <div key={result.rating} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900">
                    Rating {result.rating}
                  </span>
                  <span className="text-sm text-gray-600">
                    {result.count} vote{result.count !== 1 ? "s" : ""} (
                    {result.percentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="h-3 rounded-full bg-blue-500 transition-all duration-500"
                    style={{ width: `${result.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        );

      case "multiple_choice":
        const options = Object.entries(poll.options).filter(
          ([_, value]) => value
        );
        const optionLetters = ["A", "B", "C", "D", "E"];

        return (
          <div className="space-y-3">
            {options.map(([key, value], index) => {
              const result = results.find((r) => r.choice === key);
              return (
                <div key={key} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center mr-3 text-xs font-bold">
                        {optionLetters[index]}
                      </div>
                      <span className="font-medium text-gray-900">{value}</span>
                    </div>
                    <span className="text-sm text-gray-600">
                      {result?.count || 0} vote
                      {(result?.count || 0) !== 1 ? "s" : ""} (
                      {(result?.percentage || 0).toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="h-3 rounded-full bg-blue-500 transition-all duration-500"
                      style={{ width: `${result?.percentage || 0}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
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
          <p className="text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  if (error || !pollResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Results Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            {error || "The poll results you're looking for don't exist."}
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

  const { poll, totalVotes } = pollResults;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {poll.question}
          </h1>
          <div className="flex justify-between items-center text-sm text-gray-500">
            <span>Poll Type: {poll.poll_type.replace("_", " ")}</span>
            <span>Total Votes: {totalVotes}</span>
          </div>
          <div className="mt-2 text-xs text-gray-400">
            Created: {new Date(poll.created_at).toLocaleString()}
          </div>
        </div>

        {/* Results */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Live Results
            </h2>
            <div className="flex items-center text-sm text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              Live
            </div>
          </div>

          {renderResults()}
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-3 justify-center">
          <Link
            href={`/poll/${poll.id}`}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Vote on Poll
          </Link>
          <Link
            href="/"
            className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 transition-colors"
          >
            Back to Home
          </Link>
        </div>

        {/* Share Section */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Share This Poll
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Voting Link
              </label>
              <div className="flex">
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}/poll/${poll.id}`}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md bg-gray-50 text-sm"
                />
                <button
                  onClick={() =>
                    navigator.clipboard.writeText(
                      `${window.location.origin}/poll/${poll.id}`
                    )
                  }
                  className="px-3 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 transition-colors"
                >
                  Copy
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Results Link
              </label>
              <div className="flex">
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}/poll/${poll.id}/results`}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md bg-gray-50 text-sm"
                />
                <button
                  onClick={() =>
                    navigator.clipboard.writeText(
                      `${window.location.origin}/poll/${poll.id}/results`
                    )
                  }
                  className="px-3 py-2 bg-green-600 text-white rounded-r-md hover:bg-green-700 transition-colors"
                >
                  Copy
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
