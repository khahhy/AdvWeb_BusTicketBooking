import {
  Mail,
  MessageSquare,
  Eye,
  RotateCcw,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { NotificationLog } from "@/admin/customerCare/NotificationManagement";
import { formatDate } from "@/utils/formatDate";

interface NotificationTableProps {
  logs: NotificationLog[];
  onViewDetail: (log: NotificationLog) => void;
}

const getTemplateBadge = (template: string) => {
  switch (template) {
    case "booking_confirmation":
      return "bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-blue-100 dark:border-blue-700";
    case "trip_reminder":
      return "bg-indigo-50 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border-indigo-100 dark:border-indigo-700";
    case "delay_alert":
      return "bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-300 border-red-100 dark:border-red-700";
    case "cancellation_notice":
      return "bg-orange-50 dark:bg-orange-900 text-orange-700 dark:text-orange-300 border-orange-100 dark:border-orange-700";
    default:
      return "bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-100 dark:border-gray-600";
  }
};

const NotificationTable = ({ logs, onViewDetail }: NotificationTableProps) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-medium border-b dark:border-gray-600">
            <tr>
              <th className="px-6 py-3">Recipient</th>
              <th className="px-6 py-3">Channel</th>
              <th className="px-6 py-3">Template Type</th>
              <th className="px-6 py-3">Booking Ref</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Sent Time</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-gray-700">
            {logs.map((log) => (
              <tr
                key={log.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {log.userName}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {log.contactInfo}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {log.type === "email" ? (
                      <Mail className="w-4 h-4 text-blue-500" />
                    ) : (
                      <MessageSquare className="w-4 h-4 text-purple-500" />
                    )}
                    <span className="capitalize text-gray-700 dark:text-gray-300">
                      {log.type}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex px-2 py-1 rounded border text-xs font-medium ${getTemplateBadge(
                      log.template,
                    )}`}
                  >
                    {log.template.replace("_", " ").toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 font-mono text-xs text-gray-600 dark:text-gray-400">
                  {log.bookingTicketCode || "-"}
                </td>
                <td className="px-6 py-4">
                  {log.status === "sent" && (
                    <span className="flex items-center gap-1 text-green-600 dark:text-green-400 text-xs font-bold bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-full w-fit">
                      <CheckCircle className="w-3 h-3" /> Sent
                    </span>
                  )}
                  {log.status === "failed" && (
                    <span className="flex items-center gap-1 text-red-600 dark:text-red-400 text-xs font-bold bg-red-50 dark:bg-red-900/30 px-2 py-1 rounded-full w-fit">
                      <XCircle className="w-3 h-3" /> Failed
                    </span>
                  )}
                  {log.status === "pending" && (
                    <span className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400 text-xs font-bold bg-yellow-50 dark:bg-yellow-900/30 px-2 py-1 rounded-full w-fit">
                      <Clock className="w-3 h-3" /> Pending
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-xs whitespace-nowrap">
                  {formatDate(log.createdAt)}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => onViewDetail(log)}
                      className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/50 rounded-full"
                      title="View Content"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {log.status === "failed" && (
                      <button
                        className="p-2 text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/50 rounded-full"
                        title="Retry / Resend"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="text-center py-12 text-gray-500 dark:text-gray-400"
                >
                  No logs found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NotificationTable;
