"use client";

import { useState, useEffect } from "react";
import { Eye, RefreshCw, Trash2, ChevronDown } from "lucide-react";
import { bookingsApi, Booking } from "@/services/bookingsApi";
import { useAppSelector } from "@/store/hooks";
import LoadingSpinner from "../../host-dashboard/components/LoadingSpinner";
import BookingEmptyState from "../../components/BookingEmptyState";

export default function BookingsPage() {
  const { user } = useAppSelector((state) => state.auth);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'upcoming' | 'completed' | 'cancelled'>('all');
  const [stats, setStats] = useState({
    total: 0,
    upcoming: 0,
    completed: 0
  });

  // Fetch bookings
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await bookingsApi.getUserBookings({
          status: statusFilter === 'all' ? undefined : statusFilter,
          limit: 50
        });
        setBookings(response.data.bookings);
        
        // Calculate stats
        const allBookings = response.data.bookings;
        setStats({
          total: response.data.pagination.totalBookings,
          upcoming: allBookings.filter(b => b.status === 'upcoming').length,
          completed: allBookings.filter(b => b.status === 'completed').length
        });
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch bookings');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [statusFilter]);

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    
    try {
      await bookingsApi.cancelBooking(bookingId);
      // Refresh bookings
      const response = await bookingsApi.getUserBookings({
        status: statusFilter === 'all' ? undefined : statusFilter,
        limit: 50
      });
      setBookings(response.data.bookings);
    } catch (err) {
      console.error('Error cancelling booking:', err);
      alert('Failed to cancel booking. Please try again.');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { bg: 'bg-[#FEF3C7]', text: 'text-[#92400E]', label: 'Pending' },
      upcoming: { bg: 'bg-[#EDF6FF]', text: 'text-[#002F5B]', label: 'Upcoming' },
      confirmed: { bg: 'bg-[#EDF6FF]', text: 'text-[#002F5B]', label: 'Confirmed' },
      completed: { bg: 'bg-[#DCFCE7]', text: 'text-[#166534]', label: 'Completed' },
      cancelled: { bg: 'bg-[#FEE2E2]', text: 'text-[#B91C1C]', label: 'Cancelled' },
      rejected: { bg: 'bg-[#FEE2E2]', text: 'text-[#B91C1C]', label: 'Rejected' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return (
      <div className={`flex items-center justify-center px-3 py-1 rounded-full ${config.bg}`}>
        <span className={`text-sm font-medium ${config.text}`}>
          {config.label}
        </span>
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return <LoadingSpinner text="Loading your bookings..." />;
  }

  if (error) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-6">
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#F25417] text-white rounded-lg hover:bg-[#E0440F] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-6">
      <div className="flex flex-col gap-6">
        {/* Page Header */}
        <div className="flex flex-col gap-1">
          <h1 className="text-[16px] md:text-[32px] font-semibold md:font-bold text-[#002F5B] leading-[19px] md:leading-[39px]">
            Welcome {user?.fullname || 'User'}!
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
                {stats.total}
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
                {stats.upcoming}
              </span>
              <span className="text-[16px] md:text-[20px] text-[#686767] leading-[19px] md:leading-[24px] text-center">
                Upcoming Bookings
              </span>
            </div>
          </div>

          {/* Completed Bookings */}
          <div className="flex-1 bg-white border border-[#D1D5DB] rounded-[12px] p-4 md:p-6 shadow-[0px_4px_4px_rgba(222,222,222,0.25)]">
            <div className="flex flex-col items-center gap-2">
              <span className="text-[32px] font-semibold text-[#002F5B] leading-[39px]">
                {stats.completed}
              </span>
              <span className="text-[16px] md:text-[20px] text-[#686767] leading-[19px] md:leading-[24px] text-center">
                Completed Bookings
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
                Recent Bookings ({bookings.length})
              </h2>
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as 'all' | 'pending' | 'upcoming' | 'completed' | 'cancelled')}
                  className="appearance-none flex items-center gap-2 px-3 py-2 bg-white border border-[#D1D5DB] rounded-[8px] pr-8"
                >
                  <option value="all">All</option>
                  <option value="pending">Pending</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#121212] pointer-events-none" />
              </div>
            </div>

            {/* Divider */}
            <div className="w-full h-[0.5px] bg-[#D1D5DB] mb-4 md:mb-6"></div>

            {/* Empty State */}
            {bookings.length === 0 ? (
              <BookingEmptyState 
                type="user" 
                status={statusFilter} 
                onActionClick={() => window.location.href = '/search'} 
              />
            ) : (
              <>
                {/* Mobile Card Layout */}
                <div className="block md:hidden space-y-4">
                  {bookings.map((booking) => (
                    <div key={booking._id} className="border-b border-[#D1D5DB] pb-4">
                      <div className="flex flex-col gap-3">
                        <div className="flex justify-between items-start">
                          <div className="flex flex-col gap-2">
                            <span className="text-[12px] text-[#686767] leading-[15px]">
                              {booking._id.slice(-8).toUpperCase()}
                            </span>
                            <div className="flex flex-col gap-1">
                              <span className="text-[16px] font-medium text-[#002F5B] leading-[19px]">
                                {booking.space?.title || 'Unknown Space'}
                              </span>
                              <span className="text-[12px] text-[#686767] leading-[15px]">
                                {booking.space?.location || 'Unknown Location'}
                              </span>
                            </div>
                          </div>
                          {getStatusBadge(booking.status)}
                        </div>
                        
                        <div className="flex flex-wrap gap-4 text-[14px] text-[#686767] leading-[17px]">
                          <span className="font-bold text-[#002F5B]">₦{booking.totalAmount.toLocaleString()}</span>
                          <span>{booking.guestCount} Guest{booking.guestCount > 1 ? 's' : ''}</span>
                          <span>{formatDate(booking.startTime)}</span>
                          <span>{formatTime(booking.startTime)} - {formatTime(booking.endTime)}</span>
                        </div>
                        
                        <div className="flex items-center flex-wrap gap-2">
                          <button className="flex items-center gap-2 px-3 py-2 bg-[#DCFCE7] rounded-[8px]">
                            <Eye className="w-4 h-4 text-[#166534]" />
                            <span className="text-[14px] font-semibold text-[#166534] leading-[17px]">View</span>
                          </button>
                          {booking.canReschedule && (
                            <button className="flex items-center gap-2 px-3 py-2 bg-[#EDF6FF] rounded-[8px]">
                              <RefreshCw className="w-4 h-4 text-[#002F5B]" />
                              <span className="text-[14px] font-semibold text-[#002F5B] leading-[17px]">Reschedule</span>
                            </button>
                          )}
                          {booking.canCancel && (
                            <button 
                              onClick={() => handleCancelBooking(booking._id)}
                              className="flex items-center gap-2 px-3 py-2 bg-[#FEE2E2] rounded-[8px]"
                            >
                              <Trash2 className="w-4 h-4 text-[#B91C1C]" />
                              <span className="text-[14px] font-semibold text-[#B91C1C] leading-[17px]">Cancel</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
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
                      {bookings.map((booking) => (
                        <tr key={booking._id} className="border-b border-[#D1D5DB] hover:bg-[#F9FBFC]">
                          <td className="py-4 px-2 whitespace-nowrap">
                            <span className="text-[18px] text-[#686767] leading-[22px]">
                              {booking._id.slice(-8).toUpperCase()}
                            </span>
                          </td>
                          <td className="py-4 px-2 whitespace-nowrap">
                            <div className="flex flex-col gap-1">
                              <span className="text-[18px] text-[#002F5B] leading-[22px]">
                                {booking.space?.title || 'Unknown Space'}
                              </span>
                              <span className="text-[16px] text-[#686767] leading-[19px]">
                                {booking.space?.location || 'Unknown Location'}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-2 whitespace-nowrap">
                            <span className="text-[20px] font-bold text-[#002F5B] leading-[24px]">
                              ₦{booking.totalAmount.toLocaleString()}
                            </span>
                          </td>
                          <td className="py-4 px-2 whitespace-nowrap">
                            <span className="text-[18px] text-[#686767] leading-[22px]">
                              {booking.guestCount} Guest{booking.guestCount > 1 ? 's' : ''}
                            </span>
                          </td>
                          <td className="py-4 px-2 whitespace-nowrap">
                            <span className="text-[18px] text-[#686767] leading-[22px]">
                              {formatDate(booking.startTime)}
                            </span>
                          </td>
                          <td className="py-4 px-2 whitespace-nowrap">
                            <span className="text-[18px] text-[#686767] leading-[22px]">
                              {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                            </span>
                          </td>
                          <td className="py-4 px-2 whitespace-nowrap">
                            {getStatusBadge(booking.status)}
                          </td>
                          <td className="py-4 px-2 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <button className="flex items-center gap-2 px-3 py-2 bg-[#DCFCE7] rounded-[8px]">
                                <Eye className="w-6 h-6 text-[#166534]" />
                                <span className="text-[16px] font-semibold text-[#166534] leading-[19px]">
                                  View
                                </span>
                              </button>
                              {booking.canReschedule && (
                                <button className="flex items-center gap-2 px-3 py-2 bg-[#EDF6FF] rounded-[8px]">
                                  <RefreshCw className="w-6 h-6 text-[#002F5B]" />
                                  <span className="text-[16px] font-semibold text-[#002F5B] leading-[19px]">
                                    Reschedule
                                  </span>
                                </button>
                              )}
                              {booking.canCancel && (
                                <button 
                                  onClick={() => handleCancelBooking(booking._id)}
                                  className="flex items-center gap-2 px-3 py-2 bg-[#FEE2E2] rounded-[8px]"
                                >
                                  <Trash2 className="w-6 h-6 text-[#B91C1C]" />
                                  <span className="text-[16px] font-semibold text-[#B91C1C] leading-[19px]">
                                    Cancel
                                  </span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}

                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
