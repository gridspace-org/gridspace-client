"use client";

import Link from "next/link";
import { useEffect } from "react";
import { CheckCircle } from "lucide-react";

export default function PasswordResetSuccessPage() {
  // Cleanup any remaining reset data
  useEffect(() => {
    localStorage.removeItem("resetToken");
    localStorage.removeItem("resetEmail");
  }, []);
  return (
    <div className="min-h-screen bg-[#F7F5F5] flex items-center justify-center p-4">
      <div className="w-full max-w-[1240px] h-[950px] max-md:h-[810px] px-4 bg-white border border-[rgba(0,47,91,0.19)] rounded-lg shadow-[0_4px_4px_5px_rgba(231,230,230,0.25)] flex items-center justify-center">
        <div className="w-full max-w-[532px] max-md:max-w-[372px] flex flex-col items-center gap-6 max-md:gap-10">
          {/* Success Icon */}
          <div className="w-[102px] h-[102px] max-md:w-[72px] max-md:h-[72px] bg-[#DCFCE7] rounded-full flex items-center justify-center">
            <CheckCircle className="w-[70px] h-[70px] max-md:w-[40px] max-md:h-[40px] text-[#166534]" />
          </div>

          {/* Success Message */}
          <div className="flex flex-col items-center gap-4 max-md:gap-2 py-6 max-md:py-0">
            <h1 className="text-[32px] leading-[39px] max-md:text-[20px] max-md:leading-[38px] font-semibold max-md:font-bold text-[#002F5B] text-center max-md:max-w-[277px]">
              Password Reset Successful!
            </h1>
            <p className="text-[18px] leading-[24px] max-md:text-[16px] text-[#686767] text-center tracking-[0.5px] max-w-[472px] max-md:max-w-[354px]">
              Your password has been reset successfully. You can now log in with
              your new password
            </p>
          </div>

          {/* Back to Login Button */}
          <div className="w-full max-md:max-w-[372px]">
            <Link
              href="/signin"
              className="w-full h-[60px] max-md:h-[48px] bg-[#F25417] rounded-lg flex items-center justify-center text-white text-[18px] leading-[24px] max-md:text-[16px] font-medium hover:bg-[#E04A15] transition-colors"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
