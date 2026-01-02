import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Eye,
  XCircle,
  Calendar as CalendarIcon,
  MapPin,
  Armchair,
  CheckCircle,
  Clock,
  Ticket,
  TrendingUp,
  DollarSign,
  CalendarDays,
} from "lucide-react";

import { StatCard, BookingDetailModal } from "@/components/admin";
import { formatDate } from "@/utils/formatDate";
import { formatCurrency } from "@/utils/formatCurrency";

// Import API Hooks & Types
import {
  useGetBookingsQuery,
  useCancelBookingMutation,
  useGetBookingStatsQuery,
} from "@/store/api/bookingApi";
import { Booking, BookingStatus } from "@/store/type/bookingType";

// --- Helper Functions ---
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const BookingManagement = () => {
  // --- Local State ---
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // --- API Queries ---
  const { data: bookingData, isLoading: isBookingsLoading } =
    useGetBookingsQuery({
      search: debouncedSearch || undefined,
      // FIX LỖI 1: Ép kiểu string sang BookingStatus
      status:
        statusFilter !== "all" ? (statusFilter as BookingStatus) : undefined,
      dateFrom: dateFilter || undefined,
      limit: 50,
    });

  const bookings = (bookingData?.data || []) as Booking[];

  const { data: statsData } = useGetBookingStatsQuery();
  const stats = statsData?.data;

  const [cancelBooking, { isLoading: isCancelling }] =
    useCancelBookingMutation();

  // --- Handlers ---
  const getCustomerName = (booking: Booking) => {
    return booking.customerInfo?.fullName || booking.user?.fullName || "N/A";
  };

  const getCustomerPhone = (booking: Booking) => {
    return (
      booking.customerInfo?.phoneNumber || booking.user?.phoneNumber || "N/A"
    );
  };

  const handleViewDetail = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsDetailOpen(true);
  };

  const handleCancelBooking = async (id: string) => {
    if (
      confirm(
        "Are you sure you want to cancel this ticket? This action cannot be undone.",
      )
    ) {
      try {
        await cancelBooking(id).unwrap();
        alert("Booking cancelled successfully!");
      } catch (error) {
        console.error("Failed to cancel:", error);
        alert("Failed to cancel booking. Please try again.");
      }
    }
  };

  return (
    <div className="p-6 space-y-6 min-h-screen font-sans text-gray-900 dark:text-white">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Booking Management
        </h1>
      </div>

      {/* STATS SECTION */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Revenue (Today)"
          value={formatCurrency(stats?.revenue?.today || 0)}
          icon={DollarSign}
          description="Earnings from today"
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats?.revenue?.total || 0)}
          icon={TrendingUp}
          description="Lifetime earnings"
        />
        <StatCard
          title="Bookings (Today)"
          value={stats?.bookings?.today || 0}
          icon={CalendarDays}
          description="Tickets sold today"
        />
        <StatCard
          title="Total Bookings"
          value={stats?.bookings?.total || 0}
          icon={Ticket}
          description="All time tickets sold"
        />
      </div>

      {/* FILTERS SECTION */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700 shadow-sm flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="relative w-full lg:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search Ticket ID, Name, Phone..."
            className="w-full pl-10 pr-4 py-2 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          <div className="relative w-full sm:w-auto">
            <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="date"
              className="w-full sm:w-40 pl-10 pr-3 py-2 border dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-700"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>

          <div className="relative w-full sm:w-auto">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              className="w-full sm:w-48 pl-10 pr-8 py-2 border dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white dark:bg-gray-700 dark:text-white"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              {/* FIX VALUE: Sử dụng đúng giá trị Enum hoặc chuỗi khớp với Enum */}
              <option value="confirmed">Confirmed (Paid)</option>
              <option value="pendingPayment">Pending Payment</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {isBookingsLoading ? (
            <div className="p-8 text-center text-gray-500">
              Loading bookings...
            </div>
          ) : bookings.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No bookings found matching your criteria.
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-medium border-b dark:border-gray-600">
                <tr>
                  <th className="px-6 py-3 whitespace-nowrap">Ticket Code</th>
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3">Journey</th>
                  <th className="px-6 py-3">Seat & Price</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Booking Date</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-gray-700">
                {bookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-blue-600 dark:text-blue-400 whitespace-nowrap">
                      {booking.ticketCode || "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {getCustomerName(booking)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {getCustomerPhone(booking)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-gray-900 dark:text-white">
                        <MapPin className="w-3 h-3" />{" "}
                        {booking.route?.name || "Unknown Route"}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 ml-4">
                        {booking.trip?.tripName || "Unknown Trip"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Armchair className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                        <span className="font-semibold dark:text-white">
                          {booking.seat?.seatNumber || "?"}
                        </span>
                      </div>
                      <div className="text-green-600 dark:text-green-400 font-medium">
                        {formatCurrency(booking.price)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {/* FIX LỖI 2: So sánh bằng Enum thay vì chuỗi cứng */}
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          booking.status === BookingStatus.confirmed
                            ? "bg-green-100 text-green-800 border-green-200"
                            : booking.status === BookingStatus.pendingPayment
                              ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                              : "bg-red-100 text-red-800 border-red-200"
                        }`}
                      >
                        {booking.status === BookingStatus.confirmed ? (
                          <CheckCircle className="w-3 h-3 mr-1" />
                        ) : booking.status === BookingStatus.pendingPayment ? (
                          <Clock className="w-3 h-3 mr-1" />
                        ) : (
                          <XCircle className="w-3 h-3 mr-1" />
                        )}
                        {/* Hiển thị text đẹp hơn */}
                        {booking.status === BookingStatus.confirmed
                          ? "Paid"
                          : booking.status === BookingStatus.pendingPayment
                            ? "Pending"
                            : "Cancelled"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-xs whitespace-nowrap">
                      {formatDate(booking.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleViewDetail(booking)}
                          className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/50 rounded-full"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {booking.status !== BookingStatus.cancelled && (
                          <button
                            onClick={() => handleCancelBooking(booking.id)}
                            disabled={isCancelling}
                            className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-full disabled:opacity-50"
                            title="Cancel Ticket"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <BookingDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        booking={selectedBooking}
      />
    </div>
  );
};

export default BookingManagement;
