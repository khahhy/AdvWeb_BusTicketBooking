import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  MapPin,
  Calendar,
  Clock,
  User,
  Ticket,
  CreditCard,
  Phone,
  Mail,
  CheckCircle2,
  Edit,
} from "lucide-react";
import Navbar from "@/components/common/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Footer from "@/components/dashboard/Footer";
import { toast } from "sonner";
import backgroundImage from "@/assets/images/background.png";
import dayjs from "dayjs";
import { API_BASE_URL } from "@/lib/api";

interface BookingDetails {
  id: string;
  ticketCode: string;
  status: "pendingPayment" | "confirmed" | "cancelled";
  price: number;
  customerInfo: {
    fullName: string;
    phoneNumber: string;
    email: string;
    idNumber?: string;
  };
  createdAt: string;
  trip: {
    tripName: string;
    startTime: string;
    bus: {
      plate: string;
      busType: string;
    };
  };
  route?: {
    name: string;
  };
  seat: {
    seatNumber: string;
  };
  pickupStop: {
    location: {
      name: string;
      city: string;
    };
  };
  dropoffStop: {
    location: {
      name: string;
      city: string;
    };
  };
}

export default function BookingDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchBookingDetails();
  }, [id]);

  const fetchBookingDetails = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        toast.error("Please login to view booking details");
        navigate("/login");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/bookings/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch booking details");
      }

      const result = await response.json();
      setBooking(result.data);
    } catch (error) {
      console.error("Error fetching booking details:", error);
      toast.error("Unable to load booking details");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("vi-VN") + " VND";
  };

  const formatDate = (dateStr: string) => {
    return dayjs(dateStr).format("DD/MM/YYYY");
  };

  const formatDateTime = (dateStr: string) => {
    return dayjs(dateStr).format("DD/MM/YYYY HH:mm");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900 dark:text-green-300">
            Confirmed
          </Badge>
        );
      case "pendingPayment":
        return (
          <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300">
            Pending Payment
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="bg-red-100 text-red-700 hover:bg-red-100 dark:bg-red-900 dark:text-red-300">
            Cancelled
          </Badge>
        );
      default:
        return <Badge className="dark:text-white">Unknown</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-50 dark:bg-black dark:bg-none">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-50 dark:bg-black dark:bg-none">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Ticket className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Booking not found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              The booking you're looking for doesn't exist.
            </p>
            <Button onClick={() => navigate("/booking-history")}>
              Back to Booking History
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const handleDownloadTicket = () => {
    console.log("Downloading ticket for:", booking?.ticketCode);
    toast.info("Download ticket feature is under development");
  };

  const handleGoBack = () => {
    navigate("/booking-history");
  };

  const handleModifyBooking = () => {
    navigate(`/modify-booking/${booking?.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-50 dark:bg-black dark:bg-none">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">
              Loading booking details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-50 dark:bg-black">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Booking Not Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              The booking you're looking for doesn't exist.
            </p>
            <Button onClick={handleGoBack}>Go Back to History</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-50 dark:bg-black dark:bg-none">
      <Navbar />

      {/* Header Section */}
      <div className="pt-40 pb-32 relative">
        {/* Background Image - only in light mode */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat dark:hidden"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />

        {/* Dark mode background */}
        <div className="absolute inset-0 bg-black hidden dark:block" />

        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-pink-50 to-transparent dark:from-black dark:to-transparent pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <Button
            variant="outline"
            onClick={handleGoBack}
            className="mb-6 bg-white/80 hover:bg-white border-white/50 opacity-0 animate-[fadeInDown_0.7s_ease-out_0.1s_forwards]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to History
          </Button>

          <h1 className="text-5xl font-bold text-foreground/80 dark:text-white mb-3 opacity-0 animate-[fadeInDown_0.7s_ease-out_0.2s_forwards]">
            Booking Details
          </h1>
          <p className="text-xl text-foreground/60 dark:text-gray-300 opacity-0 animate-[fadeInDown_0.7s_ease-out_0.4s_forwards]">
            Booking Code: {booking.ticketCode}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 pb-8 -mt-16 relative z-10">
        {/* Booking Status Card */}
        <div className="opacity-0 animate-[fadeInUp_0.8s_ease-out_0.3s_forwards]">
          <div className="bg-white dark:bg-black rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <CheckCircle2 className="w-8 h-8 text-success" />
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Booking Confirmed
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Booked on {formatDateTime(booking.createdAt)}
                  </p>
                </div>
              </div>
              {getStatusBadge(booking.status)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Trip Information */}
            <div className="opacity-0 animate-[fadeInUp_0.8s_ease-out_0.4s_forwards]">
              <div className="bg-white dark:bg-black rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  Trip Information
                </h3>

                {/* Route */}
                <div className="flex items-center justify-between mb-8">
                  <div className="w-50 flex-shrink-0">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {booking.pickupStop.location.city}
                    </div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-gray-300 mt-1">
                      {dayjs(booking.trip.startTime).format("HH:mm")}
                    </div>
                  </div>

                  <div className="flex-1 px-8 text-center">
                    <div className="flex items-center justify-center gap-3 mb-1">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <div className="h-0.5 w-full border-t-2 border-dashed border-gray-300"></div>
                      <MapPin className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="text-sm text-gray-500 flex items-center justify-center gap-1">
                      <Clock className="w-4 h-4" />
                      {booking.route?.name || booking.trip.tripName}
                    </div>
                  </div>

                  <div className="text-right w-40 flex-shrink-0">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {booking.dropoffStop.location.city}
                    </div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-gray-300 mt-1">
                      Arrival
                    </div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Travel Date
                        </p>
                        <p className="text-base font-semibold text-gray-900 dark:text-white">
                          {formatDate(booking.trip.startTime)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Ticket className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Seat Number
                        </p>
                        <p className="text-base font-semibold text-gray-900 dark:text-white">
                          {booking.seat.seatNumber}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-gray-400 rounded-sm flex items-center justify-center">
                        <span className="text-white text-xs font-bold">B</span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Bus Number
                        </p>
                        <p className="text-base font-semibold text-gray-900 dark:text-white">
                          {booking.trip.bus.plate}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-gray-400 rounded-sm flex items-center justify-center">
                        <span className="text-white text-xs font-bold">T</span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Bus Type
                        </p>
                        <p className="text-base font-semibold text-gray-900 dark:text-white">
                          {booking.trip.bus.busType}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Passenger Information */}
            <div className="opacity-0 animate-[fadeInUp_0.8s_ease-out_0.5s_forwards]">
              <div className="bg-white dark:bg-black rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  Passenger Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Full Name
                      </p>
                      <p className="text-base font-semibold text-gray-900 dark:text-white">
                        {booking.customerInfo.fullName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Phone Number
                      </p>
                      <p className="text-base font-semibold text-gray-900 dark:text-white">
                        {booking.customerInfo.phoneNumber}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 md:col-span-2">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Email
                      </p>
                      <p className="text-base font-semibold text-gray-900 dark:text-white">
                        {booking.customerInfo.email}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Pickup & Dropoff Locations */}
            <div className="opacity-0 animate-[fadeInUp_0.8s_ease-out_0.6s_forwards]">
              <div className="bg-white dark:bg-black rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  Pickup & Dropoff
                </h3>

                <div className="space-y-6">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-success rounded-full flex items-center justify-center mt-1">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Pickup Location
                      </p>
                      <p className="text-base font-semibold text-gray-900 dark:text-white">
                        {booking.pickupStop.location.name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-error rounded-full flex items-center justify-center mt-1">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Dropoff Location
                      </p>
                      <p className="text-base font-semibold text-gray-900 dark:text-white">
                        {booking.dropoffStop.location.name}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Payment Summary */}
            <div className="opacity-0 animate-[fadeInUp_0.8s_ease-out_0.7s_forwards]">
              <div className="bg-white dark:bg-black rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  Payment Summary
                </h3>

                <div className="space-y-4">
                  <div className="border-t pt-4 flex justify-between text-xl font-bold text-gray-900 dark:text-white">
                    <span>Total Price</span>
                    <span className="text-success">
                      {formatCurrency(booking.price)}
                    </span>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Payment Status
                        </p>
                        <p className="text-base font-semibold text-gray-900 dark:text-white">
                          {booking.status === "confirmed"
                            ? "Paid"
                            : booking.status === "pendingPayment"
                              ? "Pending"
                              : "Cancelled"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="opacity-0 animate-[fadeInUp_0.8s_ease-out_0.8s_forwards]">
              <div className="space-y-4">
                <Button
                  onClick={handleDownloadTicket}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-2xl font-semibold flex items-center justify-center gap-2"
                  disabled={booking.status === "cancelled"}
                >
                  <Download className="w-5 h-5" />
                  Download Ticket
                </Button>

                {booking.status !== "cancelled" && (
                  <Button
                    onClick={handleModifyBooking}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-2xl font-semibold flex items-center justify-center gap-2"
                  >
                    <Edit className="w-5 h-5" />
                    Modify Booking
                  </Button>
                )}

                <Button
                  onClick={handleGoBack}
                  variant="outline"
                  className="w-full py-3 rounded-2xl font-semibold"
                >
                  Back to Booking History
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
