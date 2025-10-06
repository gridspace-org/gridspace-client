"use client";

import {
  ArrowLeft,
  Plus,
  Home,
  Calendar,
  DollarSign,
  MessageCircle,
  Eye,
  Edit,
  Pause,
  ChevronDown,
  Send,
} from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import AddListingModal from "./components/AddListingModal";

export default function HostDashboardPage() {
  const { user } = useAppSelector((state) => state.auth);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const userInfo = {
    name: user?.fullname || "Host",
    ratings: 0,
    bookings: 0,
    avatar: user?.profilePic || "/avatar-placeholder.png",
  };

  // Mock data for listings
  const listings = [
    {
      id: 1,
      name: "Urban Coworking Hub",
      location: "Victoria Island, Lagos",
      price: "₦10,000",
      status: "Completed",
      statusColor: "bg-green-100 text-green-800",
      createdDate: "Created June 22nd, 2025",
      image: "/space1.png",
    },
    {
      id: 2,
      name: "Urban Coworking Hub",
      location: "Victoria Island, Lagos",
      price: "₦10,000",
      status: "Pending",
      statusColor: "bg-yellow-100 text-yellow-800",
      createdDate: "Created June 22nd, 2025",
      image: "/space1.png",
    },
    {
      id: 3,
      name: "Urban Coworking Hub",
      location: "Victoria Island, Lagos",
      price: "₦10,000",
      status: "Canceled",
      statusColor: "bg-red-100 text-red-800",
      createdDate: "Created June 22nd, 2025",
      image: "/space1.png",
    },
  ];

  // Mock data for earnings
  const earnings = [
    {
      id: 1,
      title: "Payment for Urban Hub",
      date: "Tue, Jul 1 2025",
      amount: "₦5,000",
      status: "Completed",
      type: "payment",
    },
    {
      id: 2,
      title: "Interest",
      date: "Tue, Jul 1 2025",
      amount: "₦1,000",
      status: "Completed",
      type: "interest",
    },
    {
      id: 3,
      title: "Interest",
      date: "Tue, Jul 1 2025",
      amount: "₦1,000",
      status: "Completed",
      type: "interest",
    },
  ];

  return (
    <>
      {/* Main Content */}
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 pb-8">
          {/* Welcome Section */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 lg:gap-0 mb-6">
            <div className="flex items-center gap-2 sm:gap-6">
              <button className="flex items-center justify-center w-6 h-6">
                <ArrowLeft className="w-6 h-6 text-[#121212]" />
              </button>
              <div className="flex flex-col gap-1">
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-[32px] font-bold text-[#002F5B]">
                  Welcome {userInfo.name.split(" ")[0]}!
                </h1>
                <p className="text-sm sm:text-base md:text-lg lg:text-[18px] text-[#686767] tracking-[-0.25px]">
                  Manage your workspace and track your earnings
                </p>
              </div>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center px-3 py-2 bg-[#F25417] text-white rounded-lg gap-2 w-full sm:w-auto"
            >
              <Plus className="w-5 h-5" />
              <span className="text-sm sm:text-[16px] font-semibold">
                Add Listing
              </span>
            </button>
          </div>

          {/* Dashboard Cards */}
          <div className="flex flex-col gap-3 mb-6 max-md:hidden lg:grid lg:grid-cols-4 lg:gap-[23px]">
            <Link href="/host-dashboard/listings" className="bg-white border border-[#D1D5DB] rounded-xl p-4 shadow-sm lg:p-6 cursor-pointer block">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center lg:w-10 lg:h-10">
                  <Home className="w-8 h-8 text-[#002F5B] lg:w-10 lg:h-10" />
                </div>
                <div className="text-center">
                  <h3 className="text-base font-bold text-[#002F5B] mb-1 lg:text-[18px]">
                    My Listings
                  </h3>
                  <p className="text-xs text-[#686767] lg:text-[14px]">
                    Manage your listings
                  </p>
                </div>
              </div>
            </Link>

            <Link href="/host-dashboard/calendar" className="bg-white border border-[#D1D5DB] rounded-xl p-4 shadow-sm lg:p-6 cursor-pointer block">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center lg:w-10 lg:h-10">
                  <Calendar className="w-8 h-8 text-[#002F5B] lg:w-10 lg:h-10" />
                </div>
                <div className="text-center">
                  <h3 className="text-base font-bold text-[#002F5B] mb-1 lg:text-[18px]">
                    Calendar
                  </h3>
                  <p className="text-xs text-[#686767] lg:text-[14px]">
                    Manage your bookings
                  </p>
                </div>
              </div>
            </Link>

            <Link href="/host-dashboard/earnings" className="bg-white border border-[#D1D5DB] rounded-xl p-4 shadow-sm lg:p-6 cursor-pointer block">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center lg:w-10 lg:h-10">
                  <DollarSign className="w-8 h-8 text-[#002F5B] lg:w-10 lg:h-10" />
                </div>
                <div className="text-center">
                  <h3 className="text-base font-bold text-[#002F5B] mb-1 lg:text-[18px]">
                    Earnings
                  </h3>
                  <p className="text-xs text-[#686767] lg:text-[14px]">
                    View and manage your earnings
                  </p>
                </div>
              </div>
            </Link>

            <div className="bg-white border border-[#D1D5DB] rounded-xl p-4 shadow-sm lg:p-6 opacity-50 cursor-not-allowed pointer-events-none" aria-disabled="true">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center lg:w-10 lg:h-10">
                  <MessageCircle className="w-8 h-8 text-[#002F5B] lg:w-10 lg:h-10" />
                </div>
                <div className="text-center">
                  <h3 className="text-base font-bold text-[#002F5B] mb-1 lg:text-[18px]">
                    Message
                  </h3>
                  <p className="text-xs text-[#686767] lg:text-[14px]">
                    Chat with Guest
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Section */}
          <div className="flex flex-col gap-6 lg:flex-row lg:gap-[23px]">
            {/* Recent Listings */}
            <div className="basis-2/3 shrink-2 bg-white border border-[#D1D5DB] rounded-lg p-4 lg:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                <h2 className="text-lg lg:text-[24px] font-bold text-[#002F5B]">
                  Recent Listings
                </h2>
                <div className="flex items-center gap-2 px-3 py-2 border border-[#D1D5DB] rounded-lg">
                  <span className="text-sm text-[#121212]">All</span>
                  <ChevronDown className="w-4 h-4 text-[#121212]" />
                </div>
              </div>

              <div className="border-t border-[#D1D5DB] pt-4">
                <div className="space-y-0">
                  {listings.map((listing) => (
                    <div
                      key={listing.id}
                      className="flex flex-col justify-center items-start py-3 pb-6 gap-6 w-full border-b border-[#D1D5DB] last:border-b-0 lg:h-[256px]"
                    >
                      {/* Main content row */}
                      <div className="flex flex-row items-center lg:justify-between py-3 gap-4 w-full lg:gap-16 lg:py-[13px] lg:h-[146px]">
                        {/* Image container */}
                        <div className="w-[99px] h-[92px] rounded-lg overflow-hidden flex-shrink-0 lg:w-[120px] lg:h-[120px]">
                          <Image
                            src={listing.image}
                            alt={listing.name}
                            width={120}
                            height={120}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </div>

                        {/* Content section */}
                        <div className="flex flex-col items-start gap-3 lg:h-[77px] lg:flex-shrink-0">
                          {/* Title and details */}
                          <div className="flex flex-col items-start gap-1 lg:gap-[5px] lg:w-[198px] lg:h-[46px]">
                            <h3 className="font-medium text-base leading-5 text-[#002F5B] lg:text-[18px] lg:leading-[22px]">
                              {listing.name}
                            </h3>
                            <p className="font-normal text-sm leading-4 text-[#686767] lg:text-[16px] lg:leading-[19px]">
                              {listing.location}
                            </p>
                            <p className="font-normal text-sm leading-4 text-[#686767] lg:text-[16px] lg:leading-[19px]">
                              {listing.createdDate}
                            </p>
                          </div>
                        </div>

                        {/* Price and status section */}
                        <div className="flex flex-col items-end gap-2 w-fit lg:flex-row lg:justify-center lg:items-center lg:p-[10px] lg:gap-[10px] lg:h-[44px] lg:flex-shrink-0">
                          <p className="font-bold text-lg leading-6 text-[#002F5B] lg:text-[20px] lg:leading-[24px]">
                            {listing.price}
                          </p>

                          {/* Status badge */}
                          <div className={`flex flex-row items-center px-2 py-1 gap-1 rounded-full flex-shrink-0 lg:px-[9px] lg:py-[7px] lg:gap-[3px] ${
                            listing.status === 'Completed' ? 'bg-[#DCFCE7]' :
                            listing.status === 'Pending' ? 'bg-[#FEF3C7]' :
                            'bg-[#FEE2E2]'
                          }`}>
                            <span className={`text-xs font-medium text-center lg:text-[16px] lg:leading-[19px] ${
                              listing.status === 'Completed' ? 'text-[#166534]' :
                              listing.status === 'Pending' ? 'text-[#92400E]' :
                              'text-[#B91C1C]'
                            }`}>
                              {listing.status}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons row */}
                      <div className="flex flex-row items-center gap-2 w-full lg:gap-[7px] lg:w-[294px] lg:h-[44px]">
                        {/* View button */}
                        <button className="flex flex-row justify-center items-center px-3 py-2 gap-2 bg-[#DCFCE7] rounded-lg flex-1 lg:px-[10px] lg:py-[13px] lg:gap-[10px] lg:w-[93px] lg:h-[44px] lg:flex-none">
                          <Eye className="w-4 h-4 text-[#166534] lg:w-6 lg:h-6" />
                          <span className="text-sm font-semibold text-[#166534] lg:text-[16px] lg:leading-[19px]">
                            View
                          </span>
                        </button>

                        {/* Edit button */}
                        <button className="flex flex-row justify-center items-center px-3 py-2 gap-2 bg-[#EDF6FF] rounded-lg flex-1 lg:px-[10px] lg:py-[13px] lg:gap-[10px] lg:w-[85px] lg:h-[44px] lg:flex-none">
                          <Edit className="w-4 h-4 text-[#002F5B] lg:w-6 lg:h-6" />
                          <span className="text-sm font-semibold text-[#002F5B] lg:text-[16px] lg:leading-[19px]">
                            Edit
                          </span>
                        </button>

                        {/* Pause button */}
                        <button className="flex flex-row justify-center items-center px-3 py-2 gap-2 bg-[#FEE2E2] rounded-lg flex-1 lg:px-[10px] lg:py-[13px] lg:gap-[10px] lg:w-[102px] lg:h-[44px] lg:flex-none">
                          <Pause className="w-4 h-4 text-[#B91C1C] lg:w-6 lg:h-6" />
                          <span className="text-sm font-semibold text-[#B91C1C] lg:text-[16px] lg:leading-[19px]">
                            Pause
                          </span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Earnings */}
            <div className="w-full basis-1/3 bg-white border border-[#D1D5DB] rounded-lg p-4 lg:p-6">
              <h2 className="text-lg lg:text-[24px] font-bold text-[#002F5B] mb-4 pb-2 border-b border-[#D1D5DB]">
                Recent Earnings
              </h2>

              <div className="space-y-4">
                {earnings.map((earning) => (
                  <div
                    key={earning.id}
                    className="flex items-center gap-4 p-4 border-b border-[#D1D5DB] last:border-b-0"
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center lg:w-12 lg:h-12 ${
                      earning.type === 'payment' ? 'bg-red-100' : 'bg-green-100'
                    }`}>
                      <Send className={`w-4 h-4 lg:w-6 lg:h-6 ${
                        earning.type === 'payment' ? 'text-red-600' : 'text-green-600'
                      }`} />
                    </div>

                    <div className="flex-1">
                      <h3 className="text-sm lg:text-[18px] font-medium text-[#002F5B]">
                        {earning.title}
                      </h3>
                      <p className="text-xs lg:text-[14px] text-[#686767]">
                        {earning.date}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className={`text-sm lg:text-[14px] font-medium ${
                        earning.type === 'payment' ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {earning.amount}
                      </p>
                      <p className="text-xs text-green-600">
                        {earning.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Add Listing Modal */}
        <AddListingModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
        />
    </>
  );
}
