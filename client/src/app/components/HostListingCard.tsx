import Image from "next/image";
import {
  Star,
  MapPin,
  DollarSign,
  Eye,
  Edit,
  Pause,
  Play,
  Clock,
} from "lucide-react";

interface HostListingCardProps {
  image: string;
  name: string;
  location: string;
  rating: number;
  bookings: number;
  price: string;
  status: "live" | "pending" | "paused";
  createdDate: string;
  lastBooking: string;
  onView?: () => void;
  onEdit?: () => void;
  onToggleStatus?: () => void;
}

export default function HostListingCard({
  image,
  name,
  location,
  rating,
  bookings,
  price,
  status,
  createdDate,
  lastBooking,
  onView,
  onEdit,
  onToggleStatus,
}: HostListingCardProps) {
  const getStatusBadge = () => {
    switch (status) {
      case "live":
        return (
          <div className="flex items-center gap-1 px-2 py-1 bg-[#DCFCE7] rounded-full">
            <Play className="w-3 h-3 text-[#166534]" />
            <span className="text-[12px] text-[#166534]">Live</span>
          </div>
        );
      case "pending":
        return (
          <div className="flex items-center gap-1 px-2 py-1 bg-[#FEF3C7] rounded-full">
            <Clock className="w-3 h-3 text-[#92400E]" />
            <span className="text-[12px] text-[#92400E]">Pending</span>
          </div>
        );
      case "paused":
        return (
          <div className="flex items-center gap-1 px-2 py-1 bg-[#EDF6FF] rounded-full">
            <Pause className="w-3 h-3 text-[#002F5B]" />
            <span className="text-[12px] text-[#002F5B]">Pause</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-[fit] xl:min-w-[294px] h-fit border border-[#D8D8D9] rounded-lg overflow-hidden">
      {/* Image section */}
      <div className="relative w-full h-[168px]">
        <Image
          src={image}
          alt={name}
          width={294}
          height={168}
          className="object-cover w-full h-full"
        />

        {/* Status badge and action buttons */}
        <div className="absolute top-3 left-2 right-2 flex justify-between items-center">
          {getStatusBadge()}

          <div className="flex items-center gap-2">
            <button
              onClick={onView}
              className="w-6 h-6 bg-[#EEF7FF] rounded-full flex items-center justify-center"
            >
              <Eye className="w-3 h-3 text-[#002F5B]" />
            </button>
            <button
              onClick={onEdit}
              className="w-6 h-6 bg-[#EEF7FF] rounded-full flex items-center justify-center"
            >
              <Edit className="w-3 h-3 text-[#002F5B]" />
            </button>
          </div>
        </div>
      </div>

      {/* Content section */}
      <div className="p-2">
        {/* Title and rating */}
        <div className="flex flex-col gap-1 mb-2">
          <h3 className="text-[16px] font-semibold text-[#002F5B]">{name}</h3>

          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3 text-[#686767]" />
            <span className="text-[12px] text-[#686767]">{location}</span>
          </div>

          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-[#FFC849] fill-current" />
            <span className="text-[12px] font-bold text-[#121212]">
              {rating} ({bookings}) 20 bookings
            </span>
          </div>
        </div>

        {/* Price and action */}
        <div className="border-t border-[#D8D8D9] pt-2">
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center gap-1">
              <DollarSign className="w-3 h-3 text-[#121212]" />
              <span className="text-[14px] font-semibold text-[#002F5B]">
                {price}
              </span>
            </div>

            {status === "paused" ? (
              <button
                onClick={onToggleStatus}
                className="flex items-center gap-1 px-2 py-1 bg-[#F25417] text-white rounded text-[10px]"
              >
                <Play className="w-2 h-2" />
                <span>Activate</span>
              </button>
            ) : (
              <button
                onClick={onToggleStatus}
                className="flex items-center gap-1"
              >
                <Pause className="w-3 h-3 text-[#002F5B]" />
                <span className="text-[12px] text-[#002F5B]">Pause</span>
              </button>
            )}
          </div>

          <p className="text-[10px] text-[#686767]">
            Created {createdDate} | Last booking {lastBooking}
          </p>
        </div>
      </div>
    </div>
  );
}
