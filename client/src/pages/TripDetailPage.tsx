import { useEffect, useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "@/components/common/Navbar";
import backgroundImage from "@/assets/images/background.png";
import { generateSeats, Seat } from "@/data/mockTrips";
import dayjs from "dayjs";
import Footer from "@/components/dashboard/Footer";
import { useGetTripRouteMapDetailQuery } from "@/store/api/routesApi";
import { useGetBusSeatsQuery } from "@/store/api/busApi";
import { BackendSeat } from "@/store/type/routesType";
import {
  Clock,
  MapPin,
  Wifi,
  Tv,
  Coffee,
  Droplets,
  Bath,
  ShirtIcon,
  Zap,
  Snowflake,
  Calendar,
  Bus,
  Users,
} from "lucide-react";
import InteractiveSeatMap from "@/components/search/InteractiveSeatMap";
import { BusType } from "@/store/type/busType";

export default function TripDetailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Get trip data from URL params
  const tripId = searchParams.get("tripId") || "";
  const routeId = searchParams.get("routeId") || "";
  const travelDate = searchParams.get("date") || dayjs().format("YYYY-MM-DD");

  // Fetch trip from API - only skip if both params are missing
  const {
    data: tripData,
    isLoading: tripLoading,
    error: tripError,
  } = useGetTripRouteMapDetailQuery(
    { tripId, routeId },
    { skip: !tripId || !routeId }, // Skip if either param is missing
  );

  // Fetch seats for the bus
  const busId = tripData?.bus?.id;
  const {
    data: backendSeats,
    isLoading: seatsLoading,
    error: seatsError,
  } = useGetBusSeatsQuery(busId || "", {
    skip: !busId,
  });

  // Transform API data to component format
  const trip = useMemo(() => {
    // Backend returns {message, data}, but type says it's already unwrapped
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const actualData = (tripData as any)?.data || tripData;
    if (!actualData) {
      return {
        id: "",
        departureTime: "--:--",
        arrivalTime: "--:--",
        duration: "0h",
        from: "",
        to: "",
        price: 0,
        availableSeats: 0,
        totalSeats: 32,
        busType: "standard",
        amenities: {},
        note: undefined,
      };
    }

    const startTime = dayjs(actualData.startTime);
    const endTime = dayjs(actualData.endTime);
    const durationHours = endTime.diff(startTime, "hour", true);
    const durationText =
      durationHours >= 1
        ? `${Math.floor(durationHours)}h ${Math.round((durationHours % 1) * 60)}m`
        : `${Math.round(durationHours * 60)}m`;

    // Convert amenities object to object format
    const amenitiesObj: Record<string, boolean> = {};
    if (actualData.bus?.amenities) {
      Object.keys(actualData.bus.amenities).forEach((amenity: string) => {
        amenitiesObj[amenity.toLowerCase()] = true;
      });
    }

    // Map seat capacity enum to numbers
    const seatCapacityMap: { [key: string]: number } = {
      SEAT_16: 16,
      SEAT_28: 28,
      SEAT_32: 32,
    };

    // Map bus type enum to lowercase strings
    const busTypeMap: { [key: string]: string } = {
      STANDARD: "standard",
      VIP: "vip",
      SLEEPER: "sleeper",
      LIMOUSINE: "limousine",
    };

    const busTypeKey =
      busTypeMap[actualData.bus?.busType || "STANDARD"] || "standard";
    const totalSeats =
      seatCapacityMap[actualData.bus?.seatCapacity || "SEAT_32"] || 32;

    // Calculate available seats from backend seat data
    const availableSeats = backendSeats
      ? backendSeats.length
      : Math.floor(totalSeats * 0.6);

    return {
      id: actualData.tripId,
      busId: actualData.bus?.id,
      departureTime: startTime.format("HH:mm"),
      arrivalTime: endTime.format("HH:mm"),
      duration: durationText,
      from: actualData.originCity || actualData.origin,
      to: actualData.destinationCity || actualData.destination,
      fromTerminal: actualData.origin,
      toTerminal: actualData.destination,
      price: parseFloat(actualData.price),
      availableSeats,
      totalSeats,
      busType: busTypeKey,
      amenities: amenitiesObj,
      note: undefined,
    };
  }, [tripData, tripId, backendSeats]);

  // Convert string bus type to BusType enum
  const getBusTypeEnum = (busType?: string): BusType => {
    if (!busType) return BusType.STANDARD;
    const normalized = busType.toUpperCase();
    switch (normalized) {
      case "VIP":
        return BusType.VIP;
      case "SLEEPER":
        return BusType.SLEEPER;
      case "LIMOUSINE":
        return BusType.LIMOUSINE;
      default:
        return BusType.STANDARD;
    }
  };

  // Seat management
  const transformBackendSeats = (
    backendSeats: BackendSeat[] | undefined,
    totalSeats: number,
    basePrice: number,
    busType: string,
  ): Seat[] => {
    // If no backendSeats, fallback to generateSeats with 40% booked
    if (!backendSeats || backendSeats.length === 0) {
      return generateSeats(
        totalSeats,
        Math.floor(totalSeats * 0.4),
        basePrice,
        busType,
      );
    }

    // TODO: Integrate with bookings API to get real booked seats
    // For now, mock some seats as booked (simulate ~40% occupancy)
    const bookedCount = Math.floor(backendSeats.length * 0.4);
    const bookedIndices = new Set<number>();
    while (bookedIndices.size < bookedCount) {
      bookedIndices.add(Math.floor(Math.random() * backendSeats.length));
    }

    return backendSeats.map((backendSeat, index) => ({
      id: backendSeat.id,
      number: backendSeat.seatNumber,
      type: bookedIndices.has(index)
        ? ("booked" as const)
        : ("available" as const),
      price: basePrice,
    }));
  };

  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  // Update seats when trip data changes
  useEffect(() => {
    setSeats(
      transformBackendSeats(
        backendSeats,
        trip.totalSeats,
        trip.price,
        trip.busType,
      ),
    );
  }, [trip.totalSeats, trip.price, trip.busType, backendSeats]);

  const handleSeatSelect = (seatId: string) => {
    setSeats((prevSeats) => {
      const newSeats = prevSeats.map((seat) => {
        if (seat.id === seatId) {
          const newType: Seat["type"] =
            seat.type === "selected" ? "available" : "selected";
          return { ...seat, type: newType };
        }
        return seat;
      });

      const newSelected: string[] = [];
      for (const s of newSeats) {
        if (s.type === "selected") newSelected.push(s.id);
      }
      setSelectedSeats(() => newSelected);

      return newSeats;
    });
  };

  const totalPrice = selectedSeats.length * (trip.price || 0);

  const formatDate = () => {
    return dayjs(travelDate).format("dddd, MMMM DD, YYYY");
  };

  const formatCurrency = (amount: number | undefined | null) => {
    if (amount === undefined || amount === null || isNaN(amount)) {
      return "0đ";
    }
    return amount.toLocaleString("vi-VN") + "đ";
  };

  const handleBookTrip = () => {
    const seat =
      selectedSeats.length > 0
        ? seats.find((s) => s.id === selectedSeats[0])?.number || "01"
        : "01";
    navigate(`/checkout?tripId=${trip.id}&seat=${seat}&date=${travelDate}`);
  };

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case "wifi":
        return <Wifi className="w-5 h-5" />;
      case "tv":
        return <Tv className="w-5 h-5" />;
      case "snack":
        return <Coffee className="w-5 h-5" />;
      case "water":
        return <Droplets className="w-5 h-5" />;
      case "toilet":
        return <Bath className="w-5 h-5" />;
      case "blanket":
        return <ShirtIcon className="w-5 h-5" />;
      case "charger":
        return <Zap className="w-5 h-5" />;
      case "aircondition":
        return <Snowflake className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const getAmenityLabel = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case "wifi":
        return "WiFi";
      case "tv":
        return "TV Entertainment";
      case "snack":
        return "Complimentary Snacks";
      case "water":
        return "Bottled Water";
      case "toilet":
        return "Onboard Restroom";
      case "blanket":
        return "Blanket & Pillow";
      case "charger":
        return "Phone Charger";
      case "aircondition":
        return "Air Conditioning";
      default:
        return amenity;
    }
  };

  const getBusTypeLabel = (busType: string) => {
    switch (busType) {
      case "standard":
        return "Standard";
      case "vip":
        return "VIP";
      case "sleeper":
        return "Sleeper";
      case "limousine":
        return "Limousine";
      default:
        return busType;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-50 dark:bg-black dark:bg-none">
      {/* Navbar */}
      <Navbar />

      {/* Header Section with Background */}
      <div className="pt-40 pb-32 relative">
        {/* Background Image - only in light mode */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat dark:hidden"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />

        {/* Dark mode background */}
        <div className="absolute inset-0 bg-black hidden dark:block" />

        {/* Gradient fade overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-pink-50 to-transparent dark:from-black dark:to-transparent pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <h1 className="text-4xl font-bold text-black dark:text-white mb-2 opacity-0 animate-[fadeInDown_0.7s_ease-out_0.2s_forwards]">
            Trip Details
          </h1>
          <p className="text-lg text-black/80 dark:text-white/80 opacity-0 animate-[fadeInDown_0.7s_ease-out_0.4s_forwards]">
            Review your trip information and select your seats
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 pb-20 -mt-16 relative z-10 dark:bg-black">
        {/* Loading State */}
        {(tripLoading || seatsLoading) && (
          <div className="flex justify-center items-center py-20">
            <div className="text-gray-600 dark:text-gray-400 text-lg">
              Loading trip details...
            </div>
          </div>
        )}

        {/* Error State */}
        {(tripError || seatsError) && (
          <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-6 mb-6">
            <p className="text-yellow-800 dark:text-yellow-200">
              {tripError
                ? "Unable to load trip details from server."
                : "Unable to load seat information."}{" "}
              Showing available data.
            </p>
          </div>
        )}

        {/* Trip Content */}
        {!tripLoading && !seatsLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Trip Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Trip Route Card */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 opacity-0 animate-[fadeInUp_0.8s_ease-out_0.3s_forwards]">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Route Information
                </h2>

                <div className="flex items-center justify-between gap-6">
                  {/* Departure */}
                  <div className="flex-1 text-center">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                      Departure
                    </div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                      {trip.from}
                    </div>
                    {trip.fromTerminal && (
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                        {trip.fromTerminal}
                      </div>
                    )}
                    <div className="text-3xl font-bold text-foreground">
                      {trip.departureTime}
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="flex flex-col items-center px-4">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                      <div className="h-0.5 w-24 border-t-2 border-dashed border-gray-300 dark:border-gray-600"></div>
                      <MapPin className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {trip.duration}
                      </span>
                    </div>
                  </div>

                  {/* Arrival */}
                  <div className="flex-1 text-center">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                      Arrival
                    </div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                      {trip.to}
                    </div>
                    {trip.toTerminal && (
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                        {trip.toTerminal}
                      </div>
                    )}
                    <div className="text-3xl font-bold text-foreground">
                      {trip.arrivalTime}
                    </div>
                  </div>
                </div>

                {/* Travel Date */}
                <div className="mt-4 p-3 bg-foreground/5 rounded-xl flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-foreground" />
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Travel Date
                    </div>
                    <div className="text-base font-semibold text-gray-900 dark:text-white">
                      {formatDate()}
                    </div>
                  </div>
                </div>

                {/* Note */}
                {trip.note && (
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl border border-blue-200 dark:border-blue-800">
                    <p className="text-xs text-blue-900 dark:text-blue-200">
                      <span className="font-semibold">Note:</span> {trip.note}
                    </p>
                  </div>
                )}
              </div>

              {/* Bus Information Card */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 opacity-0 animate-[fadeInUp_0.8s_ease-out_0.5s_forwards]">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Bus Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Bus Type */}
                  {trip.busType && (
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                        <Bus className="w-5 h-5 text-blue-600 dark:text-blue-300" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                          Bus Type
                        </div>
                        <div className="text-base font-bold text-gray-900 dark:text-white">
                          {getBusTypeLabel(trip.busType)}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Available Seats */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
                      <Users className="w-5 h-5 text-green-600 dark:text-green-300" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Available Seats
                      </div>
                      <div className="text-base font-bold text-gray-900 dark:text-white">
                        {trip.availableSeats} / {trip.totalSeats}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Amenities */}
                {trip.amenities && Object.keys(trip.amenities).length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
                      Onboard Amenities
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {Object.entries(trip.amenities).map(
                        ([amenity, available]) => {
                          if (!available) return null;
                          return (
                            <div
                              key={amenity}
                              className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
                            >
                              <div className="text-green-600 dark:text-green-400">
                                {getAmenityIcon(amenity)}
                              </div>
                              <span className="text-xs font-medium text-green-900 dark:text-green-100">
                                {getAmenityLabel(amenity)}
                              </span>
                            </div>
                          );
                        },
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Seat Selection Card */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 opacity-0 animate-[fadeInUp_0.8s_ease-out_0.7s_forwards]">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Choose Your Seats
                </h2>
                <InteractiveSeatMap
                  seats={seats.map((seat) => ({
                    seatId: seat.id,
                    seatNumber: seat.number,
                    status: seat.type as "available" | "selected" | "booked",
                    price: seat.price,
                  }))}
                  busType={getBusTypeEnum(trip.busType)}
                  onSeatSelect={handleSeatSelect}
                  selectedSeats={selectedSeats}
                />

                {selectedSeats.length > 0 && (
                  <div className="mt-4 p-4 bg-foreground/5 rounded-xl border border-foreground/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                          Selected {selectedSeats.length} seat(s):
                        </p>
                        <p className="text-base font-bold text-gray-900 dark:text-white">
                          {seats
                            .filter((seat) => selectedSeats.includes(seat.id))
                            .map((seat) => seat.number)
                            .join(", ")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                          Total Price
                        </p>
                        <p className="text-2xl font-bold text-foreground">
                          {formatCurrency(totalPrice)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Policy Card */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 opacity-0 animate-[fadeInUp_0.8s_ease-out_0.9s_forwards]">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Booking Policy
                </h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-foreground rounded-full mt-1.5 flex-shrink-0"></div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Please arrive at the departure point 15 minutes early.
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-foreground rounded-full mt-1.5 flex-shrink-0"></div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Free cancellation 24 hours before departure.
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-foreground rounded-full mt-1.5 flex-shrink-0"></div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Cancellation within 24 hours will incur a 20% fee.
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-foreground rounded-full mt-1.5 flex-shrink-0"></div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Tickets cannot be transferred to others.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Price Summary & Action */}
            <div className="lg:col-span-1">
              <div className="sticky top-32 opacity-0 animate-[fadeInUp_0.8s_ease-out_0.4s_forwards]">
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    Price Summary
                  </h2>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Ticket Price
                      </span>
                      <span className="text-base font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(trip.price)}
                      </span>
                    </div>

                    {selectedSeats.length > 0 && (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Number of Seats
                          </span>
                          <span className="text-base font-semibold text-gray-900 dark:text-white">
                            {selectedSeats.length}
                          </span>
                        </div>
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                          <div className="flex items-center justify-between">
                            <span className="text-base font-semibold text-gray-900 dark:text-white">
                              Total
                            </span>
                            <span className="text-xl font-bold text-foreground">
                              {formatCurrency(totalPrice)}
                            </span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <button
                    onClick={handleBookTrip}
                    className="w-full py-3 bg-foreground text-white font-semibold rounded-xl hover:bg-foreground/90 active:bg-foreground/80 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Book Trip
                  </button>

                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
                    {selectedSeats.length === 0
                      ? "Select at least one seat to continue"
                      : "Click to proceed to booking details"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
