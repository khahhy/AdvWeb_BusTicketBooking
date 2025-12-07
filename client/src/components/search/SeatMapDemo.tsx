import { useState } from "react";
import InteractiveSeatMap, { SeatStatus } from "./InteractiveSeatMap";
import { BusType } from "@/store/type/busType";
import { Button } from "@/components/ui/button";

// Demo component to test all bus layouts
export default function SeatMapDemo() {
  const [currentType, setCurrentType] = useState<BusType>(BusType.STANDARD);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  const busTypes = [
    { type: BusType.STANDARD, name: "Standard (2-2)", capacity: 32 },
    { type: BusType.VIP, name: "VIP (2-1)", capacity: 16 },
    { type: BusType.SLEEPER, name: "Sleeper (2-tier)", capacity: 16 },
    { type: BusType.LIMOUSINE, name: "Limousine (1-2-1)", capacity: 16 },
  ];

  const generateDemoSeats = (capacity: number): SeatStatus[] => {
    const seats: SeatStatus[] = [];
    const bookedCount = Math.floor(capacity * 0.3); // 30% booked
    const bookedIndices = new Set<number>();

    while (bookedIndices.size < bookedCount) {
      bookedIndices.add(Math.floor(Math.random() * capacity));
    }

    const getSeatLabel = (index: number, total: number): string => {
      if (total === 32) {
        const row = Math.floor(index / 4) + 1;
        const col = ["A", "B", "C", "D"][index % 4];
        return `${col}${row}`;
      } else {
        const row = Math.floor(index / 4) + 1;
        const col = ["A", "B", "C", "D"][index % 4];
        return `${col}${row}`;
      }
    };

    for (let i = 0; i < capacity; i++) {
      seats.push({
        seatId: `seat-${i}`,
        seatNumber: getSeatLabel(i, capacity),
        status: bookedIndices.has(i) ? "booked" : "available",
        price: 200000,
      });
    }

    return seats;
  };

  const currentBusType = busTypes.find((bt) => bt.type === currentType)!;
  const seats = generateDemoSeats(currentBusType.capacity);

  const handleSeatSelect = (seatId: string) => {
    setSelectedSeats((prev) =>
      prev.includes(seatId)
        ? prev.filter((id) => id !== seatId)
        : [...prev, seatId],
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Interactive Seat Map Demo
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Test all bus layout types with interactive seat selection
        </p>

        {/* Bus Type Selector */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Select Bus Type
          </h2>
          <div className="flex flex-wrap gap-3">
            {busTypes.map((bt) => (
              <Button
                key={bt.type}
                onClick={() => {
                  setCurrentType(bt.type);
                  setSelectedSeats([]);
                }}
                variant={currentType === bt.type ? "default" : "outline"}
                className="flex flex-col items-start h-auto py-3 px-4"
              >
                <span className="font-semibold">{bt.name}</span>
                <span className="text-xs opacity-80">{bt.capacity} seats</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Seat Map */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            {currentBusType.name} Layout
          </h2>
          <InteractiveSeatMap
            busType={currentType}
            seats={seats}
            onSeatSelect={handleSeatSelect}
            selectedSeats={selectedSeats}
          />
        </div>

        {/* Stats */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mt-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Statistics
          </h2>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {currentBusType.capacity}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {seats.filter((s) => s.status === "available").length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Available
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {seats.filter((s) => s.status === "booked").length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Booked</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {selectedSeats.length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Selected
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
