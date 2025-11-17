import { X, Bus } from 'lucide-react';
import { Trip } from '@/data/mockTrips';
import SeatMap from '@/components/search/SeatMap';

interface SeatMapModalProps {
  show: boolean;
  onClose: () => void;
  trip: Trip;
  formatDate: () => string;
  formatCurrency: (amount: number) => string;
  selectedSeat: string;
  ticketPrice: number;
  seats: any[];
}

export default function SeatMapModal({
  show,
  onClose,
  trip,
  formatDate,
  formatCurrency,
  selectedSeat,
  ticketPrice,
  seats,
}: SeatMapModalProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" 
        style={{ 
          scrollbarWidth: 'none', 
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        <style dangerouslySetInnerHTML={{
          __html: `
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
          `
        }} />
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Trip Details</h2>
            <p className="text-sm text-gray-500 mt-1">
              {trip.from} → {trip.to} • {formatDate()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>
        
        <div className="p-6">
          {/* Trip Info */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
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
          </div>

          {/* Seat Map */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Seat Layout</h3>
            <SeatMap 
              seats={seats} 
              onSeatSelect={() => {}} 
            />
            
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Your seat: <span className="font-semibold text-gray-900">Seat {selectedSeat}</span>
                </div>
                <div className="text-sm text-gray-600">
                  Price: <span className="font-semibold text-gray-900">{formatCurrency(ticketPrice)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
