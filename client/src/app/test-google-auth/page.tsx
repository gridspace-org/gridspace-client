"use client";

import { useState } from "react";
import { useAppSelector } from "@/store/hooks";
import GoogleAuthButton from "../components/GoogleAuthButton";
import { useGoogleAuth } from "../hooks/useGoogleAuth";

export default function TestGoogleAuthPage() {
  const { user, isAuthenticated, loading, error } = useAppSelector(
    (state) => state.auth
  );
  const [testResults, setTestResults] = useState<string[]>([]);
  const { redirectToGoogleAuth } = useGoogleAuth({
    onSuccess: () => {
      setTestResults((prev) => [...prev, "✅ Google Auth successful via hook"]);
    },
    onError: (error) => {
      setTestResults((prev) => [...prev, `❌ Google Auth failed via hook: ${error}`]);
    },
  });

  const addTestResult = (result: string) => {
    setTestResults((prev) => [...prev, result]);
  };

  const testGoogleAuthUrl = async () => {
    try {
      const response = await fetch("/api/auth/google/url");
      const data = await response.json();
      if (data.success) {
        addTestResult("✅ Google Auth URL generated successfully");
        addTestResult(`🔗 Auth URL: ${data.authUrl.substring(0, 50)}...`);
      } else {
        addTestResult("❌ Failed to generate Google Auth URL");
      }
    } catch (error) {
      addTestResult(`❌ Error getting Google Auth URL: ${error}`);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-secondary)] p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-[var(--color-secondary)] mb-8">
          Google Auth Integration Test
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Test Controls */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Google Auth Button Component</h3>
                <GoogleAuthButton
                  text="Test Google Auth"
                  className="w-full"
                  onError={(error) => addTestResult(`❌ Google Auth Button Error: ${error}`)}
                />
              </div>

              <div>
                <h3 className="font-medium mb-2">Server-Side Flow</h3>
                <button
                  onClick={redirectToGoogleAuth}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Test Server-Side Flow
                </button>
              </div>

              <div>
                <h3 className="font-medium mb-2">API Tests</h3>
                <button
                  onClick={testGoogleAuthUrl}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Test Google Auth URL API
                </button>
              </div>

              <button
                onClick={clearResults}
                className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Clear Results
              </button>
            </div>
          </div>

          {/* Auth State */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Auth State</h2>
            
            <div className="space-y-3">
              <div>
                <span className="font-medium">Status:</span>
                <span className={`ml-2 px-2 py-1 rounded text-sm ${
                  isAuthenticated ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                }`}>
                  {isAuthenticated ? "Authenticated" : "Not Authenticated"}
                </span>
              </div>

              <div>
                <span className="font-medium">Loading:</span>
                <span className={`ml-2 px-2 py-1 rounded text-sm ${
                  loading ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-800"
                }`}>
                  {loading ? "Yes" : "No"}
                </span>
              </div>

              {error && (
                <div>
                  <span className="font-medium">Error:</span>
                  <span className="ml-2 px-2 py-1 rounded text-sm bg-red-100 text-red-800">
                    {error}
                  </span>
                </div>
              )}

              {user && (
                <div>
                  <span className="font-medium">User:</span>
                  <div className="mt-2 p-3 bg-gray-50 rounded text-sm">
                    <div><strong>Name:</strong> {user.fullname || user.name}</div>
                    <div><strong>Email:</strong> {user.email}</div>
                    <div><strong>Role:</strong> {user.role}</div>
                    <div><strong>Provider:</strong> {user.authProvider || "local"}</div>
                    <div><strong>Google ID:</strong> {user.googleId || "N/A"}</div>
                    <div><strong>Onboarding:</strong> {user.onboardingCompleted ? "Completed" : "Pending"}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Test Results */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Test Results</h2>
          
          {testResults.length === 0 ? (
            <p className="text-gray-500">No test results yet. Run some tests above.</p>
          ) : (
            <div className="space-y-2">
              {testResults.map((result, index) => (
                <div key={index} className="p-2 bg-gray-50 rounded text-sm font-mono">
                  {result}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Environment Check */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Environment Check</h2>
          
          <div className="space-y-2">
            <div>
              <span className="font-medium">Google Client ID:</span>
              <span className={`ml-2 px-2 py-1 rounded text-sm ${
                process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
              }`}>
                {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? "Configured" : "Not Configured"}
              </span>
            </div>
            
            <div>
              <span className="font-medium">API URL:</span>
              <span className="ml-2 px-2 py-1 rounded text-sm bg-blue-100 text-blue-800">
                {process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
