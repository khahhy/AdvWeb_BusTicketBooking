import { useState, useMemo, useRef, useEffect } from 'react';
import { Clock, MapPin } from 'lucide-react';
import { Trip, Seat, generateSeats } from '@/data/mockTrips';
import SeatMap from './SeatMap';

interface TripCardProps {
  trip: Trip;
  isOpen: boolean;
  onToggle: (tripId: string) => void;
}

export default function TripCard({ trip, isOpen, onToggle }: TripCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'schedule' | 'seat' | 'shipment' | 'policy' | null>(null);
  const [seats, setSeats] = useState<Seat[]>(() => 
    generateSeats(32, 32 - trip.availableSeats, trip.price)
  );
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  // Reset activeTab when card is closed
  if (!isOpen && activeTab !== null) {
    setActiveTab(null);
  }

  // Scroll to card when a tab is opened
  useEffect(() => {
    if (isOpen && activeTab && cardRef.current) {
      const navbarHeight = 110;
      const cardTop = cardRef.current.getBoundingClientRect().top + window.scrollY;
      const scrollPosition = cardTop - navbarHeight - 20;
      
      // Use requestAnimationFrame for smoother custom scroll
      const duration = 800; // 800ms for smoother, slower scroll
      const startPosition = window.scrollY;
      const distance = scrollPosition - startPosition;
      const startTime = performance.now();

      const easeInOutCubic = (t: number): number => {
        return t < 0.5 
          ? 4 * t * t * t 
          : 1 - Math.pow(-2 * t + 2, 3) / 2;
      };

      const animateScroll = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = easeInOutCubic(progress);
        
        window.scrollTo(0, startPosition + distance * easeProgress);
        
        if (progress < 1) {
          requestAnimationFrame(animateScroll);
        }
      };

      requestAnimationFrame(animateScroll);
    }
  }, [isOpen, activeTab]);

  const handleSeatSelect = (seatId: string) => {
    // Build new seats array and update selectedSeats deterministically
    setSeats((prevSeats) => {
      const newSeats = prevSeats.map((seat) => {
        if (seat.id === seatId) {
          const newType: Seat['type'] = seat.type === 'selected' ? 'available' : 'selected';
          return { ...seat, type: newType };
        }
        return seat;
      });

      // Compute new selected list (deduplicated)
      const newSelected: string[] = [];
      for (const s of newSeats) {
        if (s.type === 'selected') newSelected.push(s.id);
      }
      // Apply selected seats in one shot
      setSelectedSeats(() => newSelected);

      return newSeats;
    });
  };

  const totalPrice = useMemo(() => {
    return selectedSeats.length * trip.price;
  }, [selectedSeats, trip.price]);

  const tabs = [
    { id: 'schedule', label: 'Schedule' },
    { id: 'seat', label: 'Choose seat' },
    { id: 'shipment', label: 'Transshipment' },
    { id: 'policy', label: 'Policy' },
  ];

  return (
    <div ref={cardRef} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-100">
      {/* Trip Header */}
      <div className="p-6">
        <div className="flex items-start justify-between">
          {/* Time and Location */}
          <div className="flex items-center gap-8 flex-1">
            {/* Departure */}
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-1">{trip.departureTime}</div>
              <div className="text-sm font-medium text-gray-700">{trip.from}</div>
            </div>

            {/* Duration */}
            <div className="flex flex-col items-center px-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-foreground"></div>
                <div className="h-0.5 w-20 bg-foreground"></div>
                <MapPin className="w-4 h-4 text-foreground" />
              </div>
              <div className="text-xs text-gray-500 font-medium">{trip.duration}</div>
              <div className="text-xs text-gray-400">(Asian/Ho Chi Minh)</div>
            </div>

            {/* Arrival */}
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-1">{trip.arrivalTime}</div>
              <div className="text-sm font-medium text-gray-700">{trip.to}</div>
            </div>
          </div>

          {/* Seats Info */}
          <div className="flex flex-col items-center gap-2 px-8 border-l border-gray-200">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span className="font-medium">{trip.availableSeats} blank seats</span>
            </div>
          </div>

          {/* Price */}
          <div className="text-right pl-8 border-l border-gray-200">
            <div className="text-3xl font-bold text-foreground mb-1">
              {trip.price.toLocaleString('vi-VN')}đ
            </div>
            {selectedSeats.length > 0 && (
              <div className="text-xs text-gray-500">
                {selectedSeats.length} seats: {totalPrice.toLocaleString('vi-VN')}đ
              </div>
            )}
          </div>
        </div>

        {/* Note */}
        {trip.note && (
          <div className="mt-4 p-3 bg-foreground/5 rounded-lg border border-foreground/10">
            <p className="text-xs text-foreground/80">
              <span className="font-semibold">Noted:</span> {trip.note}
            </p>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-t border-gray-200">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  if (!isOpen) {
                    onToggle(trip.id);
                    setActiveTab(tab.id as any);
                  } else if (activeTab === tab.id) {
                    onToggle(trip.id);
                    setActiveTab(null);
                  } else {
                    setActiveTab(tab.id as any);
                  }
                }}
                className={`px-6 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  activeTab === tab.id && isOpen
                    ? 'bg-foreground text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button className="px-8 py-2 bg-foreground text-white font-semibold rounded-lg hover:bg-foreground/90 active:bg-foreground/80 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105">
            Select trip
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'seat' && (
        <div className="p-6 bg-gray-50 border-t border-gray-200">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Choose Your Seat</h3>
            <SeatMap seats={seats} onSeatSelect={handleSeatSelect} />
            
            {selectedSeats.length > 0 && (
              <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Selected {selectedSeats.length} seats:</p>
                    <p className="text-lg font-bold text-gray-900 mt-1">
                      {seats
                        .filter(seat => selectedSeats.includes(seat.id))
                        .map(seat => seat.number)
                        .join(', ')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="text-2xl font-bold text-foreground">
                      {totalPrice.toLocaleString('vi-VN')}đ
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'schedule' && (
        <div className="p-6 bg-gray-50 border-t border-gray-200">
          <div className="max-w-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Schedule</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-foreground/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{trip.from}</p>
                  <p className="text-sm text-gray-500">Departure: {trip.departureTime}</p>
                </div>
              </div>
              
              <div className="ml-6 border-l-2 border-dashed border-gray-300 h-12"></div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-foreground/5 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-foreground/70" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{trip.to}</p>
                  <p className="text-sm text-gray-500">Arrival: {trip.arrivalTime}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'shipment' && (
        <div className="p-6 bg-gray-50 border-t border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Transshipment Information</h3>
          <p className="text-gray-600">Information about transportation and delivery services.</p>
        </div>
      )}

      {activeTab === 'policy' && (
        <div className="p-6 bg-gray-50 border-t border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Policy</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <p>• Please arrive at the departure point 15 minutes early.</p>
            <p>• Free cancellation 24 hours before departure.</p>
            <p>• Cancellation within 24 hours will incur a 20% fee.</p>
            <p>• Tickets cannot be transferred to others.</p>
          </div>
        </div>
      )}
    </div>
  );
}
