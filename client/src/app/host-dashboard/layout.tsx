"use client";

import { ReactNode } from "react";
import HostNav from "./HostNav";
import RouteGuard from "../middleware/RouteGuard";
import { useAppSelector } from "@/store/hooks";

interface HostDashboardLayoutProps {
  children: ReactNode;
}

export default function HostDashboardLayout({ children }: HostDashboardLayoutProps) {
  const { user } = useAppSelector((state) => state.auth);
  const userInfo = {
    name: user?.fullname || "Host",
    ratings: 0,
    bookings: 0,
    profilePic: user?.profilePic || "/avatar-placeholder.png",
  };

  return (
    <RouteGuard allowedRoles={["host"]}>
      <div className="min-h-screen bg-[#F7F5F5]">
        <HostNav
          userName={userInfo.name}
          ratings={userInfo.ratings}
          bookings={userInfo.bookings}
          profilePic={userInfo.profilePic}
        />
        {children}
      </div>
    </RouteGuard>
  );
}
