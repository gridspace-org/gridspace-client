"use client";

import { ArrowRight, Eye, Check, X } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";

type ListingStatus = "pending" | "approved" | "rejected";

interface ListingRowData {
  image: string;
  name: string;
  location: string;
  hostName: string;
  hostEmail: string;
  submittedDate: string;
  status: ListingStatus;
  rate?: string;
  description?: string;
  amenities?: string[];
  photos?: string[];
}

export default function ListingsPage() {
  const data = useMemo<ListingRowData[]>(
    () => [
      {
        image: "/blogpost-img.png",
        name: "Urban Coworking Hub",
        location: "Victoria Island, Lagos",
        hostName: "Deba Derek",
        hostEmail: "derek45@gmail.com",
        submittedDate: "July 2nd, 2025",
        status: "pending",
        rate: "₦10,000",
        description:
          "Premium executive suite with city views, perfect for meetings and focused work.",
        amenities: ["Wifi", "AV Equipment", "Kitchen", "Parking"],
        photos: ["/blogpost-img.png", "/blogpost-img.png", "/blogpost-img.png"],
      },
      {
        image: "/blogpost-img.png",
        name: "TechNest Work Lounge",
        location: "Ikeja, Lagos",
        hostName: "Ada Obi",
        hostEmail: "ada.obi@example.com",
        submittedDate: "July 3rd, 2025",
        status: "approved",
        rate: "₦12,000",
        description: "Modern lounge ideal for hybrid teams and client calls.",
        amenities: ["Wifi", "Kitchen"],
        photos: ["/blogpost-img.png", "/blogpost-img.png", "/blogpost-img.png"],
      },
      {
        image: "/blogpost-img.png",
        name: "Harbor View Studios",
        location: "Lekki, Lagos",
        hostName: "Sam Bello",
        hostEmail: "sam.bello@example.com",
        submittedDate: "July 4th, 2025",
        status: "rejected",
        rate: "₦9,500",
        description: "Cozy studio with great lighting and quiet environment.",
        amenities: ["Wifi", "Parking"],
        photos: ["/blogpost-img.png", "/blogpost-img.png", "/blogpost-img.png"],
      },
    ],
    []
  );

  const [selected, setSelected] = useState<ListingRowData | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const openModal = (row: ListingRowData) => {
    setSelected(row);
    setIsOpen(true);
  };
  const closeModal = () => setIsOpen(false);

  return (
    <section className="flex flex-col items-start gap-4 md:gap-6 w-full">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-2 md:gap-[24px] w-full overflow-x-auto">
        <div className="flex items-center gap-2 md:gap-6">
          <ArrowRight className="w-6 h-6 text-[#121212] rotate-180" />
          <div className="flex flex-col gap-1">
            <h2 className="text-[20px] md:text-[32px] leading-[24px] md:leading-[39px] font-bold text-[#002F5B]">
              Listing Management
            </h2>
            <p className="text-[14px] md:text-[18px] leading-[17px] md:leading-[22px] tracking-[-0.25px] text-[#686767]">
              Review and moderate host listings
            </p>
          </div>
        </div>
      </div>

      {/* Data table */}
      <div className="w-full bg-white rounded-md shadow-[0px_4px_4px_rgba(222,222,222,0.25)] p-4 md:p-6">
        <div className="overflow-x-auto rounded-lg border border-[#D1D5DB]">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-[#D1D5DB]">
                <th className="text-left py-4 px-3 text-[16px] font-semibold text-[#002F5B]">Space Details</th>
                <th className="text-left py-4 px-3 text-[16px] font-semibold text-[#002F5B]">Host</th>
                <th className="text-left py-4 px-3 text-[16px] font-semibold text-[#002F5B]">Submission Date</th>
                <th className="text-left py-4 px-3 text-[16px] font-semibold text-[#002F5B]">Status</th>
                <th className="text-left py-4 px-3 text-[16px] font-semibold text-[#002F5B]">Action</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, idx) => (
                <tr
                  key={idx}
                  className="border-b border-[#D1D5DB] hover:bg-[#F9FBFC] cursor-pointer"
                  onClick={() => openModal(row)}
                >
                  {/* Space Details */}
                  <td className="py-4 px-3">
                    <div className="flex items-center gap-3 min-w-[260px]">
                      <div className="w-[97px] h-[86px] rounded-lg overflow-hidden shrink-0">
                        <Image src={row.image} alt={row.name} width={97} height={86} className="object-cover w-full h-full" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <h3 className="text-[16px] font-semibold text-[#002F5B]">{row.name}</h3>
                        <p className="text-[14px] text-[#686767]">{row.location}</p>
                      </div>
                    </div>
                  </td>

                  {/* Host */}
                  <td className="py-4 px-3">
                    <div className="flex flex-col gap-1 min-w-[140px]">
                      <span className="text-[16px] font-medium text-[#121212]">{row.hostName}</span>
                      <span className="text-[14px] text-[#686767]">{row.hostEmail}</span>
                    </div>
                  </td>

                  {/* Submission Date */}
                  <td className="py-4 px-3">
                    <span className="text-[16px] text-[#686767]">{row.submittedDate}</span>
                  </td>

                  {/* Status */}
                  <td className="py-4 px-3">
                    {row.status === "pending" && (
                      <div className="inline-flex items-center px-2 py-[7px] gap-1 bg-[#FEF3C7] rounded-full">
                        <span className="text-[12px] text-[#92400E]">Pending</span>
                      </div>
                    )}
                    {row.status === "approved" && (
                      <div className="inline-flex items-center px-2 py-[7px] gap-1 bg-[#DCFCE7] rounded-full">
                        <span className="text-[12px] text-[#166534]">Approved</span>
                      </div>
                    )}
                    {row.status === "rejected" && (
                      <div className="inline-flex items-center px-2 py-[7px] gap-1 bg-[#FEE2E2] rounded-full">
                        <span className="text-[12px] text-[#B91C1C]">Rejected</span>
                      </div>
                    )}
                  </td>

                  {/* Action */}
                  <td className="py-4 px-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-4">
                      <button className="w-6 h-6 flex items-center justify-center" aria-label="View">
                        <Eye className="w-6 h-6 text-[#002F5B]" />
                      </button>
                      <button className="w-6 h-6 flex items-center justify-center" aria-label="Approve">
                        <Check className="w-6 h-6 text-[#166534]" />
                      </button>
                      <button className="w-6 h-6 flex items-center justify-center" aria-label="Reject">
                        <X className="w-6 h-6 text-[#B91C1C]" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {isOpen && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="relative w-full max-w-[661px] h-auto max-h-[90vh] overflow-y-auto bg-white rounded-[8px]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6">
              <h3 className="text-[20px] md:text-[24px] font-semibold text-[#002F5B]">Listing Details</h3>
              <button aria-label="Close" onClick={closeModal} className="w-6 h-6 grid place-items-center rounded hover:bg-gray-100">
                <X className="w-5 h-5 text-[#999999]" />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 pb-6 pt-4 flex flex-col gap-6">
              {/* Name / Host */}
              <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-[313px]">
                <div className="flex flex-col gap-1 min-w-[171px]">
                  <span className="text-[14px] text-[#686767] tracking-[-0.25px]">Space Name</span>
                  <span className="text-[16px] font-semibold text-[#002F5B]">{selected.name}</span>
                </div>
                <div className="flex flex-col gap-1 min-w-[114px]">
                  <span className="text-[14px] text-[#686767] tracking-[-0.25px]">Host</span>
                  <span className="text-[16px] font-medium text-[#121212]">{selected.hostName}</span>
                </div>
              </div>

              {/* Location / Rate */}
              <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-[321px]">
                <div className="flex flex-col gap-1 min-w-[164px]">
                  <span className="text-[14px] text-[#686767] tracking-[-0.25px]">Location</span>
                  <span className="text-[16px] font-medium text-[#121212]">{selected.location}</span>
                </div>
                <div className="flex flex-col gap-1 min-w-[67px]">
                  <span className="text-[14px] text-[#686767] tracking-[-0.25px]">Daily Rate</span>
                  <span className="text-[16px] font-semibold text-[#002F5B]">{selected.rate}</span>
                </div>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1">
                <span className="text-[14px] text-[#686767] tracking-[-0.25px]">Description</span>
                <span className="text-[16px] text-[#121212]">{selected.description}</span>
              </div>

              {/* Amenities */}
              {selected.amenities && selected.amenities.length > 0 && (
                <div className="flex flex-col gap-2">
                  <span className="text-[14px] text-[#686767]">Amenities</span>
                  <div className="flex flex-wrap items-center gap-2">
                    {selected.amenities.map((a) => (
                      <div key={a} className="px-4 py-[12px] bg-[#EDF6FF] rounded-[8px]">
                        <span className="text-[14px] text-[#002F5B] tracking-[-0.25px]">{a}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Photos */}
              {selected.photos && selected.photos.length > 0 && (
                <div className="flex flex-col gap-2">
                  <span className="text-[14px] text-[#686767]">Photos</span>
                  <div className="flex flex-row items-start gap-4">
                    {selected.photos.slice(0, 3).map((src, i) => (
                      <div key={i} className="w-[188px] h-[151px] rounded-[8px] overflow-hidden border border-[#121212]">
                        <Image src={src} alt={`photo-${i + 1}`} width={188} height={151} className="object-cover w-full h-full" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-row items-center gap-4 pt-2">
                <button className="px-4 py-[13px] bg-[#002F5B] text-white rounded-[8px] text-[16px] font-semibold">
                  Approve Listing
                </button>
                <button className="px-4 py-[13px] bg-[#B91C1C] text-white rounded-[8px] text-[16px] font-semibold">
                  Reject Listing
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}




