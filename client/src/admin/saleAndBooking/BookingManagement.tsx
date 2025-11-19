import { useState, useMemo } from "react";
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
  DollarSign,
  TrendingUp,
  CalendarDays,
} from "lucide-react";

import { StatCard, BookingDetailModal } from "@/components/admin";

export interface CustomerInfo {
  fullName: string;
  email: string;
  phoneNumber: string;
  identityCard?: string;
}

export interface Booking {
  id: string;
  ticketCode: string;
  customerInfo: CustomerInfo;
  tripName: string;
  routeName: string;
  seatNumber: string;
  price: number;
  status: "pending_payment" | "confirmed" | "cancelled";
  createdAt: string;
  paymentGateway?: string;
}

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const MOCK_BOOKINGS: Booking[] = [
  {
    id: "b1",
    ticketCode: "VEX-8823",
    customerInfo: {
      fullName: "Nguyen Van An",
      email: "an.nguyen@gmail.com",
      phoneNumber: "0909123456",
    },
    tripName: "SG-DL-08:00",
    routeName: "Saigon - Da Lat",
    seatNumber: "A1",
    price: 350000,
    status: "confirmed",
    createdAt: new Date().toISOString(),
    paymentGateway: "Momo",
  },
  {
    id: "b2",
    ticketCode: "VEX-9912",
    customerInfo: {
      fullName: "Tran Thi Bich",
      email: "bich.tran@email.com",
      phoneNumber: "0912333444",
    },
    tripName: "DN-SG-22:00",
    routeName: "Da Nang - Saigon",
    seatNumber: "B8",
    price: 600000,
    status: "confirmed",
    createdAt: "2025-11-01T10:30:00Z",
    paymentGateway: "PayOS",
  },
  {
    id: "b3",
    ticketCode: "VEX-7721",
    customerInfo: {
      fullName: "Le Hoang Nam",
      email: "nam.le@gmail.com",
      phoneNumber: "0988777666",
    },
    tripName: "NT-SG-14:00",
    routeName: "Nha Trang - Saigon",
    seatNumber: "A5",
    price: 450000,
    status: "cancelled",
    createdAt: "2025-10-18T15:45:00Z",
    paymentGateway: "Zalopay",
  },
];

const BookingManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const stats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const todayStr = now.toISOString().split("T")[0];

    return MOCK_BOOKINGS.reduce(
      (acc, booking) => {
        if (booking.status !== "confirmed") return acc;

        const bookingDate = new Date(booking.createdAt);
        const bookingDateStr = bookingDate.toISOString().split("T")[0];

        acc.totalRevenue += booking.price;

        if (
          bookingDate.getMonth() === currentMonth &&
          bookingDate.getFullYear() === currentYear
        ) {
          acc.monthlyRevenue += booking.price;
        }

        if (bookingDateStr === todayStr) {
          acc.dailyRevenue += booking.price;
        }

        return acc;
      },
      { totalRevenue: 0, monthlyRevenue: 0, dailyRevenue: 0 }
    );
  }, []);

  const filteredBookings = useMemo(() => {
    return MOCK_BOOKINGS.filter((booking) => {
      const matchesSearch =
        booking.ticketCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.customerInfo.fullName
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        booking.customerInfo.phoneNumber.includes(searchTerm);

      const matchesStatus =
        statusFilter === "all" || booking.status === statusFilter;

      let matchesDate = true;
      if (dateFilter) {
        const bookingDate = new Date(booking.createdAt)
          .toISOString()
          .split("T")[0];
        matchesDate = bookingDate === dateFilter;
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [searchTerm, statusFilter, dateFilter]);

  const handleViewDetail = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsDetailOpen(true);
  };

  const handleCancelBooking = (id: string) => {
    if (confirm("Are you sure you want to cancel this ticket?")) {
      console.log("Cancel booking id:", id);
    }
  };

  return (
    <div className="p-6 space-y-6 min-h-screen font-sans text-gray-900">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Booking Management</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Revenue (Today)"
          value={formatCurrency(stats.dailyRevenue)}
          icon={DollarSign}
          description="Total earnings from today"
        />
        <StatCard
          title="Revenue (This Month)"
          value={formatCurrency(stats.monthlyRevenue)}
          icon={CalendarDays}
          description="Total earnings this month"
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          icon={TrendingUp}
          description="Lifetime earnings"
        />
        <StatCard
          title="Active Bookings"
          value={MOCK_BOOKINGS.filter((b) => b.status === "confirmed").length}
          icon={Ticket}
          description="Tickets sold & valid"
        />
      </div>

      <div className="bg-white p-4 rounded-lg border shadow-sm flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="relative w-full lg:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search Ticket ID, Name, Phone..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          <div className="relative w-full sm:w-auto">
            <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="date"
              className="w-full sm:w-40 pl-10 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>

          <div className="relative w-full sm:w-auto">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              className="w-full sm:w-48 pl-10 pr-8 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="confirmed">Confirmed (Paid)</option>
              <option value="pending_payment">Pending Payment</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 font-medium border-b">
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
            <tbody className="divide-y">
              {filteredBookings.map((booking) => (
                <tr
                  key={booking.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-blue-600 whitespace-nowrap">
                    {booking.ticketCode}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">
                      {booking.customerInfo.fullName}
                    </div>
                    <div className="text-xs text-gray-500">
                      {booking.customerInfo.phoneNumber}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-gray-900">
                      <MapPin className="w-3 h-3" /> {booking.routeName}
                    </div>
                    <div className="text-xs text-gray-500 ml-4">
                      {booking.tripName}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <Armchair className="w-3 h-3 text-gray-500" />
                      <span className="font-semibold">
                        {booking.seatNumber}
                      </span>
                    </div>
                    <div className="text-green-600 font-medium">
                      {formatCurrency(booking.price)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        booking.status === "confirmed"
                          ? "bg-green-100 text-green-800 border-green-200"
                          : booking.status === "pending_payment"
                          ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                          : "bg-red-100 text-red-800 border-red-200"
                      }`}
                    >
                      {booking.status === "confirmed" ? (
                        <CheckCircle className="w-3 h-3 mr-1" />
                      ) : booking.status === "pending_payment" ? (
                        <Clock className="w-3 h-3 mr-1" />
                      ) : (
                        <XCircle className="w-3 h-3 mr-1" />
                      )}
                      {booking.status === "confirmed"
                        ? "Paid"
                        : booking.status === "pending_payment"
                        ? "Pending"
                        : "Cancelled"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-xs whitespace-nowrap">
                    {formatDate(booking.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleViewDetail(booking)}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {booking.status !== "cancelled" && (
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full"
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
