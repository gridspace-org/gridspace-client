"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getProfile } from "@/store/slices/authSlice";
import Image from "next/image";

interface AuthLoaderProps {
  message?: string;
  redirectPath?: string;
  onComplete?: () => void;
}

export default function AuthLoader({ 
  message = "Setting up your dashboard...", 
  redirectPath,
  onComplete 
}: AuthLoaderProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [currentMessage, setCurrentMessage] = useState(message);
  const [progress, setProgress] = useState(0);
  const requestedProfileRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    // If coming from Google auth and user object might be partial, fetch full profile once
    const missingOnboardingInfo =
      typeof user.onboardingCompleted === "undefined" &&
      !user.purposes &&
      !user.location;

    if (missingOnboardingInfo && !requestedProfileRef.current) {
      requestedProfileRef.current = true;
      dispatch(getProfile())
        .unwrap()
        .catch(() => {})
        .finally(() => {
          // effect will rerun with updated user
        });
      return;
    }

    const messages = [
      "Setting up your dashboard...",
      "Loading your profile...",
      "Preparing your workspace...",
      "Almost ready!"
    ];

    let messageIndex = 0;
    let progressValue = 0;

    const interval = setInterval(() => {
      messageIndex = (messageIndex + 1) % messages.length;
      setCurrentMessage(messages[messageIndex]);
      
      progressValue += 25;
      setProgress(Math.min(progressValue, 100));

      if (progressValue >= 100) {
        clearInterval(interval);
        
        // Determine redirect path based on user role and inferred onboarding status
        let finalRedirectPath = redirectPath;

        // Consider a user onboarded if any onboarding data already exists
        const hasOnboardingData =
          Array.isArray(user.purposes) && user.purposes.length > 0 ||
          !!user.location ||
          user.onboardingCompleted === true;

        if (!finalRedirectPath) {
          if (user.role?.toLowerCase() === "host") {
            finalRedirectPath = "/host-dashboard";
          } else if (user.role?.toLowerCase() === "admin") {
            finalRedirectPath = "/admin-dashboard";
          } else if (hasOnboardingData) {
            finalRedirectPath = "/dashboard";
          } else {
            finalRedirectPath = "/onboarding";
          }
        }

        // Call completion callback if provided
        onComplete?.();

        // Redirect after a short delay
        setTimeout(() => {
          router.push(finalRedirectPath);
        }, 500);
      }
    }, 800);

    return () => clearInterval(interval);
  }, [isAuthenticated, user, router, redirectPath, onComplete, dispatch]);

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

        <div className="space-y-6">
          {/* Spinner */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-[var(--color-primary)]"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-6 h-6 bg-[var(--color-primary)] rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-[var(--color-primary)] h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          {/* Status Message */}
          <div className="space-y-2">
            <p className="text-[var(--color-text-secondary)] text-lg">
              {currentMessage}
            </p>
            <p className="text-sm text-gray-500">
              {progress}% complete
            </p>
          </div>

          {/* User Info */}
          {user && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-center gap-3">
                <Image
                  src={user.profilePic || "/avatar-placeholder.png"}
                  alt={user.fullname || "User"}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <div className="text-left">
                  <p className="font-medium text-[var(--color-text-primary)]">
                    Welcome, {user.fullname?.split(" ")[0] || "User"}!
                  </p>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    {user.role?.toLowerCase() === "host" ? "Host Dashboard" : 
                     user.role?.toLowerCase() === "admin" ? "Admin Dashboard" : 
                     "User Dashboard"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
