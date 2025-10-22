"use client";

import { Eye, Download, Send, ArrowUpRight, ArrowDownLeft } from "lucide-react";

export default function WalletPage() {
  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-6">
      <div className="flex flex-col gap-4 md:gap-6">
        {/* Page Header */}
        <div className="flex flex-col gap-1">
          <h1 className="text-[20px] md:text-[32px] font-semibold md:font-bold text-[#002F5B] leading-[24px] md:leading-[39px]">
            Wallet
          </h1>
          <p className="text-[16px] md:text-[18px] text-[#686767] leading-[19px] md:leading-[22px] tracking-[-0.25px]">
            Manage your wallet balance and view transaction history
          </p>
        </div>

        {/* Wallet Balance Card */}
        <div className="bg-[#002F5B] rounded-[12px] p-4 md:p-6 lg:p-8">
          <div className="flex flex-col gap-4 md:gap-6">
            <div className="flex flex-col gap-4 md:gap-6">
              <p className="text-[14px] md:text-[16px] font-medium text-white leading-[17px] md:leading-[19px]">
                Wallet Balance
              </p>
              
              <div className="flex items-center gap-2">
                <span className="text-[32px] md:text-[40px] font-bold text-white leading-[39px] md:leading-[48px]">
                  ₦12,500
                </span>
                <button className="p-1">
                  <Eye className="w-6 h-6 text-white" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button className="flex items-center justify-center px-3 py-2 bg-[rgba(191,219,254,0.2)] border border-[#BFDBFE] backdrop-blur-[19.85px] rounded-[8px] h-[39px] flex-1 md:flex-none">
                  <span className="text-[16px] font-medium text-white leading-[19px]">
                    Add Funds
                  </span>
                </button>
                <button className="flex items-center justify-center px-3 py-2 bg-[rgba(191,219,254,0.2)] border border-[#BFDBFE] backdrop-blur-[19.85px] rounded-[8px] h-[39px] flex-1 md:flex-none">
                  <span className="text-[16px] font-medium text-white leading-[19px]">
                    Withdraw
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="flex flex-col gap-3 md:gap-6 md:flex-row">
          {/* Total Money Spent */}
          <div className="flex-1 bg-white border border-[#D1D5DB] rounded-[12px] p-4 md:p-6 shadow-[0px_4px_4px_rgba(222,222,222,0.25)]">
            <div className="flex flex-col items-center gap-2">
              <span className="text-[32px] font-semibold text-[#002F5B] leading-[39px]">
                ₦30,000
              </span>
              <span className="text-[16px] md:text-[18px] text-[#686767] leading-[19px] md:leading-[22px] text-center">
                Total Money spent
              </span>
            </div>
          </div>

          {/* Bookings */}
          <div className="flex-1 bg-white border border-[#D1D5DB] rounded-[12px] p-4 md:p-6 shadow-[0px_4px_4px_rgba(222,222,222,0.25)]">
            <div className="flex flex-col items-center gap-2">
              <span className="text-[32px] font-semibold text-[#002F5B] leading-[39px]">
                24
              </span>
              <span className="text-[16px] md:text-[18px] text-[#686767] leading-[19px] md:leading-[22px] text-center">
                Bookings
              </span>
            </div>
          </div>

          {/* Rewards Earned */}
          <div className="flex-1 bg-white border border-[#D1D5DB] rounded-[12px] p-4 md:p-6 shadow-[0px_4px_4px_rgba(222,222,222,0.25)]">
            <div className="flex flex-col items-center gap-2">
              <span className="text-[32px] font-semibold text-[#002F5B] leading-[39px]">
                ₦2,000
              </span>
              <span className="text-[16px] md:text-[18px] text-[#686767] leading-[19px] md:leading-[22px] text-center">
                Rewards Earned
              </span>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-white border border-[#D1D5DB] rounded-[12px] shadow-[0px_4px_4px_rgba(222,222,222,0.25)]">
          <div className="p-4 md:p-6 lg:p-8">
            <div className="flex justify-between items-center mb-4 md:mb-6">
              <h2 className="text-[20px] md:text-[24px] font-semibold text-[#002F5B] leading-[24px] md:leading-[29px]">
                Transaction History
              </h2>
              <button className="flex items-center gap-2 px-3 py-2 bg-[#E7E7E7] rounded-[8px]">
                <Download className="w-5 h-5 md:w-6 md:h-6 text-[#121212]" />
                <span className="text-[14px] md:text-[16px] font-medium text-[#121212] leading-[17px] md:leading-[19px]">
                  Download
                </span>
              </button>
            </div>

            <div className="space-y-3 md:space-y-4">
              {/* Transaction 1 - Wallet top-up */}
              <div className="flex items-center justify-between p-3 md:p-4 bg-[#F9FBFC] rounded-[12px]">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="w-8 h-8 min-h-8 min-w-8 md:w-12 md:h-12 bg-[#DCFCE7] rounded-[22px] flex items-center justify-center">
                    <Send className="w-4 h-4 md:w-6 md:h-6 text-[#166534]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[14px] md:text-[18px] font-medium text-[#002F5B] leading-[17px] md:leading-[22px] tracking-[-0.25px]">
                      Wallet top-up via credit card
                    </span>
                    <span className="text-[12px] md:text-[14px] text-[#686767] leading-[15px] md:leading-[17px]">
                      Wed, Jul 2, 2025
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[14px] font-medium whitespace-nowrap text-[#2BD16A] leading-[17px]">
                    +₦15,000
                  </span>
                  <span className="text-[12px] text-[#2BD16A] leading-[15px] tracking-[-0.25px]">
                    Completed
                  </span>
                </div>
              </div>

              {/* Transaction 2 - Payment for Urban Hub */}
              <div className="flex items-center justify-between p-3 md:p-4 bg-[#F9FBFC] rounded-[12px]">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="w-8 h-8 min-h-8 min-w-8 md:w-12 md:h-12 bg-[#FEE2E2] rounded-[22px] flex items-center justify-center">
                    <ArrowDownLeft className="w-4 h-4 md:w-6 md:h-6 text-[#B91C1C]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[14px] md:text-[18px] font-medium text-[#002F5B] leading-[17px] md:leading-[22px] tracking-[-0.25px]">
                      Payment for Urban Hub
                    </span>
                    <span className="text-[12px] md:text-[14px] text-[#686767] leading-[15px] md:leading-[17px]">
                      Tue, Jul 1 2025
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[14px] font-medium whitespace-nowrap text-[#B91C1C] leading-[17px]">
                    ₦5,000
                  </span>
                  <span className="text-[12px] text-[#2BD16A] leading-[15px] tracking-[-0.25px]">
                    Completed
                  </span>
                </div>
              </div>

              {/* Transaction 3 - Cancellation refund */}
              <div className="flex items-center justify-between p-3 md:p-4 bg-[#F9FBFC] rounded-[12px]">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="w-8 h-8 min-h-8 min-w-8 md:w-12 md:h-12 bg-[#EDFFF3] rounded-[22px] flex items-center justify-center">
                    <ArrowUpRight className="w-4 h-4 md:w-6 md:h-6 text-[#166534]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[14px] md:text-[18px] font-medium text-[#002F5B] leading-[17px] md:leading-[22px] tracking-[-0.25px]">
                      Cancellation refund for Urban Hub
                    </span>
                    <span className="text-[12px] md:text-[14px] text-[#686767] leading-[15px] md:leading-[17px]">
                      Sun, Jun 30 2025
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[14px] font-medium whitespace-nowrap text-[#2BD16A] leading-[17px]">
                    +₦10,000
                  </span>
                  <span className="text-[12px] text-[#2BD16A] leading-[15px] tracking-[-0.25px]">
                    Completed
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
