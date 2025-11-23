import React from "react";
import { XCircle, Ticket, MapPin, CreditCard } from "lucide-react";
import { Booking } from "@/admin/saleAndBooking/BookingManagement";
import { formatDate } from "@/utils/formatDate";
import { formatCurrency } from "@/utils/formatCurrency";

interface BookingDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
}

const BookingDetailModal = ({
  isOpen,
  onClose,
  booking,
}: BookingDetailModalProps) => {
  if (!isOpen || !booking) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 transition-opacity animate-in fade-in duration-200"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden transform transition-all scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Ticket className="w-5 h-5 text-blue-600" />
            Ticket Details: {booking.ticketCode}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 p-1 transition-colors"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider border-b pb-1">
              Passenger Information
            </h3>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <span className="text-gray-500">Full Name:</span>
              <span className="col-span-2 font-medium">
                {booking.customerInfo.fullName}
              </span>

              <span className="text-gray-500">Email:</span>
              <span className="col-span-2 break-all">
                {booking.customerInfo.email}
              </span>

              <span className="text-gray-500">Phone:</span>
              <span className="col-span-2">
                {booking.customerInfo.phoneNumber}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider border-b pb-1">
              Trip Information
            </h3>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <span className="text-gray-500">Route:</span>
              <span className="col-span-2 font-medium flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {booking.routeName}
              </span>

              <span className="text-gray-500">Trip Name:</span>
              <span className="col-span-2">{booking.tripName}</span>

              <span className="text-gray-500">Seat:</span>
              <span className="col-span-2 font-bold text-blue-600">
                {booking.seatNumber}
              </span>

              <span className="text-gray-500">Booked At:</span>
              <span className="col-span-2">
                {formatDate(booking.createdAt)}
              </span>
            </div>
          </div>

          <div className="md:col-span-2 space-y-4 mt-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider border-b pb-1">
              Payment Details
            </h3>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-50 p-4 rounded-lg gap-4">
              <div className="flex items-center gap-3">
                <CreditCard className="w-8 h-8 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Payment Status</div>
                  <div
                    className={`font-bold capitalize ${
                      booking.status === "confirmed"
                        ? "text-green-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {booking.status.replace("_", " ")}
                  </div>
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Gateway</div>
                <div className="font-medium">
                  {booking.paymentGateway || "N/A"}
                </div>
              </div>
              <div className="text-right w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0">
                <div className="text-sm text-gray-500">Total Amount</div>
                <div className="font-bold text-xl text-blue-600">
                  {formatCurrency(booking.price)}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 font-medium text-sm"
          >
            Close
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm flex items-center gap-2 shadow-sm">
            <Ticket className="w-4 h-4" /> Resend Ticket
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailModal;
