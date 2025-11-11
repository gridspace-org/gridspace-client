"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  ChevronDown, 
  Star, 
  DollarSign,
  Map,
  Grid3X3,
  List,
  SlidersHorizontal,
  X
} from "lucide-react";
import { spacesApi, Space } from "@/services/spacesApi";
import LoadingSpinner from "../host-dashboard/components/LoadingSpinner";
import EmptyState from "../host-dashboard/components/EmptyState";

interface SearchFilters {
  location: string;
  date: string;
  time: string;
  guests: string;
  priceMin: number;
  priceMax: number;
  spaceTypes: string[];
  amenities: string[];
  distance: string[];
  ratings: number[];
}

export default function SearchPage() {
  const router = useRouter();
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    location: "",
    date: "",
    time: "",
    guests: "",
    priceMin: 1000,
    priceMax: 15000,
    spaceTypes: [],
    amenities: [],
    distance: [],
    ratings: []
  });

  // Parse URL search params on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const location = searchParams.get('location');
      const date = searchParams.get('date');
      
      if (location || date) {
        setFilters(prev => ({
          ...prev,
          ...(location && { location }),
          ...(date && { date })
        }));
      }
    }
  }, []);

  // Fetch spaces on component mount or when filters change
  useEffect(() => {
    const fetchSpaces = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await spacesApi.getSpaces({
          location: filters.location.trim().length >= 2 ? filters.location.trim() : undefined,
          priceMin: filters.priceMin,
          priceMax: filters.priceMax,
          capacity: filters.guests ? parseInt(filters.guests) : undefined,
          purposes: filters.spaceTypes.length > 0 ? filters.spaceTypes : undefined,
          amenities: filters.amenities.length > 0 ? filters.amenities : undefined,
          limit: 12
        });
        setSpaces(response.data.spaces);
      } catch (err) {
        console.error('Error fetching spaces:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch spaces');
      } finally {
        setLoading(false);
      }
    };

    fetchSpaces();
  }, [filters.location, filters.priceMin, filters.priceMax, filters.guests, filters.spaceTypes, filters.amenities]);

  const handleFilterChange = (key: keyof SearchFilters, value: string | number | string[] | number[]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    // Trigger search by updating filters which will trigger useEffect
    setFilters(prev => ({ ...prev }));
  };

  const clearFilters = () => {
    setFilters({
      location: "",
      date: "",
      time: "",
      guests: "",
      priceMin: 1000,
      priceMax: 15000,
      spaceTypes: [],
      amenities: [],
      distance: [],
      ratings: []
    });
  };

  const spaceTypes = [
    'Remote Work', 'Study Session', 'Team Meetings', 
    'Networking', 'Presentations', 'Creative Work',
    'Interview', 'Training', 'Client Meeting'
  ];

  const amenities = [
    { name: "WiFi", icon: "wifi" },
    { name: "Projector", icon: "monitor" },
    { name: "Whiteboard", icon: "keyboard" },
    { name: "Air Conditioning", icon: "wind" },
    { name: "Power Backup", icon: "zap" },
    { name: "Parking", icon: "car" },
    { name: "Coffee/Tea", icon: "coffee" },
    { name: "Printer/Scanner", icon: "printer" },
    { name: "Conference Phone", icon: "phone" },
    { name: "Monitor", icon: "monitor" },
    { name: "Kitchen", icon: "building" },
    { name: "Restroom", icon: "bath" }
  ];

  const distanceOptions = [
    "Within 1km",
    "Within 5km", 
    "Within 10km",
    "10km+"
  ];

  const ratingOptions = [5, 4, 3, 2];

  return (
    <>
      {/* Search Form */}
      <div className="bg-white shadow-[0px_4px_4px_rgba(222,222,222,0.25)] rounded-lg mx-4 md:mx-8 mt-4 p-6">
        <div className="flex flex-col lg:flex-row lg:items-end gap-4">
          {/* Location */}
          <div className="w-full lg:w-[233px]">
            <label className="block text-[#002F5B] text-[14px] font-semibold mb-2 font-inter leading-[17px]">
              Location
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#A3A3A3]" />
              <input
                type="text"
                placeholder="Enter location or city"
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-[#002F5B] rounded-lg text-[14px] font-inter placeholder:text-[#A3A3A3] focus:outline-none focus:ring-2 focus:ring-[#F25417]"
              />
            </div>
          </div>

          {/* Date */}
          <div className="w-full lg:w-[230px]">
            <label className="block text-[#002F5B] text-[14px] font-semibold mb-2">
              Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#A3A3A3]" />
              <input
                type="text"
                placeholder="dd/mm/yy"
                value={filters.date}
                onChange={(e) => handleFilterChange('date', e.target.value)}
                className="w-full pl-12 pr-12 py-3 border border-[#002F5B] rounded-lg text-[14px] placeholder:text-[#A3A3A3] focus:outline-none focus:ring-2 focus:ring-[#F25417]"
              />
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#A3A3A3]" />
            </div>
          </div>

          {/* Time */}
          <div className="w-full lg:w-[226px]">
            <label className="block text-[#002F5B] text-[14px] font-semibold mb-2">
              Time
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#A3A3A3]" />
              <input
                type="text"
                placeholder="Time"
                value={filters.time}
                onChange={(e) => handleFilterChange('time', e.target.value)}
                className="w-full pl-12 pr-12 py-3 border border-[#002F5B] rounded-lg text-[14px] placeholder:text-[#A3A3A3] focus:outline-none focus:ring-2 focus:ring-[#F25417]"
              />
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#A3A3A3]" />
            </div>
          </div>

          {/* Guests */}
          <div className="w-full lg:w-[231px]">
            <label className="block text-[#002F5B] text-[14px] font-semibold mb-2">
              Guest
            </label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#A3A3A3]" />
              <input
                type="text"
                placeholder="Guests"
                value={filters.guests}
                onChange={(e) => handleFilterChange('guests', e.target.value)}
                className="w-full pl-12 pr-12 py-3 border border-[#002F5B] rounded-lg text-[14px] placeholder:text-[#A3A3A3] focus:outline-none focus:ring-2 focus:ring-[#F25417]"
              />
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#A3A3A3]" />
            </div>
          </div>

          {/* Search Button */}
          <button 
            onClick={handleSearch}
            className="w-full lg:w-[120px] h-[50px] bg-[#F25417] text-white rounded-lg font-bold text-base font-inter leading-[19px] hover:bg-[#E0440F] transition-colors"
          >
            Find a Space
          </button>
        </div>
      </div>

      {/* Results Header */}
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 mt-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[#002F5B] text-base md:text-[18px] font-semibold leading-[19px] font-inter">
            {spaces.length} Spaces Found
          </h2>
          
          {/* View Controls */}
          <div className="flex items-center gap-3">
            {/* Mobile Filter Button */}
            <button
              onClick={() => setIsFilterOpen(prev => !prev)}
              className="lg:hidden flex items-center gap-1 px-3 py-[7px] bg-[#E7E7E7] rounded-lg"
            >
              {isFilterOpen ? (
                <X className="w-5 h-5 text-[#121212]" />
              ) : (
                <SlidersHorizontal className="w-5 h-5 text-[#121212]" />
              )}
              <span className="text-[#121212] text-[14px] leading-[17px] font-medium font-inter">Filter</span>
            </button>

            {/* Grid/List Toggle */}
            <div className="hidden md:flex items-center bg-[#EBEBEB] rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-white' : 'hover:bg-gray-100'
                }`}
              >
                <Grid3X3 className="w-6 h-6 text-[#002F5B]" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-white' : 'hover:bg-gray-100'
                }`}
              >
                <List className="w-6 h-6 text-[#002F5B]" />
              </button>
            </div>
            
            {/* Map Button */}
            <button
              disabled
              className="hidden md:flex items-center gap-2 px-4 py-3 border border-[#D1D5DB] rounded-lg text-[#D1D5DB] font-semibold cursor-not-allowed opacity-60"
            >
              <Map className="w-6 h-6" />
              Map
            </button>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Mobile Filters Sidebar */}
          <div className={`${
            isFilterOpen ? 'fixed inset-0 z-40 bg-black/20 lg:hidden' : 'hidden'
          }`} onClick={() => setIsFilterOpen(false)}>
            <div 
              className="absolute right-0 h-full w-[295px] overflow-y-auto bg-white"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-full bg-white shadow-[0px_4px_4px_rgba(222,222,222,0.25)] p-6 h-full">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-[#002F5B] text-[18px] font-semibold">Filter</h3>
                  <button
                    onClick={() => setIsFilterOpen(false)}
                    className="lg:hidden"
                  >
                    <X className="w-6 h-6 text-[#002F5B]" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Price Range */}
                  <div>
                    <h4 className="text-[#002F5B] text-[16px] font-semibold mb-3">Price Range</h4>
                    <div className="flex gap-5">
                      <div className="flex-1">
                        <label className="block text-[#002F5B] text-[16px] mb-2">From</label>
                        <input
                          type="number"
                          value={filters.priceMin}
                          onChange={(e) => handleFilterChange('priceMin', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-[#002F5B] rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#F25417]"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-[#002F5B] text-[16px] mb-2">To</label>
                        <input
                          type="number"
                          value={filters.priceMax}
                          onChange={(e) => handleFilterChange('priceMax', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-[#002F5B] rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#F25417]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Space Type */}
                  <div>
                    <h4 className="text-[#002F5B] text-[16px] font-semibold mb-3">Space Type</h4>
                    <div className="space-y-2">
                      {spaceTypes.map((type) => (
                        <label key={type} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.spaceTypes.includes(type)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                handleFilterChange('spaceTypes', [...filters.spaceTypes, type]);
                              } else {
                                handleFilterChange('spaceTypes', filters.spaceTypes.filter(t => t !== type));
                              }
                            }}
                            className="w-4 h-4 border border-[#002F5B] rounded"
                          />
                          <span className="text-[#121212] text-[14px]">{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Amenities */}
                  <div>
                    <h4 className="text-[#002F5B] text-[16px] font-semibold mb-3">Amenities</h4>
                    <div className="space-y-2">
                      {amenities.map((amenity) => (
                        <label key={amenity.name} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.amenities.includes(amenity.name)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                handleFilterChange('amenities', [...filters.amenities, amenity.name]);
                              } else {
                                handleFilterChange('amenities', filters.amenities.filter(a => a !== amenity.name));
                              }
                            }}
                            className="w-4 h-4 border border-[#002F5B] rounded"
                          />
                          <span className="text-[#121212] text-[14px]">{amenity.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Distance */}
                  <div>
                    <h4 className="text-[#002F5B] text-[16px] font-semibold mb-3">Distance</h4>
                    <div className="space-y-2">
                      {distanceOptions.map((distance) => (
                        <label key={distance} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.distance.includes(distance)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                handleFilterChange('distance', [...filters.distance, distance]);
                              } else {
                                handleFilterChange('distance', filters.distance.filter(d => d !== distance));
                              }
                            }}
                            className="w-4 h-4 border border-[#002F5B] rounded"
                          />
                          <span className="text-[#121212] text-[14px]">{distance}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Ratings */}
                  <div>
                    <h4 className="text-[#002F5B] text-[16px] font-semibold mb-3">Ratings</h4>
                    <div className="space-y-2">
                      {ratingOptions.map((rating) => (
                        <label key={rating} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.ratings.includes(rating)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                handleFilterChange('ratings', [...filters.ratings, rating]);
                              } else {
                                handleFilterChange('ratings', filters.ratings.filter(r => r !== rating));
                              }
                            }}
                            className="w-4 h-4 border border-[#002F5B] rounded"
                          />
                          <span className="text-[#121212] text-[14px]">{rating}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Clear Filters Button */}
                <button
                  onClick={clearFilters}
                  className="w-full mt-8 py-3 text-[#002F5B] text-[16px] font-medium border border-[#002F5B] rounded-lg hover:bg-[#002F5B] hover:text-white transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
          
          {/* Desktop Filters Sidebar */}
          <div className="hidden lg:block w-[295px] bg-white shadow-[0px_4px_4px_rgba(222,222,222,0.25)] rounded-lg p-6 h-fit">
            <div className="flex items-center justify-between mb-6 pb-2 border-b border-[#D8D8D9]">
              <h3 className="text-[#002F5B] text-[18px] font-semibold">Filter</h3>
              <button
                onClick={clearFilters}
                className="text-[#002F5B] text-[13px] hover:text-[#F25417] transition-colors"
              >
                Reset
              </button>
            </div>

            <div className="space-y-6">
              {/* Price Range */}
              <div>
                <h4 className="text-[#002F5B] text-[16px] font-semibold mb-3">Price Range</h4>
                <div className="flex gap-5">
                  <div className="flex-1">
                    <label className="block text-[#002F5B] text-[16px] mb-2">From</label>
                    <input
                      type="number"
                      value={filters.priceMin}
                      onChange={(e) => handleFilterChange('priceMin', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-[#002F5B] rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#F25417]"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[#002F5B] text-[16px] mb-2">To</label>
                    <input
                      type="number"
                      value={filters.priceMax}
                      onChange={(e) => handleFilterChange('priceMax', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-[#002F5B] rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#F25417]"
                    />
                  </div>
                </div>
              </div>

              {/* Space Type */}
              <div>
                <h4 className="text-[#002F5B] text-[16px] font-semibold mb-3">Space Type</h4>
                <div className="space-y-2">
                  {spaceTypes.map((type) => (
                    <label key={type} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.spaceTypes.includes(type)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleFilterChange('spaceTypes', [...filters.spaceTypes, type]);
                          } else {
                            handleFilterChange('spaceTypes', filters.spaceTypes.filter(t => t !== type));
                          }
                        }}
                        className="w-4 h-4 border border-[#002F5B] rounded"
                      />
                      <span className="text-[#121212] text-[14px]">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Amenities */}
              <div>
                <h4 className="text-[#002F5B] text-[16px] font-semibold mb-3">Amenities</h4>
                <div className="space-y-2">
                  {amenities.map((amenity) => (
                    <label key={amenity.name} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.amenities.includes(amenity.name)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleFilterChange('amenities', [...filters.amenities, amenity.name]);
                          } else {
                            handleFilterChange('amenities', filters.amenities.filter(a => a !== amenity.name));
                          }
                        }}
                        className="w-4 h-4 border border-[#002F5B] rounded"
                      />
                      <span className="text-[#121212] text-[14px]">{amenity.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Distance */}
              <div>
                <h4 className="text-[#002F5B] text-[16px] font-semibold mb-3">Distance</h4>
                <div className="space-y-2">
                  {distanceOptions.map((distance) => (
                    <label key={distance} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.distance.includes(distance)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleFilterChange('distance', [...filters.distance, distance]);
                          } else {
                            handleFilterChange('distance', filters.distance.filter(d => d !== distance));
                          }
                        }}
                        className="w-4 h-4 border border-[#002F5B] rounded"
                      />
                      <span className="text-[#121212] text-[14px]">{distance}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Ratings */}
              <div>
                <h4 className="text-[#002F5B] text-[16px] font-semibold mb-3">Ratings</h4>
                <div className="space-y-2">
                  {ratingOptions.map((rating) => (
                    <label key={rating} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.ratings.includes(rating)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleFilterChange('ratings', [...filters.ratings, rating]);
                          } else {
                            handleFilterChange('ratings', filters.ratings.filter(r => r !== rating));
                          }
                        }}
                        className="w-4 h-4 border border-[#002F5B] rounded"
                      />
                      <span className="text-[#121212] text-[14px]">{rating}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Clear Filters Button */}
            <button
              onClick={clearFilters}
              className="w-full mt-8 py-3 text-[#002F5B] text-[16px] font-medium border border-[#002F5B] rounded-lg hover:bg-[#002F5B] hover:text-white transition-colors"
            >
              Clear Filters
            </button>
          </div>

          {/* Results */}
          <div className="flex-1">
            {loading ? (
              <LoadingSpinner text="Searching for spaces..." />
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-red-600 mb-4">Error: {error}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-[#F25417] text-white rounded-lg hover:bg-[#E0440F] transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : spaces.length === 0 ? (
              <EmptyState
                type="listings"
                title="No spaces found"
                description="Try adjusting your search criteria or filters to find more spaces."
                actionText="Clear Filters"
                onActionClick={clearFilters}
              />
            ) : (
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                {spaces.map((space) => (
                  <div key={space._id} className="bg-white border border-[#D8D8D9] rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                    {/* Image */}
                    <div className="w-full h-[168px] bg-gray-200 relative">
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

                    {/* Content */}
                    <div className="p-4 space-y-4">
                      {/* Title and Rating */}
                      <div className="flex items-center justify-between">
                        <h3 className="text-[#002F5B] text-[14px] font-semibold font-inter leading-[17px]">
                          {space.title}
                        </h3>
                        <div className="flex items-center gap-1">
                          <Star className="w-[18px] h-[18px] text-[#FFC849]" fill="#FFC849" />
                          <span className="text-[#121212] text-xs leading-[15px] font-inter tracking-[-0.25px]">4.5</span>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-[#666565] text-[11px] leading-[13px] font-inter">
                        {space.description}
                      </p>

                      {/* Location */}
                      <div className="flex items-center gap-1">
                        <MapPin className="w-[14px] h-[14px] text-[#121212]" />
                        <span className="text-[#121212] text-[11px] leading-[13px] font-inter">
                          {space.location}
                           {/* 1km */}
                        </span>
                      </div>

                      {/* Price */}
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-[14px] h-[14px] text-[#121212]" />
                        <span className="text-[#002F5B] text-[14px] leading-[17px] font-semibold font-inter">
                          ₦{space.pricePerHour.toLocaleString()}/hr
                        </span>
                      </div>

                      {/* Book Button */}
                      <button 
                        onClick={() => router.push(`/search/book/${space._id}`)}
                        className="w-full py-[13px] bg-[#F25417] text-white rounded-lg font-bold text-[14px] leading-[17px] font-inter hover:bg-[#E0440F] transition-colors"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
