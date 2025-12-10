import {
  Users,
  Ticket,
  Wallet,
  TrendingUp,
  MapPin,
  Clock,
  ArrowUpRight,
  Bus,
  BarChart3,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import { Link } from "react-router-dom";
import { StatCard } from "@/components/admin";
import {
  useGetBookingStatsQuery,
  useGetRevenueChartQuery,
  useGetBookingTrendsQuery,
  useGetOccupancyRateQuery,
  useGetBookingsQuery,
} from "@/store/api/bookingApi";
import { useGetTopPerformingRoutesQuery } from "@/store/api/routesApi";
import { useGetUserStatsQuery } from "@/store/api/usersApi";
import { useGetUpcomingTripsQuery } from "@/store/api/tripsApi";
import { format } from "date-fns";
import { TopPerformingRoute } from "@/store/type/routesType";

const COLORS = [
  "var(--color-primary)",
  "var(--color-secondary)",
  "var(--color-success)",
  "var(--color-accent)",
  "#8884d8",
];

const formatVND = (amount: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    amount,
  );

const AdminDashboard = () => {
  // Fetch Stats
  const { data: bookingStatsResponse } = useGetBookingStatsQuery();
  const { data: userStatsResponse } = useGetUserStatsQuery();
  const { data: occupancyResponse } = useGetOccupancyRateQuery();

  // Fetch Charts
  const { data: revenueChartResponse } = useGetRevenueChartQuery();
  const { data: trendResponse } = useGetBookingTrendsQuery();

  const { data: topRoutesData } = useGetTopPerformingRoutesQuery(5);

  // Fetch Recent Transactions
  const { data: recentBookingsResponse } = useGetBookingsQuery({
    page: 1,
    limit: 5,
  });

  // Fetch Upcoming Trips
  const { data: upcomingTrips } = useGetUpcomingTripsQuery(5);

  const stats = bookingStatsResponse?.data;
  const userStats = userStatsResponse?.data;

  const occupancy = occupancyResponse?.data;
  const revenueChart = revenueChartResponse?.data || [];
  const bookingTrends = trendResponse?.data || [];
  const recentBookings = recentBookingsResponse?.data || [];
  const topRoutes: TopPerformingRoute[] = topRoutesData || [];

  return (
    <div className="space-y-6 min-h-screen font-sans text-gray-900 dark:text-white pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dashboard Overview
          </h1>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={formatVND(stats?.revenue?.total || 0)}
          icon={Wallet}
          description={`Today: ${formatVND(stats?.revenue?.today || 0)}`}
        />
        <StatCard
          title="Total Bookings"
          value={stats?.bookings?.total.toString() || "0"}
          icon={Ticket}
          description={`+${stats?.bookings?.today || 0} today`}
        />
        <StatCard
          title="Total Users"
          value={userStats?.total?.value?.toLocaleString() || "0"}
          icon={Users}
          description={`${userStats?.active?.value || 0} active users`}
        />
        <StatCard
          title="Occupancy Rate"
          value={`${occupancy?.averageOccupancy || 0}%`}
          icon={TrendingUp}
          description={`Avg of ${occupancy?.totalTrips || 0} trips`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl border dark:border-gray-700 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">
              Revenue Analytics
            </h2>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueChart}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#E5E7EB"
                />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6B7280", fontSize: 12 }}
                  dy={10}
                  tickFormatter={(value) => format(new Date(value), "dd/MM")}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6B7280", fontSize: 12 }}
                  width={80}
                  tickFormatter={(value) =>
                    new Intl.NumberFormat("vi-VN", {
                      notation: "compact",
                      compactDisplay: "short",
                    }).format(value)
                  }
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-surface)",
                    borderRadius: "8px",
                    border: "1px solid #E5E7EB",
                  }}
                  formatter={(value: number) => formatVND(value)}
                  labelFormatter={(label) =>
                    format(new Date(label), "dd/MM/yyyy")
                  }
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--color-primary)"
                  strokeWidth={3}
                  dot={{
                    r: 4,
                    fill: "var(--color-primary)",
                    strokeWidth: 2,
                    stroke: "#fff",
                  }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border dark:border-gray-700 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-6">
            Top Routes
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topRoutes}
                layout="vertical"
                margin={{ left: 0, right: 30 }}
              >
                <XAxis type="number" hide />
                <YAxis
                  dataKey="routeName"
                  type="category"
                  width={100}
                  tick={{ fontSize: 11, fill: "#6B7280" }}
                  interval={0}
                />
                <Tooltip
                  cursor={{ fill: "transparent" }}
                  formatter={(value: number) => [
                    `${value} vé`,
                    "Total Bookings",
                  ]}
                />
                <Bar
                  dataKey="totalBookings"
                  radius={[0, 4, 4, 0]}
                  barSize={20}
                  label={{ position: "right", fill: "#6B7280", fontSize: 10 }}
                >
                  {topRoutes.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-1">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border dark:border-gray-700 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Booking Trends (Peak Hours)
            </h2>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={bookingTrends}>
                <defs>
                  <linearGradient
                    id="colorBookings"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="var(--color-primary)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-primary)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#E5E7EB"
                />
                <XAxis
                  dataKey="hour"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6B7280", fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6B7280", fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-surface)",
                    borderRadius: "8px",
                    border: "1px solid #E5E7EB",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="bookings"
                  stroke="var(--color-primary)"
                  fillOpacity={1}
                  fill="url(#colorBookings)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">
              Recent Transactions
            </h2>
            <Link
              to="/admin/sales/transactions"
              className="text-sm text-primary font-medium hover:underline flex items-center gap-1"
            >
              View All <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                <tr>
                  <th className="px-6 py-3">Code</th>
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3">Route</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-gray-700">
                {recentBookings.length > 0 ? (
                  recentBookings.map((booking) => (
                    <tr
                      key={booking.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-6 py-4 font-medium text-primary">
                        {booking.ticketCode || booking.id.slice(0, 8)}
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                        {booking.customerInfo?.fullName || "Guest"}
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                        {booking.route?.name || "N/A"}
                      </td>
                      <td className="px-6 py-4 font-medium dark:text-white">
                        {formatVND(booking.price)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize border
                        ${
                          booking.status === "confirmed"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : booking.status === "pendingPayment"
                              ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                              : "bg-red-50 text-red-700 border-red-200"
                        }`}
                        >
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-4 text-gray-500">
                      No recent transactions found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">
              Upcoming Trips
            </h2>
            <Clock className="w-4 h-4 text-gray-400" />
          </div>
          <div className="space-y-4">
            {upcomingTrips &&
              upcomingTrips.map((trip) => (
                <div
                  key={trip.id}
                  className="flex items-center p-3 border dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="bg-primary-50 p-2.5 rounded-lg text-primary mr-3 flex flex-col items-center min-w-[60px]">
                    <span className="text-xs font-bold">
                      {format(new Date(trip.startTime), "HH:mm")}
                    </span>
                    <Bus className="w-4 h-4 mt-1" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-gray-900 dark:text-white truncate">
                      {trip.route}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" /> {trip.busPlate}
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-xs font-bold px-2 py-0.5 rounded mb-1 inline-block capitalize
                     ${
                       trip.status === "Boarding"
                         ? "bg-green-100 text-green-700 animate-pulse"
                         : trip.status === "Full"
                           ? "bg-red-100 text-red-700"
                           : "bg-gray-100 text-gray-700"
                     }`}
                    >
                      {trip.status}
                    </div>

                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {trip.bookedSeats}/{trip.totalSeats} seats
                    </div>
                  </div>
                </div>
              ))}
          </div>
          <Link
            to="/admin/bus-operations/trips"
            className="block w-full text-center mt-5 py-2 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 border dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 font-medium transition-colors"
          >
            View Full Schedule
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
