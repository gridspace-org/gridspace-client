"use client";

import {
  Search,
  Calendar,
  Wallet,
  MessageCircle,
  ArrowLeft,
} from "lucide-react";
import { useRouter } from "next/navigation";
// import {WorkspaceCard } from "../components";
import DashboardCard from "./DashboardCard";
import { useAppSelector } from "@/store/hooks";

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);
  const userInfo = {
    name: user?.fullname || "User",
    memberSince: new Date(user?.createdAt || Date.now())
      .getFullYear()
      .toString(),
    avatar: user?.profilePic || "/avatar-placeholder.png",
    wallet: "₦0", // This could be updated based on your wallet implementation
  };

  const handleCardClick = (path: string) => {
    router.push(path);
  };

  return (
    <>
      {/* Welcome Section */}
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 pt-4 pb-4">
          <div className="flex items-center gap-2 sm:gap-6">
            <button 
              onClick={() => router.back()}
              className="flex items-center justify-center w-6 h-6 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-[#121212]" />
            </button>
            <div className="flex flex-col gap-1">
              <h1 className="text-[16px] leading-[19px] md:text-[32px] md:leading-[39px] font-bold text-[#002F5B]">
                Welcome {userInfo.name.split(" ")[0]}!
              </h1>
              <p className="text-[12px] leading-[15px] md:text-[18px] md:leading-[22px] text-[#686767] tracking-[-0.25px]">
                Discover your next workspace or manage existing bookings
              </p>
            </div>
          </div>
        </div>

        {/* Dashboard Cards */}
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 pb-6 md:pb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 max-md:hidden lg:grid-cols-4 w-full gap-4 md:gap-[23px]">
            <div className="w-full">
              <DashboardCard
                icon={Search}
                title="Find Workspace"
                description="Search for available workspace"
                href="/search"
              />
            </div>
            <div className="w-full">
              <DashboardCard
                icon={Calendar}
                title="My Bookings"
                description="View Upcoming Bookings"
                onClick={() => handleCardClick("/dashboard/bookings")}
              />
            </div>
            <div className="w-full">
              <DashboardCard
                icon={Wallet}
                title="Wallet"
                description={userInfo.wallet}
                onClick={() => handleCardClick("/dashboard/wallet")}
                disabled
              />
            </div>
            <div className="w-full">
              <DashboardCard
                icon={MessageCircle}
                title="Message"
                description="Chat with host"
                onClick={() => handleCardClick("/dashboard/message")}
                disabled
              />
            </div>
          </div>
        </div>

        {/* Main Content Section */}
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 pb-12 md:pb-8">
          <div className="flex flex-col md:flex-row gap-4 md:gap-[23px]">
            {/* Recent Activity */}
            <div className="w-full flex-1 bg-white border border-[#D1D5DB] rounded-lg relative md:h-[412px]">
              <div className="absolute top-5 left-5">
                <h2 className="text-[20px] md:text-[24px] font-bold text-[#002F5B] leading-[24px] md:leading-[29px]">
                  Recent Activity
                </h2>
              </div>

              {/* Empty State */}
              <div className="flex flex-col items-center justify-center h-[300px] md:h-full gap-2">
                <Calendar className="w-[60px] h-[60px] text-[#C3C4C5]" />
                <p className="text-[16px] md:text-[16px] font-medium text-[#6F6F6F] text-center">
                  No activity yet
                </p>
                <a href="/search" className="flex items-center justify-center px-6 py-[10px] bg-[#F25417] text-white rounded-lg mt-2 w-[220px] h-10 md:w-[235px] md:h-[45px] hover:bg-[#E0450F] transition-colors">
                  <span className="text-[16px] md:text-[18px] font-semibold">
                    Book your first Space
                  </span>
                </a>
              </div>
            </div>

            {/* Recommended Spaces */}
            <div className="w-full md:w-[300px] lg:w-[506px] max-lg:flex-1 bg-white border border-[#D1D5DB] rounded-lg p-4 md:p-[21px] md:h-[412px]">
              <h2 className="text-[20px] md:text-[24px] font-bold text-[#002F5B] leading-[24px] md:leading-[29px] mb-3">
                Recommended Space
              </h2>

              {/* <WorkspaceCard
                image="/space1.png"
                name="Urban Coworking Hub"
                location="Victoria Island, Lagos"
                rating={4.75}
                price="₦5000/day"
              /> */}
            </div>
          </div>
        </div>
    </>
  );
}
