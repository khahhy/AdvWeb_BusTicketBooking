import { Seat } from '@/data/mockTrips';

interface SeatMapProps {
  seats: Seat[];
  onSeatSelect: (seatId: string) => void;
}

export default function SeatMap({ seats, onSeatSelect }: SeatMapProps) {
  const renderSeat = (seat: Seat) => {
    const getSeatStyle = () => {
      switch (seat.type) {
        case 'booked':
          return 'bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed';
        case 'selected':
          return 'bg-yellow-400 border-yellow-500 text-white cursor-pointer hover:bg-yellow-500';
        case 'available':
          return 'bg-white border-foreground/40 text-foreground/40 cursor-pointer hover:bg-blue-50';
        default:
          return 'bg-white border-gray-300';
      }
    };

    return (
      <button
        key={seat.id}
        onClick={() => seat.type !== 'booked' && onSeatSelect(seat.id)}
        disabled={seat.type === 'booked'}
        className={`relative w-9 h-9 rounded-md border-2 font-semibold text-xs transition-all duration-200 ${getSeatStyle()}`}
        title={seat.type === 'booked' ? 'Booked' : `Seat ${seat.number}`}
      >
        {/* Seat number */}
        <span className="relative z-10">{seat.number}</span>
      </button>
    );
  };



  return (
    <div className="space-y-3">
      {/* Legend */}
      <div className="flex items-center justify-center gap-4 pb-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-white border-2 border-foreground/40 rounded-md"></div>
          <span className="text-xs text-gray-600">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-yellow-400 border-2 border-yellow-500 rounded-md"></div>
          <span className="text-xs text-gray-600">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gray-200 border-2 border-gray-300 rounded-md"></div>
          <span className="text-xs text-gray-600">Booked</span>
        </div>
      </div>

      {/* Seat Layout */}
      <div className="max-w-xs mx-auto">
        {/* Seats */}
        <div className="bg-gradient-to-b from-gray-50 to-white p-2 rounded-lg border border-gray-200">
          <div className="flex gap-2 justify-center">
            {/* Left Column 1 */}
            <div className="flex flex-col gap-1.5">
              {seats.filter((_, i) => i % 4 === 0).map((seat) => renderSeat(seat))}
            </div>
            
            {/* Left Column 2 */}
            <div className="flex flex-col gap-1.5">
              {seats.filter((_, i) => i % 4 === 1).map((seat) => renderSeat(seat))}
            </div>
            
            {/* Aisle */}
            <div className="w-4 flex items-center justify-center">
              <div className="h-full w-px bg-gray-300"></div>
            </div>
            
            {/* Right Column 1 */}
            <div className="flex flex-col gap-1.5">
              {seats.filter((_, i) => i % 4 === 2).map((seat) => renderSeat(seat))}
            </div>
            
            {/* Right Column 2 */}
            <div className="flex flex-col gap-1.5">
              {seats.filter((_, i) => i % 4 === 3).map((seat) => renderSeat(seat))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
