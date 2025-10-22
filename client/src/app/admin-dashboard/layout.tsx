"use client";

import { ReactNode } from "react";
import { useAppSelector } from "@/store/hooks";
import AdminNav from "./AdminNav";

export default function AdminDashboardLayout({ children }: { children: ReactNode }) {
  const { user } = useAppSelector((state) => state.auth);
  const userName = user?.fullname || "Admin";
  const adminSince = new Date(user?.createdAt || Date.now()).getFullYear().toString();
  const profilePic = user?.profilePic || "/avatar-placeholder.png";

  return (
    <div className="min-h-screen bg-[#F7F5F5]">
      <AdminNav userName={userName} adminSince={adminSince} profilePic={profilePic} />
      <main className="max-w-[1440px] mx-auto px-4 md:px-8 w-full">{children}</main>
    </div>
  );
}


