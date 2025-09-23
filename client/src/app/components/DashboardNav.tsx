"use client";

import Image from "next/image";
import { Search, Bell, Filter } from "lucide-react";

interface DashboardNavProps {
  userName: string;
  memberSince: string;
  wallet?: string;
  profilePic?: string;
}

export default function DashboardNav({
  userName,
  memberSince,
  profilePic,
}: DashboardNavProps) {
  return (
    <div className="py-3 md:py-4 w-full">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 w-full">
        <div className="flex items-center justify-between h-[56px] md:h-[70px] gap-6">
          {/* Logo Section */}
          <div className="flex items-center justify-between md:flex-none md:gap-[318px]">
            <div className="flex items-center gap-2 md:gap-3">
              <Image
                src="/logo.png"
                alt="GridSpace Logo"
                width={40}
                height={40}
                className="w-10 h-10 md:w-12 md:h-12"
              />
              <span className="text-[#F25417] font-bold text-[20px] leading-[24px] md:text-[28px] md:leading-[34px]">
                GridSpace
              </span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="hidden sm:flex items-center px-[10px] py-[13px] gap-[348px] bg-white border border-[#D1D5DB] rounded-lg w-[30%] h-[44px]">
            <div className="flex justify-between items-center gap-[3px] w-full">
              <div className="flex items-center">
                <Search className="w-6 h-6 mr-2 text-[#A8A7A7]" />
                <span className="text-[12px] text-[#A8A7A7]">search...</span>
              </div>
              <Filter className="w-6 h-6 text-[#A8A7A7]" />
            </div>
          </div>

          {/* User Profile Section */}
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-[49px] md:h-[49px] bg-[#E7E7E7] rounded-full flex sm:hidden items-center justify-center">
              <Search className="w-5 h-5 md:w-7 md:h-7 text-[#121212]" />
            </div>
            <div className="w-8 h-8 md:w-[49px] md:h-[49px] bg-[#E7E7E7] rounded-full flex items-center justify-center">
              <Bell className="w-4 h-4 md:w-7 md:h-7 text-[#121212]" />
            </div>
            <div className="flex items-center gap-2 md:gap-[6px]">
              <div className="min-w-10 min-h-10 w-[70px] h-[70px] bg-gray-200 rounded-full overflow-hidden">
                {profilePic ? (
                  <Image
                    src={profilePic}
                    alt={`${userName}'s profile`}
                    width={70}
                    height={70}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-gray-500 text-sm font-medium">
                      {userName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div className=" hidden md:flex md:flex-col gap-0.5 md:gap-1">
                <span className="text-[14px] md:text-[16px] font-semibold text-[#002F5B] leading-[17px] md:leading-[19px]">
                  {userName}
                </span>
                <span className="text-[10px] md:text-[12px] text-[#686767] leading-[13px] md:leading-[15px]">
                  Member since {memberSince}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
