"use client";

import { ChevronDown, Eye, Pause, Play } from "lucide-react";
import { useMemo } from "react";

type UserType = "Host" | "Guest" | "Admin";
type UserStatus = "Active" | "Suspended";

interface UserRow {
  name: string;
  email: string;
  type: UserType;
  status: UserStatus;
  joined: string;
  phone: string;
}

export default function UsersPage() {
  const rows = useMemo<UserRow[]>(
    () => [
      { name: "Deba Derek", email: "derek45@gmail.com", type: "Guest", status: "Active", joined: "June 22nd, 2025", phone: "08123456789" },
      { name: "Sarah Johnson", email: "sarah@example.com", type: "Host", status: "Suspended", joined: "May 10th, 2025", phone: "08022223333" },
      { name: "Henry Cole", email: "henry@example.com", type: "Guest", status: "Active", joined: "Apr 4th, 2025", phone: "08011112222" },
    ],
    []
  );

  return (
    <section className="flex flex-col items-start gap-6 w-full">
      {/* Header row */}
      <div className="flex items-center justify-between gap-6 w-full">
        <div className="flex items-center gap-6">
          <div className="w-6 h-6 grid place-items-center rotate-180">
            {/* Back arrow visual (matches figma sizing) */}
            <div className="w-6 h-6 rounded" />
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="text-[20px] md:text-[32px] leading-[24px] md:leading-[39px] font-bold text-[#002F5B]">Users Management</h1>
            <p className="text-[14px] md:text-[18px] leading-[17px] md:leading-[22px] tracking-[-0.25px] text-[#686767]">
              Manage Host and Guest accounts and permissions
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center justify-between gap-[95px] w-[208px] h-[50px] px-2.5 border border-[#D8D8D9] rounded-[8px] bg-white">
            <span className="text-[16px] text-[#121212]">All Types</span>
            <ChevronDown className="w-6 h-6 text-[#121212]" />
          </div>
          <div className="flex items-center justify-between gap-[75px] w-[208px] h-[50px] px-2.5 border border-[#D8D8D9] rounded-[8px] bg-white">
            <span className="text-[16px] text-[#121212]">All Statuses</span>
            <ChevronDown className="w-6 h-6 text-[#121212]" />
          </div>
        </div>
      </div>

      {/* Users table card */}
      <div className="w-full bg-white rounded-[8px] shadow-[0px_4px_4px_rgba(222,222,222,0.25)]">
        <div className="p-6">
          {/* Table header */}
          <div className="hidden md:flex items-center gap-[169px] border-b border-[#D1D5DB] pb-[10px] text-[18px] font-semibold text-[#002F5B]">
            <span className="w-[260px] shrink-0">User</span>
            <span className="w-[120px] shrink-0">Type</span>
            <span className="w-[140px] shrink-0">Status</span>
            <span className="w-[180px] shrink-0">Joined</span>
            <span className="w-[160px] shrink-0">Phone</span>
            <span className="w-[120px] shrink-0">Action</span>
          </div>

          {/* Rows */}
          <div className="divide-y divide-[#D1D5DB]">
            {rows.map((row, idx) => (
              <div key={idx} className="py-4 md:py-6">
                {/* Desktop row */}
                <div className="hidden md:flex items-center gap-[115px]">
                  {/* User */}
                  <div className="w-[260px] shrink-0">
                    <div className="flex flex-col">
                      <span className="text-[18px] text-[#121212] tracking-[-0.25px]">{row.name}</span>
                      <span className="text-[16px] text-[#6F6F6F] tracking-[-0.25px]">{row.email}</span>
                    </div>
                  </div>

                  {/* Type */}
                  <div className="w-[120px] shrink-0">
                    <div className="inline-flex items-center px-[9px] py-[7px] rounded-full border border-[#D1D5DB] text-[14px] text-[#121212] bg-white">
                      {row.type}
                    </div>
                  </div>

                  {/* Status */}
                  <div className="w-[140px] shrink-0">
                    {row.status === "Active" ? (
                      <div className="inline-flex items-center px-[9px] py-[7px] gap-1 rounded-full bg-[#DCFCE7] text-[14px] text-[#166534]">
                        Active
                      </div>
                    ) : (
                      <div className="inline-flex items-center px-[9px] py-[7px] gap-1 rounded-full bg-[#FEE2E2] text-[14px] text-[#B91C1C]">
                        Suspended
                      </div>
                    )}
                  </div>

                  {/* Joined */}
                  <div className="w-[180px] shrink-0 text-[18px] text-[#686767]">{row.joined}</div>

                  {/* Phone */}
                  <div className="w-[160px] shrink-0 text-[18px] text-[#121212]">{row.phone}</div>

                  {/* Action */}
                  <div className="w-[120px] shrink-0 flex items-center gap-6">
                    <button className="w-6 h-6" aria-label="View">
                      <Eye className="w-6 h-6 text-[#002F5B]" />
                    </button>
                    {row.status === "Active" ? (
                      <button className="w-6 h-6" aria-label="Suspend">
                        <Pause className="w-6 h-6 text-[#B91C1C]" />
                      </button>
                    ) : (
                      <button className="w-6 h-6" aria-label="Activate">
                        <Play className="w-6 h-6 text-[#166534]" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Mobile row */}
                <div className="md:hidden flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[18px] text-[#121212] tracking-[-0.25px]">{row.name}</span>
                      <span className="text-[14px] text-[#6F6F6F] tracking-[-0.25px]">{row.email}</span>
                    </div>
                    <div className="inline-flex items-center px-[9px] py-[7px] rounded-full border border-[#D1D5DB] text-[14px] text-[#121212] bg-white">
                      {row.type}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    {row.status === "Active" ? (
                      <div className="inline-flex items-center px-[9px] py-[7px] gap-1 rounded-full bg-[#DCFCE7] text-[14px] text-[#166534]">
                        Active
                      </div>
                    ) : (
                      <div className="inline-flex items-center px-[9px] py-[7px] gap-1 rounded-full bg-[#FEE2E2] text-[14px] text-[#B91C1C]">
                        Suspended
                      </div>
                    )}
                    <span className="text-[14px] text-[#686767]">{row.joined}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[14px] text-[#121212]">{row.phone}</span>
                    <div className="flex items-center gap-4">
                      <button className="w-6 h-6" aria-label="View">
                        <Eye className="w-6 h-6 text-[#002F5B]" />
                      </button>
                      {row.status === "Active" ? (
                        <button className="w-6 h-6" aria-label="Suspend">
                          <Pause className="w-6 h-6 text-[#B91C1C]" />
                        </button>
                      ) : (
                        <button className="w-6 h-6" aria-label="Activate">
                          <Play className="w-6 h-6 text-[#166534]" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}


