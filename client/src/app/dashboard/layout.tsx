"use client";

import { ReactNode } from "react";
import DashboardNav from "./DashboardNav";
import RouteGuard from "../middleware/RouteGuard";
import { useAppSelector } from "@/store/hooks";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user } = useAppSelector((state) => state.auth);
  
  const userInfo = {
    name: user?.fullname || "User",
    memberSince: new Date(user?.createdAt || Date.now())
      .getFullYear()
      .toString(),
    avatar: user?.profilePic || "/avatar-placeholder.png",
    wallet: "₦0", // This could be updated based on your wallet implementation
  };

  return (
    <RouteGuard allowedRoles={["user"]}>
      <div className="min-h-screen bg-[#F7F5F5]">
        {/* Navigation Bar - Consistent across all dashboard pages */}
       
        <DashboardNav
          userName={userInfo.name}
          memberSince={userInfo.memberSince}
          profilePic={userInfo.avatar}
        />
        
        {/* Main Content Area */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </RouteGuard>
  );
}
