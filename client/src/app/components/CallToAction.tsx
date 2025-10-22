import Image from "next/image";
import { Button } from "./index";

export default function CallToAction() {
  return (
    <section className="bg-[var(--color-bg-accent)] py-12 md:py-16 relative overflow-hidden">
      <div className="w-72 h-72 md:w-96 md:h-96 bg-[var(--color-secondary)] rounded-full absolute -right-20 -bottom-20"></div>
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 w-full">
        <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16 w-full">
          <div className="w-full md:w-[60%] text-center">
            <h2 className="text-2xl md:text-4xl font-bold text-[var(--color-secondary)] mb-4 md:mb-6">
              Ready to Find Your Perfect Workspace?
            </h2>
            <p className="text-base md:text-[20px] text-[var(--color-text-primary)] mb-6 md:mb-8">
              Join thousands of professionals who trust Gridspace for their
              workspace needs
            </p>
            <Button variant="primary" size="lg" className="">
              Start Searching
            </Button>
          </div>

          <div className="flex-1 relative w-full">
            <div className="w-full h-56 sm:h-72 md:h-96 bg-gradient-to-br from-blue-100 to-orange-100 rounded-xl shadow-sm relative overflow-hidden">
              <Image
                src="/ctaspace.png"
                alt="Workspace"
                width={800}
                height={800}
                className="object-cover w-full h-full"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
