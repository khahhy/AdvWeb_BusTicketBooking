import {
  Users,
  Ticket,
  Wallet,
  TrendingUp,
  Calendar,
  MapPin,
  Clock,
  ArrowUpRight,
  Bus,
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
} from "recharts";
import { StatCard } from "@/components/admin";

const REVENUE_DATA = [
  { name: "Mon", revenue: 4000000 },
  { name: "Tue", revenue: 3000000 },
  { name: "Wed", revenue: 5500000 },
  { name: "Thu", revenue: 4800000 },
  { name: "Fri", revenue: 9000000 },
  { name: "Sat", revenue: 12000000 },
  { name: "Sun", revenue: 11500000 },
];

const POPULAR_ROUTES = [
  { name: "SG - Da Lat", value: 120, color: "var(--color-primary)" },
  { name: "SG - Nha Trang", value: 98, color: "var(--color-secondary)" },
  { name: "Da Nang - Hue", value: 86, color: "var(--color-success)" },
  { name: "Ha Noi - Sapa", value: 65, color: "var(--color-accent)" },
];

const UPCOMING_TRIPS = [
  {
    id: 1,
    route: "Saigon - Da Lat",
    time: "14:00",
    bus: "59B-123.45",
    seats: "28/34",
    status: "Boarding",
  },
  {
    id: 2,
    route: "Da Nang - Hue",
    time: "14:30",
    bus: "43B-999.88",
    seats: "15/29",
    status: "Scheduled",
  },
  {
    id: 3,
    route: "Nha Trang - Saigon",
    time: "15:00",
    bus: "79B-555.66",
    seats: "34/34",
    status: "Full",
  },
];

const RECENT_BOOKINGS = [
  {
    id: "VEX-991",
    user: "Nguyen Van A",
    route: "SG - DL",
    amount: 350000,
    status: "confirmed",
  },
  {
    id: "VEX-992",
    user: "Tran Thi B",
    route: "DN - Hue",
    amount: 180000,
    status: "pending",
  },
  {
    id: "VEX-993",
    user: "Le C",
    route: "HN - Sapa",
    amount: 450000,
    status: "confirmed",
  },
  {
    id: "VEX-994",
    user: "Pham D",
    route: "SG - VT",
    amount: 120000,
    status: "cancelled",
  },
];

const formatVND = (amount: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    amount,
  );

const AdminDashboard = () => {
  return (
    <div className="space-y-6 min-h-screen font-sans text-gray-900 dark:text-white">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dashboard Overview
          </h1>
        </div>
        <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-2 rounded-lg border dark:border-gray-700 shadow-sm">
          <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {new Date().toLocaleDateString("en-GB")}
          </span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value="49,800,000 ₫"
          icon={Wallet}
          description="+12.5% from last month"
        />
        <StatCard
          title="Total Bookings"
          value="1,254"
          icon={Ticket}
          description="+8.2% from last month"
        />
        <StatCard
          title="Active Passengers"
          value="892"
          icon={Users}
          description="+120 new users this week"
        />
        <StatCard
          title="Occupancy Rate"
          value="78%"
          icon={TrendingUp}
          description="-2.4% since yesterday"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl border dark:border-gray-700 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">
              Revenue Analytics
            </h2>
            <select className="text-sm border dark:border-gray-600 rounded-md px-2 py-1 outline-none bg-gray-50 dark:bg-gray-700 dark:text-white">
              <option>Last 7 Days</option>
              <option>Last Month</option>
            </select>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={REVENUE_DATA}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#E5E7EB"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6B7280", fontSize: 12 }}
                  dy={10}
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
                  formatter={(value: number) => formatVND(value)}
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
                data={POPULAR_ROUTES}
                layout="vertical"
                margin={{ left: 0 }}
              >
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={100}
                  tick={{ fontSize: 11 }}
                  interval={0}
                />
                <Tooltip cursor={{ fill: "transparent" }} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={30}>
                  {POPULAR_ROUTES.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
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
            <button className="text-sm text-primary font-medium hover:underline flex items-center gap-1">
              View All <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                <tr>
                  <th className="px-6 py-3">ID</th>
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3">Route</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-gray-700">
                {RECENT_BOOKINGS.map((booking) => (
                  <tr
                    key={booking.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-6 py-4 font-medium text-primary">
                      {booking.id}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                      {booking.user}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                      {booking.route}
                    </td>
                    <td className="px-6 py-4 font-medium dark:text-white">
                      {formatVND(booking.amount)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize border
                        ${
                          booking.status === "confirmed"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : booking.status === "pending"
                              ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                              : "bg-red-50 text-red-700 border-red-200"
                        }`}
                      >
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
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
            {UPCOMING_TRIPS.map((trip) => (
              <div
                key={trip.id}
                className="flex items-center p-3 border dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="bg-primary-50 p-2.5 rounded-lg text-primary mr-3 flex flex-col items-center min-w-[60px]">
                  <span className="text-xs font-bold">{trip.time}</span>
                  <Bus className="w-4 h-4 mt-1" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-gray-900 dark:text-white truncate">
                    {trip.route}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3" /> {trip.bus}
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={`text-xs font-bold px-2 py-0.5 rounded mb-1 inline-block
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
                    {trip.seats} seats
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-5 py-2 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 border dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 font-medium transition-colors">
            View Full Schedule
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
