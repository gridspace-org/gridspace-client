import Image from "next/image";
import { Star } from "lucide-react";

interface WorkspaceCardProps {
  image: string;
  name: string;
  location: string;
  rating: number;
  price: string;
  onClick?: () => void;
}

export default function WorkspaceCard({
  image,
  name,
  location,
  rating,
  price,
  onClick,
}: WorkspaceCardProps) {
  return (
    <div className="flex flex-col gap-4 cursor-pointer" onClick={onClick}>
      {/* Image */}
      <div className="w-full h-[214px] bg-gradient-to-br from-blue-100 to-orange-100 rounded-lg relative overflow-hidden">
        <Image
          src={image}
          alt={name}
          width={464}
          height={214}
          className="object-cover w-full h-full"
        />
      </div>

      {/* Content */}
      <div className="flex flex-col gap-[10px] px-3">
        <div className="flex justify-between items-start">
          <h3 className="text-[18px] font-semibold text-[#002F5B] leading-[22px]">
            {name}
          </h3>
          <div className="flex items-center gap-1">
            <Star className="w-6 h-6 text-[#FFC849] fill-current" />
            <span className="text-[14px] text-[#121212] leading-[17px] tracking-[-0.25px]">
              {rating}
            </span>
          </div>
        </div>

        <p className="text-[14px] font-medium text-[#686767] leading-[17px]">
          {location}
        </p>

        <p className="text-[20px] font-semibold text-[#002F5B] leading-[24px]">
          {price}
        </p>
      </div>
    </div>
  );
}
