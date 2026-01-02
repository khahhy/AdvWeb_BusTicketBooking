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
  sortByTime: string;
  sortByPrice: string;
}

export default function FilterPanel({ onFilterChange }: FilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedDepartureTimes, setSelectedDepartureTimes] = useState<
    string[]
  >([]);
  const [selectedArrivalTimes, setSelectedArrivalTimes] = useState<string[]>(
    [],
  );
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500000]);
  const [selectedBusTypes, setSelectedBusTypes] = useState<BusType[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [sortByTime, setSortByTime] = useState<string>("departure-asc");
  const [sortByPrice, setSortByPrice] = useState<string>("price-asc");

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
    { label: "Standard", value: BusType.STANDARD },
    { label: "VIP", value: BusType.VIP },
    { label: "Sleeper", value: BusType.SLEEPER },
    { label: "Limousine", value: BusType.LIMOUSINE },
  ];

  const amenityOptions = [
    { label: "WiFi", value: "wifi" },
    { label: "Air Condition", value: "airCondition" },
    { label: "TV", value: "tv" },
    { label: "Toilet", value: "toilet" },
    { label: "Blanket", value: "blanket" },
    { label: "Snack", value: "snack" },
    { label: "Entertainment", value: "entertainment" },
    { label: "USB", value: "usb" },
    { label: "Reclining", value: "reclining" },
  ];

  const timeSortOptions = [
    { label: "Early to Late", value: "departure-asc" },
    { label: "Late to Early", value: "departure-desc" },
  ];

  const priceSortOptions = [
    { label: "Low to High", value: "price-asc" },
    { label: "High to Low", value: "price-desc" },
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
          sortByTime,
          sortByPrice,
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
          sortByTime,
          sortByPrice,
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
          sortByTime,
          sortByPrice,
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
          sortByTime,
          sortByPrice,
        });
      }
      return newAmenities;
    });
  };

  const handleTimeSortChange = (value: string) => {
    setSortByTime(value);
    if (onFilterChange) {
      onFilterChange({
        departureTime: selectedDepartureTimes,
        arrivalTime: selectedArrivalTimes,
        priceRange,
        busType: selectedBusTypes,
        amenities: selectedAmenities,
        sortByTime: value,
        sortByPrice,
      });
    }
  };

  const handlePriceSortChange = (value: string) => {
    setSortByPrice(value);
    if (onFilterChange) {
      onFilterChange({
        departureTime: selectedDepartureTimes,
        arrivalTime: selectedArrivalTimes,
        priceRange,
        busType: selectedBusTypes,
        amenities: selectedAmenities,
        sortByTime,
        sortByPrice: value,
      });
    }
  };

  const handleClearAll = () => {
    setSelectedDepartureTimes([]);
    setSelectedArrivalTimes([]);
    setPriceRange([0, 500000]);
    setSelectedBusTypes([]);
    setSelectedAmenities([]);
    setSortByTime("departure-asc");
    setSortByPrice("price-asc");

    if (onFilterChange) {
      onFilterChange({
        departureTime: [],
        arrivalTime: [],
        priceRange: [0, 500000],
        busType: [],
        amenities: [],
        sortByTime: "departure-asc",
        sortByPrice: "price-asc",
      });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price) + "đ";
  };

  const getTimeSlotLabel = (value: string) => {
    const slots = [...departureTimeSlots, ...arrivalTimeSlots];
    return slots.find((slot) => slot.value === value)?.label || value;
  };

  const getBusTypeLabel = (value: BusType) => {
    return busTypes.find((type) => type.value === value)?.label || value;
  };

  const getAmenityLabel = (value: string) => {
    return (
      amenityOptions.find((amenity) => amenity.value === value)?.label || value
    );
  };

  const hasActiveFilters =
    selectedDepartureTimes.length > 0 ||
    selectedArrivalTimes.length > 0 ||
    selectedBusTypes.length > 0 ||
    selectedAmenities.length > 0 ||
    priceRange[0] > 0 ||
    priceRange[1] < 500000;

  const removeFilter = (type: string, value: string) => {
    switch (type) {
      case "departure":
        handleDepartureTimeToggle(value);
        break;
      case "arrival":
        handleArrivalTimeToggle(value);
        break;
      case "busType":
        handleBusTypeToggle(value as BusType);
        break;
      case "amenity":
        handleAmenityToggle(value);
        break;
      case "price": {
        const newRange: [number, number] = [0, 500000];
        setPriceRange(newRange);
        if (onFilterChange) {
          onFilterChange({
            departureTime: selectedDepartureTimes,
            arrivalTime: selectedArrivalTimes,
            priceRange: newRange,
            busType: selectedBusTypes,
            amenities: selectedAmenities,
            sortByTime,
            sortByPrice,
          });
        }
        break;
      }
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg mb-6 overflow-hidden">
      {/* Collapsed View - Filter Tags */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <svg
              className="w-6 h-6 text-gray-600 dark:text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Filters
            </h3>
            <svg
              className={`w-5 h-5 text-gray-600 dark:text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {hasActiveFilters && (
            <button
              onClick={handleClearAll}
              className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 font-medium text-sm transition-colors"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Active Filter Tags */}
        {!isExpanded && hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mt-4">
            {selectedDepartureTimes.map((time) => (
              <div
                key={`dep-${time}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-pink-50 dark:bg-pink-900/30 border border-pink-200 dark:border-pink-700 rounded-lg text-xs font-medium text-pink-700 dark:text-pink-300"
              >
                <span>Departure: {getTimeSlotLabel(time)}</span>
                <button
                  onClick={() => removeFilter("departure", time)}
                  className="hover:bg-pink-200 dark:hover:bg-pink-800 rounded-full p-0.5"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}

            {selectedArrivalTimes.map((time) => (
              <div
                key={`arr-${time}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-pink-50 dark:bg-pink-900/30 border border-pink-200 dark:border-pink-700 rounded-lg text-xs font-medium text-pink-700 dark:text-pink-300"
              >
                <span>Arrival: {getTimeSlotLabel(time)}</span>
                <button
                  onClick={() => removeFilter("arrival", time)}
                  className="hover:bg-pink-200 dark:hover:bg-pink-800 rounded-full p-0.5"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}

            {selectedBusTypes.map((type) => (
              <div
                key={`bus-${type}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-pink-50 dark:bg-pink-900/30 border border-pink-200 dark:border-pink-700 rounded-lg text-xs font-medium text-pink-700 dark:text-pink-300"
              >
                <span>{getBusTypeLabel(type)}</span>
                <button
                  onClick={() => removeFilter("busType", type)}
                  className="hover:bg-pink-200 dark:hover:bg-pink-800 rounded-full p-0.5"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}

            {selectedAmenities.map((amenity) => (
              <div
                key={`amenity-${amenity}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-pink-50 dark:bg-pink-900/30 border border-pink-200 dark:border-pink-700 rounded-lg text-xs font-medium text-pink-700 dark:text-pink-300"
              >
                <span>{getAmenityLabel(amenity)}</span>
                <button
                  onClick={() => removeFilter("amenity", amenity)}
                  className="hover:bg-pink-200 dark:hover:bg-pink-800 rounded-full p-0.5"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}

            {(priceRange[0] > 0 || priceRange[1] < 500000) && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-pink-50 dark:bg-pink-900/30 border border-pink-200 dark:border-pink-700 rounded-lg text-xs font-medium text-pink-700 dark:text-pink-300">
                <span>
                  Price: {formatPrice(priceRange[0])} -{" "}
                  {formatPrice(priceRange[1])}
                </span>
                <button
                  onClick={() => removeFilter("price", "")}
                  className="hover:bg-pink-200 dark:hover:bg-pink-800 rounded-full p-0.5"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Expanded View - All Filters */}
      {isExpanded && (
        <div className="px-6 pb-6 border-t border-gray-200 dark:border-gray-700 pt-6">
          <div className="flex flex-wrap gap-4">
            {/* Departure Time */}
            <div className="flex-1 min-w-[200px]">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Departure Time
              </h4>
              <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg">
                {/* Selected Tags */}
                {selectedDepartureTimes.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 p-2 border-b border-gray-200 dark:border-gray-700">
                    {selectedDepartureTimes.map((time) => (
                      <span
                        key={time}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 rounded text-xs font-medium"
                      >
                        {getTimeSlotLabel(time)}
                      </span>
                    ))}
                  </div>
                )}
                {/* Options List */}
                <div className="max-h-48 overflow-y-auto">
                  {departureTimeSlots.map((slot) => (
                    <button
                      key={slot.value}
                      onClick={() => handleDepartureTimeToggle(slot.value)}
                      className={`w-full flex items-center justify-between px-4 py-3 hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-colors ${
                        selectedDepartureTimes.includes(slot.value)
                          ? "bg-pink-50 dark:bg-pink-900/30"
                          : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                            selectedDepartureTimes.includes(slot.value)
                              ? "bg-pink-400 border-pink-400 dark:bg-pink-400 dark:border-pink-400"
                              : "border-gray-300 dark:border-gray-600"
                          }`}
                        >
                          {selectedDepartureTimes.includes(slot.value) && (
                            <svg
                              className="w-3 h-3 text-white"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </div>
                        <div className="flex flex-col items-start">
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {slot.label}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {slot.time}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Arrival Time */}
            <div className="flex-1 min-w-[200px]">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
                Arrival Time
              </h4>
              <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg">
                {/* Selected Tags */}
                {selectedArrivalTimes.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 p-2 border-b border-gray-200 dark:border-gray-700">
                    {selectedArrivalTimes.map((time) => (
                      <span
                        key={time}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 rounded text-xs font-medium"
                      >
                        {getTimeSlotLabel(time)}
                      </span>
                    ))}
                  </div>
                )}
                {/* Options List */}
                <div className="max-h-48 overflow-y-auto">
                  {arrivalTimeSlots.map((slot) => (
                    <button
                      key={slot.value}
                      onClick={() => handleArrivalTimeToggle(slot.value)}
                      className={`w-full flex items-center justify-between px-4 py-3 hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-colors ${
                        selectedArrivalTimes.includes(slot.value)
                          ? "bg-pink-50 dark:bg-pink-900/30"
                          : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                            selectedArrivalTimes.includes(slot.value)
                              ? "bg-pink-400 border-pink-400 dark:bg-pink-400 dark:border-pink-400"
                              : "border-gray-300 dark:border-gray-600"
                          }`}
                        >
                          {selectedArrivalTimes.includes(slot.value) && (
                            <svg
                              className="w-3 h-3 text-white"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </div>
                        <div className="flex flex-col items-start">
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {slot.label}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {slot.time}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Bus Type */}
            <div className="flex-1 min-w-[200px]">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                  />
                </svg>
                Bus Type
              </h4>
              <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg">
                {/* Selected Tags */}
                {selectedBusTypes.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 p-2 border-b border-gray-200 dark:border-gray-700">
                    {selectedBusTypes.map((type) => (
                      <span
                        key={type}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 rounded text-xs font-medium"
                      >
                        {getBusTypeLabel(type)}
                      </span>
                    ))}
                  </div>
                )}
                {/* Options List */}
                <div className="max-h-48 overflow-y-auto">
                  {busTypes.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => handleBusTypeToggle(type.value)}
                      className={`w-full flex items-center justify-between px-4 py-3 hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-colors ${
                        selectedBusTypes.includes(type.value)
                          ? "bg-pink-50 dark:bg-pink-900/30"
                          : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                            selectedBusTypes.includes(type.value)
                              ? "bg-pink-400 border-pink-400 dark:bg-pink-400 dark:border-pink-400"
                              : "border-gray-300 dark:border-gray-600"
                          }`}
                        >
                          {selectedBusTypes.includes(type.value) && (
                            <svg
                              className="w-3 h-3 text-white"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {type.label}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div className="flex-1 min-w-[200px]">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Amenities
              </h4>
              <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg">
                {/* Selected Tags */}
                {selectedAmenities.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 p-2 border-b border-gray-200 dark:border-gray-700">
                    {selectedAmenities.map((amenity) => (
                      <span
                        key={amenity}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 rounded text-xs font-medium"
                      >
                        {getAmenityLabel(amenity)}
                      </span>
                    ))}
                  </div>
                )}
                {/* Options List */}
                <div className="max-h-48 overflow-y-auto">
                  {amenityOptions.map((amenity) => (
                    <button
                      key={amenity.value}
                      onClick={() => handleAmenityToggle(amenity.value)}
                      className={`w-full flex items-center justify-between px-4 py-3 hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-colors ${
                        selectedAmenities.includes(amenity.value)
                          ? "bg-pink-50 dark:bg-pink-900/30"
                          : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                            selectedAmenities.includes(amenity.value)
                              ? "bg-pink-400 border-pink-400 dark:bg-pink-400 dark:border-pink-400"
                              : "border-gray-300 dark:border-gray-600"
                          }`}
                        >
                          {selectedAmenities.includes(amenity.value) && (
                            <svg
                              className="w-3 h-3 text-white"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {amenity.label}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Price Range */}
            <div className="flex-1 min-w-[200px]">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Price Range
              </h4>
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-3 text-sm font-semibold">
                  <span className="bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 px-4 py-2 rounded-lg border-2 border-pink-200 dark:border-pink-700">
                    {formatPrice(priceRange[0])}
                  </span>
                  <span className="text-gray-400">→</span>
                  <span className="bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 px-4 py-2 rounded-lg border-2 border-pink-200 dark:border-pink-700">
                    {formatPrice(priceRange[1])}
                  </span>
                </div>

                {/* Dual Range Slider */}
                <div className="relative pt-2 pb-6">
                  {/* Slider Track */}
                  <div className="absolute w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg top-2"></div>

                  {/* Active Track */}
                  <div
                    className="absolute h-2 bg-pink-400 dark:bg-pink-400 rounded-lg top-2"
                    style={{
                      left: `${(priceRange[0] / 500000) * 100}%`,
                      right: `${100 - (priceRange[1] / 500000) * 100}%`,
                    }}
                  ></div>

                  {/* Min Range Input */}
                  <input
                    type="range"
                    min="0"
                    max="500000"
                    step="10000"
                    value={priceRange[0]}
                    onChange={(e) => {
                      const newMin = parseInt(e.target.value);
                      if (newMin < priceRange[1]) {
                        const newRange: [number, number] = [
                          newMin,
                          priceRange[1],
                        ];
                        setPriceRange(newRange);
                        if (onFilterChange) {
                          onFilterChange({
                            departureTime: selectedDepartureTimes,
                            arrivalTime: selectedArrivalTimes,
                            priceRange: newRange,
                            busType: selectedBusTypes,
                            amenities: selectedAmenities,
                            sortByTime,
                            sortByPrice,
                          });
                        }
                      }
                    }}
                    className="absolute w-full h-2 bg-transparent rounded-lg appearance-none cursor-pointer pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-pink-400 dark:[&::-webkit-slider-thumb]:bg-pink-400 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-pink-400 dark:[&::-moz-range-thumb]:bg-pink-400 [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:shadow-lg"
                  />

                  {/* Max Range Input */}
                  <input
                    type="range"
                    min="0"
                    max="500000"
                    step="10000"
                    value={priceRange[1]}
                    onChange={(e) => {
                      const newMax = parseInt(e.target.value);
                      if (newMax > priceRange[0]) {
                        const newRange: [number, number] = [
                          priceRange[0],
                          newMax,
                        ];
                        setPriceRange(newRange);
                        if (onFilterChange) {
                          onFilterChange({
                            departureTime: selectedDepartureTimes,
                            arrivalTime: selectedArrivalTimes,
                            priceRange: newRange,
                            busType: selectedBusTypes,
                            amenities: selectedAmenities,
                            sortByTime,
                            sortByPrice,
                          });
                        }
                      }
                    }}
                    className="absolute w-full h-2 bg-transparent rounded-lg appearance-none cursor-pointer pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-pink-400 dark:[&::-webkit-slider-thumb]:bg-pink-400 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-pink-400 dark:[&::-moz-range-thumb]:bg-pink-400 [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:shadow-lg"
                  />
                </div>
              </div>
            </div>

            {/* Sort by Time */}
            <div className="flex-1 min-w-[200px]">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Sort by Time
              </h4>
              <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg">
                {/* Selected Sort */}
                <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 rounded text-xs font-medium">
                    {
                      timeSortOptions.find((opt) => opt.value === sortByTime)
                        ?.label
                    }
                  </span>
                </div>
                {/* Options List */}
                <div className="max-h-48 overflow-y-auto">
                  {timeSortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleTimeSortChange(option.value)}
                      className={`w-full flex items-center justify-between px-4 py-3 hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-colors ${
                        sortByTime === option.value
                          ? "bg-pink-50 dark:bg-pink-900/30"
                          : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            sortByTime === option.value
                              ? "bg-pink-400 border-pink-400 dark:bg-pink-400 dark:border-pink-400"
                              : "border-gray-300 dark:border-gray-600"
                          }`}
                        >
                          {sortByTime === option.value && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {option.label}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Sort by Price */}
            <div className="flex-1 min-w-[200px]">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Sort by Price
              </h4>
              <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg">
                {/* Selected Sort */}
                <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 rounded text-xs font-medium">
                    {
                      priceSortOptions.find((opt) => opt.value === sortByPrice)
                        ?.label
                    }
                  </span>
                </div>
                {/* Options List */}
                <div className="max-h-48 overflow-y-auto">
                  {priceSortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handlePriceSortChange(option.value)}
                      className={`w-full flex items-center justify-between px-4 py-3 hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-colors ${
                        sortByPrice === option.value
                          ? "bg-pink-50 dark:bg-pink-900/30"
                          : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            sortByPrice === option.value
                              ? "bg-pink-400 border-pink-400 dark:bg-pink-400 dark:border-pink-400"
                              : "border-gray-300 dark:border-gray-600"
                          }`}
                        >
                          {sortByPrice === option.value && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {option.label}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
