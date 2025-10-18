"use client";

import { Calendar, Home, Users, BookOpen, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useAppSelector } from "@/store/hooks";

export default function AdminMainContent() {
  const { user } = useAppSelector((state) => state.auth);
  const firstName = (user?.fullname || "Admin").split(" ")[0];

  return (
    <section className="flex flex-col items-start gap-4 md:gap-8 w-full">
      {/* Top welcome row - mobile sizing per figma */}
      <div className="flex items-center gap-2 w-full">
        <ArrowRight className="w-6 h-6 text-[#121212] rotate-180" />
        <div className="flex flex-col gap-1 w-full max-w-[355px] md:max-w-[460px]">
          <h2 className="text-[20px] md:text-[32px] leading-[24px] md:leading-[39px] font-bold text-[#002F5B]">
            Welcome {firstName}!
          </h2>
          <p className="text-[14px] md:text-[18px] leading-[17px] md:leading-[22px] tracking-[-0.25px] text-[#686767]">
            Manage your workspace users and gridspace activities
          </p>
        </div>
      </div>

      {/* Primary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-[23px]  w-full">
        <InfoCard
          href="/admin-dashboard/listings"
          icon={<Home className="w-8 h-8 md:w-10 md:h-10 text-[#002F5B]" />}
          title="Listing Management"
          subtitle="Manage host listings"
        />
        <InfoCard
          href="/admin-dashboard/users"
          icon={<Users className="w-8 h-8 md:w-10 md:h-10 text-[#002F5B]" />}
          title="User Management"
          subtitle="Manage host and guest"
        />
        <InfoCard
          href="/admin-dashboard/bookings"
          icon={<Calendar className="w-8 h-8 md:w-10 md:h-10 text-[#002F5B]" />}
          title="Booking Management"
          subtitle="Currently in progress"
        />
        <InfoCard
          href="/admin-dashboard/blog"
          icon={<BookOpen className="w-8 h-8 md:w-10 md:h-10 text-[#002F5B]" />}
          title="Blog"
          subtitle="Create and manage blog"
        />
      </div>

      {/* Summary cards row */}
      <div className="grid grid-cols-1 gap-[21px] w-full lg:flex lg:flex-row lg:items-center lg:justify-between">
        <SummaryCard
          value="0"
          label="Total Listings"
          hint="8 Pending Approval"
          icon={<Home className="w-8 h-8 text-[#002F5B]" />}
        />
        <SummaryCard
          value="0"
          label="Total Users"
          hint="Host and Guest combined"
          icon={<Users className="w-8 h-8 text-[#002F5B]" />}
        />
        <SummaryCard
          value="0"
          label="Active Bookings"
          hint="Currently in progress"
          icon={<Calendar className="w-8 h-8 text-[#002F5B]" />}
        />
        <SummaryCard
          value="₦0"
          label="Monthly Revenue"
          hint="0%"
          icon={<ArrowRight className="w-8 h-8 text-[#50BF7A]" />}
          hintClass="text-[#50BF7A]"
        />
      </div>
    </section>
  );
}

function InfoCard({
  href,
  icon,
  title,
  subtitle,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <Link
      href={href}
      className="box-border flex flex-col justify-center items-center p-2.5 gap-3 min-w-[240px] w-full h-[171px] md:w-full bg-white border border-[#D1D5DB]/100 shadow-[0px_4px_4px_rgba(222,222,222,0.25)] rounded-[12px] cursor-pointer hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-center">{icon}</div>
      <div className="flex flex-col items-center gap-2 w-fit">
        <h3 className="text-[18px] leading-[22px] font-bold text-[#002F5B] text-center">{title}</h3>
        <p className="text-[14px] leading-[17px] tracking-[-0.25px] text-[#686767] text-center">{subtitle}</p>
      </div>
    </Link>
  );
}

function SummaryCard({
  value,
  label,
  hint,
  icon,
  hintClass,
}: {
  value: string;
  label: string;
  hint: string;
  icon: React.ReactNode;
  hintClass?: string;
}) {
  return (
    <div className="flex flex-col justify-center items-center p-[26px_20px] gap-2 w-full h-[172px] bg-white shadow-[0px_4px_4px_rgba(222,222,222,0.25)] rounded-[8px]">
      <div className="flex items-center justify-between w-full">
        <div className="flex flex-col items-start gap-4 w-auto">
          <span className="text-[24px] leading-[29px] font-bold text-[#002F5B]">{value}</span>
          <div className="flex flex-col items-start gap-2">
            <span className="text-[16px] leading-[19px] font-medium text-[#002F5B]">{label}</span>
            <span className={`text-[14px] leading-[17px] text-start ${hintClass || "text-[#686767]"}`}>{hint}</span>
          </div>
        </div>
        <div className="flex items-center justify-center">{icon}</div>
      </div>
    </div>
  );
}


