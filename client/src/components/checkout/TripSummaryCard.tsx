import { Bus } from 'lucide-react';
import { Trip } from '@/data/mockTrips';

interface TripSummaryCardProps {
  trip: Trip;
  formatDate: () => string;
  onDetailsClick: () => void;
}

export default function TripSummaryCard({ trip, formatDate, onDetailsClick }: TripSummaryCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">
          ONE-WAY
        </span>
        <button 
          className="text-blue-600 text-sm font-medium hover:underline"
          onClick={onDetailsClick}
        >
          Details
        </button>
      </div>
      
      <div className="flex items-center justify-between">
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
      
      <div className="mt-4 text-sm text-gray-500">
        {formatDate()}
      </div>
    </div>
  );
}
