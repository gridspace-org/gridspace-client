import { ArrowRight, Users, MapPin, Medal, Calendar } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="flex flex-col md:flex-row items-center justify-center px-4 md:px-8 py-5 gap-8 max-w-[1440px] mx-auto">
      <div className="w-full md:w-1/2">
        <div className="mb-[63px] max-md:mb-10">
          <h1 className="max-sm:text-[32px] text-[56px] font-bold text-[var(--color-secondary)] mb-6 md:mb-8 leading-tight">
            Find a{" "}
            <span className="text-[var(--color-primary)]">
              flexible workspace
            </span>{" "}
            near you
          </h1>
          <p className="text-base md:text-xl text-[var(--color-text-primary)] leading-relaxed">
            Discover verified, flexible workspaces with reliable power,
            high-speed internet, and everything you need to stay productive on
            the go.
          </p>
        </div>

        {/* Mobile Auth Actions */}
        <div className="flex md:hidden items-center gap-3 mb-6">
          <Link
            href="/signin"
            className="flex-1 px-3 py-2 text-sm font-bold text-[var(--color-text-primary)] bg-white hover:bg-gray-100 rounded-lg text-center"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="flex-1 px-3 py-2 text-sm font-bold text-[var(--color-text-light)] bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] rounded-lg text-center"
          >
            Sign Up
          </Link>
        </div>

        {/* Search Bar */}
        <div className="bg-white xl:mb-[103px] p-4 rounded-lg shadow-sm mb-8 w-full">
          <div className="flex flex-col [@media(min-width:1440px)]:flex-row items-stretch md:items-center gap-3 md:gap-4 w-full">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-2 w-full">
              <div className="flex items-center gap-2 px-3 py-2 border border-[var(--color-secondary)] rounded-lg w-full sm:w-1/2">
                <MapPin className="w-6 h-6 text-gray-400" />
                <input
                  type="text"
                  placeholder="Enter location or city"
                  className="w-full text-sm text-gray-500 outline-none"
                />
              </div>
              <div className="flex items-center gap-2 px-3 py-2 border border-[var(--color-secondary)] rounded-lg w-full sm:w-1/2">
                <Calendar className="w-6 h-6 text-gray-400" />
                <input
                  type="date"
                  placeholder="dd/mm/yy"
                  className="w-full text-sm text-gray-500 outline-none"
                />
              </div>
            </div>
            <button className="flex items-center justify-center gap-2 px-4 py-3 bg-[var(--color-primary)] text-[var(--color-text-light)] text-[14px] md:text-[16px] font-bold rounded-lg hover:bg-[var(--color-primary-hover)] w-full [@media(min-width:1440px)]:w-fit whitespace-nowrap">
              Find a Space
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-6 md:gap-8">
          <div className="flex items-center gap-3">
            <div className="w-[70px] h-[70px] max-xl:size-12 max-xl:min-w-[48px] max-sm:size-10 max-sm:min-w-[40px] [@media(max-width:420px)]:size-8 [@media(max-width:420px)]:min-w-[32px] bg-[var(--color-primary-light)] rounded-full flex items-center justify-center">
              <Users className="max-xl:size-[50%] w-8 h-8 text-[var(--color-primary)]" />
            </div>
            <div>
              <div className=" max-xl:text-lg [@media(max-width:420px)]:text-[14px] text-[32px] font-bold text-[var(--color-secondary)]">
                50K+
              </div>
              <div className="max-xl:text-xs text-[16px] text-gray-500">
                Active Users
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-[70px] h-[70px] max-xl:size-12 max-xl:min-w-[48px] max-sm:size-10 max-sm:min-w-[40px] [@media(max-width:420px)]:size-8 [@media(max-width:420px)]:min-w-[32px] bg-[var(--color-primary-light)] rounded-full flex items-center justify-center">
              <MapPin className="max-xl:size-[50%] w-8 h-8 text-[var(--color-primary)]" />
            </div>
            <div>
              <div className=" max-xl:text-lg  [@media(max-width:420px)]:text-[14px] text-[32px] font-bold text-[var(--color-secondary)]">
                1200+
              </div>
              <div className="max-xl:text-xs text-[16px] text-gray-500">
                Locations
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-[70px] h-[70px] max-xl:size-12 max-xl:min-w-[48px] max-sm:size-10 max-sm:min-w-[40px] [@media(max-width:420px)]:size-8 [@media(max-width:420px)]:min-w-[32px] bg-[var(--color-primary-light)] rounded-full flex items-center justify-center">
              <Medal className="max-xl:size-[50%] w-8 h-8 text-[var(--color-primary)]" />
            </div>
            <div>
              <div className="max-xl:text-lg [@media(max-width:420px)]:text-[14px] text-[32px] font-bold text-[var(--color-secondary)]">
                4.9/5
              </div>
              <div className="max-xl:text-xs text-[16px] text-gray-500">
                Rating
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full md:w-1/2 relative mt-6 md:mt-0">
        <div
          className={"absolute w-fit h-fit z-10 -left-5 -top-7 rotate-[-6deg]"}
        >
          <div
            className={
              "absolute w-[15.57px] h-[0px] left-[-3.68px] top-[46.65px] border-[2px] border-[var(--color-secondary)] rotate-[-6.87deg]"
            }
          />

          <div
            className={
              "absolute w-[15.57px] h-[0px] left-[19.6px] top-[20.05px] border-[2px] border-[var(--color-secondary)] rotate-[91.29deg]"
            }
          />

          <div
            className={
              "absolute w-[21.59px] h-[0px] left-[-6.31px] top-[23.9px] border-[2px] border-[var(--color-secondary)] rotate-[38.98deg]"
            }
          />
        </div>
        <div className="w-[80px] h-[80px] md:w-[120px] md:h-[120px] bg-[var(--color-secondary-light)] absolute -left-3 -bottom-6"></div>
        <div className="w-[80px] h-[80px] md:w-[120px] md:h-[120px] bg-[var(--color-primary-light)] absolute -right-3 -top-6"></div>
        <div className="w-full h-64 sm:h-80 md:h-[600px] bg-gradient-to-br from-blue-100 to-orange-100 rounded-lg shadow-sm relative overflow-hidden">
          <Image
            src="/hero.png"
            alt="Workspace"
            width={1000}
            height={1000}
            className="object-cover w-full h-full"
          />
        </div>
      </div>
    </section>
  );
}
