import { Mail, MessageSquare, XCircle, Activity } from "lucide-react";

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

interface NotificationStatsProps {
  logs: NotificationLog[];
}

const NotificationStats = ({ logs }: NotificationStatsProps) => {
  const total = logs.length;

  const stats = logs.reduce(
    (acc, curr) => {
      if (curr.status === "sent") acc.sent++;
      if (curr.status === "failed") acc.failed++;
      if (curr.type === "email") acc.email++;
      if (curr.type === "sms") acc.sms++;
      return acc;
    },
    { sent: 0, failed: 0, email: 0, sms: 0 },
  );

  const successRate = total > 0 ? Math.round((stats.sent / total) * 100) : 0;

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border dark:border-gray-700 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Delivery Rate</p>
          <h3
            className={`text-2xl font-bold mt-1 ${
              successRate >= 95 ? "text-green-600 dark:text-green-400" : "text-yellow-600 dark:text-yellow-400"
            }`}
          >
            {successRate}%
          </h3>
          <span className="text-xs text-gray-400 dark:text-gray-500">Success / Attempts</span>
        </div>
        <div
          className={`h-10 w-10 rounded-full flex items-center justify-center ${
            successRate >= 95 ? "bg-green-50 dark:bg-green-900/30" : "bg-yellow-50 dark:bg-yellow-900/30"
          }`}
        >
          <Activity
            className={`w-5 h-5 ${
              successRate >= 95 ? "text-green-600 dark:text-green-400" : "text-yellow-600 dark:text-yellow-400"
            }`}
          />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border dark:border-gray-700 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Emails Sent</p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {stats.email}
          </h3>
        </div>
        <div className="h-10 w-10 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
          <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border dark:border-gray-700 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">SMS Sent</p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.sms}</h3>
        </div>
        <div className="h-10 w-10 bg-purple-50 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
          <MessageSquare className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border dark:border-gray-700 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Failed</p>
          <h3
            className={`text-2xl font-bold mt-1 ${
              stats.failed > 0 ? "text-red-600 dark:text-red-400" : "text-gray-900 dark:text-white"
            }`}
          >
            {stats.failed}
          </h3>
          <span className="text-xs text-gray-400 dark:text-gray-500">Need attention</span>
        </div>
        <div className="h-10 w-10 bg-red-50 dark:bg-red-900/30 rounded-full flex items-center justify-center">
          <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
        </div>
      </div>
    </div>
  );
};

export default NotificationStats;
