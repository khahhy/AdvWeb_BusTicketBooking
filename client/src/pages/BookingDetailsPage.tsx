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
  Star,
  Edit,
} from "lucide-react";
import Navbar from "@/components/common/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Footer from "@/components/dashboard/Footer";
import backgroundImage from "@/assets/images/background.png";
import dayjs from "dayjs";

interface BookingDetails {
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
  busNumber: string;
  busType: string;
  contactPhone: string;
  contactEmail: string;
  pickupLocation: string;
  dropoffLocation: string;
  paymentMethod: string;
  bookingDate: string;
  insuranceFee: number;
  serviceFee: number;
  totalAmount: number;
}

// Mock data for booking details
const mockBookingDetails: { [key: string]: BookingDetails } = {
  "1": {
    id: "1",
    bookingCode: "BUS123456",
    from: "Ho Chi Minh City",
    to: "Da Lat",
    date: "2024-11-15",
    departureTime: "08:00",
    arrivalTime: "14:30",
    seat: "A12",
    price: 280000,
    status: "completed",
    passengerName: "Nguyen Van A",
    duration: "6h 30m",
    busNumber: "SGN-DAL-001",
    busType: "Limousine 22 seats",
    contactPhone: "+84 901 234 567",
    contactEmail: "nguyenvana@email.com",
    pickupLocation: "Ben xe Mien Dong, 292 Đinh Bộ Lĩnh, Bình Thạnh",
    dropoffLocation: "Ben xe Da Lat, 01 Tô Hiến Thành, Phường 3",
    paymentMethod: "Credit Card",
    bookingDate: "2024-11-10",
    insuranceFee: 5000,
    serviceFee: 15000,
    totalAmount: 300000,
  },
  "2": {
    id: "2",
    bookingCode: "BUS789012",
    from: "Ho Chi Minh City",
    to: "Nha Trang",
    date: "2024-12-01",
    departureTime: "22:00",
    arrivalTime: "06:30",
    seat: "B08",
    price: 320000,
    status: "upcoming",
    passengerName: "Nguyen Van A",
    duration: "8h 30m",
    busNumber: "SGN-NTR-003",
    busType: "Sleeper Bus 34 beds",
    contactPhone: "+84 901 234 567",
    contactEmail: "nguyenvana@email.com",
    pickupLocation: "Ben xe Mien Dong, 292 Đinh Bộ Lĩnh, Bình Thạnh",
    dropoffLocation: "Ben xe Nha Trang, 23 Thang 10, Vĩnh Hải",
    paymentMethod: "Bank Transfer",
    bookingDate: "2024-11-25",
    insuranceFee: 8000,
    serviceFee: 17000,
    totalAmount: 345000,
  },
};

export default function BookingDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);

    // Simulate API call
    setTimeout(() => {
      if (id && mockBookingDetails[id]) {
        setBooking(mockBookingDetails[id]);
      }
      setLoading(false);
    }, 500);
  }, [id]);

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
      case "completed":
        return (
          <Badge className="bg-success-100 text-success hover:bg-success-100 dark:bg-green-900 dark:text-green-300">
            Completed
          </Badge>
        );
      case "upcoming":
        return (
          <Badge className="bg-primary-50 text-primary hover:bg-primary-50 dark:bg-blue-900 dark:text-blue-300">
            Upcoming
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="bg-error-50 text-error hover:bg-error-50 dark:bg-red-900 dark:text-red-300">
            Cancelled
          </Badge>
        );
      default:
        return <Badge className="dark:text-white">Unknown</Badge>;
    }
  };

  const handleDownloadTicket = () => {
    console.log("Downloading ticket for:", booking?.bookingCode);
    // Implement download logic
  };

  const handleGoBack = () => {
    navigate("/booking-history");
  };

  const handleRateTrip = () => {
    navigate(`/feedback/${booking?.id}`);
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
            <p className="text-gray-600 dark:text-gray-400">Loading booking details...</p>
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
            Booking Code: {booking.bookingCode}
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
                    Booked on {formatDateTime(booking.bookingDate)}
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
                      {booking.from}
                    </div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-gray-300 mt-1">
                      {booking.departureTime}
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
                      {booking.duration}
                    </div>
                  </div>

                  <div className="text-right w-40 flex-shrink-0">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {booking.to}
                    </div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-gray-300 mt-1">
                      {booking.arrivalTime}
                    </div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Travel Date</p>
                        <p className="text-base font-semibold text-gray-900 dark:text-white">
                          {formatDate(booking.date)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Ticket className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Seat Number</p>
                        <p className="text-base font-semibold text-gray-900 dark:text-white">
                          {booking.seat}
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
                        <p className="text-sm text-gray-600 dark:text-gray-400">Bus Number</p>
                        <p className="text-base font-semibold text-gray-900 dark:text-white">
                          {booking.busNumber}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-gray-400 rounded-sm flex items-center justify-center">
                        <span className="text-white text-xs font-bold">T</span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Bus Type</p>
                        <p className="text-base font-semibold text-gray-900 dark:text-white">
                          {booking.busType}
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
                      <p className="text-sm text-gray-600 dark:text-gray-400">Full Name</p>
                      <p className="text-base font-semibold text-gray-900 dark:text-white">
                        {booking.passengerName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Phone Number</p>
                      <p className="text-base font-semibold text-gray-900 dark:text-white">
                        {booking.contactPhone}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 md:col-span-2">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                      <p className="text-base font-semibold text-gray-900 dark:text-white">
                        {booking.contactEmail}
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
                      <p className="text-sm text-gray-600 dark:text-gray-400">Pickup Location</p>
                      <p className="text-base font-semibold text-gray-900 dark:text-white">
                        {booking.pickupLocation}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-error rounded-full flex items-center justify-center mt-1">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Dropoff Location</p>
                      <p className="text-base font-semibold text-gray-900 dark:text-white">
                        {booking.dropoffLocation}
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
                  <div className="flex justify-between text-gray-700 dark:text-gray-300">
                    <span>Ticket Price</span>
                    <span>{formatCurrency(booking.price)}</span>
                  </div>

                  <div className="flex justify-between text-gray-700 dark:text-gray-300">
                    <span>Insurance Fee</span>
                    <span>{formatCurrency(booking.insuranceFee)}</span>
                  </div>

                  <div className="flex justify-between text-gray-700 dark:text-gray-300">
                    <span>Service Fee</span>
                    <span>{formatCurrency(booking.serviceFee)}</span>
                  </div>

                  <div className="border-t pt-4 flex justify-between text-xl font-bold text-gray-900 dark:text-white">
                    <span>Total Paid</span>
                    <span className="text-success">
                      {formatCurrency(booking.totalAmount)}
                    </span>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Payment Method</p>
                        <p className="text-base font-semibold text-gray-900 dark:text-white">
                          {booking.paymentMethod}
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

                {booking.status === "upcoming" && (
                  <Button
                    onClick={handleModifyBooking}
                    className="w-full bg-primary hover:bg-primary text-white py-3 rounded-2xl font-semibold flex items-center justify-center gap-2"
                  >
                    <Edit className="w-5 h-5" />
                    Modify Booking
                  </Button>
                )}

                {booking.status === "completed" && (
                  <Button
                    onClick={handleRateTrip}
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-3 rounded-2xl font-semibold flex items-center justify-center gap-2"
                  >
                    <Star className="w-5 h-5" />
                    Rate This Trip
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
