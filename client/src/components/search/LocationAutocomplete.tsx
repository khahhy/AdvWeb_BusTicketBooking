import { useState, useRef, useEffect } from "react";
import { MapPin, X } from "lucide-react";
import { useGetLocationsQuery } from "@/store/api/locationApi";

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
  disabled?: boolean;
}

export default function LocationAutocomplete({
  value,
  onChange,
  label,
  placeholder = "Enter location",
  disabled = false,
}: LocationAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get all locations from API
  const { data: locations = [], isLoading } = useGetLocationsQuery();

  // Filter locations based on search term
  const filteredLocations = locations.filter((location) => {
    const search = searchTerm.toLowerCase();
    return (
      location.city.toLowerCase().includes(search) ||
      location.name.toLowerCase().includes(search) ||
      (location.address && location.address.toLowerCase().includes(search))
    );
  });

  // Get unique suggestions (prioritize cities, then locations)
  const suggestions = Array.from(
    new Map(
      filteredLocations.map((loc) => [
        loc.city,
        { city: loc.city, name: loc.name, address: loc.address },
      ]),
    ).values(),
  );

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev,
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
          handleSelect(suggestions[highlightedIndex].city);
        }
        break;
      case "Escape":
        setIsOpen(false);
        break;
    }
  };

  const handleSelect = (selectedCity: string) => {
    onChange(selectedCity);
    setSearchTerm("");
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    onChange(newValue);
    setIsOpen(true);
    setHighlightedIndex(-1);
  };

  const handleClear = () => {
    setSearchTerm("");
    onChange("");
    inputRef.current?.focus();
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  // Display value: show the actual value if not searching, otherwise show search term
  const displayValue = searchTerm || value;

  return (
    <div className="relative flex-1 px-4 sm:px-6 py-3 sm:py-4">
      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
        {label}
      </div>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={displayValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full text-base sm:text-lg font-medium border-0 focus:ring-0 bg-transparent p-0 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 outline-none"
          autoComplete="off"
        />
        {displayValue && !disabled && (
          <button
            onClick={handleClear}
            className="absolute right-0 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            type="button"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && !disabled && (
        <div
          ref={dropdownRef}
          className="absolute left-0 right-0 top-full mt-3 bg-white dark:bg-black rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 max-h-80 overflow-hidden z-50 opacity-0 animate-[fadeIn_0.2s_ease-out_forwards]"
        >
          <div className="overflow-y-auto max-h-80 py-2">
            {isLoading ? (
              <div className="px-5 py-4 text-base text-gray-500 dark:text-gray-400">
                Loading locations...
              </div>
            ) : suggestions.length > 0 ? (
              suggestions.map((suggestion, index) => (
                <button
                  key={`${suggestion.city}-${index}`}
                  type="button"
                  onClick={() => handleSelect(suggestion.city)}
                  className={`w-full px-5 py-4 text-left hover:bg-pink-50 dark:hover:bg-gray-900 transition-all duration-200 flex items-start gap-4 ${
                    highlightedIndex === index
                      ? "bg-pink-50 dark:bg-gray-900"
                      : ""
                  }`}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  <MapPin className="w-5 h-5 text-pink-500 dark:text-pink-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-base font-semibold text-gray-900 dark:text-white truncate">
                      {suggestion.city}
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="px-5 py-4 text-base text-gray-500 dark:text-gray-400">
                No locations found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
