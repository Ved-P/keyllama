"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function TestDBPage() {
  const [status, setStatus] = useState<string>("Not tested yet");
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState<any>(null);

  const testConnection = async () => {
    setLoading(true);
    setStatus("Testing connection...");
    setDetails(null);

    try {
      const response = await fetch("/api/test-db");
      const data = await response.json();

      if (response.ok) {
        setStatus("✅ Connection successful!");
        setDetails(data);
      } else {
        setStatus("❌ Connection failed");
        setDetails(data);
      }
    } catch (error) {
      setStatus("❌ Request failed");
      setDetails({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-2xl">
        <h1 className="text-3xl font-bold mb-6 text-center">
          MongoDB Connection Test
        </h1>

        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h2 className="font-semibold text-blue-900 mb-2">
              Environment Variables Check:
            </h2>
            <div className="text-sm space-y-1 font-mono text-blue-800">
              <div>
                MONGODB_URI:{" "}
                {typeof window === "undefined" ? "checking..." : "hidden for security"}
              </div>
              <div>
                MONGODB_DB_NAME:{" "}
                {typeof window === "undefined" ? "checking..." : "hidden for security"}
              </div>
            </div>
          </div>

          <Button
            onClick={testConnection}
            disabled={loading}
            className="w-full py-6 text-lg"
          >
            {loading ? "Testing Connection..." : "Test MongoDB Connection"}
          </Button>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 min-h-[100px]">
            <h3 className="font-semibold mb-2">Status:</h3>
            <p className="text-lg mb-4">{status}</p>

            {details && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Details:</h3>
                <pre className="bg-gray-900 text-green-400 p-4 rounded overflow-auto max-h-96 text-xs">
                  {JSON.stringify(details, null, 2)}
                </pre>
              </div>
            )}
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-900 mb-2">
              Common Issues:
            </h3>
            <ul className="text-sm text-yellow-800 space-y-2 list-disc list-inside">
              <li>
                <strong>Authentication Failed:</strong> Check that your password
                in .env.local is correct (no &lt; &gt; brackets)
              </li>
              <li>
                <strong>Network Error:</strong> Whitelist your IP address in
                MongoDB Atlas → Network Access
              </li>
              <li>
                <strong>Missing Variables:</strong> Make sure .env.local exists
                in cognix-web folder
              </li>
              <li>
                <strong>Restart Required:</strong> Restart the dev server after
                changing .env.local
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
