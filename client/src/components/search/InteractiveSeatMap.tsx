import { Armchair, Bed, User } from "lucide-react";
import { BusType } from "@/store/type/busType";
import type { SeatStatus } from "@/store/type/seatsType";

interface InteractiveSeatMapProps {
  busType: BusType;
  seats: SeatStatus[];
  onSeatSelect: (seatId: string) => void;
  selectedSeats?: string[];
}

export default function InteractiveSeatMap({
  busType,
  seats,
  onSeatSelect,
  selectedSeats = [],
}: InteractiveSeatMapProps) {
  const findSeat = (col: string, row: number) => {
    const label = `${col}${row}`;
    return seats.find((s) => s.seatNumber === label);
  };

  const getSeatStatusStyle = (seat: SeatStatus) => {
    if (seat.status === "BOOKED") {
      return "bg-gray-300 dark:bg-gray-600 border-gray-400 dark:border-gray-500 cursor-not-allowed opacity-50";
    }
    if (selectedSeats.includes(seat.seatId)) {
      return "bg-blue-500 dark:bg-blue-600 border-blue-600 dark:border-blue-500 text-white shadow-lg scale-105";
    }
    return "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-500 hover:bg-blue-50 dark:hover:bg-blue-900 hover:border-blue-400 dark:hover:border-blue-500 hover:scale-105 cursor-pointer";
  };

  const renderSeatItem = (
    seat: SeatStatus | undefined,
    _: string,
    IconComponent = Armchair,
  ) => {
    if (!seat) {
      return <div className="w-full h-10 opacity-0"></div>;
    }

    const isDisabled = seat.status === "BOOKED";
    const isSelected = selectedSeats.includes(seat.seatId);

    return (
      <button
        key={seat.seatId}
        onClick={() => !isDisabled && onSeatSelect(seat.seatId)}
        disabled={isDisabled}
        className={`group relative flex flex-col items-center gap-1 transition-all duration-200 ${isDisabled ? "cursor-not-allowed" : "cursor-pointer"}`}
        title={isDisabled ? `Seat ${seat.seatNumber} - Booked` : ""}
      >
        <div
          className={`p-2 border-2 rounded-lg shadow-sm transition-all duration-200 ${getSeatStatusStyle(seat)}`}
        >
          <IconComponent size={20} strokeWidth={2.5} />
        </div>
        <span
          className={`text-[10px] font-medium transition-colors ${
            isSelected
              ? "text-blue-600 dark:text-blue-400"
              : isDisabled
                ? "text-gray-400 dark:text-gray-500"
                : "text-gray-600 dark:text-gray-400"
          }`}
        >
          {seat.seatNumber}
        </span>
      </button>
    );
  };

  const renderStandardLayout = () => {
    const rows = 8;
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-5 gap-x-2 mb-2">
          {["A", "B", "", "C", "D"].map((col, i) => (
            <div
              key={i}
              className={`text-center text-xs font-medium text-gray-500 ${col === "" ? "w-6" : ""}`}
            >
              {col}
            </div>
          ))}
        </div>
        {Array.from({ length: rows }).map((_, i) => {
          const r = i + 1;
          return (
            <div key={r} className="grid grid-cols-5 gap-x-2 gap-y-2">
              {renderSeatItem(findSeat("A", r), `A${r}`)}
              {renderSeatItem(findSeat("B", r), `B${r}`)}
              <div className="flex justify-center items-center text-xs text-gray-400 font-mono">
                {r}
              </div>
              {renderSeatItem(findSeat("C", r), `C${r}`)}
              {renderSeatItem(findSeat("D", r), `D${r}`)}
            </div>
          );
        })}
      </div>
    );
  };

  const renderVIPLayout = () => {
    const rows = 6;
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-4 gap-x-3 mb-2">
          {["A", "B", "", "C"].map((col, i) => (
            <div
              key={i}
              className={`text-center text-xs font-medium text-gray-500 ${col === "" ? "w-6" : ""}`}
            >
              {col}
            </div>
          ))}
        </div>
        {Array.from({ length: rows }).map((_, i) => {
          const r = i + 1;
          return (
            <div key={r} className="grid grid-cols-4 gap-x-3 gap-y-2">
              {renderSeatItem(findSeat("A", r), `A${r}`)}
              {renderSeatItem(findSeat("B", r), `B${r}`)}
              <div className="flex justify-center items-center text-xs text-gray-400 font-mono">
                {r}
              </div>
              {renderSeatItem(findSeat("C", r), `C${r}`)}
            </div>
          );
        })}
      </div>
    );
  };

  const renderLimousineLayout = () => {
    const rows = 4;
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-5 gap-x-2 mb-2">
          {["A", "B", "C", "", "D"].map((col, i) => (
            <div
              key={i}
              className={`text-center text-xs font-medium text-gray-500 ${col === "" ? "w-6" : ""}`}
            >
              {col}
            </div>
          ))}
        </div>
        {Array.from({ length: rows }).map((_, i) => {
          const r = i + 1;
          return (
            <div key={r} className="grid grid-cols-5 gap-x-2 gap-y-2">
              {renderSeatItem(findSeat("A", r), `A${r}`)}
              {renderSeatItem(findSeat("B", r), `B${r}`)}
              {renderSeatItem(findSeat("C", r), `C${r}`)}
              <div className="flex justify-center items-center text-xs text-gray-400 font-mono">
                {r}
              </div>
              {renderSeatItem(findSeat("D", r), `D${r}`)}
            </div>
          );
        })}
      </div>
    );
  };

  const renderSleeperLayout = () => {
    const rows = 4;

    const renderTier = (
      leftCol: string,
      rightCol: string,
      tierLabel: string,
    ) => (
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 mb-4">
        <div className="text-center text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
          {tierLabel}
        </div>
        <div className="grid grid-cols-3 gap-x-2 mb-2">
          <div className="text-center text-xs text-gray-500">{leftCol}</div>
          <div className="w-6"></div>
          <div className="text-center text-xs text-gray-500">{rightCol}</div>
        </div>
        {Array.from({ length: rows }).map((_, i) => {
          const r = i + 1;
          return (
            <div key={r} className="grid grid-cols-3 gap-x-2 gap-y-2 mb-2">
              {renderSeatItem(findSeat(leftCol, r), `${leftCol}${r}`, Bed)}
              <div className="flex justify-center items-center text-xs text-gray-400 font-mono">
                {r}
              </div>
              {renderSeatItem(findSeat(rightCol, r), `${rightCol}${r}`, Bed)}
            </div>
          );
        })}
      </div>
    );

    return (
      <div>
        {renderTier("A", "B", "Upper Tier")}
        {renderTier("C", "D", "Lower Tier")}
      </div>
    );
  };

  const renderSeatLayout = () => {
    switch (busType) {
      case BusType.STANDARD:
        return renderStandardLayout();
      case BusType.VIP:
        return renderVIPLayout();
      case BusType.SLEEPER:
        return renderSleeperLayout();
      case BusType.LIMOUSINE:
        return renderLimousineLayout();
      default:
        return renderStandardLayout();
    }
  };

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex items-center justify-center gap-4 pb-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-500 rounded-lg flex items-center justify-center">
            <Armchair size={16} className="text-gray-600 dark:text-gray-400" />
          </div>
          <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
            Available
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 dark:bg-blue-600 border-2 border-blue-600 dark:border-blue-500 rounded-lg flex items-center justify-center shadow-lg">
            <Armchair size={16} className="text-white" />
          </div>
          <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
            Selected
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 border-2 border-gray-400 dark:border-gray-500 rounded-lg flex items-center justify-center opacity-50">
            <Armchair size={16} className="text-gray-500 dark:text-gray-400" />
          </div>
          <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
            Booked
          </span>
        </div>
      </div>

      {/* Bus Container */}
      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 max-w-md mx-auto relative">
        {/* Bus Front */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gray-300 dark:bg-gray-600 px-4 py-1 rounded-lg text-[10px] text-center text-gray-700 dark:text-gray-300 font-bold uppercase tracking-wider shadow-sm">
          Front
        </div>

        {/* Driver */}
        <div className="flex justify-between items-end mb-4 pb-3 border-b-2 border-dashed border-gray-300 dark:border-gray-600">
          <div className="flex flex-col items-center gap-1">
            <div className="p-2 bg-gray-800 dark:bg-gray-700 rounded-lg text-white shadow-sm">
              <User size={18} />
            </div>
            <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300">
              Driver
            </span>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 italic">
            Entry →
          </div>
        </div>

        {/* Seat Layout */}
        <div className="py-2">{renderSeatLayout()}</div>

        {/* Bus Back */}
        <div className="mt-4 flex justify-center pt-3 border-t-2 border-gray-300 dark:border-gray-600">
          <div className="h-2 w-24 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
        </div>
      </div>

      {/* Selected Seats Info */}
      {selectedSeats.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Selected Seats: {selectedSeats.length}
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                {seats
                  .filter((s) => selectedSeats.includes(s.seatId))
                  .map((s) => s.seatNumber)
                  .join(", ")}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Total Price
              </p>
              <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
                đ
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
