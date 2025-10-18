"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeOff } from "lucide-react";
import api from "@/services/api";

export default function NewPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Require verified email and OTP presence (from previous step)
  useEffect(() => {
    const email = localStorage.getItem("resetEmail");
    const resetToken = localStorage.getItem("resetToken");
    if (!email || !resetToken) {
      router.push("/forgot-password");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || !confirmPassword) return;
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const email = localStorage.getItem("resetEmail");
    const resetToken = localStorage.getItem("resetToken");
    if (!email || !resetToken) {
      alert("Session expired. Please request a new code.");
      router.push("/forgot-password");
      return;
    }

    setIsSubmitting(true);

    try {
      await api.resetPassword({ token: resetToken, password });
      // Clear reset data from localStorage
      localStorage.removeItem("resetToken");
      localStorage.removeItem("resetEmail");
      // Redirect to success page
      router.push("/forgot-password/success");
    } catch (error) {
      console.error("Error setting new password:", error);
      
      let errorMessage = "Failed to reset password. Please try again.";
      
      if (error instanceof Error) {
        const message = error.message.toLowerCase();
        
        if (message.includes("invalid or expired reset token")) {
          errorMessage = "Reset session has expired. Please request a new password reset.";
        } else if (message.includes("password must be at least")) {
          errorMessage = "Password must be at least 6 characters long.";
        } else if (message.includes("user not found")) {
          errorMessage = "User account not found. Please request a new password reset.";
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
      setIsSubmitting(false);
    }
  };

  const isFormValid =
    password && confirmPassword && password === confirmPassword;

  return (
    <div className="min-h-screen bg-[#F7F5F5] flex items-center justify-center p-4">
      <div className="w-full max-w-[1240px] min-h-[950px] max-md:w-full max-md:min-h-[auto] max-md:mx-2 max-md:my-4 bg-white border border-[rgba(0,47,91,0.19)] rounded-lg shadow-[0_4px_4px_5px_rgba(231,230,230,0.25)] flex items-center justify-center">
        <div className="w-full max-w-[532px] max-md:w-full max-md:px-4 max-md:py-8 flex flex-col items-center gap-8 max-md:gap-6 max-sm:gap-4">
          {/* Header Section */}
          <div className="flex flex-col items-center gap-2 max-md:gap-2 max-sm:gap-1">
            <h1 className="text-[28px] leading-[38px] max-md:text-[24px] max-md:leading-[30px] max-sm:text-[20px] max-sm:leading-[26px] font-bold text-[#002F5B] text-center">
              Create New Password
            </h1>
            <p className="text-[18px] leading-[24px] max-md:text-[14px] max-md:leading-[20px] max-sm:text-[12px] max-sm:leading-[18px] text-[#686767] text-center tracking-[0.5px] max-w-[472px] max-md:max-w-[90%] max-sm:max-w-[95%]">
              Please enter a new password. It must be different from your
              previous password
            </p>
          </div>

          {/* Form Section */}
          <form
            onSubmit={handleSubmit}
            className="w-full flex flex-col gap-6 max-md:gap-4 max-sm:gap-3"
          >
            {/* Password Input */}
            <div className="flex flex-col gap-2 max-md:gap-2 max-sm:gap-1">
              <label className="text-[18px] leading-[21px] max-md:text-[16px] max-md:leading-[18px] max-sm:text-[14px] max-sm:leading-[16px] font-medium text-[#121212]">
                Password
              </label>
              <div className="flex items-center gap-3 h-[60px] max-md:h-[56px] max-sm:h-[48px] px-3 max-md:px-2 border border-[#D1D5DB] rounded-lg bg-white">
                <Lock className="w-6 h-6 max-md:w-5 max-md:h-5 max-sm:w-4 max-sm:h-4 text-[#9CA3AF]" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter Password"
                  className="flex-1 outline-none placeholder:text-[#9CA3AF] text-[16px] max-md:text-[14px] max-sm:text-[12px]"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="text-[#9CA3AF] hover:text-[#6B7280] transition-colors p-1 max-sm:p-0.5"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-6 h-6 max-md:w-5 max-md:h-5 max-sm:w-4 max-sm:h-4" />
                  ) : (
                    <Eye className="w-6 h-6 max-md:w-5 max-md:h-5 max-sm:w-4 max-sm:h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password Input */}
            <div className="flex flex-col gap-2 max-md:gap-2 max-sm:gap-1">
              <label className="text-[18px] leading-[21px] max-md:text-[16px] max-md:leading-[18px] max-sm:text-[14px] max-sm:leading-[16px] font-medium text-[#121212]">
                Confirm Password
              </label>
              <div className="flex items-center gap-3 h-[60px] max-md:h-[56px] max-sm:h-[48px] px-3 max-md:px-2 border border-[#D1D5DB] rounded-lg bg-white">
                <Lock className="w-6 h-6 max-md:w-5 max-md:h-5 max-sm:w-4 max-sm:h-4 text-[#9CA3AF]" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  className="flex-1 outline-none placeholder:text-[#9CA3AF] text-[16px] max-md:text-[14px] max-sm:text-[12px]"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((s) => !s)}
                  className="text-[#9CA3AF] hover:text-[#6B7280] transition-colors p-1 max-sm:p-0.5"
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-6 h-6 max-md:w-5 max-md:h-5 max-sm:w-4 max-sm:h-4" />
                  ) : (
                    <Eye className="w-6 h-6 max-md:w-5 max-md:h-5 max-sm:w-4 max-sm:h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="w-full">
              <button
                type="submit"
                disabled={!isFormValid || isSubmitting}
                className="w-full h-[60px] max-md:h-[56px] max-sm:h-[48px] bg-[#F25417] rounded-lg flex items-center justify-center text-white text-[18px] max-md:text-[16px] max-sm:text-[14px] leading-[24px] max-md:leading-[20px] max-sm:leading-[18px] font-medium hover:bg-[#E04A15] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Setting Password..." : "Submit"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
