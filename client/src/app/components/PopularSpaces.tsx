import { Star } from "lucide-react";
import Image from "next/image";
import { Button } from "./index";

interface SpaceProps {
  image: string;
  name: string;
  location: string;
  rating: number;
  price: string;
  isPriority?: boolean;
}

const Rating = ({ rating }: { rating: number }) => (
  <div className="flex flex-row items-center gap-1">
    <Star className="w-5 md:w-6 h-5 md:h-6 text-[var(--color-warning)] fill-current" />
    <span className="font-inter font-normal text-[12px] md:text-[14px] leading-[15px] md:leading-[17px] text-[var(--color-text-primary)] tracking-[-0.25px]">
      {rating}
    </span>
  </div>
);

const SpaceCard = ({
  image,
  name,
  location,
  rating,
  price,
  isPriority,
}: SpaceProps) => (
  <div className="flex flex-col items-start gap-[8px] w-full">
    <div className="relative w-full h-[250px] md:h-[302px] rounded-[8px] overflow-hidden">
      <Image
        src={image}
        alt={name}
        width={800}
        height={800}
        className="object-cover w-full h-full"
        priority={isPriority}
      />
    </div>
    <div className="flex flex-col gap-[10px] w-full">
      <div className="flex flex-col justify-center gap-[4px]">
        <div className="flex flex-row items-start justify-between w-full">
          <h3 className="font-inter font-semibold text-[16px] md:text-[18px] leading-[20px] md:leading-[22px] text-[var(--color-secondary)]">
            {name}
          </h3>
          <Rating rating={rating} />
        </div>
        <p className="font-inter font-medium text-[12px] md:text-[14px] leading-[15px] md:leading-[17px] text-[var(--color-text-secondary)]">
          {location}
        </p>
      </div>
      <p className="font-inter font-semibold text-[16px] md:text-[20px] leading-[20px] md:leading-[24px] text-[var(--color-secondary)]">
        {price}/hr
      </p>
    </div>
  </div>
);

const spaces: SpaceProps[] = [
  {
    image: "/space1.png",
    name: "Urban Coworking Hub",
    location: "Victoria Island, Lagos",
    rating: 4.75,
    price: "₦5000",
    isPriority: true,
  },
  {
    image: "/space2.png",
    name: "Digital Space",
    location: "Yaba, Lagos",
    rating: 4.75,
    price: "₦10,000",
  },
  {
    image: "/space3.png",
    name: "Analyst Coworking Hub",
    location: "Ikeja, Lagos",
    rating: 4.75,
    price: "₦5000",
  },
];

export default function PopularSpaces() {
  return (
    <section className="relative w-full max-w-[1440px] mx-auto px-4 md:px-8 py-5">
      <div className="flex flex-col items-center gap-[20px]">
        {/* Header Section */}
        <div className="flex flex-col items-center gap-[8px] w-full max-w-[613px] px-4 md:px-0">
          <h2 className="font-inter font-bold text-[20px] md:text-[32px] leading-[29px] md:leading-[39px] text-[var(--color-secondary)] text-center">
            Featured Workspaces
          </h2>
          <p className="font-inter font-normal text-[16px] md:text-[20px] leading-[20px] md:leading-[24px] text-[var(--color-text-primary)] text-center">
            Discover the most popular coworking spaces trusted by thousands of
            professionals
          </p>
        </div>

        {/* Spaces Grid */}
        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-[27px] w-full">
          {spaces.map((space, index) => (
            <SpaceCard key={index} {...space} />
          ))}
        </div>

        {/* View All Button */}
        <Button variant="primary" size="lg" className="">
          View All Spaces
        </Button>
      </div>
    </section>
  );
}
