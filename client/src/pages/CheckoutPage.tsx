import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "@/components/common/Navbar";
import backgroundImage from "@/assets/images/background.png";
import { mockTrips, generateSeats } from "@/data/mockTrips";
import dayjs from "dayjs";
import TripSummaryCard from "@/components/checkout/TripSummaryCard";
import PassengerDetailsCard from "@/components/checkout/PassengerDetailsCard";
import ContactInformationCard from "@/components/checkout/ContactInformationCard";
import PriceDetailsSidebar from "@/components/checkout/PriceDetailsSidebar";
import SeatMapModal from "@/components/checkout/SeatMapModal";
import Footer from "@/components/dashboard/Footer";
import { useEffect } from "react";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Get trip data from URL params or use default
  const tripId = searchParams.get("tripId") || "1";
  const selectedSeat = searchParams.get("seat") || "25";
  const travelDate = searchParams.get("date") || dayjs().format("YYYY-MM-DD");

  const trip = mockTrips.find((t) => t.id === tripId) || mockTrips[0];

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
  const seats = generateSeats(
    trip.totalSeats,
    trip.totalSeats - trip.availableSeats,
    trip.price,
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
      console.log("Proceeding to payment...");
      // Navigate to payment page with trip details
      navigate(
        `/payment?tripId=${tripId}&seat=${selectedSeat}&date=${travelDate}&passengerName=${encodeURIComponent(fullName)}&passengerId=${encodeURIComponent(personalId)}&email=${encodeURIComponent(email)}`,
      );
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
