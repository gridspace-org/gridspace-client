import Image from "next/image";
import { Eye, Check, X } from "lucide-react";

interface AdminListingRowProps {
  image: string;
  name: string;
  location: string;
  hostName: string;
  hostEmail: string;
  submittedDate: string;
  status: "pending" | "approved" | "rejected";
  onView?: () => void;
  onApprove?: () => void;
  onReject?: () => void;
}

export default function AdminListingRow({
  image,
  name,
  location,
  hostName,
  hostEmail,
  submittedDate,
  status,
  onView,
  onApprove,
  onReject,
}: AdminListingRowProps) {
  const getStatusBadge = () => {
    switch (status) {
      case "pending":
        return (
          <div className="flex items-center px-2 py-2 bg-[#FEF3C7] rounded-full">
            <span className="text-[12px] text-[#92400E]">Pending</span>
          </div>
        );
      case "approved":
        return (
          <div className="flex items-center px-2 py-2 bg-[#DCFCE7] rounded-full">
            <span className="text-[12px] text-[#166534]">Approved</span>
          </div>
        );
      case "rejected":
        return (
          <div className="flex items-center px-2 py-2 bg-[#FEE2E2] rounded-full">
            <span className="text-[12px] text-[#B91C1C]">Rejected</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <tr className="align-middle">
      {/* Space Details */}
      <td className="px-4 py-4">
        <div className="flex items-center gap-3 min-w-[265px]">
          <div className="w-[97px] h-[86px] rounded-lg overflow-hidden shrink-0">
            <Image
              src={image}
              alt={name}
              width={97}
              height={86}
              className="object-cover w-full h-full"
            />
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="text-[16px] font-semibold text-[#002F5B]">{name}</h3>
            <p className="text-[14px] text-[#686767]">{location}</p>
          </div>
        </div>
      </td>

      {/* Host */}
      <td className="px-4 py-4">
        <div className="flex flex-col gap-1 min-w-[131px]">
          <span className="text-[16px] font-medium text-[#121212]">
            {hostName}
          </span>
          <span className="text-[14px] text-[#686767]">{hostEmail}</span>
        </div>
      </td>

      {/* Submitted Date */}
      <td className="px-4 py-4 min-w-[113px]">
        <span className="text-[16px] text-[#686767]">{submittedDate}</span>
      </td>

      {/* Status */}
      <td className="px-4 py-4 min-w-[90px]">{getStatusBadge()}</td>

      {/* Actions */}
      <td className="px-4 py-4">
        <div className="flex items-center gap-6">
          <button
            onClick={onView}
            className="w-6 h-6 flex items-center justify-center"
          >
            <Eye className="w-6 h-6 text-[#002F5B]" />
          </button>
          <button
            onClick={onApprove}
            className="w-6 h-6 flex items-center justify-center"
          >
            <Check className="w-6 h-6 text-[#166534]" />
          </button>
          <button
            onClick={onReject}
            className="w-6 h-6 flex items-center justify-center"
          >
            <X className="w-6 h-6 text-[#B91C1C]" />
          </button>
        </div>
      </td>
    </tr>
  );
}
