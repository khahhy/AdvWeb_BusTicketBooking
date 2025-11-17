import { useState } from 'react';
import { Bus, User, ChevronUp, Mail } from 'lucide-react';
import { Trip } from '@/data/mockTrips';

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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">
          DEPARTING
        </span>
        <span className="text-sm text-gray-600">{formatDate()}</span>
      </div>
      
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-2xl font-bold text-gray-900">{trip.from}</div>
          <div className="text-xl font-semibold text-gray-900 mt-1">{trip.departureTime}</div>
        </div>
        
        <div className="flex-1 px-6 text-center">
          <div className="text-xs text-gray-500 mb-1">{trip.duration}</div>
          <div className="h-px bg-gray-300 relative">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <Bus className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">{trip.to}</div>
          <div className="text-xl font-semibold text-gray-900 mt-1">{trip.arrivalTime}</div>
        </div>
      </div>

      {/* Passenger Info */}
      <div className="border-t border-gray-200 pt-4">
        <button
          onClick={() => setShowPassengerDetails(!showPassengerDetails)}
          className="w-full flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-2 text-blue-600 font-medium">
            <User className="w-5 h-5" />
            <span>1 Adult</span>
          </div>
          <ChevronUp
            className={`w-5 h-5 text-gray-400 transition-transform ${
              showPassengerDetails ? 'rotate-180' : ''
            }`}
          />
        </button>

        {showPassengerDetails && (
          <div className="mt-4 space-y-2 text-sm">
            <div className="text-gray-900 font-medium">{passengerName}</div>
            <div className="text-gray-600">{passengerId}</div>
          </div>
        )}

        <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
          <Mail className="w-4 h-4" />
          <span>Tickets will be sent via email</span>
        </div>
        <div className="mt-2 text-sm text-gray-600 ml-6">
          {email}
        </div>
      </div>
    </div>
  );
}
