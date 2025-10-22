import { Lightbulb, Shield, Wallet, BookOpen } from "lucide-react";

export default function WhyChoose() {
  return (
    <section className="py-5">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8">
        <div className="flex flex-col items-center mx-auto mb-[20px] gap-[8px] w-full max-w-[613px] px-4 md:px-0">
          <h2 className="font-inter font-bold text-[20px] md:text-[32px] leading-[29px] md:leading-[39px] text-[var(--color-secondary)] text-center">
            Why Choose GridSpace
          </h2>
          <p className="font-inter font-normal text-[16px] md:text-[20px] leading-[20px] md:leading-[24px] text-[var(--color-text-primary)] text-center">
            Experience the difference with our commitment to quality and
            reliability
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white p-10 rounded-lg shadow-sm text-center min-h-[260px]">
            <div className="w-[50px] h-[50px] md:w-[70px] md:h-[70px] bg-[var(--color-success-light)] rounded-full flex items-center justify-center mx-auto mb-4">
              <Lightbulb className="w-[50%] text-[var(--color-success)]" />
            </div>
            <h3 className="text-[16px] md:text-[24px] font-bold mb-4 text-[var(--color-text-primary)] font-700">
              Reliable Power & Internet
            </h3>
            <p className="text-[14px] md:text-[18px] text-[var(--color-text-primary)]">
              Never worry about connectivity with guaranteed backup power and
              high-speed internet at every location.
            </p>
          </div>

          <div className="bg-[var(--color-secondary)] p-10 rounded-lg shadow-sm text-center  min-h-[260px] text-[var(--color-text-light)]">
            <div className="w-[50px] h-[50px] md:w-[70px] md:h-[70px] bg-[var(--color-primary)] rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-[50%] text-[var(--color-text-light)]" />
            </div>
            <h3 className="text-[16px] md:text-[24px] font-bold mb-4 text-[var(--color-text-light)] font-700">
              Verified & Secure
            </h3>
            <p className="text-[14px] md:text-[18px] text-[var(--color-text-light)]">
              Every workspace is thoroughly vetted and verified to ensure
              quality, safety, and professionalism.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-10 rounded-lg shadow-sm min-h-[260px] text-center">
            <div className="w-[50px] h-[50px] md:w-[70px] md:h-[70px] bg-[var(--color-purple-light)] rounded-full flex items-center justify-center mx-auto mb-4">
              <Wallet className="w-[50%] text-[var(--color-purple)]" />
            </div>
            <h3 className="text-[16px] md:text-[24px] font-bold mb-4 text-[var(--color-text-primary)] font-700">
              Affordable Rates
            </h3>
            <p className="text-[14px] md:text-[18px] text-[var(--color-text-primary)]">
              Get access to quality workspaces that suit your budget, whether
              you&apos;re booking for a day or a month
            </p>
          </div>

          <div className="bg-white p-10 rounded-lg shadow-sm  min-h-[260px] text-center">
            <div className="w-[50px] h-[50px] md:w-[70px] md:h-[70px] bg-[var(--color-blue-light)] rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-[50%] text-[var(--color-blue)]" />
            </div>
            <h3 className="text-[16px] md:text-[24px] font-bold mb-4 text-[var(--color-text-primary)] font-700">
              Flexible Booking
            </h3>
            <p className="text-[14px]md:text-[18px] text-[var(--color-text-primary)]">
              Book by the hour, day, or month with easy cancellation and
              modification options.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
