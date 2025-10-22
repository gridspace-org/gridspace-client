"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import { X, ChevronDown, Wifi, Zap, Bath, Monitor, Wind, Keyboard, Printer, Phone, Building, Coffee, Car } from "lucide-react";
import { spacesApi } from "@/services/spacesApi";

interface ViewEditListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  spaceId: string;
}

interface FormErrors {
  title?: string;
  spaceType?: string;
  address?: string;
  location?: string;
  capacity?: string;
  description?: string;
  amenities?: string;
  photos?: string;
  pricePerHour?: string;
}

interface Amenity {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  category: string;
}

export default function ViewEditListingModal({ isOpen, onClose, spaceId }: ViewEditListingModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    title: string;
    spaceType: string;
    address: string;
    location: string;
    capacity: string;
    description: string;
    selectedAmenities: string[];
    images: string[];
    pricePerHour: string;
  }>({
    title: "",
    spaceType: "",
    address: "",
    location: "",
    capacity: "",
    description: "",
    selectedAmenities: [],
    images: [],
    pricePerHour: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const spaceTypes = [
    'Remote Work', 'Study Session', 'Team Meetings', 
    'Networking', 'Presentations', 'Creative Work',
    'Interview', 'Training', 'Client Meeting'
  ];

  // Amenities data structure - matching backend enum values
  const amenities: Amenity[] = useMemo(() => ([
    { id: "wifi", name: "WiFi", icon: Wifi, category: "Essentials" },
    { id: "power", name: "Power Backup", icon: Zap, category: "Essentials" },
    { id: "restroom", name: "Restroom", icon: Bath, category: "Essentials" },
    { id: "ac", name: "Air Conditioning", icon: Wind, category: "Essentials" },
    { id: "projector", name: "Projector", icon: Monitor, category: "Workspace" },
    { id: "whiteboard", name: "Whiteboard", icon: Keyboard, category: "Workspace" },
    { id: "printer", name: "Printer/Scanner", icon: Printer, category: "Workspace" },
    { id: "monitor", name: "Monitor", icon: Monitor, category: "Workspace" },
    { id: "phone", name: "Conference Phone", icon: Phone, category: "Workspace" },
    { id: "kitchen", name: "Kitchen", icon: Building, category: "Comfort" },
    { id: "coffee", name: "Coffee/Tea", icon: Coffee, category: "Comfort" },
    { id: "parking", name: "Parking", icon: Car, category: "Services" },
  ]), []);

  const fetchSpaceDetails = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await spacesApi.getSpaceById(spaceId);
      const space = response.data;
      
      setFormData({
        title: space.title,
        spaceType: space.purposes[0] || "", // Assuming single purpose for now
        address: space.address || "",
        location: space.location,
        capacity: space.capacity.toString(),
        description: space.description,
        selectedAmenities: space.amenities.map(amenityName => {
          const amenity = amenities.find(a => a.name === amenityName);
          return amenity ? amenity.id : "";
        }).filter(Boolean),
        images: space.images,
        pricePerHour: space.pricePerHour.toString(),
      });

      setError(null);
    } catch (error) {
      setError("Failed to load space details");
      console.error("Error fetching space:", error);
    } finally {
      setIsLoading(false);
    }
  }, [spaceId, amenities]);

  useEffect(() => {
    if (isOpen && spaceId) {
      fetchSpaceDetails();
    }
  }, [isOpen, spaceId, fetchSpaceDetails]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Space name is required";
    }

    if (!formData.spaceType) {
      newErrors.spaceType = "Space type is required";
    }

    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
    }

    if (!formData.capacity.trim()) {
      newErrors.capacity = "Capacity is required";
    } else if (isNaN(Number(formData.capacity)) || Number(formData.capacity) <= 0) {
      newErrors.capacity = "Capacity must be a valid number";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.length < 50) {
      newErrors.description = "Description must be at least 50 characters";
    }

    if (formData.selectedAmenities.length < 3) {
      newErrors.amenities = "Please select at least 3 amenities";
    }

    if (!formData.pricePerHour.trim()) {
      newErrors.pricePerHour = "Hourly rate is required";
    } else if (isNaN(Number(formData.pricePerHour)) || Number(formData.pricePerHour) <= 0) {
      newErrors.pricePerHour = "Hourly rate must be a valid number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleAmenityToggle = (amenityId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedAmenities: prev.selectedAmenities.includes(amenityId)
        ? prev.selectedAmenities.filter(id => id !== amenityId)
        : [...prev.selectedAmenities, amenityId]
    }));
    // Clear error when user selects an amenity
    if (errors.amenities) {
      setErrors(prev => ({ ...prev, amenities: undefined }));
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      // Get amenity names from IDs for the API
      const selectedAmenityNames = formData.selectedAmenities
        .map(id => amenities.find(a => a.id === id)?.name)
        .filter(Boolean) as string[];

      // Prepare update data
      const updateData = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        address: formData.address,
        pricePerHour: Number(formData.pricePerHour),
        capacity: Number(formData.capacity),
        purposes: [formData.spaceType],
        amenities: selectedAmenityNames,
        images: formData.images,
      };

      // Send update request
      await spacesApi.updateSpace(spaceId, updateData);
      
      setIsEditing(false);
      onClose();
    } catch (error) {
      console.error('Error updating space:', error);
      setError(error instanceof Error ? error.message : 'Failed to update listing');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-lg w-full max-w-[950px] h-[710px] max-h-[90vh] relative overflow-hidden flex flex-col mx-4 sm:mx-0">
        {/* Header */}
        <div className="flex flex-col gap-4 p-4 sm:p-6 lg:p-8 pb-4 border-b border-[#D1D5DB]">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-semibold text-[#002F5B]">
              {isEditing ? "Edit Listing" : "View Listing"}
            </h2>
            <button
              onClick={onClose}
              className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-[#686767]" />
            </button>
          </div>
          {isEditing ? (
            <p className="text-sm text-[#686767] tracking-[-0.25px]">
              Make changes to your listing details below
            </p>
          ) : (
            <p className="text-sm text-[#686767] tracking-[-0.25px]">
              View your listing details or click Edit to make changes
            </p>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#002F5B]"></div>
            </div>
          ) : error ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-red-500 text-center">
                <p className="text-lg font-semibold mb-2">Error Loading Listing</p>
                <p>{error}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[#002F5B]">Basic Information</h3>
                
                {/* Title and Type Row */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-[#002F5B] mb-1">
                      Space Name
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                      disabled={!isEditing}
                      className={`w-full h-10 px-3 border rounded-lg text-[#686767] disabled:bg-gray-50 disabled:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#002F5B] ${
                        errors.title ? 'border-red-500' : 'border-[#D1D5DB]'
                      }`}
                    />
                    {errors.title && (
                      <p className="text-red-500 text-xs mt-1">{errors.title}</p>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-[#002F5B] mb-1">
                      Space Type
                    </label>
                    <div className="relative">
                      <select
                        value={formData.spaceType}
                        onChange={(e) => handleInputChange("spaceType", e.target.value)}
                        disabled={!isEditing}
                        className={`w-full h-10 px-3 border rounded-lg text-[#686767] disabled:bg-gray-50 disabled:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#002F5B] appearance-none ${
                          errors.spaceType ? 'border-red-500' : 'border-[#D1D5DB]'
                        }`}
                      >
                        <option value="">Select Type</option>
                        {spaceTypes.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#686767] pointer-events-none" />
                    </div>
                    {errors.spaceType && (
                      <p className="text-red-500 text-xs mt-1">{errors.spaceType}</p>
                    )}
                  </div>
                </div>

                {/* Location and Capacity Row */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-[#002F5B] mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => handleInputChange("location", e.target.value)}
                      disabled={!isEditing}
                      className={`w-full h-10 px-3 border rounded-lg text-[#686767] disabled:bg-gray-50 disabled:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#002F5B] ${
                        errors.location ? 'border-red-500' : 'border-[#D1D5DB]'
                      }`}
                    />
                    {errors.location && (
                      <p className="text-red-500 text-xs mt-1">{errors.location}</p>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-[#002F5B] mb-1">
                      Capacity
                    </label>
                    <input
                      type="number"
                      value={formData.capacity}
                      onChange={(e) => handleInputChange("capacity", e.target.value)}
                      disabled={!isEditing}
                      className={`w-full h-10 px-3 border rounded-lg text-[#686767] disabled:bg-gray-50 disabled:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#002F5B] ${
                        errors.capacity ? 'border-red-500' : 'border-[#D1D5DB]'
                      }`}
                    />
                    {errors.capacity && (
                      <p className="text-red-500 text-xs mt-1">{errors.capacity}</p>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-[#002F5B] mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    disabled={!isEditing}
                    rows={4}
                    className={`w-full px-3 py-2 border rounded-lg text-[#686767] disabled:bg-gray-50 disabled:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#002F5B] resize-none ${
                      errors.description ? 'border-red-500' : 'border-[#D1D5DB]'
                    }`}
                  />
                  {errors.description && (
                    <p className="text-red-500 text-xs mt-1">{errors.description}</p>
                  )}
                </div>
              </div>

              {/* Photos */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[#002F5B]">Photos</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {formData.images.map((imageUrl, index) => (
                    <div key={index} className="aspect-square relative rounded-lg overflow-hidden border border-[#D1D5DB]">
                      <Image
                        src={imageUrl}
                        alt={`Space photo ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Amenities */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[#002F5B]">Amenities</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {amenities.map((amenity) => {
                    const IconComponent = amenity.icon;
                    const isSelected = formData.selectedAmenities.includes(amenity.id);
                    
                    return (
                      <button
                        key={amenity.id}
                        type="button"
                        onClick={() => isEditing && handleAmenityToggle(amenity.id)}
                        disabled={!isEditing}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                          isSelected
                            ? "bg-[#002F5B] text-white border-[#002F5B]"
                            : "bg-white text-[#002F5B] border-[#002F5B] hover:bg-[#F8FAFB] disabled:hover:bg-white"
                        } ${!isEditing && 'cursor-default'}`}
                      >
                        <IconComponent className="w-6 h-6 flex-shrink-0" />
                        <span className="text-sm font-normal tracking-[-0.25px]">
                          {amenity.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {errors.amenities && (
                  <p className="text-red-500 text-xs mt-1">{errors.amenities}</p>
                )}
              </div>

              {/* Pricing */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[#002F5B]">Pricing</h3>
                <div>
                  <label className="block text-sm font-medium text-[#002F5B] mb-1">
                    Hourly Rate (₦)
                  </label>
                  <input
                    type="number"
                    value={formData.pricePerHour}
                    onChange={(e) => handleInputChange("pricePerHour", e.target.value)}
                    disabled={!isEditing}
                    className={`w-full sm:w-1/3 h-10 px-3 border rounded-lg text-[#686767] disabled:bg-gray-50 disabled:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#002F5B] ${
                      errors.pricePerHour ? 'border-red-500' : 'border-[#D1D5DB]'
                    }`}
                  />
                  {errors.pricePerHour && (
                    <p className="text-red-500 text-xs mt-1">{errors.pricePerHour}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[#D1D5DB] p-4 sm:p-6">
          <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 text-[#686767] hover:bg-gray-100 rounded-lg transition-colors"
            >
              Close
            </button>
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              {isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    disabled={isSaving}
                    className="w-full sm:w-auto px-4 py-2 border border-[#D1D5DB] text-[#686767] hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full sm:w-auto px-4 py-2 bg-[#F25417] text-white rounded-lg hover:bg-[#E04A15] transition-colors disabled:bg-gray-400"
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full sm:w-auto px-4 py-2 bg-[#002F5B] text-white rounded-lg hover:bg-[#002447] transition-colors"
                >
                  Edit Listing
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}