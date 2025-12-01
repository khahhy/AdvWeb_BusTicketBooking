import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import dayjs, { Dayjs } from "dayjs";
import Navbar from "@/components/common/Navbar";
import backgroundImage from "@/assets/images/background.png";
import TripCard from "@/components/search/TripCard";
import FilterPanel, { FilterState } from "@/components/search/FilterPanel";
import Footer from "@/components/dashboard/Footer";
import { mockTrips } from "@/data/mockTrips";
import {
  useGetTripRouteMapQuery,
  useGetLocationsQuery,
} from "@/store/api/routesApi";
import { QueryTripRouteParams } from "@/store/type/tripRoutesType";
import TripSearchBar from "@/components/common/TripSearchBar";

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const [fromLocation, setFromLocation] = useState(
    () => searchParams.get("from") || "Ho Chi Minh City",
  );
  const [toLocation, setToLocation] = useState(
    () => searchParams.get("to") || "Mui Ne",
  );
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(() => {
    const dateParam = searchParams.get("departureDate");
    return dateParam ? dayjs(dateParam) : dayjs();
  });
  const [openTripId, setOpenTripId] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    departureTime: [],
    arrivalTime: [],
    priceRange: [0, 1328000],
    busType: [],
    amenities: [],
  });

  // Update locations and date when search params change
  useEffect(() => {
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const date = searchParams.get("departureDate");

    if (from) setFromLocation(from);
    if (to) setToLocation(to);
    if (date) setSelectedDate(dayjs(date));
  }, [searchParams]);

  // Convert frontend filters to API parameters
  const convertFiltersToApiParams = (
    filterState: FilterState,
  ): QueryTripRouteParams => {
    const params: QueryTripRouteParams = {
      page: 1,
      limit: 20,
    };

    // Add location filtering - find location ID from city name
    if (locationsResponse && (fromLocation || toLocation)) {
      const originLocation = locationsResponse.find(
        (loc) => loc.city === fromLocation || loc.name === fromLocation,
      );
      const destLocation = locationsResponse.find(
        (loc) => loc.city === toLocation || loc.name === toLocation,
      );

      // Use specific origin and destination location IDs for precise filtering
      if (originLocation) {
        params.originLocationId = originLocation.id;
      }
      if (destLocation) {
        params.destinationLocationId = destLocation.id;
      }
    }

    // Add departure date if selected
    if (selectedDate) {
      params.departureDate = selectedDate.format("YYYY-MM-DD");
    }

    // Convert time slots to time ranges
    if (filterState.departureTime.length > 0) {
      const timeRanges = filterState.departureTime
        .map((slot) => {
          switch (slot) {
            case "early-morning":
              return { start: "00:00", end: "06:00" };
            case "morning":
              return { start: "06:01", end: "12:00" };
            case "afternoon":
              return { start: "12:01", end: "18:00" };
            case "evening":
              return { start: "18:01", end: "23:59" };
            default:
              return null;
          }
        })
        .filter(Boolean);

      if (timeRanges.length > 0) {
        // Use the earliest start and latest end
        const starts = timeRanges.map((r) => r!.start);
        const ends = timeRanges.map((r) => r!.end);
        params.departureTimeStart = starts.sort()[0];
        params.departureTimeEnd = ends.sort().reverse()[0];
      }
    }

    // Add price range
    if (filterState.priceRange[0] > 0 || filterState.priceRange[1] < 1328000) {
      params.minPrice = filterState.priceRange[0];
      params.maxPrice = filterState.priceRange[1];
    }

    // Add bus types
    if (filterState.busType.length > 0) {
      params.busType = filterState.busType;
    }

    // Add amenities
    if (filterState.amenities.length > 0) {
      params.amenities = filterState.amenities;
    }

    return params;
  };

  // Get locations data for filtering
  const { data: locationsResponse = [] } = useGetLocationsQuery();

  // Get trip route maps with current filters
  const apiParams = convertFiltersToApiParams(filters);
  const {
    data: tripRouteData,
    isLoading,
    error,
  } = useGetTripRouteMapQuery(apiParams);

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const handleSearch = (params: {
    from: string;
    to: string;
    date: Dayjs | null;
  }) => {
    setFromLocation(params.from);
    setToLocation(params.to);
    setSelectedDate(params.date);
    console.log("Searching...", params);
  };

  const formatDate = () => {
    if (!selectedDate) return "Select date";
    return selectedDate.format("MMM DD, YYYY");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-50 dark:bg-black dark:bg-none">
      {/* Navbar */}
      <Navbar />

      {/* Search Section */}
      <div className="pt-56 pb-48 relative">
        {/* Background Image - only in light mode */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat dark:hidden"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />

        {/* Dark mode background */}
        <div className="absolute inset-0 bg-black hidden dark:block" />

        {/* Gradient fade overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-pink-50 to-transparent dark:from-black dark:to-transparent pointer-events-none"></div>

        {/* Optional overlay for better text readability */}
        {/* <div className="absolute inset-0 bg-black/20"></div> */}

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <h1 className="text-4xl font-bold text-black dark:text-white mb-2 text-center opacity-0 animate-[fadeInDown_0.7s_ease-out_0.2s_forwards]">
            Find Your Bus Journey
          </h1>
          <p className="text-center mb-8 text-black/80 dark:text-white/80 opacity-0 animate-[fadeInDown_0.7s_ease-out_0.4s_forwards]">
            Safe, Comfortable, and Affordable Bus Travel
          </p>

          {/* Search Bar */}
          <TripSearchBar
            initialFrom={fromLocation}
            initialTo={toLocation}
            initialDate={selectedDate}
            onSearch={handleSearch}
            showAnimation={true}
          />
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-7xl mx-auto px-6 py-12 pb-20 dark:bg-black dark:bg-none">
        {/* Header Section */}
        <div className="mb-8 flex gap-6">
          <div className="w-80 flex-shrink-0"></div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Available Trips
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  {fromLocation} → {toLocation} • {formatDate()}
                </p>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-300">
                {(() => {
                  if (isLoading) return "Loading...";

                  const hasApiData =
                    tripRouteData?.items && tripRouteData.items.length > 0;
                  const trips = hasApiData
                    ? tripRouteData.items
                    : error
                      ? mockTrips
                      : [];
                  return `${trips.length} trips found`;
                })()}
              </div>
            </div>
          </div>
        </div>

        {/* Filter and Trip Cards Layout */}
        <div className="flex gap-6">
          {/* Filter Panel - Left Side */}
          <div className="w-80 flex-shrink-0">
            <FilterPanel onFilterChange={handleFilterChange} />
          </div>

          {/* Trip Cards - Right Side */}
          <div className="flex-1 space-y-6">
            {isLoading && (
              <div className="flex justify-center items-center py-8">
                <div className="text-gray-600 dark:text-gray-400">
                  Loading trips...
                </div>
              </div>
            )}

            {error && (
              <div className="flex justify-center items-center py-8">
                <div className="text-red-600 dark:text-red-400">
                  Error loading trips. Using mock data.
                </div>
              </div>
            )}

            {/* Use API data primarily, fallback to mock data only when loading/error */}
            {(() => {
              if (isLoading) {
                return null; // Loading will be handled below
              }

              if (tripRouteData?.items && tripRouteData.items.length > 0) {
                // Convert TripRoute data to Trip format for TripCard component
                return tripRouteData.items.map((tripRoute) => ({
                  id: tripRoute.tripId,
                  departureTime: dayjs(tripRoute.trip.startTime).format(
                    "HH:mm",
                  ),
                  arrivalTime: dayjs(tripRoute.trip.endTime).format("HH:mm"),
                  duration:
                    dayjs(tripRoute.trip.endTime).diff(
                      dayjs(tripRoute.trip.startTime),
                      "hour",
                    ) + "h",
                  from: tripRoute.route.origin.city,
                  to: tripRoute.route.destination.city,
                  price: Number(tripRoute.price),
                  availableSeats: 20, // This would need to come from backend
                  totalSeats: 32, // Default total seats
                  busType: tripRoute.trip.bus.busType || "standard",
                  amenities: tripRoute.trip.bus.amenities || {},
                }));
              } else if (error) {
                // Only use mock data as fallback when there's an error
                console.warn("API error, falling back to mock data:", error);
                return mockTrips;
              } else {
                // No data available
                return [];
              }
            })()?.map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                isOpen={openTripId === trip.id}
                onToggle={(tripId) =>
                  setOpenTripId(openTripId === tripId ? null : tripId)
                }
              />
            ))}

            {/* No Results */}
            {(() => {
              if (isLoading) return false;

              const hasApiData =
                tripRouteData?.items && tripRouteData.items.length > 0;
              const trips = hasApiData
                ? tripRouteData.items
                : error
                  ? mockTrips
                  : [];
              return trips.length === 0;
            })() && (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🚌</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No trips found
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Try adjusting your search criteria
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
