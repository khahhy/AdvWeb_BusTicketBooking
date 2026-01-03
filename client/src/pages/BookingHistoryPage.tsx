import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  MapPin,
  Clock,
  Ticket,
  Download,
  Eye,
  Edit,
  XCircle,
  Star,
} from "lucide-react";
import Navbar from "@/components/common/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Footer from "@/components/dashboard/Footer";
import { toast } from "sonner";
import backgroundImage from "@/assets/images/background.png";
import dayjs from "dayjs";
import { API_BASE_URL } from "@/lib/api";

interface Booking {
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
  };
  route: {
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

interface ReviewSummary {
  id: string;
  bookingId: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  status?: "visible" | "hidden" | "flagged";
  flaggedReason?: string | null;
}

export default function BookingHistoryPage() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewsByBookingId, setReviewsByBookingId] = useState<
    Record<string, ReviewSummary>
  >({});
  const [filter, setFilter] = useState<
    "all" | "confirmed" | "pendingPayment" | "cancelled" | "completed"
  >("all");

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchBookings();
  }, []);

  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}0/reviews/my`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch reviews");
      }

      const result = await response.json();
      const reviews = (result.data || []) as ReviewSummary[];
      const mapped = reviews.reduce<Record<string, ReviewSummary>>(
        (acc, review) => {
          acc[review.bookingId] = review;
          return acc;
        },
        {},
      );
      setReviewsByBookingId(mapped);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        toast.error("Please login to view booking history");
        navigate("/login");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/bookings/my-bookings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch bookings");
      }

      const result = await response.json();
      setBookings(result.data || []);
      fetchReviews();
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Unable to load booking history");
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

  const isBookingCompleted = (booking: Booking) => {
    const now = new Date();
    return (
      booking.status === "confirmed" &&
      new Date(booking.trip.startTime).getTime() < now.getTime()
    );
  };

  const getStatusBadge = (booking: Booking) => {
    if (isBookingCompleted(booking)) {
      return (
        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900 dark:text-emerald-200">
          Completed
        </Badge>
      );
    }

    switch (booking.status) {
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

  const filteredBookings = bookings.filter((booking) => {
    if (filter === "all") return true;
    if (filter === "completed") return isBookingCompleted(booking);
    return booking.status === filter;
  });

  const handleDownloadTicket = (bookingCode: string) => {
    console.log("Downloading ticket for:", bookingCode);
    toast.info("Download ticket feature is under development");
  };

  const handleViewDetails = (bookingId: string) => {
    navigate(`/booking-details/${bookingId}`);
  };

  const handleModifyBooking = (bookingId: string) => {
    navigate(`/modify-booking/${bookingId}`);
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        `${API_BASE_URL}/bookings/${bookingId}/cancel`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to cancel booking");
      }

      toast.success("Booking cancelled successfully");
      fetchBookings(); // Refresh list
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast.error(
        error instanceof Error ? error.message : "Unable to cancel booking",
      );
    }
  };

  const canModifyOrCancel = (booking: Booking) => {
    const now = new Date();
    const tripStartTime = new Date(booking.trip.startTime);
    return (
      booking.status !== "cancelled" &&
      booking.status !== "pendingPayment" &&
      tripStartTime > now
    );
  };

  const handleGiveFeedback = (bookingId: string) => {
    navigate(`/feedback/${bookingId}`);
  };

  const getFeedbackLabel = (review?: ReviewSummary) => {
    if (!review) return "Feedback";
    switch (review.status) {
      case "flagged":
        return "Feedback Pending";
      case "hidden":
        return "Feedback Hidden";
      case "visible":
      default:
        return "View Feedback";
    }
  };

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

        {/* Gradient fade overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-pink-50 to-transparent dark:from-black dark:to-transparent pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <h1 className="text-5xl font-bold text-black dark:text-white mb-3 opacity-0 animate-[fadeInDown_0.7s_ease-out_0.2s_forwards]">
            Booking History
          </h1>
          <p className="text-xl text-black/80 dark:text-white/80 opacity-0 animate-[fadeInDown_0.7s_ease-out_0.4s_forwards]">
            View and manage your past and upcoming trips
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 pb-8 -mt-16 relative z-10 dark:bg-black">
        {/* Filter Tabs */}
        <div className="opacity-0 animate-[fadeInUp_0.8s_ease-out_0.3s_forwards]">
          <div className="bg-white dark:bg-black rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <div className="flex flex-wrap gap-4">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                onClick={() => setFilter("all")}
                className="rounded-full"
              >
                All Bookings
              </Button>
              <Button
                variant={filter === "confirmed" ? "default" : "outline"}
                onClick={() => setFilter("confirmed")}
                className="rounded-full"
              >
                Confirmed
              </Button>
              <Button
                variant={filter === "pendingPayment" ? "default" : "outline"}
                onClick={() => setFilter("pendingPayment")}
                className="rounded-full"
              >
                Pending Payment
              </Button>
              <Button
                variant={filter === "cancelled" ? "default" : "outline"}
                onClick={() => setFilter("cancelled")}
                className="rounded-full"
              >
                Cancelled
              </Button>
              <Button
                variant={filter === "completed" ? "default" : "outline"}
                onClick={() => setFilter("completed")}
                className="rounded-full"
              >
                Completed
              </Button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredBookings.length === 0 && (
          <div className="text-center py-12">
            <Ticket className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No bookings found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {filter === "all"
                ? "You don't have any bookings yet. Start searching for trips!"
                : "No bookings found with this filter"}
            </p>
            {filter === "all" && (
              <Button onClick={() => navigate("/")}>Search Trips</Button>
            )}
          </div>
        )}

        {/* Booking Cards */}
        {!loading && filteredBookings.length > 0 && (
          <div className="space-y-6">
            {filteredBookings.map((booking) => (
              <div
                key={booking.id}
                className="opacity-0 animate-[fadeInUp_0.8s_ease-out_0.5s_forwards]"
              >
                <div className="bg-white dark:bg-black rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        Booking Code: {booking.ticketCode}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Passenger: {booking.customerInfo.fullName}
                      </p>
                    </div>
                    {getStatusBadge(booking)}
                  </div>

                  {/* Trip Info */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-48 flex-shrink-0">
                      <div className="text-xl font-bold text-gray-900 dark:text-white">
                        {booking.pickupStop.location.city}
                      </div>
                      <div className="text-lg font-semibold text-gray-900 dark:text-gray-300 mt-1">
                        {dayjs(booking.trip.startTime).format("HH:mm")}
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
                        {booking.route.name}
                      </div>
                    </div>

                    <div className="text-right w-48 flex-shrink-0">
                      <div className="text-xl font-bold text-gray-900 dark:text-white">
                        {booking.dropoffStop.location.city}
                      </div>
                      <div className="text-lg font-semibold text-gray-900 dark:text-gray-300 mt-1">
                        Arrival
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                          Travel Date
                        </p>
                        <p className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(booking.trip.startTime)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                          Seat
                        </p>
                        <p className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                          <Ticket className="w-4 h-4" />
                          {booking.seat.seatNumber}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                          Price
                        </p>
                        <p className="text-base font-semibold text-green-600">
                          {formatCurrency(booking.price)}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewDetails(booking.id)}
                        className="flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        Details
                      </Button>
                      {booking.status === "pendingPayment" && (
                        <Button
                          size="sm"
                          onClick={() => navigate(`/payment/${booking.id}`)}
                          className="flex items-center gap-1"
                        >
                          Pay Now
                        </Button>
                      )}
                      {canModifyOrCancel(booking) && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleModifyBooking(booking.id)}
                            className="flex items-center gap-1 border-blue-300 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
                          >
                            <Edit className="w-4 h-4" />
                            Modify
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCancelBooking(booking.id)}
                            className="flex items-center gap-1 border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                          >
                            <XCircle className="w-4 h-4" />
                            Cancel
                          </Button>
                        </>
                      )}
                      {booking.status !== "cancelled" && (
                        <Button
                          size="sm"
                          onClick={() =>
                            handleDownloadTicket(booking.ticketCode)
                          }
                          className="flex items-center gap-1"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </Button>
                      )}
                      {isBookingCompleted(booking) && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleGiveFeedback(booking.id)}
                          className="flex items-center gap-1 border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-200 dark:hover:bg-amber-900"
                        >
                          <Star className="w-4 h-4" />
                          {getFeedbackLabel(reviewsByBookingId[booking.id])}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
