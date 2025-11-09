"use client";

import { ReactNode, useState, useEffect } from "react";
import { useAppSelector } from "@/store/hooks";
import AdminNav from "./AdminNav";

export default function AdminDashboardLayout({ children }: { children: ReactNode }) {
  const { user } = useAppSelector((state) => state.auth);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by using consistent default values during SSR
  const userName = mounted ? (user?.fullname || "Admin") : "Admin";
  const adminSince = mounted && user?.createdAt 
    ? new Date(user.createdAt).getFullYear().toString() 
    : "2025";
  const profilePic = mounted ? (user?.profilePic || "/avatar-placeholder.png") : "/avatar-placeholder.png";

  return (
    <div className="min-h-screen bg-[#F7F5F5]">
      <AdminNav userName={userName} adminSince={adminSince} profilePic={profilePic} />
      <main className="max-w-[1440px] mx-auto px-4 md:px-8 w-full">{children}</main>
    </div>
  );
}


