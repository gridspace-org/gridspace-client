"use client";

import RouteGuard from "../middleware/RouteGuard";
import { useAppSelector } from "@/store/hooks";
import AdminNav from "./AdminNav";
import AdminMainContent from "./AdminMainContent";
import AdminSidebar from "./AdminSidebar";

export default function AdminDashboardPage() {
  const { user } = useAppSelector((state) => state.auth);
  const userInfo = {
    name: user?.fullname || "Admin",
    adminSince: new Date(user?.createdAt || Date.now())
      .getFullYear()
      .toString(),
    avatar: user?.profilePic || "/avatar-placeholder.png",
  };

  return (
    <RouteGuard allowedRoles={["admin"]}>
      <div className="min-h-screen bg-[#F7F5F5]">
        {/* Navigation */}
        <AdminNav userName={userInfo.name} adminSince={userInfo.adminSince} profilePic={userInfo.avatar} />

        {/* Main Content */}
        <div className="flex flex-col justify-center lg:flex-row gap-4 lg:gap-6 px-4">
          <div className="w-full bg-white lg:w-auto">
            <AdminSidebar />
          </div>
          <div className="flex-1 w-[70%] mx-auto">
            <AdminMainContent />
          </div>
        </div>
      </div>
    </RouteGuard>
  );
}
