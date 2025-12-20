import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import dayjs, { Dayjs } from "dayjs";
import Navbar from "@/components/common/Navbar";
import backgroundImage from "@/assets/images/background.png";
import TripCard from "@/components/search/TripCard";
import Footer from "@/components/dashboard/Footer";
import { mockTrips, Trip } from "@/data/mockTrips";
import { useGetTripRouteMapQuery } from "@/store/api/routesApi";
import { QueryTripRouteMapParams } from "@/store/type/tripRoutesType";
import TripSearchBar from "@/components/common/TripSearchBar";
import FilterPanel, { FilterState } from "@/components/search/FilterPanel";

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
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); // Number of trips per page
  const [filters, setFilters] = useState<FilterState>({
    departureTime: [],
    arrivalTime: [],
    priceRange: [0, 500000],
    busType: [],
    amenities: [],
    sortByTime: "departure-asc",
    sortByPrice: "price-asc",
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

  const routeNameQuery = `${fromLocation} - ${toLocation}`;

  const searchApiParams: QueryTripRouteMapParams = {
    page: 1,
    limit: 100, // Lấy nhiều để Client tự paginate
    routeName: routeNameQuery,
    departureDate: selectedDate?.format("YYYY-MM-DD"),
    minPrice: filters.priceRange[0],
    maxPrice: filters.priceRange[1],
    busType: filters.busType.length > 0 ? filters.busType : undefined,
    amenities: filters.amenities.length > 0 ? filters.amenities : undefined,
  };

  const {
    data: searchTripsData,
    isLoading,
    error,
  } = useGetTripRouteMapQuery(searchApiParams);

  const tripRouteData =
    searchTripsData?.items?.map((item) => ({
      id: item.id,
      tripId: item.tripId, // Add tripId from API
      routeId: item.routeId, // Add routeId from API
      departureTime: item.trip.startTime,
      arrivalTime: item.trip.endTime,
      busType: item.trip.bus?.busType,
      amenities: item.trip.bus?.amenities,
      price: item.price,
      trip: {
        ...item.trip,
        tripName: item.trip.tripName || "Bus Trip",
      },
      route: {
        ...item.route,
        origin: item.route.origin,
        destination: item.route.destination,
      },
    })) || [];

  const applyFilters = (trips: (Trip | (typeof tripRouteData)[0])[]) => {
    return trips.filter((trip) => {
      if (
        trip.price < filters.priceRange[0] ||
        trip.price > filters.priceRange[1]
      ) {
        return false;
      }

      if (filters.departureTime.length > 0) {
        let departureHour = 0;
        if (trip.departureTime) {
          const date = new Date(trip.departureTime);
          departureHour = date.getHours();
        }

        let matchesTimeSlot = false;

        for (const timeSlot of filters.departureTime) {
          switch (timeSlot) {
            case "early-morning":
              // 00:00 - 06:00 (hour 0-6, excluding minutes after 06:00)
              if (departureHour >= 0 && departureHour < 6)
                matchesTimeSlot = true;
              else if (departureHour === 6) {
                const date = new Date(trip.departureTime);
                if (date.getMinutes() === 0) matchesTimeSlot = true;
              }
              break;
            case "morning":
              // 06:01 - 12:00
              if (departureHour > 6 && departureHour < 12)
                matchesTimeSlot = true;
              else if (departureHour === 6) {
                const date = new Date(trip.departureTime);
                if (date.getMinutes() > 0) matchesTimeSlot = true;
              } else if (departureHour === 12) {
                const date = new Date(trip.departureTime);
                if (date.getMinutes() === 0) matchesTimeSlot = true;
              }
              break;
            case "afternoon":
              // 12:01 - 18:00
              if (departureHour > 12 && departureHour < 18)
                matchesTimeSlot = true;
              else if (departureHour === 12) {
                const date = new Date(trip.departureTime);
                if (date.getMinutes() > 0) matchesTimeSlot = true;
              } else if (departureHour === 18) {
                const date = new Date(trip.departureTime);
                if (date.getMinutes() === 0) matchesTimeSlot = true;
              }
              break;
            case "evening":
              // 18:01 - 23:59
              if (departureHour > 18 && departureHour <= 23)
                matchesTimeSlot = true;
              else if (departureHour === 18) {
                const date = new Date(trip.departureTime);
                if (date.getMinutes() > 0) matchesTimeSlot = true;
              }
              break;
          }
        }

        if (!matchesTimeSlot) return false;
      }

      // Arrival time filter (using destination stop arrival time)
      if (filters.arrivalTime.length > 0) {
        let arrivalHour = 0;
        if (trip.arrivalTime) {
          const date = new Date(trip.arrivalTime);
          arrivalHour = date.getHours();
        }

        let matchesTimeSlot = false;

        for (const timeSlot of filters.arrivalTime) {
          switch (timeSlot) {
            case "early-morning":
              // 00:00 - 06:00 (hour 0-6, excluding minutes after 06:00)
              if (arrivalHour >= 0 && arrivalHour < 6) matchesTimeSlot = true;
              else if (arrivalHour === 6) {
                const date = new Date(trip.arrivalTime);
                if (date.getMinutes() === 0) matchesTimeSlot = true;
              }
              break;
            case "morning":
              // 06:01 - 12:00
              if (arrivalHour > 6 && arrivalHour < 12) matchesTimeSlot = true;
              else if (arrivalHour === 6) {
                const date = new Date(trip.arrivalTime);
                if (date.getMinutes() > 0) matchesTimeSlot = true;
              } else if (arrivalHour === 12) {
                const date = new Date(trip.arrivalTime);
                if (date.getMinutes() === 0) matchesTimeSlot = true;
              }
              break;
            case "afternoon":
              // 12:01 - 18:00
              if (arrivalHour > 12 && arrivalHour < 18) matchesTimeSlot = true;
              else if (arrivalHour === 12) {
                const date = new Date(trip.arrivalTime);
                if (date.getMinutes() > 0) matchesTimeSlot = true;
              } else if (arrivalHour === 18) {
                const date = new Date(trip.arrivalTime);
                if (date.getMinutes() === 0) matchesTimeSlot = true;
              }
              break;
            case "evening":
              // 18:01 - 23:59
              if (arrivalHour > 18 && arrivalHour <= 23) matchesTimeSlot = true;
              else if (arrivalHour === 18) {
                const date = new Date(trip.arrivalTime);
                if (date.getMinutes() > 0) matchesTimeSlot = true;
              }
              break;
          }
        }

        if (!matchesTimeSlot) return false;
      }

      // Bus type filter
      if (filters.busType.length > 0) {
        const tripBusType = trip.busType?.toLowerCase() || "standard";
        const matchesBusType = filters.busType.some(
          (filterType) => filterType.toLowerCase() === tripBusType,
        );
        if (!matchesBusType) return false;
      }

      // Amenities filter
      if (filters.amenities.length > 0) {
        const tripAmenities = trip.amenities || {};
        const hasAllAmenities = filters.amenities.every((amenity) => {
          return (
            (tripAmenities as { [key: string]: boolean })[amenity] === true
          );
        });
        if (!hasAllAmenities) return false;
      }

      return true;
    });
  };

  // Pagination logic with filters applied
  const getAllTrips = () => {
    let trips: (Trip | (typeof tripRouteData)[0])[] = [];
    if (tripRouteData && tripRouteData.length > 0) {
      trips = tripRouteData;
    } else if (error) {
      trips = mockTrips;
    }

    // Apply filters to the trips
    return applyFilters(trips);
  };

  const allTrips = getAllTrips();
  const totalPages = Math.ceil(allTrips.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTrips = allTrips.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of results
    const resultsSection = document.querySelector(".trips-results");
    if (resultsSection) {
      resultsSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Reset to first page when search parameters change
  useEffect(() => {
    setCurrentPage(1);
  }, [fromLocation, toLocation, selectedDate]);

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const handleSearch = (params: {
    from: string;
    to: string;
    date: Dayjs | null;
  }) => {
    setFromLocation(params.from);
    setToLocation(params.to);
    setSelectedDate(params.date);
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
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Available Trips
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                {fromLocation} → {toLocation} • {formatDate()}
              </p>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-300 px-4 py-2">
              {(() => {
                if (isLoading) return "Loading...";
                const totalTrips = allTrips.length;
                const originalTrips =
                  tripRouteData?.length || (error ? mockTrips.length : 0);

                if (totalTrips === 0) {
                  return originalTrips > 0
                    ? "No trips match your filters"
                    : "No trips found";
                }

                const displayStart = startIndex + 1;
                const displayEnd = Math.min(endIndex, totalTrips);
                const hasFilters =
                  filters.departureTime.length > 0 ||
                  filters.arrivalTime.length > 0 ||
                  filters.busType.length > 0 ||
                  filters.amenities.length > 0 ||
                  filters.priceRange[0] > 0 ||
                  filters.priceRange[1] < 500000;

                if (hasFilters && totalTrips < originalTrips) {
                  return `Showing ${displayStart}-${displayEnd} of ${totalTrips} trips (${originalTrips - totalTrips} filtered out)`;
                }

                return `Showing ${displayStart}-${displayEnd} of ${totalTrips} trips`;
              })()}
            </div>
          </div>
        </div>

        {/* Filter Panel - Horizontal Above Trips */}
        <FilterPanel onFilterChange={handleFilterChange} />

        {/* Trip Cards */}
        <div className="trips-results">
          <div className="space-y-6">
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

            {/* Use paginated trips data */}
            {!isLoading &&
              currentTrips.length > 0 &&
              currentTrips.map((tripRoute, index) => {
                // Check if this is API data or mock data
                const isApiData = "trip" in tripRoute;

                if (isApiData) {
                  // Convert TripRoute data to Trip format for TripCard component
                  const startTime = dayjs(tripRoute.trip.startTime);
                  const endTime = dayjs(tripRoute.trip.endTime);
                  const durationHours = endTime.diff(startTime, "hour", true);
                  const durationText =
                    durationHours >= 1
                      ? `${Math.floor(durationHours)}h ${Math.round((durationHours % 1) * 60)}m`
                      : `${Math.round(durationHours * 60)}m`;

                  const tripData = {
                    ...tripRoute.trip,

                    id: tripRoute.tripId || tripRoute.id,
                    tripId: tripRoute.tripId,
                    routeId: tripRoute.routeId,
                    route: tripRoute.route,
                    departureTime: startTime.format("HH:mm"),
                    arrivalTime: endTime.format("HH:mm"),
                    duration: durationText,
                    from: tripRoute.route.origin.city,
                    to: tripRoute.route.destination.city,
                    fromTerminal: tripRoute.route.origin.name,
                    toTerminal: tripRoute.route.destination.name,
                    price: Number(tripRoute.price),

                    // Bus Info
                    busType:
                      tripRoute.trip.bus?.busType?.toLowerCase() || "standard",
                    amenities:
                      (tripRoute.trip.bus?.amenities as unknown as {
                        [key: string]: boolean;
                      }) || {},
                  };

                  return (
                    <TripCard
                      key={`trip-${tripData.id}-${index}`}
                      trip={tripData}
                      isOpen={openTripId === tripData.id}
                      onToggle={(tripId) =>
                        setOpenTripId(openTripId === tripId ? null : tripId)
                      }
                    />
                  );
                }
              })}

            {/* No results message */}
            {!isLoading && currentTrips.length === 0 && (
              <div className="flex justify-center items-center py-8">
                <div className="text-gray-600 dark:text-gray-400">
                  No trips found for your search criteria.
                </div>
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {!isLoading && totalPages > 1 && (
            <div className="mt-8 flex justify-center items-center space-x-2">
              {/* Previous Button */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  currentPage === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600"
                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:border-gray-600"
                }`}
              >
                Previous
              </button>

              {/* Page Numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => {
                  // Show first page, last page, current page, and pages around current page
                  const showPage =
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1);

                  if (!showPage && page === currentPage - 2) {
                    return (
                      <span
                        key="dots-before"
                        className="px-2 py-2 text-gray-400"
                      >
                        ...
                      </span>
                    );
                  }

                  if (!showPage && page === currentPage + 2) {
                    return (
                      <span
                        key="dots-after"
                        className="px-2 py-2 text-gray-400"
                      >
                        ...
                      </span>
                    );
                  }

                  if (!showPage) return null;

                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-2 rounded-md text-sm font-medium ${
                        currentPage === page
                          ? "bg-blue-600 text-white dark:bg-blue-700"
                          : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:border-gray-600"
                      }`}
                    >
                      {page}
                    </button>
                  );
                },
              )}

              {/* Next Button */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  currentPage === totalPages
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600"
                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:border-gray-600"
                }`}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
