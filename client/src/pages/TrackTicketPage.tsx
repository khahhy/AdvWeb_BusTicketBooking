import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/dashboard/Footer";
import backgroundImage from "@/assets/images/background.png";
import {
  Mail,
  Phone,
  Search,
  MapPin,
  Calendar,
  Clock,
  Ticket,
  User,
  AlertCircle,
  Eye,
} from "lucide-react";
import { useLookupGuestBookingsMutation } from "@/store/api/bookingApi";
import { Booking, BookingStatus } from "@/store/type/bookingType";
import dayjs from "dayjs";

interface BookingResult {
  id: string;
  bookingCode: string;
  from: string;
  to: string;
  date: string;
  departureTime: string;
  arrivalTime: string;
  seat: string;
  price: number;
  status: "completed" | "upcoming" | "cancelled";
  passengerName: string;
  duration: string;
}

export default function TrackTicketPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    phoneNumber: "",
  });
  const [bookingResults, setBookingResults] = useState<BookingResult[]>([]);
  const [searchAttempted, setSearchAttempted] = useState(false);
  const [errors, setErrors] = useState({
    email: "",
    phoneNumber: "",
  });
  const navigate = useNavigate();
  const [lookupGuestBookings, { isLoading: isSearching }] =
    useLookupGuestBookingsMutation();

  const handleViewTicket = (bookingCode: string) => {
    if (!bookingCode) return;
    navigate(`/eticket/${bookingCode}`);
  };

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    setIsLoggedIn(!!token);
  }, []);

  const validateForm = () => {
    const newErrors = {
      email: "",
      phoneNumber: "",
    };

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.phoneNumber) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (
      !/^[0-9]{10,11}$/.test(formData.phoneNumber.replace(/\s/g, ""))
    ) {
      newErrors.phoneNumber = "Please enter a valid phone number";
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error);
  };

  const transformBookingToResult = (booking: Booking): BookingResult => {
    const startTime = booking.trip?.startTime
      ? dayjs(booking.trip.startTime)
      : dayjs();
    const endTime = startTime.add(6, "hour");
    const durationHours = endTime.diff(startTime, "hour", true);
    const durationText =
      durationHours >= 1
        ? `${Math.floor(durationHours)}h ${Math.round((durationHours % 1) * 60)}m`
        : `${Math.round(durationHours * 60)}m`;

    const mapStatus = (
      status: BookingStatus,
    ): "completed" | "upcoming" | "cancelled" => {
      switch (status) {
        case BookingStatus.confirmed:
          return "upcoming";
        case BookingStatus.cancelled:
          return "cancelled";
        case BookingStatus.pendingPayment:
        default:
          return "upcoming";
      }
    };

    return {
      id: booking.id,
      bookingCode: booking.ticketCode || booking.id.slice(0, 8).toUpperCase(),
      from: booking.pickupStop?.location?.name || "Unknown",
      to: booking.dropoffStop?.location?.name || "Unknown",
      date: startTime.format("YYYY-MM-DD"),
      departureTime: startTime.format("HH:mm"),
      arrivalTime: endTime.format("HH:mm"),
      seat: booking.seat?.seatNumber || "N/A",
      price: Number(booking.price) || 0,
      status: mapStatus(booking.status),
      passengerName: booking.customerInfo?.fullName || "Guest",
      duration: durationText,
    };
  };

  const handleTrackTicket = async () => {
    if (!validateForm()) return;

    setSearchAttempted(true);

    try {
      const response = await lookupGuestBookings({
        email: formData.email,
        phoneNumber: formData.phoneNumber.replace(/\s/g, ""),
      }).unwrap();

      const results = (response.data || []).map(transformBookingToResult);
      setBookingResults(results);
    } catch (error) {
      console.error("Error tracking ticket:", error);
      setBookingResults([]);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-success-100 text-success">Completed</Badge>;
      case "upcoming":
        return <Badge className="bg-primary-50 text-primary">Upcoming</Badge>;
      case "cancelled":
        return <Badge className="bg-error-50 text-error">Cancelled</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-700">Unknown</Badge>;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-50 dark:bg-black dark:bg-none">
      <Navbar />

      {/* Header Section */}
      <div className="pt-56 pb-48 relative dark:bg-black">
        {/* Background Image - only in light mode */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat dark:hidden"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />

        {/* Dark mode background */}
        <div className="absolute inset-0 bg-black hidden dark:block" />

        {/* Gradient fade overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-pink-50 to-transparent dark:from-black dark:to-transparent pointer-events-none"></div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <h1 className="text-4xl font-bold text-black dark:text-white mb-2 text-center opacity-0 animate-[fadeInDown_0.7s_ease-out_0.2s_forwards]">
            Track Your Ticket
          </h1>
          <p className="text-center mb-8 text-black/80 dark:text-white/80 opacity-0 animate-[fadeInDown_0.7s_ease-out_0.4s_forwards]">
            Enter your contact information to find your booking
          </p>
          {isLoggedIn && (
            <p className="text-center text-sm text-black/70 dark:text-white/70 opacity-0 animate-[fadeInDown_0.7s_ease-out_0.5s_forwards]">
              You're logged in.{" "}
              <button
                onClick={() => navigate("/booking-history")}
                className="text-pink-600 dark:text-pink-400 hover:underline font-medium"
              >
                View your booking history
              </button>
            </p>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12 pb-20 dark:bg-black">
        <div className="opacity-0 animate-[fadeInUp_0.8s_ease-out_0.6s_forwards]">
          {/* Track Form */}
          <Card className="bg-white/95 dark:bg-black backdrop-blur-sm shadow-xl border-0 mb-8 dark:border-gray-800">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-gray-800 dark:text-white flex items-center justify-center gap-3">
                Find Your Booking
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300">
                Enter the email and phone number used when booking your ticket
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                {/* Email Field */}
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="Enter your email"
                      className={`w-full pl-12 pr-4 py-4 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                        errors.email
                          ? "border-red-300 focus:ring-red-200 focus:border-red-400 dark:border-red-600 dark:focus:ring-red-800"
                          : "border-gray-300 focus:ring-pink-200 focus:border-pink-400 dark:border-gray-600 dark:focus:ring-pink-800"
                      } bg-white dark:bg-gray-900 dark:text-white`}
                    />
                    <Mail className="absolute left-4 top-4 w-5 h-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-error flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Phone Number Field */}
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Phone Number
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          phoneNumber: e.target.value,
                        })
                      }
                      placeholder="Enter your phone number"
                      className={`w-full pl-12 pr-4 py-4 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                        errors.phoneNumber
                          ? "border-red-300 focus:ring-red-200 focus:border-red-400 dark:border-red-600 dark:focus:ring-red-800"
                          : "border-gray-300 focus:ring-blue-200 focus:border-blue-400 dark:border-gray-600 dark:focus:ring-blue-800"
                      } bg-white dark:bg-gray-900 dark:text-white`}
                    />
                    <Phone className="absolute left-4 top-4 w-5 h-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  {errors.phoneNumber && (
                    <p className="text-xs text-error flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.phoneNumber}
                    </p>
                  )}
                </div>
              </div>

              {/* Search Button */}
              <div className="text-center">
                <Button
                  onClick={handleTrackTicket}
                  disabled={isSearching}
                  className="bg-black hover:bg-gray-800 text-white px-8 py-3 rounded-xl disabled:opacity-50"
                >
                  {isSearching ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5 mr-2" />
                      Track Ticket
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results Section */}
          {searchAttempted && (
            <div className="space-y-6">
              {bookingResults.length > 0 ? (
                <>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                    Your Bookings
                  </h2>
                  {bookingResults.map((booking) => (
                    <Card
                      key={booking.id}
                      className="bg-white dark:bg-black shadow-lg border-0 dark:border-gray-800"
                    >
                      <CardContent className="p-6">
                        <div className="grid md:grid-cols-3 gap-6 items-center">
                          {/* Trip Info */}
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <Ticket className="w-5 h-5 text-pink-500" />
                              <span className="font-bold text-lg">
                                {booking.bookingCode}
                              </span>
                              {getStatusBadge(booking.status)}
                            </div>
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                              <MapPin className="w-4 h-4" />
                              <span>
                                {booking.from} → {booking.to}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                              <User className="w-4 h-4" />
                              <span>{booking.passengerName}</span>
                            </div>
                          </div>

                          {/* Date & Time Info */}
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                              <Calendar className="w-4 h-4" />
                              <span>
                                {new Date(booking.date).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                              <Clock className="w-4 h-4" />
                              <span>
                                {booking.departureTime} - {booking.arrivalTime}
                              </span>
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              Duration: {booking.duration}
                            </div>
                          </div>

                          {/* Price & Seat */}
                          <div className="text-right space-y-3">
                            <div className="text-2xl font-bold text-gray-800 dark:text-white">
                              {formatPrice(booking.price)}
                            </div>
                            <div className="text-gray-600 dark:text-gray-300">
                              Seat:{" "}
                              <span className="font-semibold">
                                {booking.seat}
                              </span>
                            </div>
                            <div className="flex gap-2 justify-end">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewTicket(booking.bookingCode)}
                                className="border-pink-300 text-pink-600 hover:bg-pink-50 dark:border-pink-700 dark:text-pink-400 dark:hover:bg-pink-900/20"
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                E-Ticket
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  navigate(`/booking-details/${booking.id}`)
                                }
                                className="border-blue-300 text-blue-600 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/20"
                              >
                                View Details
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </>
              ) : (
                <Card className="bg-white dark:bg-black shadow-lg border-0 dark:border-gray-800">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                      No Bookings Found
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                      We couldn't find any bookings with the provided email and
                      phone number.
                    </p>
                    <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                      <p>
                        • Make sure you entered the correct email and phone
                        number
                      </p>
                      <p>
                        • Check if the booking was made with a different contact
                        information
                      </p>
                      <p>
                        • Contact our customer support if you need assistance
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Login Suggestion */}
          <Card className="bg-blue-50 dark:bg-gray-900 border-blue-200 dark:border-gray-700 border mt-8">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
                    Have an account?
                  </h3>
                  <p className="text-blue-700 dark:text-blue-200 mb-4">
                    Log in to view all your bookings, manage your trips, and
                    enjoy a personalized experience.
                  </p>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => navigate("/login")}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Sign In
                    </Button>
                    <Button
                      onClick={() => navigate("/signup")}
                      variant="outline"
                      className="border-blue-300 text-blue-600 hover:bg-blue-50"
                    >
                      Create Account
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
