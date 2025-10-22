"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";

interface RouteGuardProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  redirectTo?: string;
}

export default function RouteGuard({
  children,
  allowedRoles = [],
  redirectTo = "/signin",
}: RouteGuardProps) {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    // Don't redirect if user is on the signin page
    if (window.location.pathname === "/signin") return;

    // Check if user is authenticated
    if (!isAuthenticated) {
      router.replace(redirectTo);
      return;
    }

    // If roles are specified, check if user has required role
    if (
      allowedRoles.length > 0 &&
      user &&
      !allowedRoles.includes(user.role.toLowerCase())
    ) {
      // Redirect to appropriate dashboard based on role
      const dashboardPath =
        user.role.toLowerCase() === "admin"
          ? "/admin-dashboard"
          : user.role.toLowerCase() === "host"
          ? "/host-dashboard"
          : "/dashboard";

      router.replace(dashboardPath);
    }
  }, [isClient, isAuthenticated, user, allowedRoles, router, redirectTo]);

  // Don't render anything until we're on the client
  if (!isClient) {
    return null;
  }

  // Show nothing while checking auth
  if (
    !isAuthenticated ||
    (allowedRoles.length > 0 &&
      user &&
      !allowedRoles.includes(user.role.toLowerCase()))
  ) {
    return null;
  }

  return <>{children}</>;
}
