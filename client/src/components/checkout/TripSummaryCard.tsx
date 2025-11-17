import { MapPin } from 'lucide-react';
import { Trip } from '@/data/mockTrips';

interface TripSummaryCardProps {
  trip: Trip;
  formatDate: () => string;
  onDetailsClick: () => void;
}

export default function TripSummaryCard({ trip, formatDate, onDetailsClick }: TripSummaryCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
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
        
        <div className="flex-1 px-4 md:px-8 text-center">
          <div className="flex items-center justify-center gap-2 md:gap-3 mb-1">
            <MapPin className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
            <div className="h-0.5 w-16 md:w-40 border-t-2 border-dashed border-gray-300"></div>
            <MapPin className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
          </div>
          <div className="text-xs text-gray-500">{trip.duration}</div>
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
