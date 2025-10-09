"use client";

import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Navigation */}
      <nav className="flex items-center justify-between px-4 md:px-8 py-2 max-w-[1440px] mx-auto">
        <Link href="/" className="flex items-center gap-4">
          <Image src="/logo.png" alt="GridSpace Logo" width={40} height={40} />
          <span className="text-[28px] font-bold text-[var(--color-primary)]">
            GridSpace
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <div className="hidden [@media(min-width:840px)]:flex items-center gap-6 mr-6">
            <a
              href="#"
              className="text-sm text-[var(--color-text-primary)] hover:text-[var(--color-primary)]"
            >
              How it works
            </a>
            <a
              href="#"
              className="text-sm text-[var(--color-text-primary)] hover:text-[var(--color-primary)]"
            >
              Host a Space
            </a>
            <Link
              href="/blog"
              className="text-sm text-[var(--color-text-primary)] hover:text-[var(--color-primary)]"
            >
              Blog
            </Link>
            <a
              href="#"
              className="text-sm text-[var(--color-text-primary)] hover:text-[var(--color-primary)]"
            >
              About
            </a>
          </div>
          <Link href="/signin" className="hidden [@media(min-width:840px)]:inline-block px-3 md:px-4 py-2 text-sm font-bold text-[var(--color-text-primary)] hover:bg-gray-100 rounded-lg">
            Login
          </Link>
          <Link
            href="/signup"
            className="hidden [@media(min-width:840px)]:inline-block px-3 md:px-4 py-2 text-sm font-bold text-[var(--color-text-light)] bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] rounded-lg"
          >
            Sign Up
          </Link>
          <button
            className="[@media(min-width:840px)]:hidden inline-flex items-center justify-center p-2 rounded-md text-[var(--color-text-primary)] hover:bg-gray-100"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Nav Panel */}
      {mobileOpen && (
        <div className="[@media(min-width:840px)]:hidden px-4 md:px-8 py-8 pb-3 bg-white shadow-sm">
          <div className="flex flex-col gap-3">
            <a
              href="#"
              className="text-sm text-[var(--color-text-primary)] hover:text-[var(--color-primary)]"
              onClick={() => setMobileOpen(false)}
            >
              How it works
            </a>
            <a
              href="#"
              className="text-sm text-[var(--color-text-primary)] hover:text-[var(--color-primary)]"
              onClick={() => setMobileOpen(false)}
            >
              Host a Space
            </a>
            <Link
              href="/blog"
              className="text-sm text-[var(--color-text-primary)] hover:text-[var(--color-primary)]"
              onClick={() => setMobileOpen(false)}
            >
              Blog
            </Link>
            <a
              href="#"
              className="text-sm text-[var(--color-text-primary)] hover:text-[var(--color-primary)]"
              onClick={() => setMobileOpen(false)}
            >
              About
            </a>
            <div className="flex items-center gap-3 pt-1">
              <Link
                href="/signin"
                className="flex-1 px-3 py-2 text-sm font-bold text-[var(--color-text-primary)] hover:bg-gray-100 rounded-lg text-center"
                onClick={() => setMobileOpen(false)}
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="flex-1 px-3 py-2 text-sm font-bold text-[var(--color-text-light)] bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] rounded-lg text-center"
                onClick={() => setMobileOpen(false)}
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
