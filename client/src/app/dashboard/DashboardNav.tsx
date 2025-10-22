"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Search, Bell, Filter, Calendar, Wallet, MessageCircle, User, LogOut } from "lucide-react";
import { useAppDispatch } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";
import { useRouter } from "next/navigation";

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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const dispatch = useAppDispatch();
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    }

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isMenuOpen]);
  return (
    <div className="py-3 md:py-4 w-full">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 w-full">
        <div className="flex items-center justify-between h-[56px] md:h-[70px] gap-6">
          {/* Logo Section */}
          <div className="flex items-center justify-between md:flex-none md:gap-[318px]">
            <Link href="/" className="flex items-center gap-2 md:gap-3">
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
            </Link>
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
          <div className="flex items-center gap-2 md:gap-3 relative" ref={menuRef}>
            <Link
              href="/search"
              className="w-8 h-8 md:w-[49px] md:h-[49px] bg-[#E7E7E7] rounded-full flex sm:hidden items-center justify-center"
              onClick={() => setIsMenuOpen(false)}
              aria-label="Search"
            >
              <Search className="w-5 h-5 md:w-7 md:h-7 text-[#121212]" />
            </Link>
            <div className="w-8 h-8 md:w-[49px] md:h-[49px] bg-[#E7E7E7] rounded-full flex items-center justify-center">
              <Bell className="w-4 h-4 md:w-7 md:h-7 text-[#121212]" />
            </div>
            <div className="flex items-center gap-2 md:gap-[6px]">
              {/* Mobile: toggle menu */}
              <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={isMenuOpen}
                onClick={() => setIsMenuOpen((prev) => !prev)}
                className="min-w-10 min-h-10 w-10 h-10 md:hidden bg-gray-200 rounded-full overflow-hidden"
                aria-label="Open profile menu"
              >
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
              </button>

              {/* Desktop: navigate to dashboard profile */}
              <Link
                href="/dashboard/profile"
                className="hidden md:inline-block min-w-10 min-h-10 w-10 h-10 md:w-[70px] md:h-[70px] md:min-w-[70px] md:min-h-[70px] bg-gray-200 rounded-full overflow-hidden"
                aria-label="Go to profile"
              >
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
              </Link>
              <div className=" hidden md:flex md:flex-col gap-0.5 md:gap-1">
                <span className="text-[14px] md:text-[16px] font-semibold text-[#002F5B] leading-[17px] md:leading-[19px]">
                  {userName}
                </span>
                <span className="text-[10px] md:text-[12px] text-[#686767] leading-[13px] md:leading-[15px]">
                  Member since {memberSince}
                </span>
              </div>

              {/* Mobile dropdown menu */}
              {isMenuOpen && (
                <div
                  role="menu"
                  aria-label="Dashboard Sidebar"
                  className="absolute right-0 top-12 block md:hidden z-50 w-[188px] h-auto bg-white rounded-lg p-3 shadow-xl"
                >
                  {/* Header block */}
                  <div className="flex flex-row items-center gap-1.5 px-[10px] h-10 mb-2">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                      {profilePic ? (
                        <Image
                          src={profilePic}
                          alt={`${userName}'s profile`}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-gray-500 text-sm font-medium">
                          {userName.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col h-9">
                      <span className="text-[14px] leading-[17px] font-semibold text-[#002F5B]">
                        {userName}
                      </span>
                    </div>
                  </div>

                  {/* Menu items matching dashboard cards */}
                  <div className="flex flex-col w-[164px]">
                    <div className="border-t border-[#D1D5DB]/50" />

                    
                    {/* Profile link */}
                    <Link
                      href="/dashboard/profile"
                      className="flex flex-row items-center gap-3 px-4 h-8 text-[#121212] rounded-md hover:bg-[#F3F4F6]"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User className="w-[18px] h-[18px] text-[#121212]" />
                      <span className="text-[14px] leading-[17px] font-medium">Profile</span>
                    </Link>

                    <Link
                      href="/search"
                      className="flex flex-row items-center gap-3 px-4 h-8 text-[#121212] rounded-md hover:bg-[#F3F4F6]"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Search className="w-[18px] h-[18px] text-[#121212]" />
                      <span className="text-[14px] leading-[17px] font-medium">Find Space</span>
                    </Link>

                    <Link
                      href="/dashboard/bookings"
                      className="flex flex-row items-center gap-3 px-4 h-8 text-[#121212] rounded-md hover:bg-[#F3F4F6]"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Calendar className="w-[18px] h-[18px] text-[#002F5B]" />
                      <span className="text-[14px] leading-[17px] font-medium">My Bookings</span>
                    </Link>

                    {/* Disabled items: Wallet and Message */}
                    <div className="flex flex-row items-center gap-3 px-4 h-8 text-[#9CA3AF] rounded-md opacity-50 cursor-not-allowed">
                      <Wallet className="w-[18px] h-[18px] text-[#9CA3AF]" />
                      <span className="text-[14px] leading-[17px] font-medium">Wallet</span>
                    </div>

                    <div className="flex flex-row items-center gap-3 px-4 h-8 text-[#9CA3AF] rounded-md opacity-50 cursor-not-allowed">
                      <MessageCircle className="w-[18px] h-[18px] text-[#9CA3AF]" />
                      <span className="text-[14px] leading-[17px] font-medium">Message</span>
                    </div>

                    <div className="border-b border-[#D1D5DB]/50" />

                    <button
                      type="button"
                      onClick={async () => {
                        setIsMenuOpen(false);
                        try {
                          await dispatch(logout());
                        } finally {
                          router.push('/');
                        }
                      }}
                      className="flex flex-row items-center gap-3 px-4 h-8 text-[#B91C1C] rounded-md hover:bg-[#FEE2E2]"
                    >
                      <LogOut className="w-[18px] h-[18px] text-[#B91C1C]" />
                      <span className="text-[14px] leading-[17px] font-medium">Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
