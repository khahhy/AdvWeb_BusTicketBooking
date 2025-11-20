import React, { useState } from "react";
import { XCircle, Send, Users, User, Bus } from "lucide-react";

interface SendNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SendNotificationModal = ({
  isOpen,
  onClose,
}: SendNotificationModalProps) => {
  if (!isOpen) return null;

  const [targetType, setTargetType] = useState<
    "all" | "specific_user" | "specific_trip"
  >("all");
  const [channel, setChannel] = useState<"email" | "sms" | "push">("email");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Notification sent successfully (Simulation)!");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b bg-gray-50">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Send className="w-5 h-5 text-blue-600" />
            Send Manual Notification
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recipient Target
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTargetType("all")}
                className={`flex flex-col items-center justify-center p-3 border rounded-lg text-sm transition-colors ${
                  targetType === "all"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <Users className="w-5 h-5 mb-1" />
                All Users
              </button>
              <button
                type="button"
                onClick={() => setTargetType("specific_trip")}
                className={`flex flex-col items-center justify-center p-3 border rounded-lg text-sm transition-colors ${
                  targetType === "specific_trip"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <Bus className="w-5 h-5 mb-1" />
                By Trip ID
              </button>
              <button
                type="button"
                onClick={() => setTargetType("specific_user")}
                className={`flex flex-col items-center justify-center p-3 border rounded-lg text-sm transition-colors ${
                  targetType === "specific_user"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <User className="w-5 h-5 mb-1" />
                Single User
              </button>
            </div>
          </div>

          {targetType === "specific_user" && (
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                User Email / Phone
              </label>
              <input
                type="text"
                required
                className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g. customer@example.com"
              />
            </div>
          )}
          {targetType === "specific_trip" && (
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                Trip ID / Booking Code
              </label>
              <input
                type="text"
                required
                className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g. VEX-8823 or Trip-ID"
              />
              <p className="text-xs text-gray-400 mt-1">
                This will send to all passengers on this trip.
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Channel
            </label>
            <select
              className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              value={channel}
              onChange={(e) => setChannel(e.target.value as any)}
            >
              <option value="email">Email</option>
              <option value="sms">SMS (Twilio/eSMS)</option>
              <option value="push">App Push Notification</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject / Title
            </label>
            <input
              type="text"
              required
              className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g. Trip Delay Notice"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message Content
            </label>
            <textarea
              required
              rows={4}
              className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Type your message here..."
            ></textarea>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Send Now
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SendNotificationModal;
