import { useState } from "react";
import { MapPin, User, ChevronUp, Mail } from "lucide-react";
import { Trip } from "@/data/mockTrips";

interface PaymentTripSummaryCardProps {
  trip: Trip;
  formatDate: () => string;
  passengerName: string;
  passengerId: string;
  email: string;
}

export default function PaymentTripSummaryCard({
  trip,
  formatDate,
  passengerName,
  passengerId,
  email,
}: PaymentTripSummaryCardProps) {
  const [showPassengerDetails, setShowPassengerDetails] = useState(true);

  return (
    <div className="bg-white dark:bg-black rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-semibold px-3 py-1 rounded-full">
          DEPARTING
        </span>
        <span className="text-sm text-gray-600 dark:text-gray-400">{formatDate()}</span>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{trip.from}</div>
          <div className="text-xl font-semibold text-gray-900 dark:text-white mt-1">
            {trip.departureTime}
          </div>
        </div>

        <div className="flex-1 px-4 md:px-8 text-center">
          <div className="flex items-center justify-center gap-2 md:gap-3 mb-1">
            <MapPin className="w-4 h-4 md:w-5 md:h-5 text-gray-400 dark:text-gray-500" />
            <div className="h-0.5 w-16 md:w-40 border-t-2 border-dashed border-gray-300 dark:border-gray-600"></div>
            <MapPin className="w-4 h-4 md:w-5 md:h-5 text-gray-400 dark:text-gray-500" />
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{trip.duration}</div>
        </div>

        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{trip.to}</div>
          <div className="text-xl font-semibold text-gray-900 dark:text-white mt-1">
            {trip.arrivalTime}
          </div>
        </div>
      </div>

      {/* Passenger Info */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <button
          onClick={() => setShowPassengerDetails(!showPassengerDetails)}
          className="w-full flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium">
            <User className="w-5 h-5" />
            <span>1 Adult</span>
          </div>
          <ChevronUp
            className={`w-5 h-5 text-gray-400 dark:text-gray-500 transition-transform ${
              showPassengerDetails ? "rotate-180" : ""
            }`}
          />
        </button>

        {showPassengerDetails && (
          <div className="mt-4 space-y-2 text-sm">
            <div className="text-gray-900 dark:text-white font-medium">{passengerName}</div>
            <div className="text-gray-600 dark:text-gray-400">{passengerId}</div>
          </div>
        )}

        <div className="mt-4 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Mail className="w-4 h-4" />
          <span>Tickets will be sent via email</span>
        </div>
        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 ml-6">{email}</div>
      </div>
    </div>
  );
}
