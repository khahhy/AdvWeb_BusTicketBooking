import { useState } from "react";
import { ArrowLeftRight, Search } from "lucide-react";
import { Dayjs } from "dayjs";
import LocationAutocomplete from "@/components/search/LocationAutocomplete";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

interface TripSearchBarProps {
  initialFrom?: string;
  initialTo?: string;
  initialDate?: Dayjs | null;
  onSearch: (params: { from: string; to: string; date: Dayjs | null }) => void;
  showAnimation?: boolean;
}

export default function TripSearchBar({
  initialFrom = "",
  initialTo = "",
  initialDate = null,
  onSearch,
  showAnimation = false,
}: TripSearchBarProps) {
  const [fromLocation, setFromLocation] = useState(initialFrom);
  const [toLocation, setToLocation] = useState(initialTo);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(initialDate);

  const handleSwap = () => {
    const temp = fromLocation;
    setFromLocation(toLocation);
    setToLocation(temp);
  };

  const handleSearch = () => {
    onSearch({
      from: fromLocation,
      to: toLocation,
      date: selectedDate,
    });
  };

  const formatDate = () => {
    if (!selectedDate) return "Select date";
    return selectedDate.format("MMM DD, YYYY");
  };

  const containerClass = showAnimation
    ? "max-w-4xl mx-auto opacity-0 animate-[fadeInUp_0.8s_ease-out_0.6s_forwards]"
    : "max-w-4xl mx-auto";

  return (
    <div className={containerClass}>
      {/* Desktop Layout */}
      <div className="hidden md:flex items-center gap-4 bg-white dark:bg-black rounded-full shadow-2xl p-2 border border-gray-200 dark:border-gray-700">
        {/* From Field */}
        <LocationAutocomplete
          value={fromLocation}
          onChange={setFromLocation}
          label="From"
          placeholder="Enter departure city"
        />

        {/* Swap Button */}
        <button
          onClick={handleSwap}
          className="flex-shrink-0 p-3 bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors duration-200"
          type="button"
        >
          <ArrowLeftRight className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        </button>

        {/* To Field */}
        <LocationAutocomplete
          value={toLocation}
          onChange={setToLocation}
          label="To"
          placeholder="Enter destination city"
        />

        {/* Date Picker */}
        <Popover>
          <PopoverTrigger asChild>
            <div className="flex-1 px-6 py-4 cursor-pointer">
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Date
              </div>
              <div className="text-lg font-medium text-gray-900 dark:text-white">
                {formatDate()}
              </div>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="center">
            <Calendar
              value={selectedDate}
              onChange={setSelectedDate}
              disablePast
            />
          </PopoverContent>
        </Popover>

        {/* Search Button */}
        <button
          onClick={handleSearch}
          className="flex-shrink-0 bg-black dark:bg-white text-white dark:text-black p-4 rounded-full hover:bg-gray-800 dark:hover:bg-gray-200 transition-all duration-200 transform hover:scale-105"
        >
          <Search className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden bg-white dark:bg-black rounded-2xl shadow-2xl p-4 border border-gray-200 dark:border-gray-700">
        <div className="space-y-4">
          {/* From and To Fields with Swap */}
          <div className="space-y-3">
            <LocationAutocomplete
              value={fromLocation}
              onChange={setFromLocation}
              label="From"
              placeholder="Enter departure city"
            />

            <div className="flex justify-center">
              <button
                onClick={handleSwap}
                className="p-2 bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors duration-200"
                type="button"
              >
                <ArrowLeftRight className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              </button>
            </div>

            <LocationAutocomplete
              value={toLocation}
              onChange={setToLocation}
              label="To"
              placeholder="Enter destination city"
            />
          </div>

          {/* Date Picker */}
          <Popover>
            <PopoverTrigger asChild>
              <div className="w-full p-4 border border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Date
                </div>
                <div className="text-lg font-medium text-gray-900 dark:text-white">
                  {formatDate()}
                </div>
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="center">
              <Calendar
                value={selectedDate}
                onChange={setSelectedDate}
                disablePast
              />
            </PopoverContent>
          </Popover>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            className="w-full bg-black dark:bg-white text-white dark:text-black p-4 rounded-xl hover:bg-gray-800 dark:hover:bg-gray-200 transition-all duration-200 flex items-center justify-center gap-2 font-medium"
          >
            <Search className="w-5 h-5" />
            Search Buses
          </button>
        </div>
      </div>
    </div>
  );
}
