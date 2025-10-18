"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Mail } from "lucide-react";
import api from "@/services/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Clear any existing reset data when component mounts
  useEffect(() => {
    localStorage.removeItem("resetToken");
    localStorage.removeItem("resetEmail");
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);

    try {
      const response = await api.requestPasswordReset(email);
      // Store token and email for OTP verification and resending
      localStorage.setItem("resetToken", response.resetToken);
      localStorage.setItem("resetEmail", email);
      // Redirect to OTP verification page
      router.push("/forgot-password/verify-otp");
    } catch (error) {
      console.error("Error sending reset code:", error);
      
      let errorMessage = "Failed to send reset code. Please try again.";
      
      if (error instanceof Error) {
        const message = error.message.toLowerCase();
        
        if (message.includes("user with this email does not exist")) {
          errorMessage = "No account found with this email address. Please check your email or sign up for a new account.";
        } else if (message.includes("invalid email")) {
          errorMessage = "Please enter a valid email address.";
        } else if (message.includes("network") || message.includes("connection")) {
          errorMessage = "Connection failed. Please check your internet connection and try again.";
        } else if (message.includes("server error") || message.includes("internal server error")) {
          errorMessage = "Server error occurred. Please try again in a few moments.";
        } else if (message.includes("rate limit") || message.includes("too many requests")) {
          errorMessage = "Too many requests. Please wait a few minutes before trying again.";
        } else {
          errorMessage = error.message;
        }
      }
      
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F5F5] flex items-center justify-center p-4">
      <div className="w-full max-w-[1240px] h-[950px] bg-white px-4 border border-[rgba(0,47,91,0.19)] rounded-lg shadow-[0_4px_4px_5px_rgba(231,230,230,0.25)] flex items-center justify-center">
        <div className="w-full max-w-[532px] flex flex-col items-center gap-8">
          {/* Header Section */}
          <div className="flex flex-col items-center gap-2">
            <h1 className="text-[28px] leading-[38px] font-bold text-[#002F5B] text-center">
              Forgot Password?
            </h1>
            <p className="text-[18px] leading-[24px] text-[#686767] text-center tracking-[0.5px] max-w-[472px]">
              Enter your email address below. We&apos;ll send you a verification code
              to reset your password
            </p>
          </div>

          {/* Form Section */}
          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
            {/* Email Input */}
            <div className="flex flex-col gap-2">
              <label className="text-[18px] leading-[21px] font-medium text-[#121212]">
                Email Address
              </label>
              <div className="flex items-center gap-3 h-[60px] px-3 border border-[#D1D5DB] rounded-lg bg-white">
                <Mail className="w-6 min-w-6 h-6 min-h-6 text-[#9CA3AF]" />
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="flex-1 outline-none placeholder:text-[#9CA3AF] text-[16px]"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!email || isSubmitting}
              className="w-full h-[60px] bg-[#F25417] rounded-lg flex items-center justify-center text-white text-[18px] leading-[24px] font-medium hover:bg-[#E04A15] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Sending..." : "Submit"}
            </button>

            {/* Back to Sign In Link */}
            <div className="w-full flex justify-center">
              <Link
                href="/signin"
                className="text-[14px] leading-[20px] text-[#121212] hover:text-[#002F5B] transition-colors"
              >
                Go back to Sign In
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
