import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Building, Loader2 } from "lucide-react";
import Navbar from "@/components/common/Navbar";
import backgroundImage from "@/assets/images/background.png";
import dayjs from "dayjs";
import PaymentTripSummaryCard from "@/components/payment/PaymentTripSummaryCard";
import PaymentMethodsCard from "@/components/payment/PaymentMethodsCard";
import PaymentButton from "@/components/payment/PaymentButton";
import PaymentPriceSidebar from "@/components/payment/PaymentPriceSidebar";
import Footer from "@/components/dashboard/Footer";
import { useCreateBookingMutation } from "@/store/api/bookingApi";
import { useCreatePaymentMutation } from "@/store/api/paymentApi";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/store/slice/authSlice";
import { useGetTripRouteMapDetailQuery } from "@/store/api/routesApi";

export default function PaymentPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentUser = useSelector(selectCurrentUser);
  const [createBooking, { isLoading: isCreatingBooking }] =
    useCreateBookingMutation();
  const [createPayment, { isLoading: isCreatingPayment }] =
    useCreatePaymentMutation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Get data from URL params
  const tripId = searchParams.get("tripId") || "";
  const routeId = searchParams.get("routeId") || "";
  // Support both single seat (seatId) and multiple seats (seatIds)
  const seatIdsParam =
    searchParams.get("seatIds") || searchParams.get("seatId") || "";
  const seatsParam =
    searchParams.get("seats") || searchParams.get("seat") || "";
  const seatIds = seatIdsParam.split(",").filter(Boolean);
  const selectedSeats = seatsParam.split(",").filter(Boolean);
  const travelDate = searchParams.get("date") || dayjs().format("YYYY-MM-DD");
  const passengerName = searchParams.get("passengerName") || "Guest User";
  const passengerIdRaw = searchParams.get("passengerId") || "123456789012";
  const passengerId =
    passengerIdRaw.slice(0, 4) +
    "*".repeat(Math.max(0, passengerIdRaw.length - 4));
  const emailParam = searchParams.get("email") || "guest@example.com";
  const phoneNumber = searchParams.get("phoneNumber") || "";

  // Fetch trip details from API
  const {
    data: tripData,
    isLoading: tripLoading,
    error: tripError,
  } = useGetTripRouteMapDetailQuery(
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
      availableSeats: totalSeats,
      totalSeats,
      busType,
      amenities: actualData.bus?.amenities || {},
    };
  }, [tripData, tripId]);

  // Calculate prices - multiply by number of seats
  const ticketPrice = trip.price;
  const seatCount = seatIds.length || 1;
  const totalPrice = ticketPrice * seatCount;

  // Payment method state
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>("");
  const [paymentError, setPaymentError] = useState<string>("");

  const formatDate = () => {
    return dayjs(travelDate).format("ddd, MMM DD, YYYY");
  };

  const formatCurrency = (amount: number): string => {
    return amount.toLocaleString("vi-VN") + "VND";
  };
  const handlePayment = async () => {
    setPaymentError("");

    // Log the data being sent
    console.log("Booking data:", {
      tripId,
      routeId,
      seatIds,
      passengerName,
      emailParam,
      phoneNumber,
    });

    // Validate required fields
    if (!tripId || !routeId || seatIds.length === 0) {
      console.warn("Missing required data:", { tripId, routeId, seatIds });
      setPaymentError(
        `Missing booking data: ${!tripId ? "tripId " : ""}${!routeId ? "routeId " : ""}${seatIds.length === 0 ? "seatIds" : ""}. Please go back and select a seat.`,
      );
      return;
    }

    // Validate payment method selected
    if (!selectedPaymentMethod) {
      setPaymentError("Please select a payment method");
      return;
    }

    try {
      // Step 1: Create booking with multiple seats
      const bookingResponse = await createBooking({
        userId: currentUser?.id,
        tripId,
        routeId,
        seatIds, // Pass array of seat IDs
        customerInfo: {
          fullName: passengerName,
          email: emailParam,
          phoneNumber: phoneNumber || "0000000000",
          identificationCard: passengerIdRaw,
        },
      }).unwrap();

      console.log("Booking created:", bookingResponse);

      const bookingId = bookingResponse.data?.bookingId;
      const bookingIds = bookingResponse.data?.bookingIds || [bookingId];
      const bookingTotalPrice = bookingResponse.data?.totalPrice || totalPrice;

      if (!bookingId) {
        throw new Error("Booking created but no bookingId returned");
      }

      // Step 2: Create payment link with PayOS for all bookings
      const paymentResponse = await createPayment({
        bookingId, // Primary booking ID
        bookingIds, // All booking IDs
        totalAmount: bookingTotalPrice, // Total for all seats
        buyerName: passengerName,
        buyerEmail: emailParam,
        buyerPhone: phoneNumber,
      }).unwrap();

      console.log("Payment link created:", paymentResponse);

      // Backend trả về trực tiếp object, không có wrapper 'data'
      const checkoutUrl =
        (paymentResponse as { checkoutUrl?: string }).checkoutUrl ||
        paymentResponse.data?.checkoutUrl;

      if (!checkoutUrl) {
        console.error("Payment response:", paymentResponse);
        throw new Error("Payment link created but no checkoutUrl returned");
      }

      // Step 3: Redirect to PayOS payment page
      window.location.href = checkoutUrl;
    } catch (error: unknown) {
      console.error("Payment flow error:", JSON.stringify(error, null, 2));

      let errorMessage = "Unknown error";
      if (error && typeof error === "object") {
        const err = error as Record<string, unknown>;
        if (err.data && typeof err.data === "object") {
          const data = err.data as Record<string, unknown>;
          errorMessage = (data.message as string) || JSON.stringify(data);
        } else if (err.error) {
          errorMessage = String(err.error);
        } else if (err.message) {
          errorMessage = String(err.message);
        } else {
          errorMessage = JSON.stringify(error);
        }
      }

      setPaymentError(`Payment failed: ${errorMessage}`);
    }
  };

  const paymentMethods = [
    {
      id: "internet-banking",
      name: "Internet Banking",
      description: "ATM Card with online payment",
      icon: <Building className="w-5 h-5" />,
    },
  ];

  // Loading state
  if (tripLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-50 dark:bg-black dark:bg-none">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-pink-500 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-300">
              Loading payment details...
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
            Complete Payment
          </h1>
          <p className="text-xl text-black/80 dark:text-white/80 opacity-0 animate-[fadeInDown_0.7s_ease-out_0.4s_forwards]">
            Choose your preferred payment method
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 pb-20 -mt-16 relative z-10 dark:bg-black">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Trip and Payment Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="opacity-0 animate-[fadeInUp_0.8s_ease-out_0.3s_forwards]">
              <PaymentTripSummaryCard
                trip={trip}
                formatDate={formatDate}
                passengerName={passengerName}
                passengerId={passengerId}
                email={emailParam}
              />
            </div>

            <div className="opacity-0 animate-[fadeInUp_0.8s_ease-out_0.5s_forwards]">
              <PaymentMethodsCard
                paymentMethods={paymentMethods}
                selectedPaymentMethod={selectedPaymentMethod}
                onSelectPaymentMethod={(methodId) => {
                  setSelectedPaymentMethod(methodId);
                  setPaymentError("");
                }}
                error={paymentError}
              />
            </div>

            <div className="opacity-0 animate-[fadeInUp_0.8s_ease-out_0.7s_forwards]">
              <PaymentButton
                onPayment={handlePayment}
                isLoading={isCreatingBooking || isCreatingPayment}
              />
            </div>
          </div>

          {/* Right Column - Price Details */}
          <div className="lg:col-span-1">
            <div className="opacity-0 animate-[fadeInUp_0.8s_ease-out_0.4s_forwards]">
              <PaymentPriceSidebar
                selectedSeat={selectedSeats.join(", ")}
                ticketPrice={ticketPrice}
                insuranceFee={0}
                serviceFee={0}
                totalPrice={totalPrice}
                formatCurrency={formatCurrency}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
