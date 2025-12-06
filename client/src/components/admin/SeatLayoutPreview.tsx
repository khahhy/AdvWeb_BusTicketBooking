import { BUS_LAYOUT_CONFIGS } from "@/constants/bus-layouts";
import { BusType } from "@/store/type/busType";

interface SeatLayoutPreviewProps {
  busType: BusType;
  className?: string;
}

export default function SeatLayoutPreview({
  busType,
  className = "",
}: SeatLayoutPreviewProps) {
  const layout = BUS_LAYOUT_CONFIGS[busType]?.[0];

  if (!layout) return null;

  const { columns, rows } = layout.layout;
  const totalSeats = layout.totalSeats;

  const renderSeatGrid = () => {
    const seats = [];
    let seatNumber = 1;

    // For sleeper buses, render 2 decks
    if (busType === BusType.SLEEPER) {
      // Upper deck
      seats.push(
        <div
          key="upper-label"
          className="text-[8px] text-gray-500 text-center mb-0.5"
        >
          Upper Deck
        </div>,
      );
      for (let row = 0; row < rows / 2; row++) {
        const seatRow = [];
        for (
          let sectionIndex = 0;
          sectionIndex < columns.length;
          sectionIndex++
        ) {
          const columnCount = columns[sectionIndex];
          for (let col = 0; col < columnCount; col++) {
            if (seatNumber <= totalSeats / 2) {
              seatRow.push(
                <div
                  key={`seat-${seatNumber}`}
                  className="w-6 h-4 bg-purple-200 border border-purple-400 rounded text-[9px] flex items-center justify-center font-semibold text-purple-700"
                  title={`Upper ${seatNumber}`}
                >
                  {seatNumber}
                </div>,
              );
              seatNumber++;
            }
          }
          if (sectionIndex < columns.length - 1) {
            seatRow.push(
              <div
                key={`aisle-u-${row}-${sectionIndex}`}
                className="w-3"
              ></div>,
            );
          }
        }
        seats.push(
          <div
            key={`row-upper-${row}`}
            className="flex gap-0.5 justify-center items-center"
          >
            {seatRow}
          </div>,
        );
      }

      // Separator
      seats.push(
        <div
          key="separator"
          className="h-2 border-t border-gray-300 my-1"
        ></div>,
      );

      // Lower deck
      seats.push(
        <div
          key="lower-label"
          className="text-[8px] text-gray-500 text-center mb-0.5"
        >
          Lower Deck
        </div>,
      );
      for (let row = 0; row < rows / 2; row++) {
        const seatRow = [];
        for (
          let sectionIndex = 0;
          sectionIndex < columns.length;
          sectionIndex++
        ) {
          const columnCount = columns[sectionIndex];
          for (let col = 0; col < columnCount; col++) {
            if (seatNumber <= totalSeats) {
              seatRow.push(
                <div
                  key={`seat-${seatNumber}`}
                  className="w-6 h-4 bg-blue-200 border border-blue-400 rounded text-[9px] flex items-center justify-center font-semibold text-blue-700"
                  title={`Lower ${seatNumber}`}
                >
                  {seatNumber}
                </div>,
              );
              seatNumber++;
            }
          }
          if (sectionIndex < columns.length - 1) {
            seatRow.push(
              <div
                key={`aisle-l-${row}-${sectionIndex}`}
                className="w-3"
              ></div>,
            );
          }
        }
        seats.push(
          <div
            key={`row-lower-${row}`}
            className="flex gap-0.5 justify-center items-center"
          >
            {seatRow}
          </div>,
        );
      }
      return seats;
    }

    // For non-sleeper buses
    for (let row = 0; row < rows; row++) {
      const seatRow = [];

      for (
        let sectionIndex = 0;
        sectionIndex < columns.length;
        sectionIndex++
      ) {
        const columnCount = columns[sectionIndex];

        // Add seats for this section
        for (let col = 0; col < columnCount; col++) {
          if (seatNumber <= totalSeats) {
            seatRow.push(
              <div
                key={`seat-${seatNumber}`}
                className="w-5 h-5 bg-blue-200 border border-blue-400 rounded text-[9px] flex items-center justify-center font-semibold text-blue-700"
                title={`Seat ${seatNumber}`}
              >
                {seatNumber}
              </div>,
            );
            seatNumber++;
          }
        }

        // Add aisle after section (except last section)
        if (sectionIndex < columns.length - 1) {
          seatRow.push(
            <div key={`aisle-${row}-${sectionIndex}`} className="w-3"></div>,
          );
        }
      }

      // Only add row if we have seats
      if (seatRow.length > 0) {
        seats.push(
          <div
            key={`row-${row}`}
            className="flex gap-0.5 justify-center items-center"
          >
            {seatRow}
          </div>,
        );
      }
    }

    return seats;
  };

  return (
    <div className={`bg-white p-3 rounded border ${className}`}>
      {/* Bus Type Label */}
      <div className="text-center mb-2">
        <span className="text-xs font-medium text-gray-600 capitalize">
          {busType}
        </span>
        <div className="text-[10px] text-gray-400">{layout.description}</div>
      </div>

      {/* Driver area */}
      <div className="flex justify-center mb-1">
        <div className="w-6 h-3 bg-gray-300 rounded-sm"></div>
      </div>

      {/* Seat Layout */}
      <div className="space-y-0.5">{renderSeatGrid()}</div>

      {/* Bus info */}
      <div className="text-center mt-2 text-[10px] text-gray-500">
        {totalSeats} {busType === BusType.SLEEPER ? "beds" : "seats"}
      </div>
    </div>
  );
}
