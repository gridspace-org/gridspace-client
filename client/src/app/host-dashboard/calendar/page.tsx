"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, ChevronDown } from "lucide-react";

type DayBooking = {
  id: string;
  spaceType: string;
  status: "Completed" | "Upcoming" | "Cancelled";
  guestName: string;
  timeRange: string;
};

type BookingRequest = {
  id: string;
  guestName: string;
  spaceName: string;
  type: string;
  date: string;
  timeRange: string;
  guests: number;
  amount: string;
};

const dayLegend = [
  { label: "Completed", color: "#002F5B" },
  { label: "Upcoming", color: "#166534" },
  { label: "Cancelled", color: "#B91C1C" },
];

export default function CalendarPage() {
  const [view, setView] = useState<"Week" | "Month">("Month");
  const [displayDate, setDisplayDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const bookingRequests: BookingRequest[] = useMemo(
    () => [
      { id: "r1", guestName: "Deba Derek", spaceName: "Urban Hub", type: "Shared Desk", date: "Mon, Jul 1, 2025", timeRange: "9:00am - 4:00pm", guests: 1, amount: "₦5,000" },
      { id: "r2", guestName: "Uche Montana", spaceName: "Urban Hub", type: "Private Office", date: "Mon, Jul 1, 2025", timeRange: "9:00am - 4:00pm", guests: 1, amount: "₦5,000" },
    ],
    []
  );

  // Helpers to navigate months
  const startOfMonth = new Date(displayDate.getFullYear(), displayDate.getMonth(), 1);
  const endOfMonth = new Date(displayDate.getFullYear(), displayDate.getMonth() + 1, 0);
  const startWeekday = (startOfMonth.getDay() + 6) % 7; // Make Monday=0 if needed; keeping Sunday=0? Using ISO-like shift
  const daysInMonth = endOfMonth.getDate();
  const prevMonthEnd = new Date(displayDate.getFullYear(), displayDate.getMonth(), 0).getDate();

  // Build a 6x7 grid of Dates including leading/trailing days
  const calendarDates: Date[] = useMemo(() => {
    const dates: Date[] = [];
    // leading days from previous month
    for (let i = startWeekday - 1; i >= 0; i--) {
      const d = new Date(displayDate.getFullYear(), displayDate.getMonth() - 1, prevMonthEnd - i);
      dates.push(d);
    }
    // current month days
    for (let d = 1; d <= daysInMonth; d++) {
      dates.push(new Date(displayDate.getFullYear(), displayDate.getMonth(), d));
    }
    // trailing days from next month
    const trailing = 42 - dates.length; // 6 weeks * 7 days
    for (let d = 1; d <= trailing; d++) {
      dates.push(new Date(displayDate.getFullYear(), displayDate.getMonth() + 1, d));
    }
    return dates;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayDate.getFullYear(), displayDate.getMonth(), startWeekday, daysInMonth, prevMonthEnd]);

  const isSameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  const isCurrentMonth = (d: Date) => d.getMonth() === displayDate.getMonth();

  const monthFormatter = useMemo(() => new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }), []);
  const monthLabel = monthFormatter.format(displayDate);

  const handlePrevMonth = () => {
    setDisplayDate(new Date(displayDate.getFullYear(), displayDate.getMonth() - 1, 1));
  };
  const handleNextMonth = () => {
    setDisplayDate(new Date(displayDate.getFullYear(), displayDate.getMonth() + 1, 1));
  };

  const selectedDayBookings: DayBooking[] = useMemo(() => {
    // Generate simple mock based on selected date to simulate variety
    const day = selectedDate.getDate();
    const list: DayBooking[] = [];
    list.push({ id: "1", spaceType: day % 2 === 0 ? "Shared Desk" : "Private Office", status: "Completed", guestName: "Deba Derek", timeRange: "9:00am - 4:00pm" });
    if (day % 3 === 0) list.push({ id: "2", spaceType: "Shared Desk", status: "Upcoming", guestName: "Uche Montana", timeRange: "11:00am - 2:00pm" });
    if (day % 5 === 0) list.push({ id: "3", spaceType: "Private Office", status: "Cancelled", guestName: "Eze Ada", timeRange: "1:00pm - 3:00pm" });
    return list;
  }, [selectedDate]);

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-8 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between max-lg:flex-col max-lg:items-start max-lg:gap-6 overflow-x-auto">
        <div className="flex items-center gap-3 md:gap-6 min-w-max">
          <button className="p-2 rounded-lg hover:bg-gray-100 text-[#121212]"><ArrowLeft className="w-6 h-6" /></button>
          <div>
            <h1 className="text-[20px] leading-[24px] md:text-[32px] md:leading-[39px] font-bold text-[#002F5B]">Calendar</h1>
            <p className="text-[14px] leading-[17px] md:text-[18px] md:leading-[22px] tracking-[-0.25px] text-[#686767]">View your workspace bookings here</p>
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-4 min-w-max">
          {/* Filter: All Bookings */}
          <button className="flex items-center justify-between gap-2 w-fit h-[40px] md:w-[290px] md:h-[50px] px-3 border border-[#D8D8D9] rounded-lg text-[#121212] bg-white">
            <span className="text-[14px] md:text-[16px]">All Bookings</span>
            <ChevronDown className="w-[18px] h-[18px] md:w-5 md:h-5" />
          </button>
          {/* View toggle */}
          <div className="flex items-center bg-[#EBEBEB] rounded-lg h-9 md:h-[50px] px-1 gap-2">
            <button
              onClick={() => setView("Week")}
              className={`px-[10px] py-1 h-[30px] md:h-[43px] rounded-lg text-[12px] md:text-[16px] ${view === "Week" ? "bg-white text-[#002F5B] font-semibold" : "text-[#121212]"}`}
            >
              Week
            </button>
            <button
              onClick={() => setView("Month")}
              className={`px-[10px] py-1 h-[30px] md:h-[43px] rounded-lg text-[12px] md:text-[16px] ${view === "Month" ? "bg-white text-[#002F5B] font-semibold" : "text-[#121212]"}`}
            >
              Month
            </button>
          </div>
        </div>
      </div>

      {/* Calendar + Side panel */}
      <div className="mt-6 bg-white rounded-lg shadow-[0_4px_4px_rgba(222,222,222,0.25)] p-6">
        <div className="flex flex-col gap-6 xl:flex-row xl:justify-between">
          {/* Calendar */}
          <div className="w-full xl:w-[570px]">
            {/* Header month controls */}
            <div className="flex items-center justify-between px-2">
              <span className="text-[16px] text-[#121212]">{monthLabel}</span>
              <div className="flex items-center gap-2 text-[#121212]">
                <button onClick={handlePrevMonth} className="px-2 py-1 rounded hover:bg-gray-100" aria-label="Previous month">←</button>
                <button onClick={handleNextMonth} className="px-2 py-1 rounded hover:bg-gray-100" aria-label="Next month">→</button>
              </div>
            </div>

            {/* Grid */}
            <div className="mt-3 grid grid-cols-7 gap-1">
              {calendarDates.map((d, idx) => {
                const muted = !isCurrentMonth(d);
                const selected = isSameDay(d, selectedDate);
                return (
                  <button
                    key={`${d.toISOString()}-${idx}`}
                    onClick={() => setSelectedDate(d)}
                    className={`h-[54px] md:h-[65px] border border-[#D8D8D9] rounded-[4px] flex items-start justify-start p-2 text-[12px] ${
                      muted ? "text-[#9CA3AF]" : "text-[#121212]"
                    } ${selected ? "ring-2 ring-[#002F5B]" : ""}`}
                  >
                    {d.getDate()}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Side: Selected day list */}
          <div className="w-full xl:w-[550px] flex flex-col gap-4">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-[20px] leading-[24px] md:text-[24px] md:leading-[29px] font-semibold text-[#121212]">{selectedDate.toLocaleDateString("en-US", { month: "long", day: "numeric" })} ({selectedDayBookings.length})</h3>
                <button className="p-1 rounded-full hover:bg-gray-100" aria-label="close">
                  <span className="block w-5 h-5 border border-[#999999] rounded-full" />
                </button>
              </div>
              <div className="w-full h-px bg-[#D1D5DB] mt-3" />
            </div>

            <div className="flex flex-col gap-4">
              {selectedDayBookings.map((b) => (
                <div key={b.id} className="border border-[#D1D5DB] rounded-lg p-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[16px] text-[#002F5B] font-medium">{b.spaceType}</span>
                    <span
                      className={`px-2 py-1 rounded-full text-[10px] ${
                        b.status === "Completed"
                          ? "bg-[#DCFCE7] text-[#166534]"
                          : b.status === "Upcoming"
                          ? "bg-[#E7F6ED] text-[#166534]"
                          : "bg-[#FEE2E2] text-[#B91C1C]"
                      }`}
                    >
                      {b.status}
                    </span>
                  </div>
                  <div className="text-[12px] text-[#686767]">{b.guestName}</div>
                  <div className="text-[12px] text-[#686767]">{b.timeRange}</div>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-3 flex-wrap pt-1">
              {dayLegend.map((l) => (
                <div key={l.label} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: l.color }} />
                  <span className="text-[12px] md:text-[14px] text-[#121212]">{l.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Booking Requests */}
      <div className="mt-6 bg-white rounded-lg shadow-[0_4px_4px_rgba(222,222,222,0.25)] p-5 md:p-6">
        <h3 className="text-[20px] leading-[24px] md:text-[24px] md:leading-[29px] font-semibold text-[#002F5B]">Booking Request ({bookingRequests.length})</h3>
        <div className="mt-4 flex flex-col gap-3">
          {bookingRequests.map((r) => (
            <div key={r.id} className="rounded-xl bg-[#F9FBFC] p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-4">
              <div className="flex items-center gap-3 min-w-[136px]">
                <div className="w-10 h-10 rounded-full bg-gray-200" />
                <div>
                  <div className="text-[16px] font-semibold text-[#002F5B]">{r.guestName}</div>
                  <div className="text-[12px] text-[#686767]">{r.spaceName}</div>
                </div>
              </div>

              <div className="text-[14px] md:text-[16px] text-[#686767]">{r.type}</div>
              <div className="text-[14px] md:text-[16px] text-[#686767]">{r.date}</div>
              <div className="text-[14px] md:text-[16px] text-[#686767]">{r.timeRange}</div>
              <div className="text-[14px] md:text-[16px] text-[#686767]">{r.guests} Guest</div>

              <div className="flex items-center justify-between md:justify-end gap-3 pt-1 md:pt-0">
                <span className="text-[16px] font-semibold text-[#002F5B]">{r.amount}</span>
                <button className="h-10 md:h-11 px-4 border border-[#F25417] text-[#F25417] rounded-lg font-semibold">Approve</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


