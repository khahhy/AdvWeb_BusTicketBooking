import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  MapPin,
  Clock,
  Ticket,
  Download,
  Eye,
  Star,
  Edit,
} from "lucide-react";
import Navbar from "@/components/common/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Footer from "@/components/dashboard/Footer";
import backgroundImage from "@/assets/images/background.png";
import dayjs from "dayjs";

interface BookingHistoryItem {
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

// Mock data for booking history
const mockBookingHistory: BookingHistoryItem[] = [
  {
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
  },
  {
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
  },
  {
    id: "3",
    bookingCode: "BUS345678",
    from: "Da Lat",
    to: "Ho Chi Minh City",
    date: "2024-10-20",
    departureTime: "15:00",
    arrivalTime: "21:30",
    seat: "C15",
    price: 280000,
    status: "cancelled",
    passengerName: "Nguyen Van A",
    duration: "6h 30m",
  },
  {
    id: "4",
    bookingCode: "BUS901234",
    from: "Hanoi",
    to: "Sapa",
    date: "2024-09-10",
    departureTime: "07:00",
    arrivalTime: "12:30",
    seat: "D05",
    price: 180000,
    status: "completed",
    passengerName: "Nguyen Van A",
    duration: "5h 30m",
  },
];

export default function BookingHistoryPage() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<BookingHistoryItem[]>([]);
  const [filter, setFilter] = useState<
    "all" | "completed" | "upcoming" | "cancelled"
  >("all");

  useEffect(() => {
    window.scrollTo(0, 0);
    setBookings(mockBookingHistory);
  }, []);

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("vi-VN") + " VND";
  };

  const formatDate = (dateStr: string) => {
    return dayjs(dateStr).format("DD/MM/YYYY");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
            Completed
          </Badge>
        );
      case "upcoming":
        return (
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
            Upcoming
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
            Cancelled
          </Badge>
        );
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  const filteredBookings = bookings.filter((booking) =>
    filter === "all" ? true : booking.status === filter,
  );
  const handleDownloadTicket = (bookingCode: string) => {
    console.log("Downloading ticket for:", bookingCode);
    // Implement download logic
  };

  const handleViewDetails = (bookingId: string) => {
    navigate(`/booking-details/${bookingId}`);
  };

  const handleRateTrip = (bookingId: string) => {
    navigate(`/feedback/${bookingId}`);
  };

  const handleModifyBooking = (bookingId: string) => {
    navigate(`/modify-booking/${bookingId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-50">
      {/* Navbar */}
      <Navbar />

      {/* Header Section */}
      <div
        className="pt-40 pb-32 bg-cover bg-center bg-no-repeat relative"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        {/* Gradient fade overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-pink-50 via-pink-50/60 via-pink-50/30 to-transparent pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <h1 className="text-5xl font-bold text-foreground/80 mb-3 opacity-0 animate-[fadeInDown_0.7s_ease-out_0.2s_forwards]">
            Booking History
          </h1>
          <p className="text-xl text-foreground/60 opacity-0 animate-[fadeInDown_0.7s_ease-out_0.4s_forwards]">
            View and manage your past and upcoming trips
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 pb-8 -mt-16 relative z-10">
        {/* Filter Tabs */}
        <div className="opacity-0 animate-[fadeInUp_0.8s_ease-out_0.3s_forwards]">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-wrap gap-4">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                onClick={() => setFilter("all")}
                className="rounded-full"
              >
                All Bookings
              </Button>
              <Button
                variant={filter === "upcoming" ? "default" : "outline"}
                onClick={() => setFilter("upcoming")}
                className="rounded-full"
              >
                Upcoming
              </Button>
              <Button
                variant={filter === "completed" ? "default" : "outline"}
                onClick={() => setFilter("completed")}
                className="rounded-full"
              >
                Completed
              </Button>
              <Button
                variant={filter === "cancelled" ? "default" : "outline"}
                onClick={() => setFilter("cancelled")}
                className="rounded-full"
              >
                Cancelled
              </Button>
            </div>
          </div>
        </div>

        {/* Booking Cards */}
        <div className="space-y-6">
          {filteredBookings.map((booking, index) => (
            <div
              key={booking.id}
              className="opacity-0 animate-[fadeInUp_0.8s_ease-out_0.5s_forwards]"
            >
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Booking Code: {booking.bookingCode}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Passenger: {booking.passengerName}
                    </p>
                  </div>
                  {getStatusBadge(booking.status)}
                </div>

                {/* Trip Info */}
                <div className="flex items-center justify-between mb-6">
                  <div className="w-48 flex-shrink-0">
                    <div className="text-xl font-bold text-gray-900">
                      {booking.from}
                    </div>
                    <div className="text-lg font-semibold text-gray-900 mt-1">
                      {booking.departureTime}
                    </div>
                  </div>

                  <div className="flex-1 px-8 text-center">
                    <div className="flex items-center justify-center gap-3 mb-1">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <div className="h-0.5 w-40 border-t-2 border-dashed border-gray-300"></div>
                      <MapPin className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="text-sm text-gray-500 flex items-center justify-center gap-1">
                      <Clock className="w-3 h-3" />
                      {booking.duration}
                    </div>
                  </div>

                  <div className="text-right w-48 flex-shrink-0">
                    <div className="text-xl font-bold text-gray-900">
                      {booking.to}
                    </div>
                    <div className="text-lg font-semibold text-gray-900 mt-1">
                      {booking.arrivalTime}
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200 mb-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Travel Date</p>
                    <p className="text-base font-semibold text-gray-900 flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(booking.date)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Seat</p>
                    <p className="text-base font-semibold text-gray-900 flex items-center gap-1">
                      <Ticket className="w-4 h-4" />
                      {booking.seat}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Price</p>
                    <p className="text-base font-semibold text-green-600">
                      {formatCurrency(booking.price)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewDetails(booking.id)}
                      className="flex items-center gap-1"
                    >
                      <Eye className="w-4 h-4" />
                      Details
                    </Button>
                    {booking.status === "upcoming" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleModifyBooking(booking.id)}
                        className="flex items-center gap-1 border-blue-300 text-blue-600 hover:bg-blue-50"
                      >
                        <Edit className="w-4 h-4" />
                        Modify
                      </Button>
                    )}
                    {booking.status === "completed" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRateTrip(booking.id)}
                        className="flex items-center gap-1 border-yellow-300 text-yellow-600 hover:bg-yellow-50"
                      >
                        <Star className="w-4 h-4" />
                        Rate
                      </Button>
                    )}
                    {booking.status !== "cancelled" && (
                      <Button
                        size="sm"
                        onClick={() =>
                          handleDownloadTicket(booking.bookingCode)
                        }
                        className="flex items-center gap-1"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredBookings.length === 0 && (
          <div className="opacity-0 animate-[fadeInUp_0.8s_ease-out_0.5s_forwards]">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
              <Ticket className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No bookings found
              </h3>
              <p className="text-gray-600 mb-6">
                {filter === "all"
                  ? "You haven't made any bookings yet."
                  : `No ${filter} bookings found.`}
              </p>
              <Button onClick={() => setFilter("all")} className="rounded-full">
                View All Bookings
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
