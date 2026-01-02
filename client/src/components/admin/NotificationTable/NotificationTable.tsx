import {
  Mail,
  MessageSquare,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { NotificationLog } from "@/store/api/notificationApi";
import { formatDate } from "@/utils/formatDate";

interface NotificationTableProps {
  logs: NotificationLog[];
  onViewDetail: (log: NotificationLog) => void;
}

const getTemplateBadge = (template: string) => {
  if (template?.includes("booking"))
    return "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-100 dark:border-blue-700";
  if (template?.includes("payment"))
    return "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-100 dark:border-indigo-700";
  if (template?.includes("cancel"))
    return "bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-100 dark:border-orange-700";
  return "bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-100 dark:border-gray-600";
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
              <th className="px-6 py-3">Template</th>
              <th className="px-6 py-3">Booking Ref</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Time</th>
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
                    {log.template
                      ? log.template.replace(/_/g, " ").toUpperCase()
                      : "SYSTEM"}
                  </span>
                </td>
                <td className="px-6 py-4 font-mono text-xs text-gray-600 dark:text-gray-400">
                  {log.bookingTicketCode || "-"}
                </td>
                <td className="px-6 py-4">
                  {log.status === "sent" && (
                    <span className="flex items-center gap-1 text-green-600 font-bold text-xs">
                      <CheckCircle className="w-3 h-3" /> Sent
                    </span>
                  )}
                  {log.status === "failed" && (
                    <span className="flex items-center gap-1 text-red-600 font-bold text-xs">
                      <XCircle className="w-3 h-3" /> Failed
                    </span>
                  )}
                  {log.status === "pending" && (
                    <span className="flex items-center gap-1 text-yellow-600 font-bold text-xs">
                      <Clock className="w-3 h-3" /> Pending
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-xs whitespace-nowrap">
                  {formatDate(log.createdAt)}
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => onViewDetail(log)}
                    className="p-2 hover:bg-gray-100 rounded-full text-blue-600"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NotificationTable;
