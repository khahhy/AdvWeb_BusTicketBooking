import { XCircle, Mail, MessageSquare, Clock, RotateCcw } from "lucide-react";
import {
  NotificationLog,
  formatDate,
} from "@/admin/customerCare/NotificationManagement";

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
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b bg-gray-50">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg ${
                log.type === "email"
                  ? "bg-blue-100 text-blue-600"
                  : "bg-purple-100 text-purple-600"
              }`}
            >
              {log.type === "email" ? (
                <Mail className="w-5 h-5" />
              ) : (
                <MessageSquare className="w-5 h-5" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800 capitalize">
                {log.template.replace("_", " ")}
              </h2>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Sent at:{" "}
                {formatDate(log.createdAt)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 rounded-full p-1 hover:bg-gray-200"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="block text-gray-500 text-xs uppercase font-bold">
                Recipient
              </span>
              <span className="font-medium text-gray-900">{log.userName}</span>
            </div>
            <div>
              <span className="block text-gray-500 text-xs uppercase font-bold">
                Contact
              </span>
              <span className="font-medium text-gray-900">
                {log.contactInfo}
              </span>
            </div>
            <div>
              <span className="block text-gray-500 text-xs uppercase font-bold">
                Status
              </span>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold capitalize mt-1
                        ${
                          log.status === "sent"
                            ? "bg-green-100 text-green-800"
                            : log.status === "failed"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                        }`}
              >
                {log.status}
              </span>
            </div>
            <div>
              <span className="block text-gray-500 text-xs uppercase font-bold">
                Related Booking
              </span>
              <span className="font-mono text-blue-600">
                {log.bookingTicketCode || "N/A"}
              </span>
            </div>
          </div>

          <div className="mt-4">
            <span className="block text-gray-500 text-xs uppercase font-bold mb-2">
              Content Preview
            </span>
            <div className="bg-gray-100 p-4 rounded-lg border text-sm font-mono text-gray-700 whitespace-pre-wrap max-h-60 overflow-y-auto">
              {log.content}
            </div>
          </div>
        </div>

        <div className="p-6 border-t bg-gray-50 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border bg-white rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>
          {log.status === "failed" && (
            <button
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center gap-2"
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
