import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "@/components/common/Navbar";
import backgroundImage from "@/assets/images/background.png";
import dayjs from "dayjs";
import "dayjs/locale/en";
import Footer from "@/components/dashboard/Footer";

dayjs.locale("en");
import { useGetTripRouteMapDetailQuery } from "@/store/api/routesApi";
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
import { useSeatBooking } from "@/hooks/useSeatBooking";
import { useGetBookingRulesQuery } from "@/store/api/settingApi";

export default function TripDetailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [timeLeft, setTimeLeft] = useState<number>(120);

  const { data: bookingRules } = useGetBookingRulesQuery();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Get trip data from URL params
  const tripId = searchParams.get("tripId") || "";
  const routeId = searchParams.get("routeId") || "";
  const dateParam = searchParams.get("date");

  // Validate and use date parameter, fallback to today if invalid
  const travelDate = useMemo(() => {
    if (!dateParam || dateParam === "Invalid Date") {
      return dayjs().format("YYYY-MM-DD");
    }
    const parsedDate = dayjs(dateParam);
    return parsedDate.isValid() ? dateParam : dayjs().format("YYYY-MM-DD");
  }, [dateParam]);

  // Fetch trip from API - only skip if both params are missing
  const {
    data: tripData,
    isLoading: tripLoading,
    error: tripError,
  } = useGetTripRouteMapDetailQuery(
    { tripId, routeId },
    { skip: !tripId || !routeId },
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const actualData = (tripData as any)?.data || tripData;
  const basePrice = parseFloat(actualData?.price || 0);

  const {
    seats,
    selectedSeats,
    toggleSeat,
    totalPrice,
    availableSeatsCount,
    isLoading: seatsLoading,
    handleTimeout,
    refetch,
    resetSelection,
  } = useSeatBooking({
    tripId,
    routeId,
    basePrice,
    isOpen: true,
  });

  // Transform API data to component format
  const trip = useMemo(() => {
    if (!actualData) {
      return {
        id: "",
        busPlate: "",
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

    // Map bus type to lowercase (case-insensitive)
    const rawBusType = actualData.bus?.busType || "STANDARD";
    const busTypeKey = rawBusType.toLowerCase();

    // Get total seats from bus type
    const getTotalSeatsFromBusType = (busType: string): number => {
      switch (busType.toLowerCase()) {
        case "vip":
          return 18;
        case "sleeper":
          return 16;
        case "limousine":
          return 16;
        case "standard":
        default:
          return 32;
      }
    };

    const totalSeats = getTotalSeatsFromBusType(busTypeKey);

    return {
      id: actualData.tripId,
      busId: actualData.bus?.id,
      busPlate: actualData.bus?.plate || "",
      departureTime: startTime.format("HH:mm"),
      arrivalTime: endTime.format("HH:mm"),
      duration: durationText,
      from: actualData.originCity || actualData.origin,
      to: actualData.destinationCity || actualData.destination,
      fromTerminal: actualData.origin,
      toTerminal: actualData.destination,
      price: parseFloat(actualData.price),
      availableSeats: availableSeatsCount,
      totalSeats,
      busType: busTypeKey,
      amenities: amenitiesObj,
      note: undefined,
    };
  }, [tripData, availableSeatsCount]);

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

  useEffect(() => {
    if (selectedSeats.length === 0) {
      setTimeLeft(120);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);

          resetSelection();
          handleTimeout().then(() => {
            refetch();
          });

          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [selectedSeats.length === 0]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const formatDate = () => {
    const date = dayjs(travelDate);
    return date.isValid() ? date.format("dddd, MMMM DD, YYYY") : "Invalid Date";
  };

  const formatCurrency = (amount: number | undefined | null) => {
    if (amount === undefined || amount === null || isNaN(amount)) return "0đ";
    return amount.toLocaleString("vi-VN") + "đ";
  };

  const handleBookTrip = () => {
    if (selectedSeats.length === 0) return;
    const selectedSeatId = selectedSeats[0];
    const seatObj = seats.find((s) => s.seatId === selectedSeatId);
    const seatNumber = seatObj?.seatNumber || "";

    navigate(
      `/checkout?tripId=${tripId}&routeId=${routeId}&seatId=${selectedSeatId}&seat=${seatNumber}&date=${travelDate}`,
    );
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
      <Navbar />

      <div className="pt-40 pb-32 relative">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat dark:hidden"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
        <div className="absolute inset-0 bg-black hidden dark:block" />
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
        {(tripLoading || seatsLoading) && (
          <div className="flex justify-center items-center py-20">
            <div className="text-gray-600 dark:text-gray-400 text-lg">
              Loading trip details...
            </div>
          </div>
        )}

        {tripError && (
          <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-6 mb-6">
            <p className="text-yellow-800 dark:text-yellow-200">
              Unable to load trip details from server. Showing available data.
            </p>
          </div>
        )}

        {!tripLoading && !seatsLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Route Information */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 opacity-0 animate-[fadeInUp_0.8s_ease-out_0.3s_forwards]">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Route Information
                </h2>
                <div className="flex items-center justify-between gap-6">
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
                {trip.note && (
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl border border-blue-200 dark:border-blue-800">
                    <p className="text-xs text-blue-900 dark:text-blue-200">
                      <span className="font-semibold">Note:</span> {trip.note}
                    </p>
                  </div>
                )}
              </div>

              {/* Bus Information */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 opacity-0 animate-[fadeInUp_0.8s_ease-out_0.5s_forwards]">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Bus Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  {trip.busPlate && (
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center flex-shrink-0">
                        <span className="text-purple-600 dark:text-purple-300 text-xs font-bold">
                          #
                        </span>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                          Plate Number
                        </div>
                        <div className="text-base font-bold text-gray-900 dark:text-white">
                          {trip.busPlate}
                        </div>
                      </div>
                    </div>
                  )}
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

              {/* Seat Selection */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 opacity-0 animate-[fadeInUp_0.8s_ease-out_0.7s_forwards]">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Choose Your Seats
                </h2>

                <InteractiveSeatMap
                  seats={seats.map((seat) => ({
                    seatId: seat.seatId,
                    seatNumber: seat.seatNumber,
                    status: selectedSeats.includes(seat.seatId)
                      ? "AVAILABLE"
                      : seat.status === "BOOKED"
                        ? "BOOKED"
                        : "AVAILABLE",
                    price: trip.price,
                  }))}
                  busType={getBusTypeEnum(trip.busType)}
                  onSeatSelect={toggleSeat} // Dùng hàm toggle từ hook
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
                            .filter((seat) =>
                              selectedSeats.includes(seat.seatId),
                            )
                            .map((seat) => seat.seatNumber)
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
                {bookingRules ? (
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-foreground rounded-full mt-1.5 flex-shrink-0"></div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        Please arrive at the departure point 30 minutes early.
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-foreground rounded-full mt-1.5 flex-shrink-0"></div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        Free cancellation{" "}
                        <strong>
                          {bookingRules.minCancellationHours} hours
                        </strong>{" "}
                        before departure.
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-foreground rounded-full mt-1.5 flex-shrink-0"></div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        Cancellation within {bookingRules.minCancellationHours}{" "}
                        hours will incur a{" "}
                        <strong>{100 - bookingRules.refundPercentage}%</strong>{" "}
                        fee.
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-foreground rounded-full mt-1.5 flex-shrink-0"></div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        Unpaid seats will be held for{" "}
                        <strong>
                          {bookingRules.paymentHoldTimeMinutes} minutes
                        </strong>
                        .
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-foreground rounded-full mt-1.5 flex-shrink-0"></div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        Tickets cannot be transferred to others.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-500 italic">
                    Loading policy details...
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Price Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-32 opacity-0 animate-[fadeInUp_0.8s_ease-out_0.4s_forwards]">
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    Price Summary
                  </h2>
                  {selectedSeats.length > 0 && (
                    <div
                      className={`mb-4 p-3 rounded-lg flex items-center gap-2 border ${
                        timeLeft < 60
                          ? "bg-red-50 border-red-200 text-red-700"
                          : "bg-blue-50 border-blue-200 text-blue-700"
                      }`}
                    >
                      <Clock className="w-4 h-4" />
                      <div className="text-sm font-medium">
                        Keep the seat in:{" "}
                        <span className="font-bold">
                          {formatTime(timeLeft)}
                        </span>
                      </div>
                    </div>
                  )}
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
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
