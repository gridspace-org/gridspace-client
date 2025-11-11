"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Mail, ArrowRight, ArrowLeft } from "lucide-react";
import api from "@/services/api";

export default function VerifyOTPPage() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  // Check if we have resetEmail on mount
  useEffect(() => {
    const resetEmail = localStorage.getItem("resetEmail");
    if (!resetEmail) {
      router.push("/forgot-password");
    }
  }, [router]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    const newOtp = [...otp];

    for (let i = 0; i < pastedData.length && i < 6; i++) {
      newOtp[i] = pastedData[i];
    }

    setOtp(newOtp);

    // Focus the next empty input or the last one
    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const isOtpComplete = otp.every((digit) => digit !== "");

  return (
    <div className="min-h-screen w-full bg-[#F7F5F5] flex items-center justify-center p-4">
      <div className="w-full max-w-[1240px] min-h-[950px] max-md:w-full max-md:min-h-[auto] max-md:mx-2 max-md:my-4 bg-white border border-[rgba(0,47,91,0.19)] rounded-lg shadow-[0_4px_4px_5px_rgba(231,230,230,0.25)] flex items-center justify-center">
        <div className="w-full max-w-[624px] min-h-[541px] max-md:w-full max-md:min-h-[auto] max-md:px-4 max-md:py-8 bg-white border border-[#EBECF2] rounded-[40px] shadow-[0_30.944px_61.8881px_rgba(37,49,76,0.08)] flex flex-col items-center pt-8 gap-6 max-md:gap-4">
          {/* Logo Section */}
          <div className="w-[72px] h-[72px] max-md:w-[56px] max-md:h-[56px] max-sm:w-[48px] max-sm:h-[48px] bg-[#FFEBE3] rounded-2xl max-md:rounded-4xl max-sm:rounded-3xl flex items-center justify-center">
            <Mail className="w-10 h-10 max-md:w-7 max-md:h-7 max-sm:w-6 max-sm:h-6 text-[#F25417]" />
          </div>

          {/* Header Section */}
          <div className="flex flex-col items-center gap-4 max-md:gap-3 max-sm:gap-2">
            <h1 className="text-[32px] leading-[39px] max-md:text-[24px] max-md:leading-[28px] max-sm:text-[20px] max-sm:leading-[24px] font-semibold text-[#002F5B] max-md:text-[#121212] text-center">
              Verify Code
            </h1>
            <p className="text-[18px] leading-[22px] max-md:text-[14px] max-md:leading-[18px] max-sm:text-[12px] max-sm:leading-[16px] text-[#686767] text-center max-w-[518px] max-md:max-w-[90%] max-sm:max-w-[95%]">
              Enter the verification code sent to your email address
            </p>
            <p className="text-[14px] leading-[18px] max-md:text-[12px] max-md:leading-[16px] max-sm:text-[10px] max-sm:leading-[14px] text-[#9CA3AF] text-center max-w-[518px] max-md:max-w-[90%] max-sm:max-w-[95%]">
              Can&apos;t find the email? Please check your spam folder
            </p>
          </div>

          {/* OTP Input Section */}
          <div className="w-full max-w-[544px] max-md:w-full px-8 max-md:px-4">
            <div className="flex flex-col gap-3 max-md:gap-2">
              <label className="text-[16px] leading-[18px] max-md:text-[14px] max-md:leading-[16px] font-medium text-[#19213D]">
                Verification Code
              </label>

              <div className="flex justify-center gap-2 max-md:gap-1.5 max-sm:gap-1">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className="w-16 h-16 max-md:w-12 max-md:h-12 max-sm:w-10 max-sm:h-10 text-center text-[32px] max-md:text-[20px] max-sm:text-[16px] font-medium text-[#D1D5DB] bg-white border border-[#D1D5DB] rounded-2xl max-md:rounded-lg max-sm:rounded-md shadow-[0_0.5px_2px_rgba(25,33,61,0.11)] focus:outline-none focus:border-[#F25417] focus:text-[#19213D] transition-colors"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="w-full max-w-[544px] max-md:w-full px-8 max-md:px-4 flex flex-col items-center gap-6 max-md:gap-4 max-sm:gap-3">
            {/* Verify Button */}
            <div className="w-full max-md:w-full">
              <button
                className="w-full h-[67px] max-md:h-[56px] max-sm:h-[48px] bg-[#F25417] rounded-lg flex items-center justify-center gap-2 text-white text-[16px] max-md:text-[14px] max-sm:text-[12px] leading-[19px] max-md:leading-[16px] max-sm:leading-[14px] font-medium hover:bg-[#E04A15] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!isOtpComplete || isVerifying}
                onClick={async () => {
                  if (isOtpComplete) {
                    const code = otp.join("");
                    const email = localStorage.getItem("resetEmail") || "";

                    if (!email) {
                      alert("Email not found. Please request a new code.");
                      router.push("/forgot-password");
                      return;
                    }

                    setIsVerifying(true);

                    try {
                      await api.verifyPasswordResetOtp(email, code);
                      // Store the OTP as resetToken for the password reset step
                      localStorage.setItem("resetToken", code);
                      router.push("/forgot-password/new-password");
                    } catch (error: unknown) {
                      console.error("Error verifying OTP:", error);
                      
                      let errorMessage = "Failed to verify code. Please try again.";
                      
                      if (error instanceof Error) {
                        const message = error.message.toLowerCase();
                        
                        if (message.includes("invalid or expired verification code")) {
                          errorMessage = "Invalid or expired verification code. Please request a new code.";
                        } else if (message.includes("verification code expired")) {
                          errorMessage = "Verification code has expired. Please request a new code.";
                        } else if (message.includes("invalid verification code")) {
                          errorMessage = "Invalid verification code. Please check the code and try again.";
                        } else if (message.includes("network") || message.includes("connection")) {
                          errorMessage = "Connection failed. Please check your internet connection and try again.";
                        } else if (message.includes("server error") || message.includes("internal server error")) {
                          errorMessage = "Server error occurred. Please try again in a few moments.";
                        } else {
                          errorMessage = error.message;
                        }
                      }
                      
                      alert(errorMessage);
                      setOtp(["", "", "", "", "", ""]);
                      inputRefs.current[0]?.focus();
                    } finally {
                      setIsVerifying(false);
                    }
                  }
                }}
              >
                <span>{isVerifying ? "Verifying..." : "Verify"}</span>
                <ArrowRight className="w-[18px] h-[18px]" />
              </button>
            </div>
            
            {/* Bottom Links */}
            <div className="justify-center flex flex-col items-center gap-4 max-md:gap-3 max-sm:gap-2 max-md:w-full">
              {/* Back to Sign In Link */}
              <div className="flex justify-center max-md:flex max-md:items-center max-md:gap-2">
                <Link
                  href="/signin"
                  className="flex items-center gap-2 text-[16px] leading-[19px] max-md:text-[14px] max-md:leading-[17px] max-sm:text-[12px] max-sm:leading-[14px] font-medium text-[#F25417] hover:text-[#E04A15] transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 max-sm:w-4 max-sm:h-4" />
                  <span>Back to Sign In</span>
                </Link>
              </div>

              {/* Resend Code Button */}
              <button
                onClick={async () => {
                  if (!isResending) {
                    setIsResending(true);
                    try {
                      await api.requestPasswordReset(
                        localStorage.getItem("resetEmail") || ""
                      );
                      alert(
                        "A new verification code has been sent to your email."
                      );
                      // Clear current OTP
                      setOtp(["", "", "", "", "", ""]);
                      inputRefs.current[0]?.focus();
                    } catch (error: unknown) {
                      console.error("Error resending code:", error);
                      
                      let errorMessage = "Failed to resend code. Please try again.";
                      
                      if (error instanceof Error) {
                        const message = error.message.toLowerCase();
                        
                        if (message.includes("user with this email does not exist")) {
                          errorMessage = "No account found with this email. Please go back and enter the correct email.";
                        } else if (message.includes("rate limit") || message.includes("too many requests")) {
                          errorMessage = "Too many requests. Please wait a few minutes before requesting a new code.";
                        } else if (message.includes("network") || message.includes("connection")) {
                          errorMessage = "Connection failed. Please check your internet connection and try again.";
                        } else if (message.includes("server error") || message.includes("internal server error")) {
                          errorMessage = "Server error occurred. Please try again in a few moments.";
                        } else {
                          errorMessage = error.message;
                        }
                      }
                      
                      alert(errorMessage);
                    } finally {
                      setIsResending(false);
                    }
                  }
                }}
                className="text-center text-[18px] leading-[28px] max-md:text-[12px] max-md:leading-[18px] max-sm:text-[10px] max-sm:leading-[14px] text-[#F25417] hover:text-[#E04A15] transition-colors disabled:opacity-50 disabled:cursor-not-allowed px-2"
                disabled={isResending}
              >
                {isResending
                  ? "Sending..."
                  : "Didn't receive the code? Request a new one."}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
