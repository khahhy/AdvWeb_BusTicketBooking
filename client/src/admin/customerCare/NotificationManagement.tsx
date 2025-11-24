import { useState, useMemo } from "react";
import { Search, Plus } from "lucide-react";
import {
  NotificationDetailModal,
  NotificationTable,
  NotificationStats,
  SendNotificationModal,
} from "@/components/admin";

export interface NotificationLog {
  id: string;
  userId: string;
  userName: string;
  contactInfo: string;
  bookingId?: string;
  bookingTicketCode?: string;
  type: "email" | "sms";
  template:
    | "booking_confirmation"
    | "trip_reminder"
    | "delay_alert"
    | "cancellation_notice"
    | "otp_verification";
  content: string;
  status: "pending" | "sent" | "failed";
  sentAt?: string;
  createdAt: string;
}

// --- MOCK DATA ---
const MOCK_LOGS: NotificationLog[] = [
  {
    id: "n1",
    userId: "u1",
    userName: "Nguyen Van An",
    contactInfo: "an.nguyen@gmail.com",
    bookingId: "b1",
    bookingTicketCode: "VEX-8823",
    type: "email",
    template: "booking_confirmation",
    content:
      "Subject: Booking Confirmed! \nDear An, Your ticket VEX-8823 is confirmed...",
    status: "sent",
    createdAt: "2025-11-20T08:05:00Z",
  },
  {
    id: "n2",
    userId: "u1",
    userName: "Nguyen Van An",
    contactInfo: "0909123456",
    bookingId: "b1",
    bookingTicketCode: "VEX-8823",
    type: "sms",
    template: "booking_confirmation",
    content:
      "VEX-8823: Ban da dat ve thanh cong chuyen SG-DL 08:00. Vui long den truoc 15p.",
    status: "sent",
    createdAt: "2025-11-20T08:05:05Z",
  },
  {
    id: "n3",
    userId: "u2",
    userName: "Tran Thi Bich",
    contactInfo: "bich.tran@email.com",
    bookingId: "b2",
    bookingTicketCode: "VEX-9912",
    type: "email",
    template: "delay_alert",
    content:
      "Subject: Trip Delay Notice \nDear Bich, Trip DN-SG is delayed by 30 mins...",
    status: "failed",
    createdAt: "2025-11-20T10:30:00Z",
  },
  {
    id: "n4",
    userId: "u3",
    userName: "Le Hoang",
    contactInfo: "0988777666",
    type: "sms",
    template: "otp_verification",
    content: "Your OTP code is 4492. Valid for 5 minutes.",
    status: "sent",
    createdAt: "2025-11-19T15:45:00Z",
  },
];

const NotificationManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [selectedLog, setSelectedLog] = useState<NotificationLog | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);

  const filteredLogs = useMemo(() => {
    return MOCK_LOGS.filter((log) => {
      const matchesSearch =
        log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.contactInfo.includes(searchTerm) ||
        (log.bookingTicketCode &&
          log.bookingTicketCode
            .toLowerCase()
            .includes(searchTerm.toLowerCase()));

      const matchesType = typeFilter === "all" || log.type === typeFilter;
      const matchesStatus =
        statusFilter === "all" || log.status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [searchTerm, typeFilter, statusFilter]);

  return (
    <div className="p-6 space-y-6 min-h-screen font-sans text-gray-900 dark:text-white">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            Notification Logs
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Track system delivery & send manual alerts.
          </p>
        </div>

        <button
          onClick={() => setIsSendModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          Create Notification
        </button>
      </div>

      <NotificationStats logs={filteredLogs} />

      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by User, Phone, Email, Ticket..."
            className="w-full pl-10 pr-4 py-2 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            className="border dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">All Channels</option>
            <option value="email">Email Only</option>
            <option value="sms">SMS Only</option>
          </select>

          <select
            className="border dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="sent">Sent Successfully</option>
            <option value="failed">Failed</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      <NotificationTable
        logs={filteredLogs}
        onViewDetail={(log) => {
          setSelectedLog(log);
          setIsDetailOpen(true);
        }}
      />

      <NotificationDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        log={selectedLog}
      />

      <SendNotificationModal
        isOpen={isSendModalOpen}
        onClose={() => setIsSendModalOpen(false)}
      />
    </div>
  );
};

export default NotificationManagement;
