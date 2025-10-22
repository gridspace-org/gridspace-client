"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  ChevronDown, 
  Star, 
  MessageCircle,
  Medal,
  Wifi,
  Coffee,
  Wind,
  Zap,
  Printer,
  Car,
  ArrowLeft
} from "lucide-react";
import { spacesApi, Space } from "@/services/spacesApi";
import { bookingsApi, CreateBookingRequest } from "@/services/bookingsApi";
import LoadingSpinner from "../../../host-dashboard/components/LoadingSpinner";
import EmptyState from "../../../host-dashboard/components/EmptyState";
// import Map from "../../../components/Map";

interface BookingFormData {
  date: string;
  startTime: string;
  endTime: string;
  guests: number;
  pricingType: 'hourly' | 'daily';
}

export default function BookingPage() {
  const params = useParams();
  const router = useRouter();
  const spaceId = params.id as string;
  
  const [space, setSpace] = useState<Space | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingData, setBookingData] = useState<BookingFormData>({
    date: "",
    startTime: "09:00",
    endTime: "17:00",
    guests: 1,
    pricingType: 'daily'
  });

  // Fetch space details
  useEffect(() => {
    const fetchSpace = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await spacesApi.getSpaceById(spaceId);
        setSpace(response.data);
      } catch (err) {
        console.error('Error fetching space:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch space details');
      } finally {
        setLoading(false);
      }
    };

    if (spaceId) {
      fetchSpace();
    }
  }, [spaceId]);

  const handleBookingDataChange = (field: keyof BookingFormData, value: string | number) => {
    setBookingData(prev => ({ ...prev, [field]: value }));
  };

  const calculateTotal = () => {
    if (!space) return 0;
    const basePrice = space.pricePerHour;
    const serviceFee = Math.round(basePrice * 0.05); // 5% service fee
    return basePrice + serviceFee;
  };

  const handleBookNow = async () => {
    if (!space) return;
    
    // Validate form data
    if (!bookingData.date || !bookingData.startTime || !bookingData.endTime) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      // Create booking request
      const bookingRequest: CreateBookingRequest = {
        spaceId: space._id,
        startTime: new Date(`${bookingData.date}T${bookingData.startTime}:00.000Z`).toISOString(),
        endTime: new Date(`${bookingData.date}T${bookingData.endTime}:00.000Z`).toISOString(),
        guestCount: bookingData.guests,
        bookingType: bookingData.pricingType,
        specialRequests: ''
      };

      // Create booking
      const response = await bookingsApi.createBooking(bookingRequest);
      
      if (response.success) {
        alert('Booking created successfully! You will be redirected to your bookings.');
        router.push('/dashboard/bookings');
      } else {
        alert('Failed to create booking. Please try again.');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Failed to create booking. Please try again.');
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading space details..." />;
  }

  if (error || !space) {
    return (
      <div className="min-h-screen bg-[#F7F5F5] flex items-center justify-center">
        <EmptyState
          type="listings"
          title="Space not found"
          description="The space you're looking for doesn't exist or has been removed."
          actionText="Back to Search"
          onActionClick={() => router.push('/search')}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F5F5]">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-[#D8D8D9]">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-[#002F5B]" />
            </button>
            <h1 className="text-[#002F5B] text-xl font-semibold">Space Details</h1>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Space Images and Details */}
          <div className="space-y-6">
            {/* Image Gallery */}
            <div className="bg-white border border-[#D8D8D9] rounded-lg overflow-hidden">
              <div className="grid grid-cols-2 gap-1">
                {/* Main Image */}
                <div className="col-span-2 h-[325px] relative">
                  {space.images[0] ? (
                    <Image
                      src={space.images[0]}
                      alt={space.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500">No Image</span>
                    </div>
                  )}
                </div>
                
                {/* Thumbnail Images */}
                {space.images.slice(1, 5).map((image, index) => (
                  <div key={index} className="h-[157px] relative">
                    <Image
                      src={image}
                      alt={`${space.title} ${index + 2}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Host Information */}
            <div className="bg-white shadow-[0px_4px_4px_rgba(222,222,222,0.25)] rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-[70px] h-[70px] bg-gray-200 rounded-full flex items-center justify-center">
                    {space.hostId.profilePic ? (
                      <Image
                        src={space.hostId.profilePic}
                        alt={space.hostId.fullname}
                        width={70}
                        height={70}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl font-semibold text-gray-600">
                        {space.hostId.fullname.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-[#002F5B] text-base font-semibold">
                        {space.hostId.fullname}
                      </h3>
                      <div className="flex items-center gap-1 px-3 py-1 bg-[#F25417] rounded-full">
                        <Medal className="w-3.5 h-3.5 text-white" />
                        <span className="text-white text-xs">Host</span>
                      </div>
                    </div>
                    <p className="text-[#686767] text-xs">Responds within an hour</p>
                    <p className="text-[#686767] text-xs">Host since 2022</p>
                  </div>
                </div>
                <button className="flex items-center gap-2 px-4 py-3 border border-[#F25417] rounded-lg text-[#F25417] font-semibold hover:bg-[#F25417] hover:text-white transition-colors">
                  <MessageCircle className="w-6 h-6" />
                  Contact
                </button>
              </div>
            </div>

            {/* Space Title and Basic Info */}
            <div className="space-y-4">
              <h1 className="text-[#002F5B] text-2xl font-semibold">{space.title}</h1>
              
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-1">
                  <MapPin className="w-6 h-6 text-[#686767]" />
                  <span className="text-[#686767] text-base">{space.location} 1km</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-6 h-6 text-[#F25417]" fill="#F25417" />
                  <span className="text-[#686767] text-base">4.5 (120 reviews)</span>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-1">
                  <Users className="w-6 h-6 text-[#686767]" />
                  <span className="text-[#686767] text-base">Up to {space.capacity} people</span>
                </div>
                <div className="px-3 py-1 bg-[#F25417] rounded-full">
                  <span className="text-white text-xs">Shared Desk</span>
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div className="bg-white shadow-[0px_4px_4px_rgba(222,222,222,0.25)] rounded-lg p-6">
              <h2 className="text-[#002F5B] text-xl font-semibold mb-6">Amenities</h2>
              <div className="grid grid-cols-2 gap-4">
                {space.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border border-[#002F5B] rounded-xl">
                    <div className="w-6 h-6 flex items-center justify-center">
                      {amenity === 'WiFi' && <Wifi className="w-6 h-6 text-[#002F5B]" />}
                      {amenity === 'Coffee/Tea' && <Coffee className="w-6 h-6 text-[#002F5B]" />}
                      {amenity === 'Air Conditioning' && <Wind className="w-6 h-6 text-[#002F5B]" />}
                      {amenity === 'Power Backup' && <Zap className="w-6 h-6 text-[#002F5B]" />}
                      {amenity === 'Printer/Scanner' && <Printer className="w-6 h-6 text-[#002F5B]" />}
                      {amenity === 'Parking' && <Car className="w-6 h-6 text-[#002F5B]" />}
                    </div>
                    <span className="text-[#002F5B] text-base font-medium">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-white shadow-[0px_4px_4px_rgba(222,222,222,0.25)] rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-[#002F5B] text-xl font-semibold">Reviews</h2>
                <div className="flex items-center gap-1">
                  <Star className="w-6 h-6 text-[#F25417]" fill="#F25417" />
                  <span className="text-[#686767] text-base font-bold">4.5 (120 reviews)</span>
                </div>
              </div>

              <div className="space-y-6">
                {/* Sample Reviews */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-black">John Okafor</h4>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 text-[#F25417]" fill="#F25417" />
                          ))}
                        </div>
                        <span className="text-[#686767] text-sm">2 weeks ago</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-[#2E2E2E] text-sm">
                    Absolutely fantastic workspace! The location is perfect, the amenities are top-notch, 
                    and Adebayo was incredibly helpful throughout my stay. The high-speed internet and 
                    comfortable seating made it easy to be productive all day.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-black">Fatima Abdullahi</h4>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 text-[#F25417]" fill="#F25417" />
                          ))}
                        </div>
                        <span className="text-[#686767] text-sm">1 Month ago</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-[#2E2E2E] text-sm">
                    Great space for team meetings and collaborative work. The private rooms are well-equipped 
                    and the common areas have a great atmosphere. Highly recommend for anyone looking for a 
                    professional workspace in Lagos.
                  </p>
                </div>
              </div>
            </div>

            {/* About This Space */}
            <div className="bg-white shadow-[0px_4px_4px_rgba(222,222,222,0.25)] rounded-lg p-6">
              <h2 className="text-[#002F5B] text-2xl font-semibold mb-4">About this Space</h2>
              <p className="text-[#121212] text-lg leading-6">
                {space.description}
              </p>
            </div>

            {/* Map */}
            <div className="bg-white shadow-[0px_4px_4px_rgba(222,222,222,0.25)] rounded-lg p-6">
              <h2 className="text-[#002F5B] text-xl font-semibold mb-4">Location</h2>
              {/* <Map 
                location={space.location} 
                className="w-full h-[400px]"
              /> */}
            </div>
          </div>

          {/* Right Column - Booking Form */}
          <div className="lg:sticky lg:top-6 lg:h-fit">
            <div className="bg-white shadow-[0px_4px_4px_rgba(222,222,222,0.25)] rounded-lg p-6">
              {/* Pricing Toggle */}
              <div className="mb-6">
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => handleBookingDataChange('pricingType', 'hourly')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      bookingData.pricingType === 'hourly'
                        ? 'bg-[#E7E6E5] text-[#002F5B]'
                        : 'bg-[#E7E6E5] text-[#002F5B]'
                    }`}
                  >
                    Hourly
                  </button>
                  <button
                    onClick={() => handleBookingDataChange('pricingType', 'daily')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      bookingData.pricingType === 'daily'
                        ? 'bg-[#E7E6E5] text-[#002F5B]'
                        : 'bg-[#E7E6E5] text-[#002F5B]'
                    }`}
                  >
                    Daily
                  </button>
                </div>
                <div className="text-center">
                  <span className="text-[#002F5B] text-3xl font-semibold">
                    ₦{space.pricePerHour.toLocaleString()}/{bookingData.pricingType === 'hourly' ? 'hour' : 'day'}
                  </span>
                </div>
              </div>

              {/* Booking Form */}
              <div className="space-y-6">
                {/* Date */}
                <div>
                  <label className="block text-[#D1D5DB] text-lg font-semibold mb-2">Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-6 h-6 text-[#686767]" />
                    <input
                      type="date"
                      value={bookingData.date}
                      onChange={(e) => handleBookingDataChange('date', e.target.value)}
                      className="w-full pl-12 pr-12 py-3 border border-[#D1D5DB] rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-[#F25417]"
                    />
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 text-[#121212]" />
                  </div>
                </div>

                {/* Time */}
                <div>
                  <label className="block text-[#D1D5DB] text-lg font-semibold mb-3">Time</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[#D1D5DB] text-base mb-2">Start</label>
                      <div className="relative">
                        <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 text-[#686767]" />
                        <input
                          type="time"
                          value={bookingData.startTime}
                          onChange={(e) => handleBookingDataChange('startTime', e.target.value)}
                          className="w-full px-3 py-3 border border-[#D1D5DB] rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-[#F25417]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[#D1D5DB] text-base mb-2">End</label>
                      <div className="relative">
                        <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 text-[#686767]" />
                        <input
                          type="time"
                          value={bookingData.endTime}
                          onChange={(e) => handleBookingDataChange('endTime', e.target.value)}
                          className="w-full px-3 py-3 border border-[#D1D5DB] rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-[#F25417]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Guests */}
                <div>
                  <label className="block text-[#D1D5DB] text-lg font-semibold mb-2">Guests</label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-6 h-6 text-[#686767]" />
                    <select
                      value={bookingData.guests}
                      onChange={(e) => handleBookingDataChange('guests', parseInt(e.target.value))}
                      className="w-full pl-12 pr-12 py-3 border border-[#D1D5DB] rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-[#F25417] appearance-none"
                    >
                      {[...Array(space.capacity)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1} Guest{i + 1 > 1 ? 's' : ''}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 text-[#121212] pointer-events-none" />
                  </div>
                </div>

                {/* Pricing Breakdown */}
                <div className="border-t border-[#999797] pt-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-[#121212] text-sm">
                        Workspace Fee x 1 {bookingData.pricingType === 'hourly' ? 'hour' : 'day'}
                      </span>
                      <span className="text-[#121212] text-sm">₦{space.pricePerHour.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#121212] text-sm">Service Fee</span>
                      <span className="text-[#121212] text-sm">₦{Math.round(space.pricePerHour * 0.05).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-t border-[#999797] pt-2">
                      <span className="text-[#002F5B] text-xl font-semibold">Total</span>
                      <span className="text-[#002F5B] text-xl font-semibold">₦{calculateTotal().toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Book Button */}
                <button
                  onClick={handleBookNow}
                  className="cursor-not-allowed disabled:opacity-50 disabled:cursor-not-allowed w-full py-3 bg-[#F25417] text-white rounded-lg font-medium text-xl hover:bg-[#E0440F] transition-colors"
                  disabled={true}
                >
                  Book this space
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
