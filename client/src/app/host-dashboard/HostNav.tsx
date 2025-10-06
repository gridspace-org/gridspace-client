"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Search, Bell, Filter, User, Home, Calendar, LogOut } from "lucide-react";

interface HostNavProps {
  userName: string;
  ratings: number;
  bookings: number;
  profilePic?: string;
}

export default function HostNav({
  userName,
  ratings,
  bookings,
  profilePic,
}: HostNavProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

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
            <div className="w-8 h-8 md:w-[49px] md:h-[49px] bg-[#E7E7E7] rounded-full flex sm:hidden items-center justify-center">
              <Search className="w-5 h-5 md:w-7 md:h-7 text-[#121212]" />
            </div>
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={isMenuOpen}
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="w-8 h-8 md:w-[49px] md:h-[49px] bg-[#E7E7E7] rounded-full flex items-center justify-center overflow-hidden"
            >
              <Bell className="w-4 h-4 md:w-7 md:h-7 text-[#121212]" />
            </button>
            <div className="flex items-center gap-2 md:gap-[6px]">
              <button
                type="button"
                onClick={() => setIsMenuOpen((prev) => !prev)}
                className="w-10 h-10 min-w-10 min-h-10 md:min-w-[70px] md:min-h-[70px] md:w-[70px] md:h-[70px] bg-gray-200 rounded-full overflow-hidden"
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
              <div className=" hidden md:flex md:flex-col gap-0.5 md:gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-[14px] md:text-[16px] font-semibold text-[#002F5B] leading-[17px] md:leading-[19px]">
                    {userName}
                  </span>
                  <div className="flex items-center gap-1 px-2 py-1 bg-[#F25417] rounded-full">
                    <span className="text-[10px] md:text-[12px] text-white">
                      Host
                    </span>
                  </div>
                </div>
                <span className="text-[10px] md:text-[12px] text-[#686767] leading-[13px] md:leading-[15px]">
                  {ratings} ratings | {bookings} bookings
                </span>
              </div>

              {/* Mobile dropdown menu */}
              {isMenuOpen && (
                <div
                  role="menu"
                  aria-label="Host Sidebar"
                  className="absolute right-0 top-12 block md:hidden z-50 w-[188px] h-auto bg-white rounded-lg p-3 shadow-xl"
                >
                  {/* Header profile block */}
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
                      <span className="text-[12px] leading-[15px] text-[#686767]">
                        Host
                      </span>
                    </div>
                  </div>

                  {/* Menu items */}
                  <div className="flex flex-col w-[164px]">
                    <div className="border-t border-[#D1D5DB]/50" />
                    <Link
                      href="/host-dashboard"
                      className="flex flex-row items-center gap-3 px-4 h-8 text-[#121212] rounded-md hover:bg-[#F3F4F6]"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User className="w-[18px] h-[18px] text-[#121212]" />
                      <span className="text-[14px] leading-[17px] font-medium">Profile</span>
                    </Link>

                    <Link
                      href="/host-dashboard/listings"
                      className="flex flex-row items-center gap-3 px-4 h-8 text-[#121212] rounded-md hover:bg-[#F3F4F6]"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Home className="w-[18px] h-[18px] text-[#002F5B]" />
                      <span className="text-[14px] leading-[17px] font-medium">My Listings</span>
                    </Link>

                    <Link
                      href="/host-dashboard/calendar"
                      className="flex flex-row items-center gap-3 px-4 h-8 text-[#121212] rounded-md hover:bg-[#F3F4F6]"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Calendar className="w-[18px] h-[18px] text-[#002F5B]" />
                      <span className="text-[14px] leading-[17px] font-medium">Calendar</span>
                    </Link>

                    <Link
                      href="/host-dashboard/earnings"
                      className="flex flex-row items-center gap-3 px-4 h-8 text-[#121212] rounded-md hover:bg-[#F3F4F6]"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <svg className="w-[18px] h-[18px] text-[#002F5B]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 3h18v18H3z" fill="none"/>
                        <path d="M5 12h14M5 8h14M5 16h14" stroke="#002F5B" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                      <span className="text-[14px] leading-[17px] font-medium">Earnings</span>
                    </Link>

                    <Link
                      href="/host-dashboard"
                      className="flex flex-row items-center gap-3 px-4 h-8 text-[#121212] rounded-md hover:bg-[#F3F4F6]"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Bell className="w-[18px] h-[18px] text-[#121212]" />
                      <span className="text-[14px] leading-[17px] font-medium">Notifications</span>
                    </Link>

                    <div className="border-b border-[#D1D5DB]/50" />

                    <button
                      type="button"
                      onClick={() => setIsMenuOpen(false)}
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
