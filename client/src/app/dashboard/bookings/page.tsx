"use client";

import { Eye, RefreshCw, Trash2, ChevronDown } from "lucide-react";

export default function BookingsPage() {
  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-6">
      <div className="flex flex-col gap-6">
        {/* Page Header */}
        <div className="flex flex-col gap-1">
          <h1 className="text-[16px] md:text-[32px] font-semibold md:font-bold text-[#002F5B] leading-[19px] md:leading-[39px]">
            Welcome Pearl!
          </h1>
          <p className="text-[12px] md:text-[18px] text-[#686767] leading-[15px] md:leading-[22px] tracking-[-0.25px]">
            Discover your next workspace or manage existing bookings
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="flex flex-col gap-3 md:gap-6 md:flex-row">
          {/* Total Bookings */}
          <div className="flex-1 bg-white border border-[#D1D5DB] rounded-[12px] p-4 md:p-6 shadow-[0px_4px_4px_rgba(222,222,222,0.25)]">
            <div className="flex flex-col items-center gap-2">
              <span className="text-[32px] font-semibold text-[#002F5B] leading-[39px]">
                4
              </span>
              <span className="text-[16px] md:text-[20px] text-[#686767] leading-[19px] md:leading-[24px] text-center">
                Total Bookings
              </span>
            </div>
          </div>

          {/* Upcoming Bookings */}
          <div className="flex-1 bg-white border border-[#D1D5DB] rounded-[12px] p-4 md:p-6 shadow-[0px_4px_4px_rgba(222,222,222,0.25)]">
            <div className="flex flex-col items-center gap-2">
              <span className="text-[32px] font-semibold text-[#2BD16A] leading-[39px]">
                1
              </span>
              <span className="text-[16px] md:text-[20px] text-[#686767] leading-[19px] md:leading-[24px] text-center">
                Upcoming Bookings
              </span>
            </div>
          </div>

          {/* Past Bookings */}
          <div className="flex-1 bg-white border border-[#D1D5DB] rounded-[12px] p-4 md:p-6 shadow-[0px_4px_4px_rgba(222,222,222,0.25)]">
            <div className="flex flex-col items-center gap-2">
              <span className="text-[32px] font-semibold text-[#002F5B] leading-[39px]">
                1
              </span>
              <span className="text-[16px] md:text-[20px] text-[#686767] leading-[19px] md:leading-[24px] text-center">
                Past Bookings
              </span>
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white border border-[#D1D5DB] rounded-[12px] shadow-[0px_4px_4px_rgba(222,222,222,0.25)]">
          <div className="p-4 md:p-6 lg:p-8">
            {/* Header with Filter */}
            <div className="flex justify-between items-center mb-4 md:mb-6">
              <h2 className="text-[20px] md:text-[24px] font-bold text-[#002F5B] leading-[24px] md:leading-[29px]">
                Recent Bookings (4)
              </h2>
              <div className="flex items-center gap-2 px-3 py-2 bg-white border border-[#D1D5DB] rounded-[8px]">
                <span className="text-[14px] md:text-[16px] text-[#121212] leading-[17px] md:leading-[19px]">All</span>
                <ChevronDown className="w-5 h-5 md:w-6 md:h-6 text-[#121212]" />
              </div>
            </div>

            {/* Divider */}
            <div className="w-full h-[0.5px] bg-[#D1D5DB] mb-4 md:mb-6"></div>

            {/* Mobile Card Layout */}
            <div className="block md:hidden space-y-4">
              {/* Booking Card 1 - Upcoming */}
              <div className="border-b border-[#D1D5DB] pb-4">
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-2">
                      <span className="text-[12px] text-[#686767] leading-[15px]">WS582622</span>
                      <div className="flex flex-col gap-1">
                        <span className="text-[16px] font-medium text-[#002F5B] leading-[19px]">
                          Urban Coworking Hub
                        </span>
                        <span className="text-[12px] text-[#686767] leading-[15px]">
                          Victoria Island, Lagos
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-center w-[86px] h-[25px] bg-[#EDF6FF] rounded-[100px]">
                      <span className="text-[14px] text-[#002F5B] leading-[17px] text-center">
                        Upcoming
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-[14px] text-[#686767] leading-[17px]">
                    <span className="font-bold text-[#002F5B]">₦10,000</span>
                    <span>4 Guests</span>
                    <span>June 22nd, 2025</span>
                    <span>9:00AM - 4:00PM</span>
                  </div>
                  
                  <div className="flex items-center flex-wrap gap-2">
                    <button className="flex items-center gap-2 px-3 py-2 bg-[#DCFCE7] rounded-[8px]">
                      <Eye className="w-4 h-4 text-[#166534]" />
                      <span className="text-[14px] font-semibold text-[#166534] leading-[17px]">View</span>
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 bg-[#EDF6FF] rounded-[8px]">
                      <RefreshCw className="w-4 h-4 text-[#002F5B]" />
                      <span className="text-[14px] font-semibold text-[#002F5B] leading-[17px]">Reschedule</span>
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 bg-[#FEE2E2] rounded-[8px]">
                      <Trash2 className="w-4 h-4 text-[#B91C1C]" />
                      <span className="text-[14px] font-semibold text-[#B91C1C] leading-[17px]">Cancel</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Booking Card 2 - Pending */}
              <div className="border-b border-[#D1D5DB] pb-4">
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-2">
                      <span className="text-[12px] text-[#686767] leading-[15px]">WS582622</span>
                      <div className="flex flex-col gap-1">
                        <span className="text-[16px] font-medium text-[#002F5B] leading-[19px]">
                          Urban Coworking Hub
                        </span>
                        <span className="text-[12px] text-[#686767] leading-[15px]">
                          Victoria Island, Lagos
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-center w-[72px] h-[25px] bg-[#FEF3C7] rounded-[100px]">
                      <span className="text-[14px] text-[#92400E] leading-[17px] text-center">
                        Pending
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-[14px] text-[#686767] leading-[17px]">
                    <span className="font-bold text-[#002F5B]">₦10,000</span>
                    <span>4 Guests</span>
                    <span>June 22nd, 2025</span>
                    <span>9:00AM - 4:00PM</span>
                  </div>
                  
                  <div className="flex items-center flex-wrap gap-2">
                    <button className="flex items-center gap-2 px-3 py-2 bg-[#DCFCE7] rounded-[8px]">
                      <Eye className="w-4 h-4 text-[#166534]" />
                      <span className="text-[14px] font-semibold text-[#166534] leading-[17px]">View</span>
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 bg-[#EDF6FF] rounded-[8px]">
                      <RefreshCw className="w-4 h-4 text-[#002F5B]" />
                      <span className="text-[14px] font-semibold text-[#002F5B] leading-[17px]">Reschedule</span>
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 bg-[#FEE2E2] rounded-[8px]">
                      <Trash2 className="w-4 h-4 text-[#B91C1C]" />
                      <span className="text-[14px] font-semibold text-[#B91C1C] leading-[17px]">Cancel</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Booking Card 3 - Completed */}
              <div className="border-b border-[#D1D5DB] pb-4">
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-2">
                      <span className="text-[12px] text-[#686767] leading-[15px]">WS582622</span>
                      <div className="flex flex-col gap-1">
                        <span className="text-[16px] font-medium text-[#002F5B] leading-[19px]">
                          Urban Coworking Hub
                        </span>
                        <span className="text-[12px] text-[#686767] leading-[15px]">
                          Victoria Island, Lagos
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-center w-[91px] h-[25px] bg-[#DCFCE7] rounded-[100px]">
                      <span className="text-[14px] text-[#166534] leading-[17px] text-center">
                        Completed
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-[14px] text-[#686767] leading-[17px]">
                    <span className="font-bold text-[#002F5B]">₦10,000</span>
                    <span>4 Guests</span>
                    <span>June 22nd, 2025</span>
                    <span>9:00AM - 4:00PM</span>
                  </div>
                  
                  <div className="flex items-center flex-wrap gap-2">
                    <button className="flex items-center gap-2 px-3 py-2 bg-[#DCFCE7] rounded-[8px]">
                      <Eye className="w-4 h-4 text-[#166534]" />
                      <span className="text-[14px] font-semibold text-[#166534] leading-[17px]">View</span>
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 bg-[#EDF6FF] rounded-[8px]">
                      <RefreshCw className="w-4 h-4 text-[#002F5B]" />
                      <span className="text-[14px] font-semibold text-[#002F5B] leading-[17px]">Reschedule</span>
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 bg-[#FEE2E2] rounded-[8px]">
                      <Trash2 className="w-4 h-4 text-[#B91C1C]" />
                      <span className="text-[14px] font-semibold text-[#B91C1C] leading-[17px]">Cancel</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Booking Card 4 - Canceled */}
              <div className="pb-4">
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-2">
                      <span className="text-[12px] text-[#686767] leading-[15px]">WS582622</span>
                      <div className="flex flex-col gap-1">
                        <span className="text-[16px] font-medium text-[#002F5B] leading-[19px]">
                          Urban Coworking Hub
                        </span>
                        <span className="text-[12px] text-[#686767] leading-[15px]">
                          Victoria Island, Lagos
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-center w-[81px] h-[25px] bg-[#FEE2E2] rounded-[100px]">
                      <span className="text-[14px] text-[#B91C1C] leading-[17px] text-center">
                        Canceled
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-[14px] text-[#686767] leading-[17px]">
                    <span className="font-bold text-[#002F5B]">₦10,000</span>
                    <span>4 Guests</span>
                    <span>June 22nd, 2025</span>
                    <span>9:00AM - 4:00PM</span>
                  </div>
                  
                  <div className="flex items-center flex-wrap gap-2">
                    <button className="flex items-center gap-2 px-3 py-2 bg-[#DCFCE7] rounded-[8px]">
                      <Eye className="w-4 h-4 text-[#166534]" />
                      <span className="text-[14px] font-semibold text-[#166534] leading-[17px]">View</span>
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 bg-[#EDF6FF] rounded-[8px]">
                      <RefreshCw className="w-4 h-4 text-[#002F5B]" />
                      <span className="text-[14px] font-semibold text-[#002F5B] leading-[17px]">Reschedule</span>
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 bg-[#FEE2E2] rounded-[8px]">
                      <Trash2 className="w-4 h-4 text-[#B91C1C]" />
                      <span className="text-[14px] font-semibold text-[#B91C1C] leading-[17px]">Cancel</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop Table Layout */}
            <div className="hidden md:block overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 rounded-lg border border-[#D1D5DB]">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b border-[#D1D5DB]">
                    <th className="text-left py-4 px-2 text-[16px] font-medium text-[#686767] leading-[19px] w-[120px]">
                      Booking ID
                    </th>
                    <th className="text-left py-4 px-2 text-[16px] font-medium text-[#686767] leading-[19px] w-[200px]">
                      Workspace
                    </th>
                    <th className="text-left py-4 px-2 text-[16px] font-medium text-[#686767] leading-[19px] w-[100px]">
                      Price
                    </th>
                    <th className="text-left py-4 px-2 text-[16px] font-medium text-[#686767] leading-[19px] w-[100px]">
                      Guests
                    </th>
                    <th className="text-left py-4 px-2 text-[16px] font-medium text-[#686767] leading-[19px] w-[150px]">
                      Date
                    </th>
                    <th className="text-left py-4 px-2 text-[16px] font-medium text-[#686767] leading-[19px] w-[150px]">
                      Time
                    </th>
                    <th className="text-left py-4 px-2 text-[16px] font-medium text-[#686767] leading-[19px] w-[120px]">
                      Status
                    </th>
                    <th className="text-left py-4 px-2 text-[16px] font-medium text-[#686767] leading-[19px] w-[200px]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {/* Booking 1 - Upcoming */}
                  <tr className="border-b border-[#D1D5DB] hover:bg-[#F9FBFC]">
                    <td className="py-4 px-2 whitespace-nowrap">
                      <span className="text-[18px] text-[#686767] leading-[22px]">
                        WS582622
                      </span>
                    </td>
                    <td className="py-4 px-2 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <span className="text-[18px] text-[#002F5B] leading-[22px]">
                          Urban Coworking Hub
                        </span>
                        <span className="text-[16px] text-[#686767] leading-[19px]">
                          Victoria Island, Lagos
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-2 whitespace-nowrap">
                      <span className="text-[20px] font-bold text-[#002F5B] leading-[24px]">
                        ₦10,000
                      </span>
                    </td>
                    <td className="py-4 px-2 whitespace-nowrap">
                      <span className="text-[18px] text-[#686767] leading-[22px]">
                        4 Guests
                      </span>
                    </td>
                    <td className="py-4 px-2 whitespace-nowrap">
                      <span className="text-[18px] text-[#686767] leading-[22px]">
                        June 22nd, 2025
                      </span>
                    </td>
                    <td className="py-4 px-2 whitespace-nowrap">
                      <span className="text-[18px] text-[#686767] leading-[22px]">
                        9:00AM - 4:00PM
                      </span>
                    </td>
                    <td className="py-4 px-2 whitespace-nowrap">
                      <div className="flex items-center justify-center w-[86px] h-[25px] bg-[#EDF6FF] rounded-[100px]">
                        <span className="text-[14px] text-[#002F5B] leading-[17px] text-center">
                          Upcoming
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-2 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button className="flex items-center gap-2 px-3 py-2 bg-[#DCFCE7] rounded-[8px]">
                          <Eye className="w-6 h-6 text-[#166534]" />
                          <span className="text-[16px] font-semibold text-[#166534] leading-[19px]">
                            View
                          </span>
                        </button>
                        <button className="flex items-center gap-2 px-3 py-2 bg-[#EDF6FF] rounded-[8px]">
                          <RefreshCw className="w-6 h-6 text-[#002F5B]" />
                          <span className="text-[16px] font-semibold text-[#002F5B] leading-[19px]">
                            Reschedule
                          </span>
                        </button>
                        <button className="flex items-center gap-2 px-3 py-2 bg-[#FEE2E2] rounded-[8px]">
                          <Trash2 className="w-6 h-6 text-[#B91C1C]" />
                          <span className="text-[16px] font-semibold text-[#B91C1C] leading-[19px]">
                            Cancel
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Booking 2 - Pending */}
                  <tr className="border-b border-[#D1D5DB] hover:bg-[#F9FBFC]">
                    <td className="py-4 px-2 whitespace-nowrap">
                      <span className="text-[18px] text-[#686767] leading-[22px]">
                        WS582622
                      </span>
                    </td>
                    <td className="py-4 px-2 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <span className="text-[18px] text-[#002F5B] leading-[22px]">
                          Urban Coworking Hub
                        </span>
                        <span className="text-[16px] text-[#686767] leading-[19px]">
                          Victoria Island, Lagos
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-2 whitespace-nowrap">
                      <span className="text-[20px] font-bold text-[#002F5B] leading-[24px]">
                        ₦10,000
                      </span>
                    </td>
                    <td className="py-4 px-2 whitespace-nowrap">
                      <span className="text-[18px] text-[#686767] leading-[22px]">
                        4 Guests
                      </span>
                    </td>
                    <td className="py-4 px-2 whitespace-nowrap">
                      <span className="text-[18px] text-[#686767] leading-[22px]">
                        June 22nd, 2025
                      </span>
                    </td>
                    <td className="py-4 px-2 whitespace-nowrap">
                      <span className="text-[18px] text-[#686767] leading-[22px]">
                        9:00AM - 4:00PM
                      </span>
                    </td>
                    <td className="py-4 px-2 whitespace-nowrap">
                      <div className="flex items-center justify-center w-[72px] h-[25px] bg-[#FEF3C7] rounded-[100px]">
                        <span className="text-[14px] text-[#92400E] leading-[17px] text-center">
                          Pending
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-2 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button className="flex items-center gap-2 px-3 py-2 bg-[#DCFCE7] rounded-[8px]">
                          <Eye className="w-6 h-6 text-[#166534]" />
                          <span className="text-[16px] font-semibold text-[#166534] leading-[19px]">
                            View
                          </span>
                        </button>
                        <button className="flex items-center gap-2 px-3 py-2 bg-[#EDF6FF] rounded-[8px]">
                          <RefreshCw className="w-6 h-6 text-[#002F5B]" />
                          <span className="text-[16px] font-semibold text-[#002F5B] leading-[19px]">
                            Reschedule
                          </span>
                        </button>
                        <button className="flex items-center gap-2 px-3 py-2 bg-[#FEE2E2] rounded-[8px]">
                          <Trash2 className="w-6 h-6 text-[#B91C1C]" />
                          <span className="text-[16px] font-semibold text-[#B91C1C] leading-[19px]">
                            Cancel
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Booking 3 - Completed */}
                  <tr className="border-b border-[#D1D5DB] hover:bg-[#F9FBFC]">
                    <td className="py-4 px-2 whitespace-nowrap">
                      <span className="text-[18px] text-[#686767] leading-[22px]">
                        WS582622
                      </span>
                    </td>
                    <td className="py-4 px-2 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <span className="text-[18px] text-[#002F5B] leading-[22px]">
                          Urban Coworking Hub
                        </span>
                        <span className="text-[16px] text-[#686767] leading-[19px]">
                          Victoria Island, Lagos
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-2 whitespace-nowrap">
                      <span className="text-[20px] font-bold text-[#002F5B] leading-[24px]">
                        ₦10,000
                      </span>
                    </td>
                    <td className="py-4 px-2 whitespace-nowrap">
                      <span className="text-[18px] text-[#686767] leading-[22px]">
                        4 Guests
                      </span>
                    </td>
                    <td className="py-4 px-2 whitespace-nowrap">
                      <span className="text-[18px] text-[#686767] leading-[22px]">
                        June 22nd, 2025
                      </span>
                    </td>
                    <td className="py-4 px-2 whitespace-nowrap">
                      <span className="text-[18px] text-[#686767] leading-[22px]">
                        9:00AM - 4:00PM
                      </span>
                    </td>
                    <td className="py-4 px-2 whitespace-nowrap">
                      <div className="flex items-center justify-center w-[91px] h-[25px] bg-[#DCFCE7] rounded-[100px]">
                        <span className="text-[14px] text-[#166534] leading-[17px] text-center">
                          Completed
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-2 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button className="flex items-center gap-2 px-3 py-2 bg-[#DCFCE7] rounded-[8px]">
                          <Eye className="w-6 h-6 text-[#166534]" />
                          <span className="text-[16px] font-semibold text-[#166534] leading-[19px]">
                            View
                          </span>
                        </button>
                        <button className="flex items-center gap-2 px-3 py-2 bg-[#EDF6FF] rounded-[8px]">
                          <RefreshCw className="w-6 h-6 text-[#002F5B]" />
                          <span className="text-[16px] font-semibold text-[#002F5B] leading-[19px]">
                            Reschedule
                          </span>
                        </button>
                        <button className="flex items-center gap-2 px-3 py-2 bg-[#FEE2E2] rounded-[8px]">
                          <Trash2 className="w-6 h-6 text-[#B91C1C]" />
                          <span className="text-[16px] font-semibold text-[#B91C1C] leading-[19px]">
                            Cancel
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Booking 4 - Canceled */}
                  <tr className="hover:bg-[#F9FBFC]">
                    <td className="py-4 px-2 whitespace-nowrap">
                      <span className="text-[18px] text-[#686767] leading-[22px]">
                        WS582622
                      </span>
                    </td>
                    <td className="py-4 px-2 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <span className="text-[18px] text-[#002F5B] leading-[22px]">
                          Urban Coworking Hub
                        </span>
                        <span className="text-[16px] text-[#686767] leading-[19px]">
                          Victoria Island, Lagos
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-2 whitespace-nowrap">
                      <span className="text-[20px] font-bold text-[#002F5B] leading-[24px]">
                        ₦10,000
                      </span>
                    </td>
                    <td className="py-4 px-2 whitespace-nowrap">
                      <span className="text-[18px] text-[#686767] leading-[22px]">
                        4 Guests
                      </span>
                    </td>
                    <td className="py-4 px-2 whitespace-nowrap">
                      <span className="text-[18px] text-[#686767] leading-[22px]">
                        June 22nd, 2025
                      </span>
                    </td>
                    <td className="py-4 px-2 whitespace-nowrap">
                      <span className="text-[18px] text-[#686767] leading-[22px]">
                        9:00AM - 4:00PM
                      </span>
                    </td>
                    <td className="py-4 px-2 whitespace-nowrap">
                      <div className="flex items-center justify-center w-[81px] h-[25px] bg-[#FEE2E2] rounded-[100px]">
                        <span className="text-[14px] text-[#B91C1C] leading-[17px] text-center">
                          Canceled
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-2 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button className="flex items-center gap-2 px-3 py-2 bg-[#DCFCE7] rounded-[8px]">
                          <Eye className="w-6 h-6 text-[#166534]" />
                          <span className="text-[16px] font-semibold text-[#166534] leading-[19px]">
                            View
                          </span>
                        </button>
                        <button className="flex items-center gap-2 px-3 py-2 bg-[#EDF6FF] rounded-[8px]">
                          <RefreshCw className="w-6 h-6 text-[#002F5B]" />
                          <span className="text-[16px] font-semibold text-[#002F5B] leading-[19px]">
                            Reschedule
                          </span>
                        </button>
                        <button className="flex items-center gap-2 px-3 py-2 bg-[#FEE2E2] rounded-[8px]">
                          <Trash2 className="w-6 h-6 text-[#B91C1C]" />
                          <span className="text-[16px] font-semibold text-[#B91C1C] leading-[19px]">
                            Cancel
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
