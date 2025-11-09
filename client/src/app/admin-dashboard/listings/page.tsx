"use client";

import { ArrowRight, Eye, Check, X, Building2 } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import adminApiService, { Space } from "@/services/adminApi";

export default function ListingsPage() {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Space | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchSpaces();
  }, [currentPage]);

  const fetchSpaces = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminApiService.getSpaces({
        page: currentPage,
        limit: 10,
      });
      setSpaces(response.data.spaces);
      setTotalPages(response.data.pagination.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch spaces');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (spaceId: string) => {
    try {
      await adminApiService.approveSpace(spaceId, {
        notes: 'Approved by admin',
      });
      fetchSpaces();
      if (selected?._id === spaceId) {
        setIsOpen(false);
        setSelected(null);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to approve space');
    }
  };

  const handleReject = async (spaceId: string) => {
    try {
      await adminApiService.rejectSpace(spaceId, {
        reason: 'Does not meet platform requirements',
      });
      fetchSpaces();
      if (selected?._id === spaceId) {
        setIsOpen(false);
        setSelected(null);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to reject space');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getLocationDisplay = (location: Space['location']) => {
    const parts = [location.city, location.state].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : location.address || 'Unknown';
  };

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
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#002F5B]"></div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <p className="text-[16px] text-[#B91C1C]">{error}</p>
            <button
              onClick={fetchSpaces}
              className="px-4 py-2 bg-[#002F5B] text-white rounded-lg hover:bg-[#003d75]"
            >
              Retry
            </button>
          </div>
        ) : spaces.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <Building2 className="w-16 h-16 text-[#D1D5DB]" />
            <h3 className="text-[20px] font-semibold text-[#002F5B]">No Listings Found</h3>
            <p className="text-[16px] text-[#686767] text-center max-w-md">
              There are no workspace listings to review at the moment. Check back later for new submissions.
            </p>
          </div>
        ) : (
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
                {spaces.map((space) => (
                  <tr
                    key={space._id}
                    className="border-b border-[#D1D5DB] hover:bg-[#F9FBFC] cursor-pointer"
                    onClick={() => { setSelected(space); setIsOpen(true); }}
                  >
                    {/* Space Details */}
                    <td className="py-4 px-3">
                      <div className="flex items-center gap-3 min-w-[260px]">
                        <div className="w-[97px] h-[86px] rounded-lg overflow-hidden shrink-0 bg-gray-200">
                          {space.images && space.images.length > 0 ? (
                            <Image src={space.images[0]} alt={space.title} width={97} height={86} className="object-cover w-full h-full" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Building2 className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-1">
                          <h3 className="text-[16px] font-semibold text-[#002F5B]">{space.title}</h3>
                          <p className="text-[14px] text-[#686767]">{getLocationDisplay(space.location)}</p>
                        </div>
                      </div>
                    </td>

                    {/* Host */}
                    <td className="py-4 px-3">
                      <div className="flex flex-col gap-1 min-w-[140px]">
                        <span className="text-[16px] font-medium text-[#121212]">{space.host?.fullname || 'Unknown'}</span>
                        <span className="text-[14px] text-[#686767]">{space.host?.email || 'N/A'}</span>
                      </div>
                    </td>

                    {/* Submission Date */}
                    <td className="py-4 px-3">
                      <span className="text-[16px] text-[#686767]">{formatDate(space.createdAt)}</span>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-3">
                      {space.status === "pending" && (
                        <div className="inline-flex items-center px-2 py-[7px] gap-1 bg-[#FEF3C7] rounded-full">
                          <span className="text-[12px] text-[#92400E]">Pending</span>
                        </div>
                      )}
                      {space.status === "approved" && (
                        <div className="inline-flex items-center px-2 py-[7px] gap-1 bg-[#DCFCE7] rounded-full">
                          <span className="text-[12px] text-[#166534]">Approved</span>
                        </div>
                      )}
                      {space.status === "rejected" && (
                        <div className="inline-flex items-center px-2 py-[7px] gap-1 bg-[#FEE2E2] rounded-full">
                          <span className="text-[12px] text-[#B91C1C]">Rejected</span>
                        </div>
                      )}
                    </td>

                    {/* Action */}
                    <td className="py-4 px-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => { setSelected(space); setIsOpen(true); }}
                          className="w-6 h-6 flex items-center justify-center"
                          aria-label="View"
                        >
                          <Eye className="w-6 h-6 text-[#002F5B]" />
                        </button>
                        <button
                          onClick={() => handleApprove(space._id)}
                          className="w-6 h-6 flex items-center justify-center"
                          aria-label="Approve"
                        >
                          <Check className="w-6 h-6 text-[#166534]" />
                        </button>
                        <button
                          onClick={() => handleReject(space._id)}
                          className="w-6 h-6 flex items-center justify-center"
                          aria-label="Reject"
                        >
                          <X className="w-6 h-6 text-[#B91C1C]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {isOpen && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="relative w-full max-w-[661px] h-auto max-h-[90vh] overflow-y-auto bg-white rounded-[8px]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6">
              <h3 className="text-[20px] md:text-[24px] font-semibold text-[#002F5B]">Listing Details</h3>
              <button aria-label="Close" onClick={() => setIsOpen(false)} className="w-6 h-6 grid place-items-center rounded hover:bg-gray-100">
                <X className="w-5 h-5 text-[#999999]" />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 pb-6 pt-4 flex flex-col gap-6">
              {/* Name / Host */}
              <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-[313px]">
                <div className="flex flex-col gap-1 min-w-[171px]">
                  <span className="text-[14px] text-[#686767] tracking-[-0.25px]">Space Name</span>
                  <span className="text-[16px] font-semibold text-[#002F5B]">{selected.title}</span>
                </div>
                <div className="flex flex-col gap-1 min-w-[114px]">
                  <span className="text-[14px] text-[#686767] tracking-[-0.25px]">Host</span>
                  <span className="text-[16px] font-medium text-[#121212]">{selected.host?.fullname || 'Unknown'}</span>
                </div>
              </div>

              {/* Location / Rate */}
              <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-[321px]">
                <div className="flex flex-col gap-1 min-w-[164px]">
                  <span className="text-[14px] text-[#686767] tracking-[-0.25px]">Location</span>
                  <span className="text-[16px] font-medium text-[#121212]">{getLocationDisplay(selected.location)}</span>
                </div>
                <div className="flex flex-col gap-1 min-w-[67px]">
                  <span className="text-[14px] text-[#686767] tracking-[-0.25px]">Daily Rate</span>
                  <span className="text-[16px] font-semibold text-[#002F5B]">₦{selected.pricePerDay?.toLocaleString() || 'N/A'}</span>
                </div>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1">
                <span className="text-[14px] text-[#686767] tracking-[-0.25px]">Description</span>
                <span className="text-[16px] text-[#121212]">{selected.description || 'No description provided'}</span>
              </div>

              {/* Amenities */}
              {selected.amenities && selected.amenities.length > 0 && (
                <div className="flex flex-col gap-2">
                  <span className="text-[14px] text-[#686767]">Amenities</span>
                  <div className="flex flex-wrap items-center gap-2">
                    {selected.amenities.map((a, idx) => (
                      <div key={idx} className="px-4 py-[12px] bg-[#EDF6FF] rounded-[8px]">
                        <span className="text-[14px] text-[#002F5B] tracking-[-0.25px]">{a}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Photos */}
              {selected.images && selected.images.length > 0 && (
                <div className="flex flex-col gap-2">
                  <span className="text-[14px] text-[#686767]">Photos</span>
                  <div className="flex flex-row items-start gap-4 overflow-x-auto">
                    {selected.images.slice(0, 3).map((src, i) => (
                      <div key={i} className="w-[188px] h-[151px] rounded-[8px] overflow-hidden border border-[#121212] shrink-0">
                        <Image src={src} alt={`photo-${i + 1}`} width={188} height={151} className="object-cover w-full h-full" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-row items-center gap-4 pt-2">
                <button
                  onClick={() => handleApprove(selected._id)}
                  className="px-4 py-[13px] bg-[#002F5B] text-white rounded-[8px] text-[16px] font-semibold hover:bg-[#003d75]"
                >
                  Approve Listing
                </button>
                <button
                  onClick={() => handleReject(selected._id)}
                  className="px-4 py-[13px] bg-[#B91C1C] text-white rounded-[8px] text-[16px] font-semibold hover:bg-[#991b1b]"
                >
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




