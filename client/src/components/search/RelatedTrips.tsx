import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, ArrowRight } from "lucide-react";
import dayjs from "dayjs";
import { API_BASE_URL } from "@/lib/api";

interface Trip {
  id: string;
  tripId: string;
  routeId: string;
  startTime: string;
  endTime: string;
  price: number;
  availableSeats: number;
  from: string;
  to: string;
  fromTerminal?: string;
  toTerminal?: string;
}

interface RelatedTripsProps {
  currentTripId: string;
  routeId: string;
  date: string;
}

export default function RelatedTrips({
  currentTripId,
  routeId,
  date,
}: RelatedTripsProps) {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelatedTrips = async () => {
      try {
        setLoading(true);
        const formattedDate = dayjs(date).format("YYYY-MM-DD");

        const response = await fetch(
          `${API_BASE_URL}/routes/${routeId}/trips?date=${formattedDate}`,
        );

        if (!response.ok) {
          throw new Error("Failed to load related trips");
        }

        const result = await response.json();
        const allTrips = result.data || [];
        const now = dayjs();

        // Filter out current trip, past trips, and show only trips with available seats
        // Only show trips from now until end of day
        const relatedTrips = allTrips
          .filter((trip: Trip) => {
            const tripStartTime = dayjs(trip.startTime);
            return (
              trip.tripId !== currentTripId &&
              trip.availableSeats > 0 &&
              tripStartTime.isAfter(now) // Only future trips
            );
          })
          .slice(0, 4); // Show maximum 4 related trips

        setTrips(relatedTrips);
      } catch (err) {
        console.error("Error fetching related trips:", err);
        setTrips([]);
      } finally {
        setLoading(false);
      }
    };

    if (routeId && date) {
      fetchRelatedTrips();
    }
  }, [currentTripId, routeId, date]);

  const formatTime = (dateStr: string) => {
    return dayjs(dateStr).format("HH:mm");
  };

  const formatDuration = (start: string, end: string) => {
    const startDate = dayjs(start);
    const endDate = dayjs(end);
    const diffMs = endDate.diff(startDate);

    if (!Number.isFinite(diffMs) || diffMs <= 0) return "—";

    const totalMinutes = Math.round(diffMs / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours <= 0) {
      return `${minutes}m`;
    }

    return `${hours}h ${minutes}m`;
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("vi-VN") + "đ";
  };

  const handleTripClick = (trip: Trip) => {
    const formattedDate = dayjs(trip.startTime).format("YYYY-MM-DD");
    navigate(
      `/trip-detail?tripId=${trip.tripId}&routeId=${trip.routeId}&date=${formattedDate}`,
    );
    window.scrollTo(0, 0);
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          Related Trips
        </h2>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">
            Loading trips...
          </span>
        </div>
      </div>
    );
  }

  if (trips.length === 0) {
    return null; // Don't show section if no related trips
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Other Trips on This Route
        </h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {trips.length} available
        </span>
      </div>

      <div className="space-y-4">
        {trips.map((trip) => (
          <div
            key={trip.id}
            onClick={() => handleTripClick(trip)}
            className="group border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-md transition-all duration-200 cursor-pointer"
          >
            <div className="flex items-center justify-between gap-4">
              {/* Time and Route Info */}
              <div className="flex items-center gap-4 flex-1">
                {/* Departure */}
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatTime(trip.startTime)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {trip.from}
                  </div>
                  {trip.fromTerminal && (
                    <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 line-clamp-1 max-w-[80px]">
                      {trip.fromTerminal}
                    </div>
                  )}
                </div>

                {/* Duration */}
                <div className="flex flex-col items-center flex-1 px-2">
                  <div className="flex items-center gap-1 w-full">
                    <div className="h-px flex-1 bg-gray-300 dark:bg-gray-600"></div>
                    <ArrowRight className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    <div className="h-px flex-1 bg-gray-300 dark:bg-gray-600"></div>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDuration(trip.startTime, trip.endTime)}
                  </div>
                </div>

                {/* Arrival */}
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatTime(trip.endTime)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {trip.to}
                  </div>
                  {trip.toTerminal && (
                    <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 line-clamp-1 max-w-[80px]">
                      {trip.toTerminal}
                    </div>
                  )}
                </div>
              </div>

              {/* Price and Seats */}
              <div className="flex flex-col items-end gap-2">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {formatCurrency(trip.price)}
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>{trip.availableSeats} seats left</span>
                </div>
                <button
                  className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTripClick(trip);
                  }}
                >
                  View details
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-center">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
        >
          Back to search results
        </button>
      </div>
    </div>
  );
}
