"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Search, Bell, Filter, Home, Users, Calendar, BookOpen, LogOut } from "lucide-react";
import apiService from "@/services/api";

interface AdminNavProps {
  userName: string;
  adminSince: string;
  profilePic?: string;
}

export default function AdminNav({ userName, adminSince, profilePic }: AdminNavProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
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

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await apiService.logout();
      localStorage.removeItem('authToken');
      router.push('/signin');
    } catch (error) {
      console.error('Logout error:', error);
      alert('Failed to logout. Please try again.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="py-3 md:py-4 w-full">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 w-full">
        <div className="flex items-center justify-between h-[56px] md:h-[70px] gap-6">
          {/* Logo Section */}
          <div className="flex items-center justify-between md:flex-none md:gap-[235px]">
            <Link href="/" className="flex items-center gap-2 md:gap-3">
              <Image src="/logo.png" alt="GridSpace Logo" width={48} height={48} className="w-12 h-12" />
              <span className="text-[#F25417] font-bold text-[28px] leading-[34px]">GridSpace</span>
            </Link>
          </div>

          {/* Search Bar - Figma styled */}
          <div className="hidden sm:flex items-center px-[10px] py-[13px] gap-[348px] bg-white border border-[#D1D5DB] rounded-lg w-[30%] md:w-[400px] lg:w-[466px] h-[44px]">
            <div className="flex justify-between items-center gap-[3px] w-full">
              <div className="flex items-center">
                <Search className="w-6 h-6 mr-2 text-[#A8A7A7]" />
                <span className="text-[12px] text-[#A8A7A7]">search...</span>
              </div>
              <Filter className="w-6 h-6 text-[#A8A7A7]" />
          </div>
        </div>

          {/* Right Section */}
          <div className="flex items-center gap-2 md:gap-3 relative" ref={menuRef}>
            <div className="w-8 h-8 min-w-[32px] min-h-[32px] md:w-[49px] md:h-[49px] md:min-w-[49px] md:min-h-[49px] bg-[#E7E7E7] rounded-full flex items-center justify-center shrink-0">
              <Bell className="w-4 h-4 md:w-7 md:h-7 text-[#121212]" />
          </div>
            <div className="flex items-center gap-2 md:gap-[8px]">
          <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={isMenuOpen}
                onClick={() => setIsMenuOpen((prev) => !prev)}
                className="min-w-[40px] min-h-[40px] w-10 h-10 md:w-[70px] md:h-[70px] md:min-w-[70px] md:min-h-[70px] bg-gray-200 rounded-full overflow-hidden shrink-0"
                aria-label="Open profile menu"
              >
                {profilePic ? (
                  <Image src={profilePic} alt={`${userName}'s profile`} width={70} height={70} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-gray-500 text-sm font-medium">{userName.charAt(0).toUpperCase()}</span>
                  </div>
                )}
          </button>
              <div className="hidden md:flex md:flex-col gap-0.5 md:gap-1">
                <span className="text-[14px] md:text-[16px] font-semibold text-[#002F5B] leading-[17px] md:leading-[19px]">{userName}</span>
                <span className="text-[10px] md:text-[12px] text-[#686767] leading-[13px] md:leading-[15px]">Admin since {adminSince}</span>
              </div>

              {/* Dropdown menu - Accessible on all screen sizes */}
              {isMenuOpen && (
                <div role="menu" aria-label="Admin Sidebar" className="absolute right-0 top-12 md:top-16 z-50 w-[188px] bg-white rounded-lg p-3 shadow-xl">
                  {/* Header */}
                  <div className="flex flex-row items-center gap-1.5 px-[10px] h-10 mb-2">
                    <div className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-full overflow-hidden bg-gray-200 flex items-center justify-center shrink-0">
              {profilePic ? (
                        <Image src={profilePic} alt={`${userName}'s profile`} width={40} height={40} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-gray-500 text-sm font-medium">{userName.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="flex flex-col h-9">
                      <span className="text-[14px] leading-[17px] font-semibold text-[#002F5B]">{userName}</span>
                    </div>
                  </div>

                  {/* Items (match InfoCards) */}
                  <div className="flex flex-col w-[164px]">
                    <div className="border-t border-[#D1D5DB]/50" />

                    <Link href="/admin-dashboard/listings" className="flex flex-row items-center gap-3 px-4 h-8 text-[#121212] rounded-md hover:bg-[#F3F4F6]" onClick={() => setIsMenuOpen(false)}>
                      <Home className="w-[18px] h-[18px] text-[#002F5B]" />
                      <span className="text-[14px] leading-[17px] font-medium">Listings</span>
                    </Link>

                    <Link href="/admin-dashboard/users" className="flex flex-row items-center gap-3 px-4 h-8 text-[#121212] rounded-md hover:bg-[#F3F4F6]" onClick={() => setIsMenuOpen(false)}>
                      <Users className="w-[18px] h-[18px] text-[#002F5B]" />
                      <span className="text-[14px] leading-[17px] font-medium">Users</span>
                    </Link>

                    <Link href="/admin-dashboard/bookings" className="flex flex-row items-center gap-3 px-4 h-8 text-[#121212] rounded-md hover:bg-[#F3F4F6]" onClick={() => setIsMenuOpen(false)}>
                      <Calendar className="w-[18px] h-[18px] text-[#002F5B]" />
                      <span className="text-[14px] leading-[17px] font-medium">Bookings</span>
                    </Link>

                    <Link href="/admin-dashboard/blog" className="flex flex-row items-center gap-3 px-4 h-8 text-[#121212] rounded-md hover:bg-[#F3F4F6]" onClick={() => setIsMenuOpen(false)}>
                      <BookOpen className="w-[18px] h-[18px] text-[#002F5B]" />
                      <span className="text-[14px] leading-[17px] font-medium">Blog</span>
                    </Link>

                    <button 
                      className="flex flex-row items-center gap-3 px-4 h-8 text-[#121212] rounded-md hover:bg-[#F3F4F6] text-left mt-1 disabled:opacity-50 disabled:cursor-not-allowed" 
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      aria-label="Log out"
                    >
                      <LogOut className="w-[18px] h-[18px] text-[#DC2626]" />
                      <span className="text-[14px] leading-[17px] font-medium">
                        {isLoggingOut ? 'Logging out...' : 'Log Out'}
                      </span>
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
