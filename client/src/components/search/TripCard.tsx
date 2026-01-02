import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
} from "lucide-react";
import InteractiveSeatMap from "./InteractiveSeatMap";
import { BusType } from "@/store/type/busType";
import dayjs from "dayjs";
import type { Trip } from "@/store/type/tripsType";
import { useSeatBooking } from "@/hooks/useSeatBooking";
import { useGetBookingRulesQuery } from "@/store/api/settingApi";

export type TripCardData = Trip & {
  tripId?: string;
  routeId?: string;
  price: number;
  from: string;
  to: string;
  fromTerminal?: string;
  toTerminal?: string;
  duration?: string;
  busType?: string;
  amenities?: Record<string, boolean>;
  note?: string;
  departureTime: string;
  arrivalTime: string;
};

interface TripCardProps {
  trip: TripCardData;
  isOpen: boolean;
  onToggle: (tripId: string) => void;
}

type TabId = "schedule" | "seat" | "shipment" | "policy";

export default function TripCard({ trip, isOpen, onToggle }: TripCardProps) {
  const navigate = useNavigate();
  const cardRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<TabId | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(120);

  const { data: bookingRules } = useGetBookingRulesQuery();

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

  const {
    seats,
    selectedSeats,
    toggleSeat,
    totalPrice,
    availableSeatsCount,
    isLoading,
    handleTimeout,
    refetch,
    resetSelection,
  } = useSeatBooking({
    tripId: trip.tripId || trip.id,
    routeId: trip.routeId || "default-route-id",
    basePrice: trip.price,
    isOpen: isOpen && activeTab === "seat",
  });

  const handleBookTrip = () => {
    if (selectedSeats.length === 0) return;

    const departureDate = dayjs(trip.departureTime);
    const date = departureDate.isValid()
      ? departureDate.format("YYYY-MM-DD")
      : dayjs().format("YYYY-MM-DD");
    const selectedSeatId = selectedSeats[0];
    const seatObj = seats.find((s) => s.seatId === selectedSeatId);
    const seatNumber = seatObj?.seatNumber || "";

    navigate(
      `/checkout?tripId=${trip.tripId || trip.id}&routeId=${trip.routeId || ""}&seatId=${selectedSeatId}&seat=${seatNumber}&date=${date}`,
    );
  };

  const handleViewDetail = () => {
    const departureDate = dayjs(trip.departureTime);
    const date = departureDate.isValid()
      ? departureDate.format("YYYY-MM-DD")
      : dayjs().format("YYYY-MM-DD");
    const tId = trip.tripId || trip.id;
    const rId = trip.routeId || "";
    navigate(`/trip-detail?tripId=${tId}&routeId=${rId}&date=${date}`);
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("vi-VN") + "đ";
  };

  if (!isOpen && activeTab !== null) {
    setActiveTab(null);
  }

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

  useEffect(() => {
    if (isOpen && activeTab && cardRef.current) {
      const navbarHeight = 110;
      const cardTop =
        cardRef.current.getBoundingClientRect().top + window.scrollY;
      const scrollPosition = cardTop - navbarHeight - 20;
      window.scrollTo({ top: scrollPosition, behavior: "smooth" });
    }
  }, [isOpen, activeTab]);

  const tabs = [
    { id: "schedule", label: "Schedule" },
    { id: "seat", label: "Choose seat" },
    { id: "shipment", label: "Transshipment" },
    { id: "policy", label: "Policy" },
  ];

  return (
    <div
      ref={cardRef}
      className="bg-white dark:bg-black rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-100 dark:border-gray-700"
    >
      {/* Trip Header */}
      <div className="py-6 px-6">
        <div className="grid grid-cols-2 gap-8">
          {/* Left Section: Time and Location Info */}
          <div className="flex items-center gap-6">
            {/* Departure */}
            <div className="text-center w-32 flex-shrink-0">
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 leading-tight mb-2">
                {trip.departureTime}
              </div>
              <div className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">
                {trip.from}
              </div>
              {trip.fromTerminal && (
                <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                  {trip.fromTerminal}
                </div>
              )}
            </div>

            {/* Duration */}
            <div className="flex flex-col items-center justify-center px-3 flex-shrink-0">
              <div className="flex items-center gap-2 mb-1.5">
                <MapPin className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                <div className="h-0.5 w-32 border-t-2 border-dashed border-gray-300 dark:border-gray-600"></div>
                <MapPin className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-300 font-semibold">
                {trip.duration}
              </div>
              <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                (Asian/Ho Chi Minh)
              </div>
            </div>

            {/* Arrival */}
            <div className="text-center w-32 flex-shrink-0">
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 leading-tight mb-2">
                {trip.arrivalTime}
              </div>
              <div className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">
                {trip.to}
              </div>
              {trip.toTerminal && (
                <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                  {trip.toTerminal}
                </div>
              )}
            </div>
          </div>

          {/* Right Section: Seats, Price and Amenities */}
          <div className="flex flex-col gap-3">
            {/* Top: Seats and Price Info */}
            <div className="flex items-center justify-end gap-6">
              {/* Seats Info */}
              <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span className="font-semibold">
                  {availableSeatsCount} blank seats
                </span>
              </div>

              {/* Price */}
              <div className="text-right">
                <div className="text-3xl font-bold text-foreground leading-tight mb-1">
                  {formatCurrency(trip.price)}
                </div>
                {selectedSeats.length > 0 && (
                  <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                    {selectedSeats.length} seat
                    {selectedSeats.length > 1 ? "s" : ""}:{" "}
                    {formatCurrency(totalPrice)}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom: Bus Type and Amenities */}
            <div className="flex items-center justify-end gap-2 flex-wrap">
              {trip.busType && (
                <span className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-lg text-xs font-semibold uppercase">
                  {trip.busType}
                </span>
              )}

              {trip.amenities && Object.keys(trip.amenities).length > 0 && (
                <>
                  {Object.entries(trip.amenities)
                    .filter(([, available]) => available)
                    .map(([amenity]) => {
                      const getAmenityIcon = (amenity: string) => {
                        switch (amenity.toLowerCase()) {
                          case "wifi":
                            return <Wifi className="w-3.5 h-3.5" />;
                          case "tv":
                            return <Tv className="w-3.5 h-3.5" />;
                          case "snack":
                            return <Coffee className="w-3.5 h-3.5" />;
                          case "water":
                            return <Droplets className="w-3.5 h-3.5" />;
                          case "toilet":
                            return <Bath className="w-3.5 h-3.5" />;
                          case "blanket":
                            return <ShirtIcon className="w-3.5 h-3.5" />;
                          case "charger":
                            return <Zap className="w-3.5 h-3.5" />;
                          case "aircondition":
                            return <Snowflake className="w-3.5 h-3.5" />;
                          default:
                            return null;
                        }
                      };
                      return (
                        <div
                          key={amenity}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg text-xs font-semibold border border-green-200 dark:border-green-800"
                        >
                          {getAmenityIcon(amenity)}
                          <span className="capitalize">{amenity}</span>
                        </div>
                      );
                    })}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  if (!isOpen) {
                    onToggle(trip.id);
                    setActiveTab(tab.id as TabId);
                  } else if (activeTab === tab.id) {
                    onToggle(trip.id);
                    setActiveTab(null);
                  } else {
                    setActiveTab(tab.id as TabId);
                  }
                }}
                className={`px-10 py-2 text-sm font-medium rounded-2xl transition-all duration-200 ${
                  activeTab === tab.id && isOpen
                    ? "bg-foreground text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleViewDetail}
            className="px-8 py-2 bg-foreground text-white font-semibold rounded-2xl hover:bg-foreground/90 active:bg-foreground/80 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
          >
            View detail
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "seat" && (
        <div className="p-6 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
              Choose Your Seat
            </h3>

            {isLoading ? (
              <div className="text-center py-4">Loading seats...</div>
            ) : (
              <div className="flex flex-col lg:flex-row gap-8 items-start">
                <div className="flex-1 w-full lg:w-auto">
                  <InteractiveSeatMap
                    busType={getBusTypeEnum(trip.busType)}
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
                    onSeatSelect={toggleSeat}
                    selectedSeats={selectedSeats}
                  />
                </div>

                <div className="w-full lg:w-80 flex-shrink-0">
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm p-6 sticky top-4">
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                      Price Summary
                    </h4>

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
                          Giữ ghế trong:{" "}
                          <span className="font-bold">
                            {formatTime(timeLeft)}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                          Ticket Price
                        </span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(trip.price)}
                        </span>
                      </div>

                      {selectedSeats.length > 0 ? (
                        <>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600 dark:text-gray-400">
                              Quantity
                            </span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {selectedSeats.length}
                            </span>
                          </div>
                          <div className="flex justify-between items-start text-sm">
                            <span className="text-gray-600 dark:text-gray-400">
                              Seats
                            </span>
                            <span className="font-medium text-blue-600 dark:text-blue-400 text-xs text-right max-w-[120px] break-words">
                              {seats
                                .filter((s) => selectedSeats.includes(s.seatId))
                                .map((s) => s.seatNumber)
                                .join(", ")}
                            </span>
                          </div>
                          <div className="border-t border-gray-100 dark:border-gray-700 pt-3 mt-3">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-gray-900 dark:text-white">
                                Total
                              </span>
                              <span className="text-xl font-bold text-foreground">
                                {formatCurrency(totalPrice)}
                              </span>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="pt-4 text-center text-gray-400 dark:text-gray-500 text-sm italic border-t border-gray-100 dark:border-gray-700">
                          Select seats to calculate price
                        </div>
                      )}
                    </div>

                    <button
                      onClick={handleBookTrip}
                      disabled={selectedSeats.length === 0}
                      className={`w-full py-3 rounded-xl font-bold text-white transition-all shadow-md ${
                        selectedSeats.length > 0
                          ? "bg-foreground hover:bg-foreground/90 hover:scale-[1.02]"
                          : "bg-gray-300 dark:bg-gray-700 cursor-not-allowed"
                      }`}
                    >
                      Book Trip
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "schedule" && (
        <div className="p-6 bg-gray-50 border-t border-gray-200">
          <div className="max-w-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Schedule</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-foreground/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{trip.from}</p>
                  {trip.fromTerminal && (
                    <p className="text-sm text-gray-600">{trip.fromTerminal}</p>
                  )}
                  <p className="text-sm text-gray-500">
                    Departure: {trip.departureTime}
                  </p>
                </div>
              </div>
              <div className="ml-6 border-l-2 border-dashed border-gray-300 h-12"></div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-foreground/5 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-foreground/70" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{trip.to}</p>
                  {trip.toTerminal && (
                    <p className="text-sm text-gray-600">{trip.toTerminal}</p>
                  )}
                  <p className="text-sm text-gray-500">
                    Arrival: {trip.arrivalTime}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "shipment" && (
        <div className="p-6 bg-gray-50 border-t border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Transshipment Information
          </h3>
          <p className="text-gray-600">
            Information about transportation and delivery services.
          </p>
        </div>
      )}

      {activeTab === "policy" && (
        <div className="p-6 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Policy
          </h3>
          {bookingRules ? (
            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <p>• Please arrive at the departure point 30 minutes early.</p>
              <p>
                • Free cancellation{" "}
                <strong>{bookingRules.minCancellationHours} hours</strong>{" "}
                before departure.
              </p>
              <p>
                • Cancellation within {bookingRules.minCancellationHours} hours
                will incur a{" "}
                <strong>{100 - bookingRules.refundPercentage}%</strong> fee
                (Refund {bookingRules.refundPercentage}%).
              </p>
              <p>
                • Unpaid seats will be held for{" "}
                <strong>{bookingRules.paymentHoldTimeMinutes} minutes</strong>.
              </p>
              <p>• Tickets cannot be transferred to others.</p>
            </div>
          ) : (
            <div className="text-sm text-gray-500 italic">
              Loading policy information...
            </div>
          )}
        </div>
      )}
    </div>
  );
}
