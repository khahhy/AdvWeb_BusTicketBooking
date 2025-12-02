import { XCircle, Mail, MessageSquare, Clock, RotateCcw } from "lucide-react";
import { NotificationLog } from "@/admin/customerCare/NotificationManagement";
import { formatDate } from "@/utils/formatDate";

interface NotificationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  log: NotificationLog | null;
}

const NotificationDetailModal = ({
  isOpen,
  onClose,
  log,
}: NotificationDetailModalProps) => {
  if (!isOpen || !log) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg ${
                log.type === "email"
                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                  : "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
              }`}
            >
              {log.type === "email" ? (
                <Mail className="w-5 h-5" />
              ) : (
                <MessageSquare className="w-5 h-5" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800 dark:text-white capitalize">
                {log.template.replace("_", " ")}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Sent at:{" "}
                {formatDate(log.createdAt)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 rounded-full p-1 hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="block text-gray-500 dark:text-gray-400 text-xs uppercase font-bold">
                Recipient
              </span>
              <span className="font-medium text-gray-900 dark:text-white">
                {log.userName}
              </span>
            </div>
            <div>
              <span className="block text-gray-500 dark:text-gray-400 text-xs uppercase font-bold">
                Contact
              </span>
              <span className="font-medium text-gray-900 dark:text-white">
                {log.contactInfo}
              </span>
            </div>
            <div>
              <span className="block text-gray-500 dark:text-gray-400 text-xs uppercase font-bold">
                Status
              </span>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold capitalize mt-1
                        ${
                          log.status === "sent"
                            ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                            : log.status === "failed"
                              ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
                              : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300"
                        }`}
              >
                {log.status}
              </span>
            </div>
            <div>
              <span className="block text-gray-500 dark:text-gray-400 text-xs uppercase font-bold">
                Related Booking
              </span>
              <span className="font-mono text-blue-600 dark:text-blue-400">
                {log.bookingTicketCode || "N/A"}
              </span>
            </div>
          </div>

          <div className="mt-4">
            <span className="block text-gray-500 dark:text-gray-400 text-xs uppercase font-bold mb-2">
              Content Preview
            </span>
            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg border dark:border-gray-600 text-sm font-mono text-gray-700 dark:text-gray-300 whitespace-pre-wrap max-h-60 overflow-y-auto">
              {log.content}
            </div>
          </div>
        </div>

        <div className="p-6 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            Close
          </button>
          {log.status === "failed" && (
            <button
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
              onClick={() => alert("Retry logic triggered!")}
            >
              <RotateCcw className="w-4 h-4" /> Retry Sending
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationDetailModal;
