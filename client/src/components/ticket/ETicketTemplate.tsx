import { AppLogo } from "@/components/AppLogo/AppLogo";
import {
  Bus,
  Calendar,
  Clock,
  MapPin,
  User,
  CreditCard,
  Phone,
  Mail,
  Info,
} from "lucide-react";
import dayjs from "dayjs";
import QRCode from "react-qr-code";

export interface ETicketTemplateProps {
  bookingCode: string;
  passengerName: string;
  passengerId: string;
  email?: string;
  phone?: string;
  tripFrom: string;
  tripTo: string;
  fromTerminal?: string;
  toTerminal?: string;
  departureTime: string;
  arrivalTime: string;
  travelDate: string;
  duration: string;
  seatNumber: string;
  busType: string;
  licensePlate?: string;
  ticketPrice: number;
  totalPrice: number;
  bookingDate?: string;
  status?: "CONFIRMED" | "PENDING" | "CANCELLED";
}

export const ETicketTemplate = ({
  bookingCode,
  passengerName,
  passengerId,
  email,
  phone,
  tripFrom,
  tripTo,
  fromTerminal,
  toTerminal,
  departureTime,
  arrivalTime,
  travelDate,
  duration,
  seatNumber,
  busType,
  licensePlate,
  ticketPrice,
  totalPrice,
  bookingDate,
  status = "CONFIRMED",
}: ETicketTemplateProps) => {
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("vi-VN") + " VND";
  };

  const formatDate = (date: string) => {
    return dayjs(date).format("ddd, DD MMM YYYY");
  };

  const getStatusColor = () => {
    switch (status) {
      case "CONFIRMED":
        return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 border-green-300 dark:border-green-700";
      case "PENDING":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700";
      case "CANCELLED":
        return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 border-red-300 dark:border-red-700";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300 border-gray-300 dark:border-gray-700";
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border-2 border-gray-200 dark:border-gray-700">
      {/* Header with Branding */}
      <div className="bg-gradient-to-r from-rose-200 via-rose-300 to-pink-200 dark:from-blue-600 dark:via-blue-700 dark:to-blue-800 px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white dark:bg-gray-900 p-3 rounded-xl shadow-lg">
              <AppLogo className="h-10 w-auto" />
            </div>
            <div className="text-gray-800 dark:text-white">
              <h1 className="text-2xl font-bold">Bus Ticket Booking</h1>
              <p className="text-sm text-gray-700 dark:text-white/90">
                E-Ticket Confirmation
              </p>
            </div>
          </div>
          <div
            className={`px-4 py-2 rounded-full border-2 font-semibold text-sm ${getStatusColor()}`}
          >
            {status}
          </div>
        </div>
      </div>

      {/* Booking Code Section */}
      <div className="bg-gradient-to-b from-rose-50 to-white dark:from-gray-800 dark:to-gray-900 px-8 py-6 border-b-4 border-dashed border-gray-300 dark:border-gray-600">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Booking Code
            </p>
            <p className="text-3xl font-bold text-rose-400 dark:text-blue-400 tracking-wider font-mono">
              {bookingCode}
            </p>
            {bookingDate && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Booked on {formatDate(bookingDate)}
              </p>
            )}
          </div>
          <div className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow-md">
            <QRCode value={bookingCode} size={100} />
          </div>
        </div>
      </div>

      {/* Trip Details Section */}
      <div className="px-8 py-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <Bus className="w-5 h-5 text-rose-400 dark:text-blue-400" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Trip Information
          </h2>
        </div>

        {/* Route Display */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1">
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {tripFrom}
            </div>
            {fromTerminal && (
              <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {fromTerminal}
              </div>
            )}
            <div className="text-xl font-semibold text-rose-400 dark:text-blue-400 mt-2">
              {departureTime}
            </div>
          </div>

          <div className="flex-1 px-8">
            <div className="flex items-center justify-center gap-3 mb-2">
              <MapPin className="w-5 h-5 text-gray-400 dark:text-gray-500" />
              <div className="h-1 flex-1 border-t-2 border-dashed border-gray-300 dark:border-gray-600"></div>
              <div className="bg-rose-100 dark:bg-blue-900 text-rose-600 dark:text-blue-300 text-xs font-semibold px-3 py-1 rounded-full">
                {duration}
              </div>
              <div className="h-1 flex-1 border-t-2 border-dashed border-gray-300 dark:border-gray-600"></div>
              <MapPin className="w-5 h-5 text-gray-400 dark:text-gray-500" />
            </div>
          </div>

          <div className="flex-1 text-right">
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {tripTo}
            </div>
            {toTerminal && (
              <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1 justify-end">
                <MapPin className="w-4 h-4" />
                {toTerminal}
              </div>
            )}
            <div className="text-xl font-semibold text-rose-400 dark:text-blue-400 mt-2">
              {arrivalTime}
            </div>
          </div>
        </div>

        {/* Additional Trip Info */}
        <div className="grid grid-cols-3 gap-4 bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-rose-400 dark:text-blue-400" />
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Travel Date
              </p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {formatDate(travelDate)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Bus className="w-5 h-5 text-rose-400 dark:text-blue-400" />
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Seat Number
              </p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {seatNumber}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-rose-400 dark:text-blue-400" />
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Bus Type
              </p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {busType}
              </p>
            </div>
          </div>
        </div>

        {licensePlate && (
          <div className="mt-3 text-center">
            <span className="inline-flex items-center gap-2 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-4 py-2 rounded-lg text-sm font-semibold">
              <Bus className="w-4 h-4" />
              License Plate: {licensePlate}
            </span>
          </div>
        )}
      </div>

      {/* Passenger Information */}
      <div className="px-8 py-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-rose-400 dark:text-blue-400" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Passenger Information
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Full Name
              </p>
              <p className="text-base font-semibold text-gray-900 dark:text-white">
                {passengerName}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                ID Number
              </p>
              <p className="text-base font-semibold text-gray-900 dark:text-white font-mono">
                {passengerId}
              </p>
            </div>
          </div>
          <div className="space-y-4">
            {email && (
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  Email
                </p>
                <p className="text-base font-semibold text-gray-900 dark:text-white break-all">
                  {email}
                </p>
              </div>
            )}
            {phone && (
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  Phone Number
                </p>
                <p className="text-base font-semibold text-gray-900 dark:text-white">
                  {phone}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payment Information */}
      <div className="px-8 py-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="w-5 h-5 text-rose-400 dark:text-blue-400" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Payment Details
          </h2>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-3">
          <div className="flex justify-between text-gray-700 dark:text-gray-300">
            <span>Ticket Price (Seat {seatNumber})</span>
            <span className="font-semibold">{formatCurrency(ticketPrice)}</span>
          </div>
          {totalPrice !== ticketPrice && (
            <div className="flex justify-between text-gray-700 dark:text-gray-300">
              <span>Additional Fees</span>
              <span className="font-semibold">
                {formatCurrency(totalPrice - ticketPrice)}
              </span>
            </div>
          )}
          <div className="border-t-2 border-gray-300 dark:border-gray-600 pt-3 flex justify-between">
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              Total Paid
            </span>
            <span className="text-lg font-bold text-green-600 dark:text-green-400">
              {formatCurrency(totalPrice)}
            </span>
          </div>
        </div>
      </div>

      {/* Important Information */}
      <div className="px-8 py-6 bg-blue-50 dark:bg-blue-900/20">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-2">
            <h3 className="font-semibold text-blue-900 dark:text-blue-300">
              Important Information
            </h3>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
              <li>
                Please arrive at the terminal at least 15 minutes before
                departure
              </li>
              <li>
                Bring a valid ID matching the passenger name on this ticket
              </li>
              <li>Present this e-ticket (printed or digital) for boarding</li>
              <li>Keep your booking code safe for any inquiries</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-100 dark:bg-gray-800 px-8 py-4 text-center border-t border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Thank you for choosing Bus Ticket Booking Service
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
          For support: support@busticket.com | Hotline: 1900-xxxx
        </p>
      </div>
    </div>
  );
};
