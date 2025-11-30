import { useState } from "react";
import { BusType } from "@/store/type/busType";

interface FilterPanelProps {
  onFilterChange?: (filters: FilterState) => void;
}

export interface FilterState {
  departureTime: string[];
  arrivalTime: string[];
  priceRange: [number, number];
  busType: BusType[];
  amenities: string[];
}

export default function FilterPanel({ onFilterChange }: FilterPanelProps) {
  const [selectedDepartureTimes, setSelectedDepartureTimes] = useState<
    string[]
  >([]);
  const [selectedArrivalTimes, setSelectedArrivalTimes] = useState<string[]>(
    [],
  );
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1328000]);
  const [selectedBusTypes, setSelectedBusTypes] = useState<BusType[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  const departureTimeSlots = [
    { label: "Early Morning", time: "00:00 - 06:00", value: "early-morning" },
    { label: "Morning", time: "06:01 - 12:00", value: "morning" },
    { label: "Afternoon", time: "12:01 - 18:00", value: "afternoon" },
    { label: "Evening", time: "18:01 - 23:59", value: "evening" },
  ];

  const arrivalTimeSlots = [
    { label: "Early Morning", time: "00:00 - 06:00", value: "early-morning" },
    { label: "Morning", time: "06:01 - 12:00", value: "morning" },
    { label: "Afternoon", time: "12:01 - 18:00", value: "afternoon" },
    { label: "Evening", time: "18:01 - 23:59", value: "evening" },
  ];

  const busTypes = [
    { label: "Standard", value: BusType.STANDARD, icon: "🚌" },
    { label: "VIP", value: BusType.VIP, icon: "✨" },
    { label: "Sleeper", value: BusType.SLEEPER, icon: "🛏️" },
    { label: "Limousine", value: BusType.LIMOUSINE, icon: "🚐" },
  ];

  const amenityOptions = [
    { label: "WiFi", value: "wifi", icon: "📶" },
    { label: "Air Condition", value: "airCondition", icon: "❄️" },
    { label: "TV", value: "tv", icon: "📺" },
    { label: "Toilet", value: "toilet", icon: "🚻" },
    { label: "Blanket", value: "blanket", icon: "🛏️" },
    { label: "Snack", value: "snack", icon: "🍪" },
    { label: "Entertainment", value: "entertainment", icon: "🎬" },
    { label: "USB", value: "usb", icon: "🔌" },
    { label: "Reclining", value: "reclining", icon: "🪑" },
  ];

  const handleDepartureTimeToggle = (value: string) => {
    setSelectedDepartureTimes((prev) => {
      const newTimes = prev.includes(value)
        ? prev.filter((t) => t !== value)
        : [...prev, value];

      if (onFilterChange) {
        onFilterChange({
          departureTime: newTimes,
          arrivalTime: selectedArrivalTimes,
          priceRange,
          busType: selectedBusTypes,
          amenities: selectedAmenities,
        });
      }
      return newTimes;
    });
  };

  const handleArrivalTimeToggle = (value: string) => {
    setSelectedArrivalTimes((prev) => {
      const newTimes = prev.includes(value)
        ? prev.filter((t) => t !== value)
        : [...prev, value];

      if (onFilterChange) {
        onFilterChange({
          departureTime: selectedDepartureTimes,
          arrivalTime: newTimes,
          priceRange,
          busType: selectedBusTypes,
          amenities: selectedAmenities,
        });
      }
      return newTimes;
    });
  };

  const handleBusTypeToggle = (value: BusType) => {
    setSelectedBusTypes((prev) => {
      const newTypes = prev.includes(value)
        ? prev.filter((t) => t !== value)
        : [...prev, value];

      if (onFilterChange) {
        onFilterChange({
          departureTime: selectedDepartureTimes,
          arrivalTime: selectedArrivalTimes,
          priceRange,
          busType: newTypes,
          amenities: selectedAmenities,
        });
      }
      return newTypes;
    });
  };

  const handleAmenityToggle = (value: string) => {
    setSelectedAmenities((prev) => {
      const newAmenities = prev.includes(value)
        ? prev.filter((a) => a !== value)
        : [...prev, value];

      if (onFilterChange) {
        onFilterChange({
          departureTime: selectedDepartureTimes,
          arrivalTime: selectedArrivalTimes,
          priceRange,
          busType: selectedBusTypes,
          amenities: newAmenities,
        });
      }
      return newAmenities;
    });
  };

  const handleClearAll = () => {
    setSelectedDepartureTimes([]);
    setSelectedArrivalTimes([]);
    setPriceRange([0, 1328000]);
    setSelectedBusTypes([]);
    setSelectedAmenities([]);

    if (onFilterChange) {
      onFilterChange({
        departureTime: [],
        arrivalTime: [],
        priceRange: [0, 1328000],
        busType: [],
        amenities: [],
      });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price) + "đ";
  };

  return (
    <div className="bg-white dark:bg-black rounded-2xl shadow-md p-6 sticky top-32 z-10">
      {/* Filter Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Filters</h3>
        <button
          onClick={handleClearAll}
          className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 font-medium text-sm"
        >
          Clear all
        </button>
      </div>

      {/* Departure Time */}
      <div className="mb-8">
        <h4 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-4">
          Departure time
        </h4>
        <div className="grid grid-cols-2 gap-3">
          {departureTimeSlots.map((slot) => (
            <button
              key={slot.value}
              onClick={() => handleDepartureTimeToggle(slot.value)}
              className={`p-3 rounded-2xl border-2 transition-all ${
                selectedDepartureTimes.includes(slot.value)
                  ? "border-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-500"
                  : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
              }`}
            >
              <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
                {slot.label}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{slot.time}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Arrival Time */}
      <div className="mb-8">
        <h4 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-4">Arrival time</h4>
        <div className="grid grid-cols-2 gap-3">
          {arrivalTimeSlots.map((slot) => (
            <button
              key={slot.value}
              onClick={() => handleArrivalTimeToggle(slot.value)}
              className={`p-3 rounded-2xl border-2 transition-all ${
                selectedArrivalTimes.includes(slot.value)
                  ? "border-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-500"
                  : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
              }`}
            >
              <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
                {slot.label}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{slot.time}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Bus Type */}
      <div className="mb-8">
        <h4 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-4">
          Bus Type
        </h4>
        <div className="grid grid-cols-2 gap-3">
          {busTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => handleBusTypeToggle(type.value)}
              className={`p-3 rounded-2xl border-2 transition-all ${
                selectedBusTypes.includes(type.value)
                  ? "border-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-500"
                  : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
              }`}
            >
              <div className="flex items-center justify-center mb-1">
                <span className="text-lg">{type.icon}</span>
              </div>
              <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
                {type.label}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Amenities */}
      <div className="mb-8">
        <h4 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-4">
          Amenities
        </h4>
        <div className="grid grid-cols-3 gap-2">
          {amenityOptions.map((amenity) => (
            <button
              key={amenity.value}
              onClick={() => handleAmenityToggle(amenity.value)}
              className={`p-2 rounded-xl border transition-all ${
                selectedAmenities.includes(amenity.value)
                  ? "border-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-500"
                  : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
              }`}
            >
              <div className="flex flex-col items-center">
                <span className="text-sm mb-1">{amenity.icon}</span>
                <span className="text-xs text-gray-900 dark:text-gray-100 font-medium">
                  {amenity.label}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h4 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-4">Price</h4>
        <div className="flex items-center justify-between text-sm text-gray-700 dark:text-gray-300 font-medium mb-3">
          <span>{formatPrice(priceRange[0])}</span>
          <span>-</span>
          <span>{formatPrice(priceRange[1])}</span>
        </div>

        {/* Dual Range Slider */}
        <div className="relative pt-2 pb-6">
          {/* Slider Track */}
          <div className="absolute w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg top-2"></div>

          {/* Active Track */}
          <div
            className="absolute h-2 bg-gray-800 dark:bg-blue-500 rounded-lg top-2"
            style={{
              left: `${(priceRange[0] / 1328000) * 100}%`,
              right: `${100 - (priceRange[1] / 1328000) * 100}%`,
            }}
          ></div>

          {/* Min Range Input */}
          <input
            type="range"
            min="0"
            max="1328000"
            step="10000"
            value={priceRange[0]}
            onChange={(e) => {
              const newMin = parseInt(e.target.value);
              if (newMin < priceRange[1]) {
                const newRange: [number, number] = [newMin, priceRange[1]];
                setPriceRange(newRange);
                if (onFilterChange) {
                  onFilterChange({
                    departureTime: selectedDepartureTimes,
                    arrivalTime: selectedArrivalTimes,
                    priceRange: newRange,
                    busType: selectedBusTypes,
                    amenities: selectedAmenities,
                  });
                }
              }
            }}
            className="absolute w-full h-2 bg-transparent rounded-lg appearance-none cursor-pointer pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gray-800 dark:[&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-gray-800 dark:[&::-webkit-slider-thumb]:border-blue-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-gray-800 dark:[&::-moz-range-thumb]:bg-blue-500 [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-gray-800 dark:[&::-moz-range-thumb]:border-blue-500 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:shadow-md"
          />

          {/* Max Range Input */}
          <input
            type="range"
            min="0"
            max="1328000"
            step="10000"
            value={priceRange[1]}
            onChange={(e) => {
              const newMax = parseInt(e.target.value);
              if (newMax > priceRange[0]) {
                const newRange: [number, number] = [priceRange[0], newMax];
                setPriceRange(newRange);
                if (onFilterChange) {
                  onFilterChange({
                    departureTime: selectedDepartureTimes,
                    arrivalTime: selectedArrivalTimes,
                    priceRange: newRange,
                    busType: selectedBusTypes,
                    amenities: selectedAmenities,
                  });
                }
              }
            }}
            className="absolute w-full h-2 bg-transparent rounded-lg appearance-none cursor-pointer pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gray-800 dark:[&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-gray-800 dark:[&::-webkit-slider-thumb]:border-blue-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-gray-800 dark:[&::-moz-range-thumb]:bg-blue-500 [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-gray-800 dark:[&::-moz-range-thumb]:border-blue-500 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:shadow-md"
          />
        </div>
      </div>
    </div>
  );
}
