"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  User,
  Grid3X3,
  Monitor,
  BookOpen,
  Users,
  Handshake,
  Presentation,
  Layers,
  MapPin,
  Upload,
} from "lucide-react";
import { useAppDispatch } from "@/store/hooks";
import { completeOnboarding } from "@/store/slices/authSlice";
import AuthLoader from "../components/AuthLoader";

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [selectedPurposes, setSelectedPurposes] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [customLocation, setCustomLocation] = useState<string>("");
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLoader, setShowLoader] = useState(false);
  const router = useRouter();
  const dispatch = useAppDispatch();

  const handleContinue = async () => {
    if (currentStep === 1 && selectedRole) {
      // Move to step 2
      setCurrentStep(2);
    } else if (currentStep === 2 && selectedPurposes.length > 0) {
      // Move to step 3
      setCurrentStep(3);
    } else if (currentStep === 3 && (selectedLocation || customLocation)) {
      // Move to step 4
      setCurrentStep(4);
    } else if (currentStep === 4) {
      // Complete onboarding by sending data to server
      setIsSubmitting(true);

      try {
        setError(null);
        const location = selectedLocation || customLocation;
        // Map frontend role values to backend role values
        const roleMapping: { [key: string]: string } = {
          "seeker": "user",
          "host": "host",
          "admin": "admin"
        };

        const onboardingData = {
          role: roleMapping[selectedRole] || selectedRole,
          purposes: selectedPurposes,
          location: location,
          profilePic: profilePictureFile || undefined,
        };

        console.log("Onboarding data being sent:", {
          ...onboardingData,
          profilePic: onboardingData.profilePic ? "File present" : "No file"
        });

        await dispatch(completeOnboarding(onboardingData)).unwrap();

        // Show loader after successful onboarding completion
        setShowLoader(true);
      } catch (error: unknown) {
        console.error("Failed to complete onboarding:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to complete onboarding. Please try again.";
        setError(errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleBack = () => {
    if (currentStep === 1) {
      router.back();
    } else {
      setCurrentStep(currentStep - 1);
    }
  };

  const togglePurpose = (purpose: string) => {
    setSelectedPurposes((prev) =>
      prev.includes(purpose)
        ? prev.filter((p) => p !== purpose)
        : [...prev, purpose]
    );
  };

  const selectLocation = (location: string) => {
    setSelectedLocation(location);
    setCustomLocation(""); // Clear custom location when selecting a popular city
  };

  const popularCities = [
    "Abuja",
    "Lagos",
    "Port Harcourt",
    "Ibadan",
    "Benin",
    "Uyo",
    "Kaduna",
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setProfilePictureFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePicture(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Show loader if onboarding is completed successfully
  if (showLoader) {
    return <AuthLoader message="Setting up your dashboard..." />;
  }

  return (
    <div className="min-h-screen bg-[#F7F5F5] flex items-center justify-center p-4">
      <div className="w-full max-w-[1238px] flex flex-col items-start gap-10 md:gap-16">
        {/* Header Section */}
        <div className="flex flex-col items-center gap-4 md:gap-6 w-full">
          <div className="flex flex-col items-center gap-1.5 md:gap-3 w-full">
            <h1 className="text-[20px] md:text-[40px] font-bold text-[#002F5B] text-center leading-6 md:leading-[48px] w-[223px] md:w-full">
              Welcome to GridSpace
            </h1>
            <p className="text-[16px] md:text-[24px] font-normal text-[#686767] text-center leading-[19px] md:leading-[29px] w-[339px] md:w-full">
              Let&apos;s personalise your workspace experience
            </p>
          </div>

          {/* Progress Bar */}
          <div className="flex flex-col items-start gap-2.5 w-full">
            <div className="w-full h-[7px] bg-[#D9D9D9] rounded-[12px]">
              <div
                className="h-[7px] bg-[#002F5B] rounded-[12px] transition-all duration-300"
                style={{
                  width:
                    currentStep === 1
                      ? "25%"
                      : currentStep === 2
                      ? "50%"
                      : currentStep === 3
                      ? "75%"
                      : "100%",
                }}
              ></div>
            </div>
            <p className="text-[12px] md:text-[16px] font-normal text-[#686767] text-center leading-[15px] md:leading-[19px] w-full">
              Step {currentStep} of 4
            </p>
          </div>
        </div>

        {/* Step 1: Role Selection (Refactored to Figma style) */}
        {currentStep === 1 && (
          <div className="w-full bg-white rounded-[8px] relative p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col items-start gap-6 sm:gap-6 lg:gap-6 w-full">
              {/* Seeker Card */}
              <div
                className={`w-full border border-[#D1D5DB] rounded-[8px] py-10 px-[37px] cursor-pointer transition-all duration-200 ${
                  selectedRole === "seeker" ? "ring-2 ring-[#002F5B] bg-[#EDF6FF]" : "bg-white"
                }`}
                onClick={() => setSelectedRole("seeker")}
              >
                <div className="flex flex-row items-center justify-between gap-6 w-full">
                  <div className="flex flex-row items-center gap-6">
                    <div className="w-[40px] h-[40px] md:w-[70px] md:h-[70px] min-w-[40px] min-h-[40px] md:min-w-[70px] md:min-h-[70px] bg-[#002F5B] rounded-[8px] flex items-center justify-center flex-shrink-0">
                      <User className="w-6 h-6 md:w-10 md:h-10 text-white" />
                    </div>
                    <div className="flex flex-col justify-center items-start gap-2">
                      <h3 className="font-semibold text-[16px] md:text-[24px] leading-[19px] md:leading-[29px] text-[#002F5B]">
                        I&apos;m looking for spaces
                      </h3>
                      <p className="font-normal text-[12px] md:text-[18px] leading-[15px] md:leading-[22px] text-[#686767]">
                        Find and book workspaces for your needs
                      </p>
                    </div>
                  </div>
                  <div
                    className="w-5 h-5 md:w-[33px] md:h-[33px] min-w-5 min-h-5 md:min-w-[33px] md:min-h-[33px] border border-[#264582] rounded-full flex items-center justify-center bg-white flex-shrink-0"
                  >
                    {selectedRole === "seeker" && (
                      <div className="w-3 h-3 md:w-[21px] md:h-[21px] bg-[#002F5B] rounded-full" />
                    )}
                  </div>
                </div>
              </div>

              {/* Host Card */}
              <div
                className={`w-full border border-[#D1D5DB] rounded-[8px] py-10 px-[37px] cursor-pointer transition-all duration-200 ${
                  selectedRole === "host" ? "ring-2 ring-[#002F5B] bg-[#EDF6FF]" : "bg-white"
                }`}
                onClick={() => setSelectedRole("host")}
              >
                <div className="flex flex-row items-center justify-between gap-6 w-full">
                  <div className="flex flex-row items-center gap-6">
                    <div className="w-[40px] h-[40px] md:w-[70px] md:h-[70px] min-w-[40px] min-h-[40px] md:min-w-[70px] md:min-h-[70px] bg-[#002F5B] rounded-[8px] flex items-center justify-center flex-shrink-0">
                      <Grid3X3 className="w-6 h-6 md:w-10 md:h-10 text-white" />
                    </div>
                    <div className="flex flex-col justify-center items-start gap-2">
                      <h3 className="font-semibold text-[16px] md:text-[24px] leading-[19px] md:leading-[29px] text-[#002F5B]">
                        I want to host spaces
                      </h3>
                      <p className="font-normal text-[12px] md:text-[18px] leading-[15px] md:leading-[22px] text-[#686767]">
                        List your workspace and earn income
                      </p>
                    </div>
                  </div>
                  <div
                    className="w-5 h-5 md:w-[33px] md:h-[33px] min-w-5 min-h-5 md:min-w-[33px] md:min-h-[33px] border border-[#264582] rounded-full flex items-center justify-center bg-white flex-shrink-0"
                  >
                    {selectedRole === "host" && (
                      <div className="w-3 h-3 md:w-[21px] md:h-[21px] bg-[#002F5B] rounded-full" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Workspace Purpose Selection */}
        {currentStep === 2 && (
          <div className="w-full bg-white rounded-[8px] p-4 sm:p-6 lg:p-8">
            {/* Content Container */}
            <div className="flex flex-col items-center gap-4 sm:gap-6 lg:gap-8 w-full">
              {/* Section Title */}
              <div className="flex flex-col items-center gap-3 sm:gap-4 w-full max-w-2xl">
                <h2 className="font-bold text-[16px] sm:text-[18px] lg:text-[32px] leading-[20px] sm:leading-[22px] lg:leading-[39px] text-[#002F5B] text-center">
                  What will you use workspace for?
                </h2>
                <p className="font-normal text-[12px] sm:text-[14px] lg:text-[18px] leading-[15px] sm:leading-[17px] lg:leading-[22px] text-[#6D6D6D] text-center max-w-lg">
                  Select all that apply to help us recommend the best spaces
                </p>
              </div>

              {/* Purpose Options Grid */}
              <div className="w-full max-w-4xl lg:max-w-none">
                {/* Mobile: Single column, Tablet: 2 columns, Desktop: 2 columns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 w-full">
                  {/* Remote Work */}
                  <div
                    className={`w-full h-[84px] bg-white border border-[#D1D5DB] rounded-[12px] p-3 sm:p-4 cursor-pointer transition-all duration-200 hover:shadow-sm ${
                      selectedPurposes.includes("remote-work")
                        ? "ring-2 ring-[#002F5B] bg-blue-50"
                        : ""
                    }`}
                    onClick={() => togglePurpose("remote-work")}
                  >
                    <div className="flex flex-row items-center gap-3 sm:gap-4 w-full h-full">
                      <div className="w-[40px] h-[40px] bg-[#E1E1E1] rounded-[12px] flex items-center justify-center flex-shrink-0">
                        <Monitor className="w-5 h-5 sm:w-6 sm:h-6 text-[#121212]" />
                      </div>
                      <div className="flex flex-col justify-center items-start gap-0 flex-1 min-w-0">
                        <h3 className="font-semibold text-[14px] sm:text-[16px] lg:text-[20px] leading-[17px] sm:leading-[19px] lg:leading-[24px] text-[#002F5B] truncate w-full">
                          Remote Work
                        </h3>
                        <p className="font-normal text-[11px] sm:text-[12px] lg:text-[16px] leading-[13px] sm:leading-[15px] lg:leading-[19px] text-[#686767] truncate w-full">
                          Focus on daily work tasks
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Study Session */}
                  <div
                    className={`w-full h-[84px] bg-white border border-[#D1D5DB] rounded-[12px] p-3 sm:p-4 cursor-pointer transition-all duration-200 hover:shadow-sm ${
                      selectedPurposes.includes("study")
                        ? "ring-2 ring-[#002F5B] bg-blue-50"
                        : ""
                    }`}
                    onClick={() => togglePurpose("study")}
                  >
                    <div className="flex flex-row items-center gap-3 sm:gap-4 w-full h-full">
                      <div className="w-[40px] h-[40px] bg-[#E1E1E1] rounded-[12px] flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-[#121212]" />
                      </div>
                      <div className="flex flex-col justify-center items-start gap-0 flex-1 min-w-0">
                        <h3 className="font-semibold text-[14px] sm:text-[16px] lg:text-[20px] leading-[17px] sm:leading-[19px] lg:leading-[24px] text-[#002F5B] truncate w-full">
                          Study Session
                        </h3>
                        <p className="font-normal text-[11px] sm:text-[12px] lg:text-[16px] leading-[13px] sm:leading-[15px] lg:leading-[19px] text-[#686767] truncate w-full">
                          Quiet Place for reading
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Team meetings */}
                  <div
                    className={`w-full h-[84px] bg-white border border-[#D1D5DB] rounded-[12px] p-3 sm:p-4 cursor-pointer transition-all duration-200 hover:shadow-sm ${
                      selectedPurposes.includes("meetings")
                        ? "ring-2 ring-[#002F5B] bg-blue-50"
                        : ""
                    }`}
                    onClick={() => togglePurpose("meetings")}
                  >
                    <div className="flex flex-row items-center gap-3 sm:gap-4 w-full h-full">
                      <div className="w-[40px] h-[40px] bg-[#E1E1E1] rounded-[12px] flex items-center justify-center flex-shrink-0">
                        <Users className="w-5 h-5 sm:w-6 sm:h-6 text-[#121212]" />
                      </div>
                      <div className="flex flex-col justify-center items-start gap-0 flex-1 min-w-0">
                        <h3 className="font-semibold text-[14px] sm:text-[16px] lg:text-[20px] leading-[17px] sm:leading-[19px] lg:leading-[24px] text-[#002F5B] truncate w-full">
                          Team meetings
                        </h3>
                        <p className="font-normal text-[11px] sm:text-[12px] lg:text-[16px] leading-[13px] sm:leading-[15px] lg:leading-[19px] text-[#686767] truncate w-full">
                          Collaborate with colleagues
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Networking */}
                  <div
                    className={`w-full h-[84px] bg-white border border-[#D1D5DB] rounded-[12px] p-3 sm:p-4 cursor-pointer transition-all duration-200 hover:shadow-sm ${
                      selectedPurposes.includes("networking")
                        ? "ring-2 ring-[#002F5B] bg-blue-50"
                        : ""
                    }`}
                    onClick={() => togglePurpose("networking")}
                  >
                    <div className="flex flex-row items-center gap-3 sm:gap-4 w-full h-full">
                      <div className="w-[40px] h-[40px] bg-[#E1E1E1] rounded-[12px] flex items-center justify-center flex-shrink-0">
                        <Handshake className="w-5 h-5 sm:w-6 sm:h-6 text-[#121212]" />
                      </div>
                      <div className="flex flex-col justify-center items-start gap-0 flex-1 min-w-0">
                        <h3 className="font-semibold text-[14px] sm:text-[16px] lg:text-[20px] leading-[17px] sm:leading-[19px] lg:leading-[24px] text-[#002F5B] truncate w-full">
                          Networking
                        </h3>
                        <p className="font-normal text-[11px] sm:text-[12px] lg:text-[16px] leading-[13px] sm:leading-[15px] lg:leading-[19px] text-[#686767] truncate w-full">
                          Meet New Professionals
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Presentations */}
                  <div
                    className={`w-full h-[84px] bg-white border border-[#D1D5DB] rounded-[12px] p-3 sm:p-4 cursor-pointer transition-all duration-200 hover:shadow-sm ${
                      selectedPurposes.includes("presentations")
                        ? "ring-2 ring-[#002F5B] bg-blue-50"
                        : ""
                    }`}
                    onClick={() => togglePurpose("presentations")}
                  >
                    <div className="flex flex-row items-center gap-3 sm:gap-4 w-full h-full">
                      <div className="w-[40px] h-[40px] bg-[#E1E1E1] rounded-[12px] flex items-center justify-center flex-shrink-0">
                        <Presentation className="w-5 h-5 sm:w-6 sm:h-6 text-[#121212]" />
                      </div>
                      <div className="flex flex-col justify-center items-start gap-0 flex-1 min-w-0">
                        <h3 className="font-semibold text-[14px] sm:text-[16px] lg:text-[20px] leading-[17px] sm:leading-[19px] lg:leading-[24px] text-[#002F5B] truncate w-full">
                          Presentations
                        </h3>
                        <p className="font-normal text-[11px] sm:text-[12px] lg:text-[16px] leading-[13px] sm:leading-[15px] lg:leading-[19px] text-[#686767] truncate w-full">
                          Present to Client or Teams
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Creative Work */}
                  <div
                    className={`w-full h-[84px] bg-white border border-[#D1D5DB] rounded-[12px] p-3 sm:p-4 cursor-pointer transition-all duration-200 hover:shadow-sm ${
                      selectedPurposes.includes("creative")
                        ? "ring-2 ring-[#002F5B] bg-blue-50"
                        : ""
                    }`}
                    onClick={() => togglePurpose("creative")}
                  >
                    <div className="flex flex-row items-center gap-3 sm:gap-4 w-full h-full">
                      <div className="w-[40px] h-[40px] bg-[#E1E1E1] rounded-[12px] flex items-center justify-center flex-shrink-0">
                        <Layers className="w-5 h-5 sm:w-6 sm:h-6 text-[#121212]" />
                      </div>
                      <div className="flex flex-col justify-center items-start gap-0 flex-1 min-w-0">
                        <h3 className="font-semibold text-[14px] sm:text-[16px] lg:text-[20px] leading-[17px] sm:leading-[19px] lg:leading-[24px] text-[#002F5B] truncate w-full">
                          Creative Work
                        </h3>
                        <p className="font-normal text-[11px] sm:text-[12px] lg:text-[16px] leading-[13px] sm:leading-[15px] lg:leading-[19px] text-[#686767] truncate w-full">
                          Designs and other creative projects
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Location Selection */}
        {currentStep === 3 && (
          <div className="w-full h-[432px] sm:h-[596px] bg-white rounded-[8px] p-4 sm:p-6 lg:p-8">
            {/* Content Container */}
            <div className="flex flex-col items-center gap-8 sm:gap-10 lg:gap-12 w-full h-full">
              {/* Section Title */}
              <div className="flex flex-col items-center gap-2 sm:gap-3 w-full max-w-2xl">
                <h2 className="font-bold text-[18px] sm:text-[24px] lg:text-[32px] leading-[22px] sm:leading-[29px] lg:leading-[39px] text-[#002F5B] text-center">
                  Where are you based?
                </h2>
                <p className="font-normal text-[14px] sm:text-[16px] lg:text-[18px] leading-[17px] sm:leading-[19px] lg:leading-[22px] text-[#686767] text-center max-w-lg">
                  Tell us your primary city to show you relevant workspaces
                </p>
              </div>

              {/* Location Input and Popular Cities */}
              <div className="flex flex-col items-center gap-6 sm:gap-8 lg:gap-10 w-full max-w-2xl">
                {/* Location Input Field */}
                <div className="w-full h-[62px] sm:h-[84px] bg-white border border-[#ACABAB] sm:border-[#D1D5DB] rounded-[8px] p-3 sm:p-4 flex items-center gap-3 sm:gap-4">
                  <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-[#6D6D6D] flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Enter location or city"
                    className="flex-1 text-[14px] sm:text-[16px] lg:text-[20px] leading-[17px] sm:leading-[19px] lg:leading-[24px] text-[#6D6D6D] outline-none placeholder:text-[#6D6D6D]"
                    value={customLocation}
                    onChange={(e) => {
                      setCustomLocation(e.target.value);
                      setSelectedLocation(""); // Clear selected location when typing
                    }}
                  />
                </div>

                {/* Popular Cities Section */}
                <div className="flex flex-col items-center gap-3 sm:gap-4 w-full">
                  <h3 className="font-medium text-[14px] sm:text-[16px] lg:text-[18px] leading-[17px] sm:leading-[19px] lg:leading-[22px] text-[#686767] text-center">
                    Popular Cities:
                  </h3>

                  {/* Cities Grid */}
                  <div className="flex flex-col items-center gap-3 sm:gap-4 w-full">
                    {/* First Row */}
                    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 lg:gap-5 w-full">
                      {popularCities.slice(0, 4).map((city) => (
                        <button
                          key={city}
                          onClick={() => selectLocation(city)}
                          className={`px-3 sm:px-4 py-2 sm:py-3 rounded-[8px] transition-all duration-200 whitespace-nowrap ${
                            selectedLocation === city
                              ? "bg-[#002F5B] text-white"
                              : "bg-[#F1F1F1] text-[#002F5B] hover:bg-[#E1E1E1]"
                          }`}
                        >
                          <span className="font-normal text-[14px] sm:text-[16px] lg:text-[20px] leading-[17px] sm:leading-[19px] lg:leading-[24px]">
                            {city}
                          </span>
                        </button>
                      ))}
                    </div>

                    {/* Second Row */}
                    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 lg:gap-5 w-full">
                      {popularCities.slice(4).map((city) => (
                        <button
                          key={city}
                          onClick={() => selectLocation(city)}
                          className={`px-3 sm:px-4 py-2 sm:py-3 rounded-[8px] transition-all duration-200 whitespace-nowrap ${
                            selectedLocation === city
                              ? "bg-[#002F5B] text-white"
                              : "bg-[#F1F1F1] text-[#002F5B] hover:bg-[#E1E1E1]"
                          }`}
                        >
                          <span className="font-normal text-[14px] sm:text-[16px] lg:text-[20px] leading-[17px] sm:leading-[19px] lg:leading-[24px]">
                            {city}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Profile Picture Upload */}
        {currentStep === 4 && (
          <div className="w-full h-[443px] sm:h-[623px] bg-white rounded-[8px] p-8 sm:p-12 lg:p-16">
            {/* Content Container */}
            <div className="flex flex-col items-center gap-6 sm:gap-8 lg:gap-10 w-full h-full">
              {/* Main Content */}
              <div className="flex flex-col items-center gap-6 sm:gap-8 lg:gap-[33px] w-full max-w-md">
                {/* Section Title */}
                <div className="flex flex-col items-center gap-2 sm:gap-3 w-full">
                  <h2 className="font-bold text-[18px] sm:text-[24px] lg:text-[32px] leading-[22px] sm:leading-[29px] lg:leading-[39px] text-[#002F5B] text-center">
                    Add a profile picture
                  </h2>
                  <p className="font-normal text-[14px] sm:text-[16px] lg:text-[18px] leading-[17px] sm:leading-[19px] lg:leading-[22px] text-[#686767] text-center max-w-sm">
                    Help others recognise you (optional)
                  </p>
                </div>

                {/* Profile Picture Upload */}
                <div className="flex flex-col items-center gap-4 sm:gap-6 w-full">
                  {/* Profile Picture Placeholder */}
                  <div className="w-[95px] h-[95px] sm:w-[120px] sm:h-[120px] lg:w-[185px] lg:h-[185px] bg-[#EAEAEA] rounded-[100px] flex items-center justify-center overflow-hidden">
                    {profilePicture ? (
                      <Image
                        src={profilePicture}
                        alt="Profile"
                        width={185}
                        height={185}
                        className="w-full h-full rounded-[100px] object-cover"
                      />
                    ) : (
                      <Upload className="w-8 h-8 sm:w-12 sm:h-12 lg:w-20 lg:h-20 text-[#C4C7CB]" />
                    )}
                  </div>

                  {/* Choose Picture Button */}
                  <label className="w-[137px] h-[41px] sm:w-[152px] sm:h-[43px] bg-white border border-[#F25417] rounded-[12px] flex items-center justify-center cursor-pointer hover:bg-[#FFF3EE] transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <span className="font-bold text-[14px] sm:text-[16px] leading-[17px] sm:leading-[19px] text-[#F25417]">
                      Choose Picture
                    </span>
                  </label>
                </div>
              </div>

              {/* Skip Instruction */}
              <div className="flex justify-center w-full max-w-sm">
                <p className="font-normal text-[12px] sm:text-[14px] lg:text-[18px] leading-[15px] sm:leading-[17px] lg:leading-[22px] text-[#686767] text-center">
                  You can skip this step and add a profile photo later in your
                  settings
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="w-full bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex flex-row items-center justify-between w-full h-[48px]">
          {/* Back Button */}
          <button
            onClick={handleBack}
            className="flex flex-row justify-center items-center gap-2.5 px-4 py-3 rounded-[12px] hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-[#121212]" />
            <span className="font-bold text-[16px] leading-[19px] text-[#121212]">
              Back
            </span>
          </button>

          {/* Continue Button */}
          <button
            onClick={handleContinue}
            disabled={
              isSubmitting ||
              (currentStep === 1
                ? !selectedRole
                : currentStep === 2
                ? selectedPurposes.length === 0
                : currentStep === 3
                ? !selectedLocation && !customLocation
                : false)
            }
            className={`flex flex-row justify-center items-center gap-2.5 px-4 py-3 rounded-[8px] transition-colors w-[138px] ${
              (currentStep === 1
                ? selectedRole
                : currentStep === 2
                ? selectedPurposes.length > 0
                : currentStep === 3
                ? selectedLocation || customLocation
                : true) && !isSubmitting
                ? "bg-[#F25417] hover:bg-[#E04A15] text-white"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            <span className="font-bold text-[16px] leading-[19px]">
              {isSubmitting ? "Saving..." : "Continue"}
            </span>
            {!isSubmitting && <ArrowRight className="w-6 h-6" />}
          </button>
        </div>
      </div>
    </div>
  );
}
