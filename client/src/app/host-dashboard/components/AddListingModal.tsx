"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { X, Clock, ChevronDown, Wifi, Zap, Bath, Monitor, Keyboard, Printer, Phone, Building, Coffee, Car, Upload, Trash2, Info, Wind } from "lucide-react";
import { spacesApi } from "@/services/spacesApi";

interface AddListingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormErrors {
  spaceName?: string;
  spaceType?: string;
  fullAddress?: string;
  location?: string;
  capacity?: string;
  description?: string;
  availableDays?: string;
  amenities?: string;
  photos?: string;
  hourlyRate?: string;
  dailyRate?: string;
  weeklyDiscount?: string;
  monthlyDiscount?: string;
  availabilitySchedule?: string;
  timeSlots?: string;
}

interface UploadedPhoto {
  id: string;
  file: File;
  preview: string;
}

interface Amenity {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  category: string;
}

export default function AddListingModal({ isOpen, onClose }: AddListingModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    spaceName: "",
    spaceType: "",
    fullAddress: "",
    location: "",
    capacity: "",
    description: "",
    startTime: "9:00AM",
    endTime: "6:00PM",
    availableDays: [] as string[],
    selectedAmenities: [] as string[],
    uploadedPhotos: [] as UploadedPhoto[],
    hourlyRate: "",
    dailyRate: "",
    weeklyDiscount: "",
    monthlyDiscount: "",
    availabilitySchedule: "",
    selectedTimeSlots: [] as string[],
  });

  const [errors, setErrors] = useState<FormErrors>({});
  // const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const spaceTypes = [
    'Remote Work', 'Study Session', 'Team Meetings', 
    'Networking', 'Presentations', 'Creative Work',
    'Interview', 'Training', 'Client Meeting'
  ];

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // Amenities data structure - matching backend enum values
  const amenities: Amenity[] = [
    // Essentials
    { id: "wifi", name: "WiFi", icon: Wifi, category: "Essentials" },
    { id: "power", name: "Power Backup", icon: Zap, category: "Essentials" },
    { id: "restroom", name: "Restroom", icon: Bath, category: "Essentials" },
    { id: "ac", name: "Air Conditioning", icon: Wind, category: "Essentials" },
    
    // Workspace
    { id: "projector", name: "Projector", icon: Monitor, category: "Workspace" },
    { id: "whiteboard", name: "Whiteboard", icon: Keyboard, category: "Workspace" },
    { id: "printer", name: "Printer/Scanner", icon: Printer, category: "Workspace" },
    { id: "monitor", name: "Monitor", icon: Monitor, category: "Workspace" },
    { id: "phone", name: "Conference Phone", icon: Phone, category: "Workspace" },
    
    // Comfort
    { id: "kitchen", name: "Kitchen", icon: Building, category: "Comfort" },
    { id: "coffee", name: "Coffee/Tea", icon: Coffee, category: "Comfort" },
    
    // Services
    { id: "parking", name: "Parking", icon: Car, category: "Services" },
  ];

  // Time slots for availability
  const timeSlots = [
    "8:00AM", "9:00AM", "10:00AM", "11:00AM",
    "12:00PM", "1:00PM", "2:00PM", "3:00PM",
    "4:00PM", "5:00PM", "6:00PM", "7:00PM"
  ];

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        spaceName: "",
        spaceType: "",
        fullAddress: "",
        location: "",
        capacity: "",
        description: "",
        startTime: "9:00AM",
        endTime: "6:00PM",
        availableDays: [],
        selectedAmenities: [],
        uploadedPhotos: [],
        hourlyRate: "",
        dailyRate: "",
        weeklyDiscount: "",
        monthlyDiscount: "",
        availabilitySchedule: "",
        selectedTimeSlots: [],
      });
      setErrors({});
      setCurrentStep(1);
    }
  }, [isOpen]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (currentStep === 1) {
      if (!formData.spaceName.trim()) {
        newErrors.spaceName = "Space name is required";
      }

      if (!formData.spaceType) {
        newErrors.spaceType = "Space type is required";
      }

      if (!formData.fullAddress.trim()) {
        newErrors.fullAddress = "Full address is required";
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

      if (formData.availableDays.length === 0) {
        newErrors.availableDays = "Please select at least one available day";
      }
    } else if (currentStep === 2) {
      if (formData.selectedAmenities.length < 3) {
        newErrors.amenities = "Please select at least 3 amenities";
      }
    } else if (currentStep === 3) {
      if (formData.uploadedPhotos.length < 3) {
        newErrors.photos = "Please upload at least 3 photos to continue";
      }
    } else if (currentStep === 4) {
      if (!formData.hourlyRate.trim()) {
        newErrors.hourlyRate = "Hourly rate is required";
      } else if (isNaN(Number(formData.hourlyRate)) || Number(formData.hourlyRate) <= 0) {
        newErrors.hourlyRate = "Hourly rate must be a valid number";
      }

      if (!formData.dailyRate.trim()) {
        newErrors.dailyRate = "Daily rate is required";
      } else if (isNaN(Number(formData.dailyRate)) || Number(formData.dailyRate) <= 0) {
        newErrors.dailyRate = "Daily rate must be a valid number";
      }

      if (formData.weeklyDiscount && (isNaN(Number(formData.weeklyDiscount)) || Number(formData.weeklyDiscount) < 0)) {
        newErrors.weeklyDiscount = "Weekly discount must be a valid number";
      }

      if (formData.monthlyDiscount && (isNaN(Number(formData.monthlyDiscount)) || Number(formData.monthlyDiscount) < 0)) {
        newErrors.monthlyDiscount = "Monthly discount must be a valid number";
      }
    } else if (currentStep === 5) {
      if (!formData.availabilitySchedule) {
        newErrors.availabilitySchedule = "Please select an availability schedule";
      }

      if (formData.selectedTimeSlots.length === 0) {
        newErrors.timeSlots = "Please select at least one time slot";
      }
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

  const handleDayToggle = (day: string) => {
    setFormData(prev => ({
      ...prev,
      availableDays: prev.availableDays.includes(day)
        ? prev.availableDays.filter(d => d !== day)
        : [...prev.availableDays, day]
    }));
    // Clear error when user selects a day
    if (errors.availableDays) {
      setErrors(prev => ({ ...prev, availableDays: undefined }));
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

  const handleAvailabilityScheduleChange = (schedule: string) => {
    setFormData(prev => ({
      ...prev,
      availabilitySchedule: schedule
    }));

    // Clear error when user starts selecting
    if (errors.availabilitySchedule) {
      setErrors(prev => ({ ...prev, availabilitySchedule: undefined }));
    }
  };

  const handleTimeSlotToggle = (timeSlot: string) => {
    setFormData(prev => ({
      ...prev,
      selectedTimeSlots: prev.selectedTimeSlots.includes(timeSlot)
        ? prev.selectedTimeSlots.filter(slot => slot !== timeSlot)
        : [...prev.selectedTimeSlots, timeSlot]
    }));

    // Clear error when user starts selecting
    if (errors.timeSlots) {
      setErrors(prev => ({ ...prev, timeSlots: undefined }));
    }
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;

    const newPhotos: UploadedPhoto[] = Array.from(files).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file)
    }));

    setFormData(prev => ({
      ...prev,
      uploadedPhotos: [...prev.uploadedPhotos, ...newPhotos]
    }));

    // Clear error when user uploads photos
    if (errors.photos) {
      setErrors(prev => ({ ...prev, photos: undefined }));
    }
  };

  const handleRemovePhoto = (photoId: string) => {
    setFormData(prev => ({
      ...prev,
      uploadedPhotos: prev.uploadedPhotos.filter(photo => {
        if (photo.id === photoId) {
          URL.revokeObjectURL(photo.preview);
          return false;
        }
        return true;
      })
    }));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (currentStep === 1) {
      // Move to step 2
      setCurrentStep(2);
      setErrors({});
    } else if (currentStep === 2) {
      // Move to step 3
      setCurrentStep(3);
      setErrors({});
    } else if (currentStep === 3) {
      // Move to step 4
      setCurrentStep(4);
      setErrors({});
    } else if (currentStep === 4) {
      // Move to step 5
      setCurrentStep(5);
      setErrors({});
    } else if (currentStep === 5) {
      // Move to step 6
      setCurrentStep(6);
      setErrors({});
    } else if (currentStep === 6) {
      // Final submission
      setIsSubmitting(true);
      setSubmitError(null);
      
        try {
          // Prepare form data to include files (actual File objects) so multer receives them
          const fd = new FormData();
          fd.append('title', formData.spaceName);
          fd.append('description', formData.description);
          fd.append('location', formData.location);
          if (formData.fullAddress) fd.append('address', formData.fullAddress);
          fd.append('pricePerHour', String(parseInt(formData.hourlyRate || '0')));
          fd.append('capacity', String(parseInt(formData.capacity || '0')));

          // purposes (spaceType) - backend expects array of strings
          if (formData.spaceType) fd.append('purposes[]', formData.spaceType);

          // amenities - send names expected by validator
          const selectedAmenityNames = formData.selectedAmenities
            .map(id => amenities.find(a => a.id === id)?.name)
            .filter(Boolean) as string[];
          selectedAmenityNames.forEach(name => fd.append('amenities[]', name));

          // Append files using the original File objects, under 'images'
          formData.uploadedPhotos.forEach((p, idx) => {
            // ensure the file object exists
            if (p.file) fd.append('images', p.file, p.file.name || `image_${idx}`);
          });

          // Note: the server createSpace validator doesn't accept timeSlots in the request body.
          // Availability/time slots should be set using the update endpoint or a dedicated availability API.
          // Therefore we intentionally do NOT append `timeSlots` here to avoid validation errors.

          // Submit FormData to API
          await spacesApi.createSpace(fd);

          // Close modal on success
          onClose();
        } catch (error) {
          console.error('Error submitting form:', error);
          setSubmitError(error instanceof Error ? error.message : 'Failed to create listing');
        } finally {
          setIsSubmitting(false);
        }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setErrors({});
    } else {
      onClose();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg w-full max-w-[950px] h-[710px] max-h-[90vh] relative overflow-hidden flex flex-col mx-4 sm:mx-0">
        {/* Header */}
        <div className="flex flex-col gap-4 p-4 sm:p-6 lg:p-8 pb-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-semibold text-[#002F5B]">Add New Listing</h2>
            <button
              onClick={onClose}
              className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-[#686767]" />
            </button>
          </div>
          <p className="text-base sm:text-lg text-[#686767] tracking-[-0.25px]">
            {currentStep === 1 
              ? "Tell us about your space and when it's available"
              : currentStep === 2
              ? "Select amenities and features your space offers"
              : currentStep === 3
              ? "Upload Pictures to showcase your space"
              : currentStep === 4
              ? "Set your rates and any discounts"
              : currentStep === 5
              ? "Configure your availability schedule"
              : "Review your listing before submitting"
            }
          </p>
          
          {/* Progress Steps */}
          <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto">
            <div className="flex items-center gap-2 sm:gap-3 min-w-max">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${
                currentStep >= 1 ? 'bg-[#002F5B]' : 'bg-[#EBEBEB]'
              }`}>
                {currentStep > 1 ? (
                  <span className="text-white font-semibold text-sm sm:text-lg">✓</span>
                ) : (
                  <span className={`font-semibold text-sm sm:text-lg ${
                    currentStep === 1 ? 'text-white' : 'text-[#121212]'
                  }`}>1</span>
                )}
              </div>
              <div className={`w-8 sm:w-12 h-0.5 ${
                currentStep > 1 ? 'bg-[#002F5B]' : 'bg-[#EBEBEB]'
              }`}></div>
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${
                currentStep >= 2 ? 'bg-[#002F5B]' : 'bg-[#EBEBEB]'
              }`}>
                {currentStep > 2 ? (
                  <span className="text-white font-semibold text-sm sm:text-lg">✓</span>
                ) : (
                  <span className={`font-semibold text-sm sm:text-lg ${
                    currentStep >= 2 ? 'text-white' : 'text-[#121212]'
                  }`}>2</span>
                )}
              </div>
              <div className={`w-8 sm:w-12 h-0.5 ${
                currentStep > 2 ? 'bg-[#002F5B]' : 'bg-[#EBEBEB]'
              }`}></div>
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${
                currentStep >= 3 ? 'bg-[#002F5B]' : 'bg-[#EBEBEB]'
              }`}>
                {currentStep > 3 ? (
                  <span className="text-white font-semibold text-sm sm:text-lg">✓</span>
                ) : (
                  <span className={`font-semibold text-sm sm:text-lg ${
                    currentStep >= 3 ? 'text-white' : 'text-[#121212]'
                  }`}>3</span>
                )}
              </div>
              <div className={`w-8 sm:w-12 h-0.5 ${
                currentStep > 3 ? 'bg-[#002F5B]' : 'bg-[#EBEBEB]'
              }`}></div>
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${
                currentStep >= 4 ? 'bg-[#002F5B]' : 'bg-[#EBEBEB]'
              }`}>
                {currentStep > 4 ? (
                  <span className="text-white font-semibold text-sm sm:text-lg">✓</span>
                ) : (
                  <span className={`font-semibold text-sm sm:text-lg ${
                    currentStep >= 4 ? 'text-white' : 'text-[#121212]'
                  }`}>4</span>
                )}
              </div>
              <div className={`w-8 sm:w-12 h-0.5 ${
                currentStep > 4 ? 'bg-[#002F5B]' : 'bg-[#EBEBEB]'
              }`}></div>
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${
                currentStep >= 5 ? 'bg-[#002F5B]' : 'bg-[#EBEBEB]'
              }`}>
                {currentStep > 5 ? (
                  <span className="text-white font-semibold text-sm sm:text-lg">✓</span>
                ) : (
                  <span className={`font-semibold text-sm sm:text-lg ${
                    currentStep >= 5 ? 'text-white' : 'text-[#121212]'
                  }`}>5</span>
                )}
              </div>
              <div className={`w-8 sm:w-12 h-0.5 ${
                currentStep > 5 ? 'bg-[#002F5B]' : 'bg-[#EBEBEB]'
              }`}></div>
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${
                currentStep >= 6 ? 'bg-[#002F5B]' : 'bg-[#EBEBEB]'
              }`}>
                <span className={`font-semibold text-sm sm:text-lg ${
                  currentStep >= 6 ? 'text-white' : 'text-[#121212]'
                }`}>6</span>
              </div>
            </div>
          </div>
          
          <p className="text-sm text-[#686767] tracking-[-0.25px]">
            {currentStep === 1 
              ? "Step 1 of 6: Basic Information"
              : currentStep === 2
              ? "Step 2 of 6: Amenities and Features"
              : currentStep === 3
              ? "Step 3 of 6: Photos"
              : currentStep === 4
              ? "Step 4 of 6: Pricing"
              : currentStep === 5
              ? "Step 5 of 6: Availability"
              : "Step 6 of 6: Review and submit"
            }
          </p>
          <div className="w-full h-px bg-[#D1D5DB]"></div>
        </div>

        {/* Form Content */}
        <div className="px-4 sm:px-6 lg:px-8 pb-4 overflow-y-auto flex-1">
          {currentStep === 1 ? (
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Space Name and Type Row */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-lg font-semibold text-[#002F5B] mb-2">
                  Space Name
                </label>
                <input
                  type="text"
                  value={formData.spaceName}
                  onChange={(e) => handleInputChange("spaceName", e.target.value)}
                  placeholder="e.g. Urban Coworking Hub"
                  className={`w-full h-12 px-3 border rounded-lg text-[#686767] focus:outline-none focus:ring-2 focus:ring-[#002F5B] ${
                    errors.spaceName ? 'border-red-500' : 'border-[#D1D5DB]'
                  }`}
                />
                {errors.spaceName && (
                  <p className="text-red-500 text-sm mt-1">{errors.spaceName}</p>
                )}
              </div>
              <div className="flex-1">
                <label className="block text-lg font-semibold text-[#002F5B] mb-2">
                  Space Type
                </label>
                <div className="relative">
                  <select
                    value={formData.spaceType}
                    onChange={(e) => handleInputChange("spaceType", e.target.value)}
                    className={`w-full h-12 px-3 border rounded-lg text-[#686767] focus:outline-none focus:ring-2 focus:ring-[#002F5B] appearance-none ${
                      errors.spaceType ? 'border-red-500' : 'border-[#D1D5DB]'
                    }`}
                  >
                    <option value="">Select Type</option>
                    {spaceTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 text-[#686767]" />
                </div>
                {errors.spaceType && (
                  <p className="text-red-500 text-sm mt-1">{errors.spaceType}</p>
                )}
              </div>
            </div>

            {/* Full Address */}
            <div>
              <label className="block text-lg font-semibold text-[#002F5B] mb-2">
                Full Address
              </label>
              <input
                type="text"
                value={formData.fullAddress}
                onChange={(e) => handleInputChange("fullAddress", e.target.value)}
                placeholder="23 Jakande street, Victoria Island, Lagos"
                className={`w-full h-12 px-3 border rounded-lg text-[#686767] focus:outline-none focus:ring-2 focus:ring-[#002F5B] ${
                  errors.fullAddress ? 'border-red-500' : 'border-[#D1D5DB]'
                }`}
              />
              {errors.fullAddress && (
                <p className="text-red-500 text-sm mt-1">{errors.fullAddress}</p>
              )}
            </div>

            {/* Location and Capacity Row */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-lg font-semibold text-[#002F5B] mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  placeholder="e.g. Lagos, Nigeria"
                  className={`w-full h-12 px-3 border rounded-lg text-[#686767] focus:outline-none focus:ring-2 focus:ring-[#002F5B] ${
                    errors.location ? 'border-red-500' : 'border-[#D1D5DB]'
                  }`}
                />
                {errors.location && (
                  <p className="text-red-500 text-sm mt-1">{errors.location}</p>
                )}
              </div>
              <div className="flex-1">
                <label className="block text-lg font-semibold text-[#002F5B] mb-2">
                  Capacity
                </label>
                <input
                  type="text"
                  value={formData.capacity}
                  onChange={(e) => handleInputChange("capacity", e.target.value)}
                  placeholder="Number of People"
                  className={`w-full h-12 px-3 border rounded-lg text-[#686767] focus:outline-none focus:ring-2 focus:ring-[#002F5B] ${
                    errors.capacity ? 'border-red-500' : 'border-[#D1D5DB]'
                  }`}
                />
                {errors.capacity && (
                  <p className="text-red-500 text-sm mt-1">{errors.capacity}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-lg font-semibold text-[#002F5B] mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Describe what makes your space special. Highlight unique features, atmosphere and what guests can expect......"
                className={`w-full h-32 px-3 py-3 border rounded-lg text-[#686767] focus:outline-none focus:ring-2 focus:ring-[#002F5B] resize-none ${
                  errors.description ? 'border-red-500' : 'border-[#D1D5DB]'
                }`}
              />
              <div className="flex justify-between items-center mt-1">
                <p className="text-xs text-[#686767]">
                  Minimum of 50 characters. Focus on what makes your space unique and appealing
                </p>
                <p className={`text-xs ${formData.description.length < 50 ? 'text-red-500' : 'text-green-500'}`}>
                  {formData.description.length}/50
                </p>
              </div>
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description}</p>
              )}
            </div>

            {/* Start Time and End Time Row */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-lg font-semibold text-[#002F5B] mb-2">
                  Start Time
                </label>
                <div className="relative">
                  <div className="flex items-center gap-2 h-12 px-3 border border-[#D1D5DB] rounded-lg">
                    <Clock className="w-6 h-6 text-[#686767]" />
                    <span className="text-[#686767]">{formData.startTime}</span>
                    <ChevronDown className="w-6 h-6 text-[#686767] ml-auto" />
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <label className="block text-lg font-semibold text-[#002F5B] mb-2">
                  End Time
                </label>
                <div className="relative">
                  <div className="flex items-center gap-2 h-12 px-3 border border-[#D1D5DB] rounded-lg">
                    <Clock className="w-6 h-6 text-[#686767]" />
                    <span className="text-[#686767]">{formData.endTime}</span>
                    <ChevronDown className="w-6 h-6 text-[#686767] ml-auto" />
                  </div>
                </div>
              </div>
            </div>

            {/* Available Days */}
            <div>
              <label className="block text-lg font-semibold text-[#002F5B] mb-2">
                Available Days
              </label>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2 sm:gap-4">
                  {days.map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleDayToggle(day)}
                      className={`px-3 py-2 sm:px-4 sm:py-3 rounded-xl border text-sm sm:text-base font-normal tracking-[-0.25px] transition-colors ${
                        formData.availableDays.includes(day)
                          ? "bg-[#002F5B] text-white border-[#002F5B]"
                          : "bg-white text-[#686767] border-[#D1D5DB] hover:border-[#002F5B]"
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
                {errors.availableDays && (
                  <p className="text-red-500 text-sm mt-1">{errors.availableDays}</p>
                )}
              </div>
            </div>
            </form>
          ) : currentStep === 2 ? (
            /* Step 2: Amenities and Features */
            <div className="space-y-6">
              {/* Information Banner */}
              <div className="bg-[#EDF6FF] border border-[#002F5B] rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#002F5B] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-sm font-bold">i</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-[#002F5B] mb-2">
                      Select at least 3 amenities
                    </h3>
                    <p className="text-[#002F5B] text-sm">
                      Choose the features and services that best describe your space. This helps guests find exactly what they need.
                    </p>
                  </div>
                </div>
              </div>

              {/* Amenities by Category */}
              {["Essentials", "Workspace", "Comfort", "Services"].map((category) => (
                <div key={category} className="space-y-4">
                  <h3 className="text-lg font-semibold text-[#002F5B]">
                    {category}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {amenities
                      .filter(amenity => amenity.category === category)
                      .map((amenity) => {
                        const IconComponent = amenity.icon;
                        const isSelected = formData.selectedAmenities.includes(amenity.id);
                        
                        return (
                          <button
                            key={amenity.id}
                            type="button"
                            onClick={() => handleAmenityToggle(amenity.id)}
                            className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                              isSelected
                                ? "bg-[#002F5B] text-white border-[#002F5B]"
                                : "bg-white text-[#002F5B] border-[#002F5B] hover:bg-[#F8FAFB]"
                            }`}
                          >
                            <IconComponent className="w-6 h-6 flex-shrink-0" />
                            <span className="text-sm font-normal tracking-[-0.25px]">
                              {amenity.name}
                            </span>
                          </button>
                        );
                      })}
                  </div>
                </div>
              ))}

              {/* Error message for amenities */}
              {errors.amenities && (
                <div className="text-red-500 text-sm mt-2">
                  {errors.amenities}
                </div>
              )}
            </div>
          ) : currentStep === 3 ? (
            /* Step 3: Photo Upload */
            <div className="space-y-6">
              {/* Upload Area */}
              <div 
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragOver 
                    ? 'border-[#002F5B] bg-[#F8FAFB]' 
                    : 'border-[#D1D5DB] hover:border-[#002F5B]'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="flex flex-col items-center gap-6">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                    <Upload className="w-10 h-10 text-[#CECED2]" />
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="text-xl font-semibold text-[#002F5B]">
                      Upload Photos
                    </h3>
                    <p className="text-[#686767] text-base">
                      Drag and drop images here or Click to browse
                    </p>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => document.getElementById('file-upload')?.click()}
                    className="bg-[#F25417] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#E04A15] transition-colors"
                  >
                    Choose Files
                  </button>
                  
                  <input
                    id="file-upload"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e.target.files)}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Error message for photos */}
              {errors.photos && (
                <div className="bg-[#FEE2E2] border border-[#B91C1C] rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#B91C1C] flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-bold">!</span>
                    </div>
                    <p className="text-[#B91C1C] text-sm">
                      {errors.photos}
                    </p>
                  </div>
                </div>
              )}

              {/* Photo Preview Grid */}
              {formData.uploadedPhotos.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-[#002F5B]">
                    Uploaded Photos ({formData.uploadedPhotos.length})
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {formData.uploadedPhotos.map((photo) => (
                      <div key={photo.id} className="relative group">
                        <div className="aspect-square rounded-lg overflow-hidden border border-[#D1D5DB] relative">
                          <Image
                            src={photo.preview}
                            alt="Uploaded photo"
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(photo.id)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : currentStep === 4 ? (
            /* Step 4: Pricing */
            <div className="space-y-6">
              {/* Hourly and Daily Rates */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-lg font-semibold text-[#002F5B] mb-2">
                    Set Hourly Rate (₦)
                  </label>
                  <input
                    type="number"
                    value={formData.hourlyRate}
                    onChange={(e) => handleInputChange("hourlyRate", e.target.value)}
                    placeholder="600"
                    className={`w-full h-12 px-3 border rounded-lg text-[#686767] focus:outline-none focus:ring-2 focus:ring-[#002F5B] ${
                      errors.hourlyRate ? 'border-red-500' : 'border-[#D1D5DB]'
                    }`}
                  />
                  {errors.hourlyRate && (
                    <p className="text-red-500 text-sm mt-1">{errors.hourlyRate}</p>
                  )}
                </div>
                <div className="flex-1">
                  <label className="block text-lg font-semibold text-[#002F5B] mb-2">
                    Daily Rate (₦)
                  </label>
                  <input
                    type="number"
                    value={formData.dailyRate}
                    onChange={(e) => handleInputChange("dailyRate", e.target.value)}
                    placeholder="5000"
                    className={`w-full h-12 px-3 border rounded-lg text-[#686767] focus:outline-none focus:ring-2 focus:ring-[#002F5B] ${
                      errors.dailyRate ? 'border-red-500' : 'border-[#D1D5DB]'
                    }`}
                  />
                  {errors.dailyRate && (
                    <p className="text-red-500 text-sm mt-1">{errors.dailyRate}</p>
                  )}
                </div>
              </div>

              {/* Bulk Booking Discounts Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[#002F5B]">
                  Bulk Booking Discounts
                </h3>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <label className="block text-lg font-semibold text-[#002F5B] mb-2">
                      Weekly Discount (₦)
                    </label>
                    <input
                      type="number"
                      value={formData.weeklyDiscount}
                      onChange={(e) => handleInputChange("weeklyDiscount", e.target.value)}
                      placeholder="5000"
                      className={`w-full h-12 px-3 border rounded-lg text-[#686767] focus:outline-none focus:ring-2 focus:ring-[#002F5B] ${
                        errors.weeklyDiscount ? 'border-red-500' : 'border-[#D1D5DB]'
                      }`}
                    />
                    {errors.weeklyDiscount && (
                      <p className="text-red-500 text-sm mt-1">{errors.weeklyDiscount}</p>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="block text-lg font-semibold text-[#002F5B] mb-2">
                      Monthly Discount (₦)
                    </label>
                    <input
                      type="number"
                      value={formData.monthlyDiscount}
                      onChange={(e) => handleInputChange("monthlyDiscount", e.target.value)}
                      placeholder="5000"
                      className={`w-full h-12 px-3 border rounded-lg text-[#686767] focus:outline-none focus:ring-2 focus:ring-[#002F5B] ${
                        errors.monthlyDiscount ? 'border-red-500' : 'border-[#D1D5DB]'
                      }`}
                    />
                    {errors.monthlyDiscount && (
                      <p className="text-red-500 text-sm mt-1">{errors.monthlyDiscount}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : currentStep === 5 ? (
            /* Step 5: Availability Schedule */
            <div className="space-y-6">
              {/* Availability Schedule Options */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[#002F5B]">
                  Availability Schedule
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Weekdays Only */}
                  <button
                    type="button"
                    onClick={() => handleAvailabilityScheduleChange("weekdays")}
                    className={`p-4 border rounded-xl text-left transition-colors ${
                      formData.availabilitySchedule === "weekdays"
                        ? 'border-[#002F5B] bg-[#F8FAFB]'
                        : 'border-[#D1D5DB] hover:border-[#002F5B]'
                    }`}
                  >
                    <div className="space-y-1">
                      <h4 className="font-semibold text-[#686767] text-base">
                        Weekdays Only
                      </h4>
                      <p className="text-sm text-[#686767]">
                        Monday- Friday
                      </p>
                    </div>
                  </button>

                  {/* Everyday */}
                  <button
                    type="button"
                    onClick={() => handleAvailabilityScheduleChange("everyday")}
                    className={`p-4 border rounded-xl text-left transition-colors ${
                      formData.availabilitySchedule === "everyday"
                        ? 'border-[#002F5B] bg-[#F8FAFB]'
                        : 'border-[#D1D5DB] hover:border-[#002F5B]'
                    }`}
                  >
                    <div className="space-y-1">
                      <h4 className="font-semibold text-[#686767] text-base">
                        Everyday
                      </h4>
                      <p className="text-sm text-[#686767]">
                        Monday- Sunday
                      </p>
                    </div>
                  </button>

                  {/* Custom Schedule */}
                  <button
                    type="button"
                    onClick={() => handleAvailabilityScheduleChange("custom")}
                    className={`p-4 border rounded-xl text-left transition-colors ${
                      formData.availabilitySchedule === "custom"
                        ? 'border-[#002F5B] bg-[#F8FAFB]'
                        : 'border-[#D1D5DB] hover:border-[#002F5B]'
                    }`}
                  >
                    <div className="space-y-1">
                      <h4 className="font-semibold text-[#686767] text-base">
                        Custom Schedule
                      </h4>
                      <p className="text-sm text-[#686767]">
                        Choose specific days
                      </p>
                    </div>
                  </button>
                </div>

                {/* Error message for availability schedule */}
                {errors.availabilitySchedule && (
                  <div className="bg-[#FEE2E2] border border-[#B91C1C] rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#B91C1C] flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm font-bold">!</span>
                      </div>
                      <p className="text-[#B91C1C] text-sm">
                        {errors.availabilitySchedule}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Available Time Slots */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[#002F5B]">
                  Available Time Slots
                </h3>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {timeSlots.map((timeSlot) => (
                    <button
                      key={timeSlot}
                      type="button"
                      onClick={() => handleTimeSlotToggle(timeSlot)}
                      className={`p-3 border rounded-xl text-center transition-colors ${
                        formData.selectedTimeSlots.includes(timeSlot)
                          ? 'border-[#002F5B] bg-[#F8FAFB] text-[#002F5B]'
                          : 'border-[#D1D5DB] hover:border-[#002F5B] text-[#686767]'
                      }`}
                    >
                      {timeSlot}
                    </button>
                  ))}
                </div>

                {/* Error message for time slots */}
                {errors.timeSlots && (
                  <div className="bg-[#FEE2E2] border border-[#B91C1C] rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#B91C1C] flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm font-bold">!</span>
                      </div>
                      <p className="text-[#B91C1C] text-sm">
                        {errors.timeSlots}
                      </p>
                    </div>
                  </div>
                )}

                <p className="text-xs text-[#686767] tracking-[-0.25px]">
                  Select the hours your space is available for booking
                </p>
              </div>
            </div>
          ) : currentStep === 6 ? (
            /* Step 6: Review and Submit */
            <div className="space-y-6">
              {/* Ready to Submit Banner */}
              <div className="bg-[#EDF6FF] border border-[#002F5B] rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info className="w-6 h-6 text-[#002F5B] flex-shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium text-[#002F5B]">
                      Ready to Submit
                    </h3>
                    <p className="text-[#002F5B] text-sm">
                      Review your listing details below. After submission, your listing will be reviewed by our team.
                    </p>
                  </div>
                </div>
              </div>

              {/* Error Display */}
              {submitError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5">⚠️</div>
                    <div>
                      <h3 className="text-lg font-medium text-red-800">
                        Submission Failed
                      </h3>
                      <p className="text-red-700 text-sm mt-1">
                        {submitError}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Listing Preview */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[#002F5B]">
                  Listing Preview
                </h3>
                
                <div className="bg-white border border-[#D1D5DB] rounded-lg p-4 space-y-4">
                  {/* Basic Information vs Pricing and Availability */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-medium text-[#002F5B] text-base">Basic Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-[#686767]">Space Name:</span>
                          <span className="font-semibold text-[#121212]">{formData.spaceName || "Not provided"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#686767]">Address:</span>
                          <span className="font-semibold text-[#121212]">{formData.fullAddress || "Not provided"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#686767]">Description:</span>
                          <span className="font-semibold text-[#121212]">{formData.description ? `${formData.description.substring(0, 30)}...` : "Not provided"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#686767]">Hours:</span>
                          <span className="font-semibold text-[#121212]">{formData.startTime} - {formData.endTime}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#686767]">Days:</span>
                          <span className="font-semibold text-[#121212]">{formData.availableDays.length > 0 ? formData.availableDays.join(", ") : "Not selected"}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="font-medium text-[#002F5B] text-base">Pricing and Availability</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-[#686767]">Hourly Rate:</span>
                          <span className="font-semibold text-[#121212]">₦{formData.hourlyRate || "Not set"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#686767]">Daily Rate:</span>
                          <span className="font-semibold text-[#121212]">₦{formData.dailyRate || "Not set"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#686767]">Amenities:</span>
                          <span className="font-semibold text-[#121212]">{formData.selectedAmenities.length} selected</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#686767]">Photos:</span>
                          <span className="font-semibold text-[#121212]">{formData.uploadedPhotos.length} Uploads</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#686767]">Time Slots:</span>
                          <span className="font-semibold text-[#121212]">{formData.selectedTimeSlots.length} available</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Photos Preview */}
              {formData.uploadedPhotos.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-[#002F5B]">
                    Photos
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {formData.uploadedPhotos.slice(0, 3).map((photo) => (
                      <div key={photo.id} className="aspect-square rounded-lg overflow-hidden border border-[#D1D5DB] relative">
                        <Image
                          src={photo.preview}
                          alt="Uploaded photo"
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* What will happen next Banner */}
              <div className="bg-[#FEF3C7] border border-[#92400E] rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info className="w-6 h-6 text-[#92400E] flex-shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium text-[#92400E]">
                      What will happen next?
                    </h3>
                    <p className="text-[#92400E] text-sm">
                      Your Listing will be reviewed by our team. We&apos;ll verify the information and photos. 
                      You&apos;ll receive an email confirmation within 24-48 hours. Once approved your listing will 
                      go live and start receiving bookings.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Future steps placeholder */
            <div className="text-center py-8">
              <p className="text-[#686767]">More steps coming soon...</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#F8FAFB] border-t border-[#D1D5DB] p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-2 px-4 py-3 text-[#121212] font-bold hover:bg-gray-100 rounded-lg transition-colors"
              >
                <span className="transform rotate-180">→</span>
                Back
              </button>
              <span className="text-xs text-[#686767] tracking-[-0.25px]">
                {currentStep} of 6 steps completed
              </span>
            </div>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`flex items-center gap-2 px-4 py-3 font-bold rounded-xl transition-colors ${
                isSubmitting 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-[#F25417] hover:bg-[#E04A15]'
              } text-white w-full sm:w-auto`}
            >
              {isSubmitting ? 'Processing...' : (currentStep === 6 ? 'Submit for Review' : 'Continue')}
              {!isSubmitting && <span>→</span>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
