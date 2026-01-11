"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface Session {
  _id: string;
  userDetails: {
    fullName: string;
    className: string;
  };
  stats: {
    totalEditEvents: number;
    charsInserted: number;
    charsDeleted: number;
    pasteEventsCount: number;
    focusEventsCount: number;
    activeTimeMs: number;
    inactiveTimeMs: number;
  };
  analysis: {
    score: number;
    reasons: string[];
  };
  timestamp: string;
}

export default function ViewClassPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch available classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await fetch("/api/classes");
        const result = await response.json();
        if (response.ok && result.data) {
          const classNames = result.data.map((c: any) => c.name);
          setClasses(classNames);
        }
      } catch (err) {
        console.error("Error fetching classes:", err);
      }
    };
    fetchClasses();
  }, []);

  // Fetch sessions for selected class
  useEffect(() => {
    const fetchSessions = async () => {
      setLoading(true);
      setError(null);

      try {
        const url = `/api/classes/sessions?className=${encodeURIComponent(selectedClass)}`;
        const response = await fetch(url);
        const result = await response.json();

        if (response.ok) {
          setSessions(result.data);
        } else {
          setError(result.error || "Failed to load sessions");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [selectedClass]);

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-green-600 bg-green-50";
    if (score >= 40) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Class Sessions</h1>
              <p className="text-gray-500 mt-1">
                View student activity and AI detection scores
              </p>
            </div>
            <a
              href="/"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              ← Back to Home
            </a>
          </div>

          {/* Class Selector */}
          <div className="mb-6">
            <label htmlFor="classSelect" className="block text-sm font-medium text-gray-700 mb-2">
              Select Class:
            </label>
            <select
              id="classSelect"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="block w-full max-w-xs px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Classes</option>
              {classes.map((className) => (
                <option key={className} value={className}>
                  {className}
                </option>
              ))}
            </select>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800 font-semibold">Error:</p>
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
              <p className="mt-4 text-gray-600">Loading sessions...</p>
            </div>
          )}

          {/* Sessions Display */}
          {!loading && sessions.length > 0 && (
            <div>
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  Showing <strong>{sessions.length}</strong> session{sessions.length !== 1 ? "s" : ""}
                  {selectedClass !== "all" && (
                    <span> for class <strong>{selectedClass}</strong></span>
                  )}
                </p>
              </div>

              <div className="space-y-4">
                {sessions.map((session) => (
                  <div
                    key={session._id}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">
                          {session.userDetails.fullName}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {session.userDetails.className}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(session.timestamp).toLocaleString()}
                        </p>
                      </div>

                      {/* Human Likelihood Score Badge */}
                      <div
                        className={`px-4 py-2 rounded-lg font-bold text-2xl ${getScoreColor(
                          session.analysis.score
                        )}`}
                      >
                        {session.analysis.score}%
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-xs text-gray-600">Total Edits</p>
                        <p className="text-lg font-semibold">
                          {session.stats.totalEditEvents}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-xs text-gray-600">Chars Inserted</p>
                        <p className="text-lg font-semibold">
                          {session.stats.charsInserted}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-xs text-gray-600">Paste Events</p>
                        <p className="text-lg font-semibold">
                          {session.stats.pasteEventsCount}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-xs text-gray-600">Active Time</p>
                        <p className="text-lg font-semibold">
                          {Math.round(session.stats.activeTimeMs / 60000)} min
                        </p>
                      </div>
                    </div>

                    {/* AI Analysis Reasons */}
                    {session.analysis.reasons.length > 0 && (
                      <details className="mt-4">
                        <summary className="cursor-pointer text-sm font-semibold text-gray-700 hover:text-gray-900">
                          View AI Analysis Details
                        </summary>
                        <ul className="mt-2 space-y-1 text-sm text-gray-600 list-disc list-inside">
                          {session.analysis.reasons.map((reason, idx) => (
                            <li key={idx}>{reason}</li>
                          ))}
                        </ul>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && sessions.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-gray-600 text-lg">No sessions found</p>
              <p className="text-gray-500 text-sm mt-2">
                {selectedClass !== "all"
                  ? `No sessions recorded for class "${selectedClass}"`
                  : "No sessions have been recorded yet"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
