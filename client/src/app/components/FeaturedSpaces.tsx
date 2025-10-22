interface LocationCardProps {
  city: string;
  workspaceCount: number;
  imageNumber: number;
  overlay?: string;
}

const LocationCard = ({
  city,
  workspaceCount,
  imageNumber,
  overlay = "0.25",
}: LocationCardProps) => (
  <div
    className="w-full h-[235px] sm:h-[361px] rounded-[8px] relative overflow-hidden"
    style={{
      backgroundImage: `linear-gradient(0deg, rgba(0, 0, 0, ${overlay}), rgba(0, 0, 0, ${overlay})), url(/space${imageNumber}.png)`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    }}
  >
    <div className="absolute bottom-0 left-0 p-[24px_12px]">
      <h3 className="font-inter font-semibold text-[20px] md:text-[32px] leading-[39px] text-[var(--color-text-light)]">
        {city}
      </h3>
      <p className="font-inter font-normal text-[14px] md:text-[18px] leading-[22px] text-[var(--color-text-light)]">
        {workspaceCount}+ workspace
      </p>
    </div>
  </div>
);

const locations: LocationCardProps[] = [
  {
    city: "Lagos",
    workspaceCount: 40,
    imageNumber: 4,
  },
  {
    city: "Abuja",
    workspaceCount: 20,
    imageNumber: 5,
    overlay: "0.39",
  },
  {
    city: "Port Harcourt",
    workspaceCount: 25,
    imageNumber: 6,
  },
];

export default function FeaturedSpaces() {
  return (
    <section className="w-full max-w-[1440px] mx-auto px-4 md:px-8 py-5">
      <div className="flex flex-col items-center gap-[20px]">
        {/* Header Section */}
        <div className="flex flex-col items-center gap-[8px] max-w-[613px] text-center">
          <h2 className="font-inter font-bold text-[20px] md:text-[32px] leading-[29px] md:leading-[39px] text-[var(--color-secondary)]">
            Popular Locations
          </h2>
          <p className="font-inter font-normal text-[16px] md:text-[20px] leading-[24px] text-[var(--color-text-primary)] text-center">
            Explore workspaces in Nigeria&apos;s thriving business districts
          </p>
        </div>

        {/* Locations Grid */}
        <div className="flex flex-col md:flex-row items-center gap-[27px] w-full">
          {locations.map((location, index) => (
            <LocationCard key={index} {...location} />
          ))}
        </div>
      </div>
    </section>
  );
}
