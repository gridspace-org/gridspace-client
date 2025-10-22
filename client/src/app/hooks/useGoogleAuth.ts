"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/store/hooks";
import { googleAuth } from "@/store/slices/authSlice";
import axios from "axios";

interface UseGoogleAuthOptions {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  redirectTo?: string;
}

export const useGoogleAuth = (options: UseGoogleAuthOptions = {}) => {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleGoogleAuth = useCallback(
    async (idToken: string) => {
      try {
        const result = await dispatch(googleAuth({ idToken })).unwrap();

        if (result) {
          options.onSuccess?.();
          
          // Determine redirect path
          let redirectPath = options.redirectTo;
          if (!redirectPath) {
            if (result.user.onboardingCompleted) {
              redirectPath = "/dashboard";
            } else {
              redirectPath = "/onboarding";
            }
          }
          
          router.push(redirectPath);
        }
      } catch (error: unknown) {
        console.error("Google authentication failed:", error);
        const errorMessage = error instanceof Error ? error.message : "Google authentication failed";
        options.onError?.(errorMessage);
      }
    },
    [dispatch, router, options]
  );

  const getGoogleAuthUrl = useCallback(async () => {
    try {
      const response = await axios.get("/api/auth/google/url");
      return response.data.authUrl;
    } catch (error) {
      console.error("Failed to get Google auth URL:", error);
      throw error;
    }
  }, []);

  const redirectToGoogleAuth = useCallback(async () => {
    try {
      const authUrl = await getGoogleAuthUrl();
      window.location.href = authUrl;
    } catch (error) {
      console.error("Failed to redirect to Google authentication:", error);
      options.onError?.("Failed to redirect to Google authentication");
    }
  }, [getGoogleAuthUrl, options]);

  return {
    handleGoogleAuth,
    getGoogleAuthUrl,
    redirectToGoogleAuth,
  };
};
