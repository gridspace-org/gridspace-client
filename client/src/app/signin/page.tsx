"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import Button from "../components/Button";
import { useAppDispatch } from "@/store/hooks";
import { signin } from "@/store/slices/authSlice";
import GoogleAuthButton from "../components/GoogleAuthButton";
import AuthLoader from "../components/AuthLoader";

export default function SignInPage() {
  const dispatch = useAppDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLoader, setShowLoader] = useState(false);

  // Show loader if authentication is successful
  if (showLoader) {
    return <AuthLoader message="Signing you in..." />;
  }

  return (
    <div className="h-[1024px] max-lg:h-screen max-lg:p-4 bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]">
      <main className="max-w-[1440px] mx-auto lg:pr-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_608px] gap-6">
          {/* Left visual panel */}
          <div className="relative h-[360px] max-lg:hidden lg:h-[1024px]">
            <Image
              src="/signup.png"
              alt="GridSpace inspiration"
              width={800}
              height={800}
              className="object-cover w-full h-full"
            />
            {/* Bottom overlay card */}
            <div className="absolute left-1/2 -translate-x-1/2 bottom-30 lg:w-[70%] xl:h-[196px] bg-[rgba(242,84,23,0.10)] border border-[rgba(242,84,23,0.33)] rounded-lg backdrop-blur-md">
              <div className="h-full px-4 py-4 lg:py-[20px] flex flex-col justify-center items-center text-center">
                <h3 className="text-[20px] lg:text-[28px] leading-[28px] xl:leading-[48px] font-bold text-[var(--color-text-light)]">
                  Welcome back to{" "}
                  <span className="text-[var(--color-primary)]">GridSpace</span>
                </h3>
                <p className="mt-1 text-[14px] lg:text-[16px] leading-[21px] tracking-[0.5px] text-[var(--color-text-light)]/90">
                  Access your workspace and connect with productive
                  professionals
                </p>
              </div>
            </div>
          </div>

          {/* Right form card */}
          <div className="bg-white border flex flex-col justify-center border-[rgba(0,47,91,0.19)] max-md:w-full max-w-[608px] md:w-[608px] max-lg:h-fit max-lg:mx-auto rounded-lg shadow-[0_4px_4px_5px_rgba(231,230,230,0.25)] p-5 sm:p-7 md:p-8 lg:p-10 my-auto h-[950px]">
            <div className="flex flex-col items-center mb-8 gap-1">
              <h1 className="text-[16px] md:text-[28px] leading-[19px] md:leading-[38px] font-bold text-[var(--color-secondary)] text-center">
                Welcome Back!
              </h1>
              <p className="text-[14px] md:text-[16px] leading-6 tracking-[0.5px] text-[var(--color-text-secondary)] text-center">
                Sign In to access your workspace dashboard
              </p>
            </div>

            <form
              className="space-y-5"
              onSubmit={async (e) => {
                e.preventDefault();
                if (!email || !password) return;

                try {
                  setError(null);
                  setIsSubmitting(true);

                  await dispatch(
                    signin({
                      email,
                      password,
                    })
                  ).unwrap();

                  // If signin successful, show loader
                  setShowLoader(true);
                } catch (err: unknown) {                  
                  setError(err as string | null);
                } finally {
                  setIsSubmitting(false);
                }
              }}
            >
              {/* Email */}
              <div className="space-y-2">
                <label className="text-[16px] md:text-[18px] font-medium">
                  Email Address
                </label>
                <div className="flex items-center gap-3 h-[56px] sm:h-[60px] px-3 border border-gray-300 focus-within:border-black rounded-lg bg-white transition-colors duration-200">
                  <Mail className="w-5 h-5 text-[#9CA3AF]" />
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    className="flex-1 max-sm:w-[50%] outline-none placeholder:text-[#9CA3AF] text-[14px] md:text-[16px]"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="text-[16px] md:text-[18px] font-medium">
                  Password
                </label>
                <div className="flex items-center justify-between gap-3 h-[56px] sm:h-[60px] px-3 border border-gray-300 focus-within:border-black rounded-lg bg-white transition-colors duration-200">
                  <div className="flex items-center gap-3 flex-1">
                    <Lock className="w-5 h-5 text-[#9CA3AF]" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter password"
                      className="flex-1 max-sm:w-[50%] outline-none placeholder:text-[#9CA3AF] text-[14px] md:text-[16px]"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="text-sm text-gray-500 hover:text-gray-700 px-2"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Keep logged in and Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    id="keepLoggedIn"
                    type="checkbox"
                    checked={keepLoggedIn}
                    onChange={(e) => setKeepLoggedIn(e.target.checked)}
                    className="w-4 h-4 border border-[var(--color-border)] rounded-sm accent-[var(--color-primary)]"
                  />
                  <label
                    htmlFor="keepLoggedIn"
                    className="text-[14px] text-[var(--color-text-secondary)]"
                  >
                    Keep me logged in
                  </label>
                </div>
                <Link
                  href="/forgot-password"
                  className="text-[14px] text-[var(--color-primary)] hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 mb-4 text-sm text-red-500 bg-red-50 rounded">
                  {error}
                </div>
              )}

              {/* Submit */}
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={!email || !password || isSubmitting}
              >
                {isSubmitting ? "Signing in..." : "Sign In"}
              </Button>

              {/* Divider */}
              <div className="flex items-center gap-2 text-[16px] text-[#5A5959]">
                <span className="flex-1 h-px bg-[#9CA3AF]" />
                <span className="max-md:text-[14px]">Or continue with</span>
                <span className="flex-1 h-px bg-[#9CA3AF]" />
              </div>

              {/* Social buttons */}
              <div className="flex flex-col lg:flex-row gap-3">
                <GoogleAuthButton
                  text="Continue with Google"
                  className="flex-1"
                  onError={(error) => setError(error)}
                  onSuccess={() => setShowLoader(true)}
                />
                <button className="hidden flex-1 h-[56px] sm:h-[60px] px-4 py-3 rounded-lg border border-[var(--color-secondary)] flex items-center justify-center gap-2 transition-all duration-300 hover:bg-gray-100 hover:text-[var(--color-secondary)] hover:shadow-sm">
                  <Image
                    src="/facebook.png"
                    alt="Facebook"
                    width={24}
                    height={24}
                  />
                  <span className="text-[16px]">Facebook</span>
                </button>
                <button className="hidden flex-1 h-[56px] sm:h-[60px] px-4 py-3 rounded-lg border border-[var(--color-secondary)] flex items-center justify-center gap-2 transition-all duration-300 hover:bg-gray-100 hover:text-[var(--color-secondary)] hover:shadow-sm">
                  <Image src="/apple.png" alt="Apple" width={30} height={30} />
                  <span className="text-[16px]">Apple</span>
                </button>
              </div>

              <p className="text-center text-xs md:text-sm">
                Don&apos;t have an account?{" "}
                <Link
                  href="/signup"
                  className="text-[var(--color-primary)] font-medium hover:underline"
                >
                  Sign Up
                </Link>
              </p>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
