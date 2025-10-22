import { Button } from "./index";

export default function Newsletter() {
  return (
    <section className="py-5">
      <div className="max-w-[693px] mx-auto text-center">
        <div className="flex flex-col items-center gap-[8px] w-full max-w-[613px] mx-auto px-4 md:px-8">
          <h2 className="text-2xl md:text-4xl font-bold text-[var(--color-secondary)]">
            Join the Grid
          </h2>
          <p className="text-base md:text-2xl text-[var(--color-text-primary)] mb-6 md:mb-8">
            Get workspace tips, updates, and exclusive offers straight to your
            inbox.
          </p>
        </div>

        <div className="bg-[var(--color-bg-primary)] mx-4 md:h-[70px] h-[58px] [@media(max-width:425px)]:h-fit flex items-center border border-[var(--color-primary)] rounded-lg px-[17px] md:py-[15px] py-[6px] shadow-sm">
          <div className="flex flex-col [@media(min-width:425px)]:flex-row items-stretch w-full [@media(min-width:425px)]:items-center gap-3 md:gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 text-[12px] md:text-[18px] text-gray-500 outline-none"
            />
            <Button
              variant="primary"
              size="sm"
              className="[@media(max-width:425px)]:py-1"
            >
              Subscribe Now
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
