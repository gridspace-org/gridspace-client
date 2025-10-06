"use client";

import { useState } from "react";
import { ArrowLeft, Plus, Eye, Edit, Calendar, ChevronDown, Star } from "lucide-react";
import AddListingModal from "../components/AddListingModal";

type Listing = {
  id: string;
  name: string;
  location: string;
  status: "Completed" | "Pending";
  dailyRate: string;
  ratingText: string; // e.g. 4.5 (120 reviews)
  type: string;
  capacity: string;
  totalBookings: number;
};

type BookingRow = {
  id: string;
  spaceName: string;
  location: string;
  guestName: string;
  dateRange: string;
  amount: string;
};

const mockListings: Listing[] = [
  {
    id: "1",
    name: "Urban Coworking Hub",
    location: "Victoria Island, Lagos",
    status: "Completed",
    dailyRate: "₦10,000/day",
    ratingText: "4.5 (120 reviews)",
    type: "Shared Desk",
    capacity: "50 People",
    totalBookings: 10,
  },
  {
    id: "2",
    name: "Creative Hub",
    location: "Ikeja, Lagos",
    status: "Completed",
    dailyRate: "₦10,000/day",
    ratingText: "4.5 (120 reviews)",
    type: "Shared Desk",
    capacity: "50 People",
    totalBookings: 10,
  },
  {
    id: "3",
    name: "Urban Coworking Hub",
    location: "Victoria Island, Lagos",
    status: "Pending",
    dailyRate: "₦10,000/day",
    ratingText: "4.5 (120 reviews)",
    type: "Shared Desk",
    capacity: "50 People",
    totalBookings: 10,
  },
  {
    id: "4",
    name: "Urban Coworking Hub",
    location: "Victoria Island, Lagos",
    status: "Pending",
    dailyRate: "₦5,000/day",
    ratingText: "4.5 (120 reviews)",
    type: "Shared Desk",
    capacity: "50 People",
    totalBookings: 10,
  },
];

const mockBookings: BookingRow[] = [
  {
    id: "b1",
    spaceName: "Creative Hub",
    location: "Ikeja, Lagos",
    guestName: "Deba Derek",
    dateRange: "25 June, 2025 9:00am to 2:00pm",
    amount: "₦10,000",
  },
  {
    id: "b2",
    spaceName: "Creative Hub",
    location: "Ikeja, Lagos",
    guestName: "Uche Montana",
    dateRange: "25 June, 2025 9:00am to 2:00pm",
    amount: "₦10,000",
  },
  {
    id: "b3",
    spaceName: "Urban Coworking Hub",
    location: "Victoria Island, Lagos",
    guestName: "Uche Montana",
    dateRange: "20 June, 2025 9:00am to 4:00pm",
    amount: "₦5,000",
  },
  {
    id: "b4",
    spaceName: "Urban Coworking Hub",
    location: "Victoria Island, Lagos",
    guestName: "Uche Montana",
    dateRange: "20 June, 2025 9:00am to 4:00pm",
    amount: "₦5,000",
  },
];

export default function ListingsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const totalListings = mockListings.length;
  const approvedListings = mockListings.filter(l => l.status === "Completed").length;
  const pendingListings = mockListings.filter(l => l.status === "Pending").length;
  const totalBookings = mockListings.reduce((sum, l) => sum + l.totalBookings, 0);

  return (
    <>
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 pb-8">
        {/* Header: My Listings + CTA */}
        <div className="flex items-center justify-between gap-6 md:gap-[33px] overflow-x-auto">
          <div className="flex items-center gap-2 md:gap-6 min-w-max">
            <button className="p-2 rounded-lg hover:bg-gray-100 text-[#121212]"><ArrowLeft className="w-6 h-6" /></button>
            <div>
              <h1 className="text-[20px] leading-[24px] md:text-[32px] md:leading-[39px] font-bold text-[#002F5B]">My Listings</h1>
              <p className="text-[14px] leading-[17px] md:text-[18px] md:leading-[22px] tracking-[-0.25px] text-[#686767]">Manage your workspace Listings</p>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 px-2 h-10 md:px-3 md:h-11 bg-[#F25417] text-white rounded-lg min-w-[121px] md:min-w-[142px]"
          >
            <Plus className="w-5 h-5" />
            <span className="text-[14px] md:text-[16px] font-semibold">Add Listing</span>
          </button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[23px] mt-6">
          <div className="bg-white border border-[#D1D5DB] rounded-xl shadow-[0_4px_4px_rgba(222,222,222,0.25)] p-4 flex flex-col items-center gap-3">
            <div className="text-[32px] leading-[39px] font-semibold text-[#002F5B]">{totalListings}</div>
            <div className="text-[18px] leading-[22px] text-center text-[#686767]">Total Listings</div>
          </div>
          <div className="bg-white border border-[#D1D5DB] rounded-xl shadow-[0_4px_4px_rgba(222,222,222,0.25)] p-4 flex flex-col items-center gap-3">
            <div className="text-[32px] leading-[39px] font-semibold text-[#002F5B]">{approvedListings}</div>
            <div className="text-[18px] leading-[22px] text-center text-[#686767]">Approved Listings</div>
          </div>
          <div className="bg-white border border-[#D1D5DB] rounded-xl shadow-[0_4px_4px_rgba(222,222,222,0.25)] p-4 flex flex-col items-center gap-3">
            <div className="text-[32px] leading-[39px] font-semibold text-[#002F5B]">{pendingListings}</div>
            <div className="text-[18px] leading-[22px] text-center text-[#686767]">Pending listings</div>
          </div>
          <div className="bg-white border border-[#D1D5DB] rounded-xl shadow-[0_4px_4px_rgba(222,222,222,0.25)] p-4 flex flex-col items-center gap-3">
            <div className="text-[32px] leading-[39px] font-semibold text-[#002F5B]">{totalBookings}</div>
            <div className="text-[18px] leading-[22px] text-center text-[#686767]">Total Bookings</div>
          </div>
        </div>

        {/* Main Content: Listings (left) + Bookings (right) */}
        <div className="mt-6 flex flex-col lg:flex-row gap-[23px]">
          {/* Listings Panel */}
          <div className="bg-white border border-[#D1D5DB] flex-1 rounded-lg p-4 md:p-6 flex flex-col gap-4 min-h-[400px]">
            <div className="flex items-center justify-between">
              <h2 className="text-[20px] leading-[24px] md:text-[24px] md:leading-[29px] font-bold text-[#002F5B]">Listings</h2>
              <button className="flex items-center justify-between gap-3 w-[137px] h-[44px] md:w-[188px] md:h-[50px] px-3 py-2 border border-[#D1D5DB] rounded-lg text-[#121212]">
                <span className="text-[14px] md:text-[16px]">All</span>
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>
            <div className="h-px w-full bg-[#D1D5DB]" />

            <div className="flex flex-col divide-y divide-[#D1D5DB]">
              {mockListings.map((l) => (
                <div key={l.id} className="py-3 flex flex-col gap-4">
                  {/* Row top: name/location + status + price/rating */}
                  <div className="flex items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                      <div>
                        <div className="text-[18px] font-medium text-[#002F5B]">{l.name}</div>
                        <div className="text-[16px] text-[#686767]">{l.location}</div>
                      </div>
                      {l.status === "Completed" ? (
                        <div className="px-2 py-1 rounded-full bg-[#DCFCE7]">
                          <span className="text-[14px] text-[#166534]">Completed</span>
                        </div>
                      ) : (
                        <div className="px-2 py-1 rounded-full bg-[#FEF3C7]">
                          <span className="text-[14px] text-[#92400E]">Pending</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-end gap-4 min-w-[150px]">
                      <div>
                        <div className="text-[20px] font-bold text-[#002F5B]">{l.dailyRate}</div>
                        <div className="flex items-center gap-2 text-[16px] text-[#686767]">
                          <Star className="w-5 h-5 text-[#F25417]" fill="#F25417" />
                          <span>{l.ratingText}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Row middle: meta */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-16">
                    <div>
                      <div className="text-[16px] text-[#686767]">Type</div>
                      <div className="text-[16px] text-[#002F5B] font-medium">{l.type}</div>
                    </div>
                    <div>
                      <div className="text-[16px] text-[#686767]">Capacity</div>
                      <div className="text-[16px] text-[#002F5B] font-medium">{l.capacity}</div>
                    </div>
                    <div>
                      <div className="text-[16px] text-[#686767]">Total Bookings</div>
                      <div className="text-[16px] text-[#002F5B] font-medium">{l.totalBookings}</div>
                    </div>
                  </div>

                  {/* Row bottom: actions */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <button className="flex items-center gap-2 px-3 h-11 border border-[#D1D5DB] rounded-lg text-[#686767]">
                      <Eye className="w-5 h-5" />
                      <span className="text-[16px] font-semibold">View</span>
                    </button>
                    <button className="flex items-center gap-2 px-3 h-11 border border-[#D1D5DB] rounded-lg text-[#686767]">
                      <Edit className="w-5 h-5" />
                      <span className="text-[16px] font-semibold">Edit</span>
                    </button>
                    <button className="flex items-center gap-2 px-3 h-11 border border-[#D1D5DB] rounded-lg text-[#686767]">
                      <Calendar className="w-5 h-5" />
                      <span className="text-[16px] font-semibold">Bookings</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bookings Panel */}
          <div className="bg-white border border-[#D1D5DB] w-full md:flex-none lg:shrink-2 lg:basis-1/3 rounded-lg p-4 md:p-5 flex flex-col gap-3 min-h-[400px]">
            <div className="pb-2 border-b border-[#D1D5DB]">
              <h2 className="text-[20px] leading-[24px] md:text-[24px] md:leading-[29px] font-bold text-[#002F5B]">Bookings ({mockBookings.length})</h2>
            </div>

            {/* Header Row */}
            <div className="hidden md:grid grid-cols-[1.5fr,1fr,1.4fr,0.8fr] text-[14px] text-[#002F5B] font-semibold pb-2 border-b border-[#D1D5DB]">
              <span>Space Name & Location</span>
              <span>Guest Name</span>
              <span>Date & Time</span>
              <span>Amount</span>
            </div>

            {/* Rows */}
            <div className="flex flex-col divide-y divide-[#D1D5DB]">
              {mockBookings.map((b) => (
                <div key={b.id} className="py-4 md:grid md:grid-cols-[1.5fr,1fr,1.4fr,0.8fr] md:items-center">
                  {/* Mobile stacked row */}
                  <div className="md:hidden flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-[14px] font-medium text-[#002F5B]">{b.spaceName}</div>
                        <div className="text-[12px] text-[#686767]">{b.location}</div>
                      </div>
                      <div className="text-[12px] font-medium text-[#002F5B]">{b.amount}</div>
                    </div>
                    <div className="text-[12px] text-[#121212]">{b.guestName}</div>
                    <div className="text-[12px] text-[#121212]">{b.dateRange}</div>
                  </div>

                  {/* Desktop row */}
                  <div className="hidden md:block">
                    <div className="text-[14px] font-medium text-[#002F5B]">{b.spaceName}</div>
                    <div className="text-[12px] text-[#686767]">{b.location}</div>
                  </div>
                  <div className="hidden md:block text-[14px] text-[#121212]">{b.guestName}</div>
                  <div className="hidden md:block text-[14px] text-[#121212]">{b.dateRange}</div>
                  <div className="hidden md:block text-[14px] font-medium text-[#002F5B]">{b.amount}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Listing Modal */}
      <AddListingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}


