"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppDispatch } from "@/store/hooks";
import { clearAuth } from "@/store/slices/authSlice";
import Image from "next/image";
import Link from "next/link";
import AuthLoader from "../../components/AuthLoader";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const handleCallback = () => {
      const token = searchParams.get("token");
      const success = searchParams.get("success");
      const error = searchParams.get("error");

      if (success === "true" && token) {
        // Store the token and show loader
        localStorage.setItem("authToken", token);
        setStatus("success");
        setMessage("Authentication successful! Redirecting...");
        
        // The AuthLoader will handle the redirect logic
      } else if (success === "false" || error) {
        // Handle error
        setStatus("error");
        setMessage(error ? decodeURIComponent(error) : "Authentication failed");
        
        // Clear any existing auth state
        dispatch(clearAuth());
      } else {
        // Invalid callback
        setStatus("error");
        setMessage("Invalid authentication callback");
        dispatch(clearAuth());
      }
    };

    handleCallback();
  }, [searchParams, router, dispatch]);

  return (
    <>
      {status === "success" ? (
        <AuthLoader message="Completing authentication..." />
      ) : (
        <div className="min-h-screen bg-[var(--color-bg-secondary)] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <Image
            src="/logo.png"
            alt="GridSpace"
            width={80}
            height={80}
            className="mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-[var(--color-secondary)]">
            GridSpace
          </h1>
        </div>

        {status === "loading" && (
          <div className="space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)] mx-auto"></div>
            <p className="text-[var(--color-text-secondary)]">
              Processing authentication...
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-red-600">
              Authentication Failed
            </h2>
            <p className="text-[var(--color-text-secondary)]">
              {message}
            </p>
            <div className="space-y-2">
              <Link
                href="/signin"
                className="block w-full bg-[var(--color-primary)] text-white py-2 px-4 rounded-lg hover:bg-[var(--color-primary)]/90 transition-colors"
              >
                Try Again
              </Link>
              <Link
                href="/"
                className="block w-full border border-[var(--color-border)] text-[var(--color-text-primary)] py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Go Home
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
      )}
    </>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-[var(--color-bg-secondary)] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <Image
            src="/logo.png"
            alt="GridSpace"
            width={80}
            height={80}
            className="mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-[var(--color-secondary)]">
            GridSpace
          </h1>
        </div>
        <div className="space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)] mx-auto"></div>
          <p className="text-[var(--color-text-secondary)]">
            Loading...
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AuthCallbackContent />
    </Suspense>
  );
}
