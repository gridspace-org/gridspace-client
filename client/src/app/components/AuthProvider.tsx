"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getProfile } from "@/store/slices/authSlice";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user, loading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // If we're authenticated but don't have user data, fetch it
    if (isAuthenticated && !user && !loading) {
      dispatch(getProfile());
    }
  }, [isAuthenticated, user, loading, dispatch]);

  return <>{children}</>;
}