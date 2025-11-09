"use client";

import { ArrowRight, Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import adminApiService, { Booking } from "@/services/adminApi";

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchBookings();
  }, [currentPage]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminApiService.getBookings({
        page: currentPage,
        limit: 10,
      });
      setBookings(response.data.bookings);
      setTotalPages(response.data.pagination.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return { bg: 'bg-[#FEF3C7]', text: 'text-[#92400E]' };
      case 'upcoming': return { bg: 'bg-[#DBEAFE]', text: 'text-[#1E40AF]' };
      case 'in_progress': return { bg: 'bg-[#E0E7FF]', text: 'text-[#3730A3]' };
      case 'completed': return { bg: 'bg-[#DCFCE7]', text: 'text-[#166534]' };
      case 'cancelled': return { bg: 'bg-[#FEE2E2]', text: 'text-[#B91C1C]' };
      default: return { bg: 'bg-gray-100', text: 'text-gray-700' };
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return { bg: 'bg-[#DCFCE7]', text: 'text-[#166534]' };
      case 'pending': return { bg: 'bg-[#FEF3C7]', text: 'text-[#92400E]' };
      case 'failed': return { bg: 'bg-[#FEE2E2]', text: 'text-[#B91C1C]' };
      case 'refunded': return { bg: 'bg-[#F3E8FF]', text: 'text-[#6B21A8]' };
      default: return { bg: 'bg-gray-100', text: 'text-gray-700' };
    }
  };

  return (
    <section className="flex flex-col items-start gap-4 md:gap-6 w-full">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-2 md:gap-[24px] w-full overflow-x-auto">
        <div className="flex items-center gap-2 md:gap-6">
          <ArrowRight className="w-6 h-6 text-[#121212] rotate-180" />
          <div className="flex flex-col gap-1">
            <h2 className="text-[20px] md:text-[32px] leading-[24px] md:leading-[39px] font-bold text-[#002F5B]">
              Bookings Management
            </h2>
            <p className="text-[14px] md:text-[18px] leading-[17px] md:leading-[22px] tracking-[-0.25px] text-[#686767]">
              Track and manage platform bookings
            </p>
          </div>
        </div>
      </div>

      {/* Data table */}
      <div className="w-full bg-white rounded-md shadow-[0px_4px_4px_rgba(222,222,222,0.25)] p-4 md:p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#002F5B]"></div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <p className="text-[16px] text-[#B91C1C]">{error}</p>
            <button
              onClick={fetchBookings}
              className="px-4 py-2 bg-[#002F5B] text-white rounded-lg hover:bg-[#003d75]"
            >
              Retry
            </button>
          </div>
        ) : bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <Calendar className="w-16 h-16 text-[#D1D5DB]" />
            <h3 className="text-[20px] font-semibold text-[#002F5B]">No Bookings Found</h3>
            <p className="text-[16px] text-[#686767] text-center max-w-md">
              There are no bookings to display at the moment. Bookings will appear here as users make reservations.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-[#D1D5DB]">
            <table className="w-full min-w-[1000px]">
              <thead>
                <tr className="border-b border-[#D1D5DB]">
                  <th className="text-left py-4 px-3 text-[16px] font-semibold text-[#002F5B]">Guest</th>
                  <th className="text-left py-4 px-3 text-[16px] font-semibold text-[#002F5B]">Space</th>
                  <th className="text-left py-4 px-3 text-[16px] font-semibold text-[#002F5B]">Host</th>
                  <th className="text-left py-4 px-3 text-[16px] font-semibold text-[#002F5B]">Date Range</th>
                  <th className="text-left py-4 px-3 text-[16px] font-semibold text-[#002F5B]">Status</th>
                  <th className="text-left py-4 px-3 text-[16px] font-semibold text-[#002F5B]">Payment</th>
                  <th className="text-left py-4 px-3 text-[16px] font-semibold text-[#002F5B]">Amount</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => {
                  const statusStyle = getStatusColor(booking.status);
                  const paymentStyle = getPaymentStatusColor(booking.paymentStatus);
                  return (
                    <tr key={booking._id} className="border-b border-[#D1D5DB] hover:bg-[#F9FBFC]">
                      {/* Guest */}
                      <td className="py-4 px-3">
                        <div className="flex flex-col gap-1 min-w-[140px]">
                          <span className="text-[16px] font-medium text-[#121212]">{booking.user?.fullname || 'Unknown'}</span>
                          <span className="text-[14px] text-[#686767]">{booking.user?.email || 'N/A'}</span>
                        </div>
                      </td>

                      {/* Space */}
                      <td className="py-4 px-3">
                        <span className="text-[16px] text-[#121212] min-w-[140px] block">{booking.space?.title || 'Unknown'}</span>
                      </td>

                      {/* Host */}
                      <td className="py-4 px-3">
                        <div className="flex flex-col gap-1 min-w-[140px]">
                          <span className="text-[16px] font-medium text-[#121212]">{booking.host?.fullname || 'Unknown'}</span>
                          <span className="text-[14px] text-[#686767]">{booking.host?.email || 'N/A'}</span>
                        </div>
                      </td>

                      {/* Date Range */}
                      <td className="py-4 px-3">
                        <div className="flex flex-col gap-1 min-w-[120px]">
                          <span className="text-[14px] text-[#686767]">{formatDate(booking.startDate)}</span>
                          <span className="text-[14px] text-[#686767]">{formatDate(booking.endDate)}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-3">
                        <div className={`inline-flex items-center px-2 py-[7px] gap-1 ${statusStyle.bg} rounded-full`}>
                          <span className={`text-[12px] ${statusStyle.text} capitalize`}>
                            {booking.status.replace('_', ' ')}
                          </span>
                        </div>
                      </td>

                      {/* Payment */}
                      <td className="py-4 px-3">
                        <div className={`inline-flex items-center px-2 py-[7px] gap-1 ${paymentStyle.bg} rounded-full`}>
                          <span className={`text-[12px] ${paymentStyle.text} capitalize`}>
                            {booking.paymentStatus}
                          </span>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="py-4 px-3">
                        <span className="text-[16px] font-semibold text-[#002F5B]">₦{booking.totalPrice.toLocaleString()}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}


