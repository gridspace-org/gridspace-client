"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, TrendingUp, Calendar, Banknote } from "lucide-react";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

type ViewRange = "Weekly" | "Monthly";

export default function EarningsPage() {
  const [range, setRange] = useState<ViewRange>("Weekly");

  const weeklyData = useMemo(
    () => [
      { name: "Week 1", earnings: 30000, bookings: 20, cancellations: 3, fees: 5 },
      { name: "Week 2", earnings: 42000, bookings: 28, cancellations: 4, fees: 6 },
      { name: "Week 3", earnings: 38000, bookings: 25, cancellations: 2, fees: 5 },
      { name: "Week 4", earnings: 52000, bookings: 34, cancellations: 5, fees: 7 },
    ],
    []
  );

  const monthlyData = useMemo(
    () => [
      { name: "Mar", earnings: 120000, bookings: 80, cancellations: 10, fees: 18 },
      { name: "Apr", earnings: 150000, bookings: 95, cancellations: 11, fees: 20 },
      { name: "May", earnings: 138000, bookings: 90, cancellations: 9, fees: 19 },
      { name: "Jun", earnings: 160000, bookings: 102, cancellations: 12, fees: 22 },
    ],
    []
  );

  const data = range === "Weekly" ? weeklyData : monthlyData;

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 pt-6 md:pt-8 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 md:gap-6 flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3 md:gap-6 self-start">
          <button className="p-2 rounded-lg hover:bg-gray-100 text-[#121212]">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex flex-col gap-1">
            <h1 className="text-[20px] leading-[24px] md:text-[32px] md:leading-[39px] font-bold text-[#002F5B]">Earnings</h1>
            <p className="text-[14px] leading-[17px] md:text-[18px] md:leading-[22px] tracking-[-0.25px] text-[#686767]">Track your workspace income and performance</p>
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-4 self-stretch md:self-auto justify-between md:justify-end w-full md:w-auto">
          {/* Export */}
          <button className="h-10 md:h-[41px] px-3 rounded-lg bg-[#E7E7E7] text-[#000] text-[12px] md:text-[16px] font-medium min-w-[90px]">Export</button>

          {/* Weekly/Monthly toggle */}
          <div className="flex items-center bg-[#EBEBEB] rounded-lg h-10 md:h-[50px] px-1 gap-2 w-[145px] md:w-[175px]">
            <button
              onClick={() => setRange("Weekly")}
              className={`px-[10px] py-1 h-8 md:h-[44px] rounded-lg text-[12px] md:text-[16px] ${range === "Weekly" ? "bg-white text-[#002F5B] font-semibold" : "text-[#121212]"}`}
            >
              Weekly
            </button>
            <button
              onClick={() => setRange("Monthly")}
              className={`px-[10px] py-1 h-8 md:h-[44px] rounded-lg text-[12px] md:text-[16px] ${range === "Monthly" ? "bg-white text-[#002F5B] font-semibold" : "text-[#121212]"}`}
            >
              Monthly
            </button>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="mt-4 md:mt-6 grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-[21px]">
        <div className="rounded-[12px] md:rounded-lg bg-white shadow-[0_4px_4px_rgba(222,222,222,0.25)] p-4 md:p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[24px] leading-[29px] font-bold text-[#002F5B]">₦30,000</div>
              <div className="text-[12px] leading-[15px] tracking-[-0.25px] text-[#6F6F6F]">Total Earnings</div>
            </div>
            <TrendingUp className="w-8 h-8 text-[#50BF7A]" />
          </div>
          <div className="mt-4 text-[12px] leading-[15px] tracking-[-0.25px] text-[#50BF7A]">+12% from last month</div>
        </div>

        <div className="rounded-[12px] md:rounded-lg bg-white shadow-[0_4px_4px_rgba(222,222,222,0.25)] p-4 md:p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[24px] leading-[29px] font-bold text-[#002F5B]">2</div>
              <div className="text-[12px] leading-[15px] tracking-[-0.25px] text-[#6F6F6F]">Total Bookings</div>
            </div>
            <Calendar className="w-8 h-8 text-[#002F5B]" />
          </div>
          <div className="mt-4 text-[12px] leading-[15px] tracking-[-0.25px] text-[#50BF7A]">+8% from last month</div>
        </div>

        <div className="rounded-[12px] md:rounded-lg bg-white shadow-[0_4px_4px_rgba(222,222,222,0.25)] p-4 md:p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[24px] leading-[29px] font-bold text-[#002F5B]">₦10,000</div>
              <div className="text-[12px] leading-[15px] tracking-[-0.25px] text-[#6F6F6F]">Avg. Booking Value</div>
            </div>
            <Banknote className="w-8 h-8 text-[#F25417]" />
          </div>
          <div className="mt-4 text-[12px] leading-[15px] tracking-[-0.25px] text-[#50BF7A]">+5% from last month</div>
        </div>
      </div>

      {/* Chart Card */}
      <div className="mt-6 rounded-lg bg-white shadow-[0_4px_4px_rgba(222,222,222,0.25)]">
        <div className="flex items-center justify-between px-4 md:px-6 pt-5 md:pt-6">
          <h3 className="text-[20px] leading-[24px] md:text-[24px] md:leading-[29px] font-semibold text-[#002F5B]">Earnings Trend</h3>
          <div className="flex items-center bg-[#EBEBEB] rounded-lg h-10 md:h-[50px] px-1 gap-2 w-[145px] md:w-[175px]">
            <button
              onClick={() => setRange("Weekly")}
              className={`px-[10px] py-1 h-8 md:h-[44px] rounded-lg text-[12px] md:text-[16px] ${range === "Weekly" ? "bg-white text-[#002F5B] font-semibold" : "text-[#121212]"}`}
            >
              Weekly
            </button>
            <button
              onClick={() => setRange("Monthly")}
              className={`px-[10px] py-1 h-8 md:h-[44px] rounded-lg text-[12px] md:text-[16px] ${range === "Monthly" ? "bg-white text-[#002F5B] font-semibold" : "text-[#121212]"}`}
            >
              Monthly
            </button>
          </div>
        </div>

        <div className="px-3 md:px-6 pb-6 h-[439px] md:h-[535px] mt-4 md:mt-[30px]">
          <div className="flex flex-col md:flex-row items-start gap-4 md:gap-6 h-full">
            <div className="grow max-md:w-full h-[400px] md:h-[480px] lg:h-[500px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data} margin={{ top: 24, right: 24, bottom: 24, left: 8 }}>
                  <CartesianGrid stroke="#EBEBEB" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: "#222" }} tickLine={false} axisLine={{ stroke: "#333" }} />
                  <YAxis tick={{ fill: "#444" }} tickLine={false} axisLine={{ stroke: "#333" }} label={{ value: '# Amount', angle: -90, position: 'left', offset: 0, fill: "#000" }} />
                  <Tooltip cursor={{ fill: "rgba(0,0,0,0.03)" }} />
                  {/* Bars for series */}
                  <Bar dataKey="bookings" name="Bookings" fill="#3366CC" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="cancellations" name="Cancellation" fill="#DC3912" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="fees" name="Platform Fees" fill="#FF9900" radius={[4, 4, 0, 0]} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <div className="flex md:flex-col flex-row flex-wrap gap-3 min-w-0 md:min-w-[160px]">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-[2px]" style={{ background: "#3366CC" }} />
                <span className="text-[12px] md:text-[13px] text-[#222222]">Bookings</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-[2px]" style={{ background: "#DC3912" }} />
                <span className="text-[12px] md:text-[13px] text-[#222222]">Cancellation</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-[2px]" style={{ background: "#FF9900" }} />
                <span className="text-[12px] md:text-[13px] text-[#222222]">Platform Fees</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


