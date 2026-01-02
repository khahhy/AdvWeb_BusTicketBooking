import { useState } from "react";
import { Search, RefreshCw, Loader2 } from "lucide-react";
import {
  NotificationDetailModal,
  NotificationTable,
  NotificationStats,
} from "@/components/admin";

import {
  useGetNotificationsQuery,
  NotificationLog,
} from "@/store/api/notificationApi";

const NotificationManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    setTimeout(() => setDebouncedSearch(val), 500);
  };

  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [selectedLog, setSelectedLog] = useState<NotificationLog | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const {
    data: apiResponse,
    isLoading,
    isFetching,
    refetch,
  } = useGetNotificationsQuery({
    search: debouncedSearch || undefined,
    type: typeFilter !== "all" ? (typeFilter as "email" | "sms") : undefined,
    status:
      statusFilter !== "all"
        ? (statusFilter as "pending" | "sent" | "failed")
        : undefined,
    limit: 20,
  });

  const logs = apiResponse?.data || [];

  const stats = apiResponse?.stats || {
    total: 0,
    sent: 0,
    failed: 0,
    pending: 0,
  };

  const handleViewDetail = (log: NotificationLog) => {
    setSelectedLog(log);
    setIsDetailOpen(true);
  };

  return (
    <div className="p-6 space-y-6 min-h-screen font-sans text-gray-900 dark:text-white">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            Notification Logs
          </h1>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => refetch()}
            className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 px-3 py-2 rounded-lg transition-all flex items-center gap-2"
            title="Reload Data"
          >
            <RefreshCw
              className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`}
            />
            <span className="text-sm font-medium">Refresh</span>
          </button>
        </div>
      </div>

      <NotificationStats stats={stats} />

      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search User, Email, Ticket..."
            className="w-full pl-10 pr-4 py-2 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            className="border dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">All Channels</option>
            <option value="email">Email</option>
            <option value="sms">SMS</option>
          </select>

          <select
            className="border dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="sent">Sent</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />
          <p className="text-gray-500 text-sm">Loading notification logs...</p>
        </div>
      ) : logs.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 text-gray-500 dark:text-gray-400">
          No notifications found matching your criteria.
        </div>
      ) : (
        <NotificationTable logs={logs} onViewDetail={handleViewDetail} />
      )}

      <NotificationDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        log={selectedLog}
      />
    </div>
  );
};

export default NotificationManagement;
