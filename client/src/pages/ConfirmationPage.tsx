import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Download, Mail, MapPin } from "lucide-react";
import Navbar from "@/components/common/Navbar";
import backgroundImage from "@/assets/images/background.png";
import Footer from "@/components/dashboard/Footer";
import { mockTrips } from "@/data/mockTrips";
import dayjs from "dayjs";

export default function ConfirmationPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Get data from URL params
  const tripId = searchParams.get("tripId") || "1";
  const selectedSeat = searchParams.get("seat") || "25";
  const travelDate = searchParams.get("date") || dayjs().format("YYYY-MM-DD");
  const passengerName = searchParams.get("passengerName") || "VO LE VIET TU";
  const passengerId = searchParams.get("passengerId") || "123456789012";
  const email = searchParams.get("email") || "example@gmail.com";
  const bookingCode =
    searchParams.get("bookingCode") ||
    "BUS" + Math.random().toString(36).substr(2, 9).toUpperCase();

  const trip = mockTrips.find((t) => t.id === tripId) || mockTrips[0];

  const ticketPrice = trip.price;
  const insuranceFee = 1000;
  const serviceFee = 14000;
  const totalPrice = ticketPrice + insuranceFee + serviceFee;

  const formatDate = () => {
    return dayjs(travelDate).format("ddd, MMM DD, YYYY");
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("vi-VN") + "VND";
  };

  const handleDownloadTicket = () => {
    console.log("Downloading ticket...");
    // Implement download logic
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 dark:bg-black dark:bg-none">
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
          <div className="flex flex-col items-center text-center">
            <h1 className="text-5xl font-bold text-black dark:text-white mb-3 opacity-0 animate-[fadeInDown_0.7s_ease-out_0.3s_forwards]">
              Payment Successful!
            </h1>
            <p className="text-xl text-black/80 dark:text-white/80 opacity-0 animate-[fadeInDown_0.7s_ease-out_0.4s_forwards]">
              Your booking has been confirmed
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 pb-20 -mt-16 relative z-10 dark:bg-black">
        {/* Booking Code Card */}
        <div className="opacity-0 animate-[fadeInUp_0.8s_ease-out_0.3s_forwards]">
          <div className="bg-white dark:bg-black rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Booking Code</p>
            <p className="text-4xl font-bold text-primary dark:text-blue-400 tracking-wider">
              {bookingCode}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
              Please save this code for ticket pickup
            </p>
          </div>
        </div>

        {/* Trip Information Card */}
        <div className="opacity-0 animate-[fadeInUp_0.8s_ease-out_0.5s_forwards]">
          <div className="bg-white dark:bg-black rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Trip Information
              </h2>
              <span className="inline-block bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs font-semibold px-3 py-1 rounded-full">
                CONFIRMED
              </span>
            </div>

            <div className="flex items-center justify-between mb-6">
              <div className="w-32 flex-shrink-0">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {trip.from}
                </div>
                <div className="text-xl font-semibold text-gray-900 dark:text-white mt-1">
                  {trip.departureTime}
                </div>
              </div>

              <div className="flex-1 px-4 md:px-8 text-center">
                <div className="flex items-center justify-center gap-2 md:gap-3 mb-1">
                  <MapPin className="w-4 h-4 md:w-5 md:h-5 text-gray-400 dark:text-gray-500" />
                  <div className="h-0.5 w-16 md:w-40 border-t-2 border-dashed border-gray-300 dark:border-gray-600"></div>
                  <MapPin className="w-4 h-4 md:w-5 md:h-5 text-gray-400 dark:text-gray-500" />
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{trip.duration}</div>
              </div>

              <div className="text-right w-32 flex-shrink-0">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {trip.to}
                </div>
                <div className="text-xl font-semibold text-gray-900 dark:text-white mt-1">
                  {trip.arrivalTime}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Date</p>
                <p className="text-base font-semibold text-gray-900 dark:text-white">
                  {formatDate()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Seat Number</p>
                <p className="text-base font-semibold text-gray-900 dark:text-white">
                  {selectedSeat}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Passenger Information Card */}
        <div className="opacity-0 animate-[fadeInUp_0.8s_ease-out_0.6s_forwards]">
          <div className="bg-white dark:bg-black rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Passenger Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Full Name</p>
                <p className="text-base font-semibold text-gray-900 dark:text-white">
                  {passengerName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">ID Number</p>
                <p className="text-base font-semibold text-gray-900 dark:text-white">
                  {passengerId}
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Email</p>
                <p className="text-base font-semibold text-gray-900 dark:text-white">{email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Summary Card */}
        <div className="opacity-0 animate-[fadeInUp_0.8s_ease-out_0.7s_forwards]">
          <div className="bg-white dark:bg-black rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Payment Summary
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between text-gray-700 dark:text-gray-300">
                <span>Ticket Price (Seat {selectedSeat})</span>
                <span>{formatCurrency(ticketPrice)}</span>
              </div>
              <div className="flex justify-between text-gray-700 dark:text-gray-300">
                <span>Insurance Fee</span>
                <span>{formatCurrency(insuranceFee)}</span>
              </div>
              <div className="flex justify-between text-gray-700 dark:text-gray-300">
                <span>Service Fee</span>
                <span>{formatCurrency(serviceFee)}</span>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between text-xl font-bold text-gray-900 dark:text-white">
                <span>Total Paid</span>
                <span className="text-green-600 dark:text-green-400">
                  {formatCurrency(totalPrice)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Email Notification */}
        <div className="opacity-0 animate-[fadeInUp_0.8s_ease-out_0.8s_forwards]">
          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-2xl p-4 mb-6 flex items-start gap-3">
            <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-blue-900 dark:text-blue-300">
                Ticket sent to your email
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-200 mt-1">
                We've sent your ticket confirmation to{" "}
                <span className="font-semibold">{email}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="opacity-0 animate-[fadeInUp_0.8s_ease-out_0.9s_forwards]">
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleDownloadTicket}
              className="flex-1 bg-primary hover:bg-primary/90 dark:bg-blue-600 dark:hover:bg-blue-700 text-primary-foreground dark:text-white py-4 rounded-2xl transition-all duration-300 font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
            >
              <Download className="w-5 h-5" />
              Download Ticket
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="flex-1 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white border-2 border-gray-300 dark:border-gray-600 py-4 rounded-2xl transition-all duration-300 font-semibold"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
