import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "@/components/common/Navbar";
import backgroundImage from "@/assets/images/background.png";
import dayjs from "dayjs";
import TripSummaryCard from "@/components/checkout/TripSummaryCard";
import PassengerDetailsCard from "@/components/checkout/PassengerDetailsCard";
import ContactInformationCard from "@/components/checkout/ContactInformationCard";
import PriceDetailsSidebar from "@/components/checkout/PriceDetailsSidebar";
import SeatMapModal from "@/components/checkout/SeatMapModal";
import Footer from "@/components/dashboard/Footer";
import { useGetTripRouteMapDetailQuery } from "@/store/api/routesApi";
import { useGetTripSeatsQuery } from "@/store/api/tripsApi";
import { SeatStatus } from "@/store/type/seatsType";
import { Loader2 } from "lucide-react";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Get trip data from URL params
  const tripId = searchParams.get("tripId") || "";
  const routeId = searchParams.get("routeId") || "";
  const seatId = searchParams.get("seatId") || "";
  const selectedSeat = searchParams.get("seat") || "";
  const travelDate = searchParams.get("date") || dayjs().format("YYYY-MM-DD");

  // Fetch trip details from API
  const {
    data: tripData,
    isLoading: tripLoading,
    error: tripError,
  } = useGetTripRouteMapDetailQuery(
    { tripId, routeId },
    { skip: !tripId || !routeId },
  );

  // Fetch real-time seat status
  const { data: seatStatusData } = useGetTripSeatsQuery(
    { tripId, routeId },
    { skip: !tripId || !routeId },
  );

  // Transform API data to component format
  const trip = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const actualData = (tripData as any)?.data || tripData;
    if (!actualData) {
      return {
        id: tripId,
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
      };
    }

    const startTime = dayjs(actualData.startTime);
    const endTime = dayjs(actualData.endTime);
    const durationHours = endTime.diff(startTime, "hour", true);
    const durationText =
      durationHours >= 1
        ? `${Math.floor(durationHours)}h ${Math.round((durationHours % 1) * 60)}m`
        : `${Math.round(durationHours * 60)}m`;

    const busType = actualData.bus?.busType?.toLowerCase() || "standard";
    const totalSeats =
      busType === "sleeper" || busType === "limousine" ? 20 : 32;

    // Calculate available seats from real seat status
    const availableSeats = seatStatusData?.availableSeats ?? totalSeats;

    return {
      id: actualData.tripId,
      departureTime: startTime.format("HH:mm"),
      arrivalTime: endTime.format("HH:mm"),
      duration: durationText,
      from: actualData.originCity || actualData.origin,
      to: actualData.destinationCity || actualData.destination,
      fromTerminal: actualData.origin,
      toTerminal: actualData.destination,
      price: parseFloat(actualData.price) || 0,
      availableSeats,
      totalSeats,
      busType,
      amenities: actualData.bus?.amenities || {},
    };
  }, [tripData, tripId, seatStatusData]);

  // Transform real seat status data for seat map
  const transformSeatStatus = (
    seatStatusData: SeatStatus[] | undefined,
    basePrice: number,
  ) => {
    if (!seatStatusData || seatStatusData.length === 0) {
      return [];
    }

    return seatStatusData.map((seat) => ({
      id: seat.seatId,
      number: seat.seatNumber,
      type:
        seat.status === "BOOKED" || seat.status === "LOCKED"
          ? ("booked" as const)
          : ("available" as const),
      price: basePrice,
    }));
  };

  // Calculate prices
  const ticketPrice = trip.price;
  const insuranceFee = 1000;
  const serviceFee = 14000;
  const totalPrice = ticketPrice + insuranceFee + serviceFee;

  const [fullName, setFullName] = useState("");
  const [contactName, setContactName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [personalId, setPersonalId] = useState("");
  const [contactPersonalId, setContactPersonalId] = useState("");
  const [countryCode, setCountryCode] = useState("+84");
  const [showPassengerDetails, setShowPassengerDetails] = useState(true);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showSeatMap, setShowSeatMap] = useState(false);

  const seats = useMemo(
    () => transformSeatStatus(seatStatusData?.seats, trip.price),
    [seatStatusData, trip.price],
  );

  const formatDate = () => {
    return dayjs(travelDate).format("ddd, MMM DD, YYYY");
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("vi-VN") + "VND";
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Validate passenger details
    if (!fullName.trim()) {
      newErrors.fullName = "Please enter passenger full name";
    }
    if (!personalId.trim()) {
      newErrors.personalId = "Please enter Personal ID/Citizen ID/Passport ID";
    }

    // Validate contact information
    if (!contactName.trim()) {
      newErrors.contactName = "Please enter contact name";
    }
    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = "Please enter phone number";
    } else if (!/^\d{9,11}$/.test(phoneNumber)) {
      newErrors.phoneNumber = "Please enter a valid phone number";
    }
    if (!email.trim()) {
      newErrors.email = "Please enter email address";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!contactPersonalId.trim()) {
      newErrors.contactPersonalId =
        "Please enter Personal ID/Citizen ID/Passport ID";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      const params = new URLSearchParams({
        tripId,
        routeId,
        seatId,
        seat: selectedSeat,
        date: travelDate,
        passengerName: fullName,
        passengerId: personalId,
        email,
        phoneNumber,
      });
      navigate(`/payment?${params.toString()}`);
    }
  };

  // Loading state
  if (tripLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-50 dark:bg-black dark:bg-none">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-pink-500 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-300">
              Loading trip details...
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Error state
  if (tripError || !tripId || !routeId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-50 dark:bg-black dark:bg-none">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-red-500 text-lg mb-4">
              {!tripId || !routeId
                ? "Missing trip information. Please select a trip first."
                : "Failed to load trip details. Please try again."}
            </p>
            <button
              onClick={() => navigate("/search")}
              className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
            >
              Go to Search
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

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
          <h1 className="text-5xl font-bold text-black dark:text-white mb-3 opacity-0 animate-[fadeInDown_0.7s_ease-out_0.2s_forwards]">
            Complete Your Booking
          </h1>
          <p className="text-xl text-black/80 dark:text-white/80 opacity-0 animate-[fadeInDown_0.7s_ease-out_0.4s_forwards]">
            Just a few steps away from your journey
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 pb-20 -mt-16 relative z-10 dark:bg-black">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Booking Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="opacity-0 animate-[fadeInUp_0.8s_ease-out_0.3s_forwards]">
              <TripSummaryCard
                trip={trip}
                formatDate={formatDate}
                onDetailsClick={() => setShowSeatMap(true)}
              />
            </div>

            <div className="opacity-0 animate-[fadeInUp_0.8s_ease-out_0.5s_forwards]">
              <PassengerDetailsCard
                fullName={fullName}
                setFullName={setFullName}
                personalId={personalId}
                setPersonalId={setPersonalId}
                selectedSeat={selectedSeat}
                showPassengerDetails={showPassengerDetails}
                setShowPassengerDetails={setShowPassengerDetails}
                errors={errors}
                setErrors={setErrors}
              />
            </div>

            <div className="opacity-0 animate-[fadeInUp_0.8s_ease-out_0.7s_forwards]">
              <ContactInformationCard
                contactName={contactName}
                setContactName={setContactName}
                phoneNumber={phoneNumber}
                setPhoneNumber={setPhoneNumber}
                email={email}
                setEmail={setEmail}
                contactPersonalId={contactPersonalId}
                setContactPersonalId={setContactPersonalId}
                countryCode={countryCode}
                setCountryCode={setCountryCode}
                errors={errors}
                setErrors={setErrors}
              />
            </div>
          </div>

          {/* Right Column - Price Details */}
          <div className="lg:col-span-1">
            <div className="opacity-0 animate-[fadeInUp_0.8s_ease-out_0.4s_forwards]">
              <PriceDetailsSidebar
                selectedSeat={selectedSeat}
                ticketPrice={ticketPrice}
                insuranceFee={insuranceFee}
                serviceFee={serviceFee}
                totalPrice={totalPrice}
                formatCurrency={formatCurrency}
                onNext={handleNext}
              />
            </div>
          </div>
        </div>
      </div>

      <SeatMapModal
        show={showSeatMap}
        onClose={() => setShowSeatMap(false)}
        trip={trip}
        formatDate={formatDate}
        formatCurrency={formatCurrency}
        selectedSeat={selectedSeat}
        ticketPrice={ticketPrice}
        seats={seats}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}
