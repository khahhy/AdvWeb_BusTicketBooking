import { SEAT_LAYOUTS } from "@/store/api/busApi";
import { BusType, SeatCapacity } from "@/store/type/busType";
import SeatLayoutPreview from "./SeatLayoutPreview";

interface BusLayoutSelectorProps {
  selectedBusType?: BusType;
  selectedSeatCapacity?: SeatCapacity;
  onBusTypeChange: (busType: BusType) => void;
  onSeatCapacityChange: (seatCapacity: SeatCapacity) => void;
}

export default function BusLayoutSelector({
  selectedBusType,
  selectedSeatCapacity,
  onBusTypeChange,
  onSeatCapacityChange,
}: BusLayoutSelectorProps) {
  const availableCapacities = selectedBusType
    ? SEAT_LAYOUTS[selectedBusType]?.map((layout) => layout.seatCapacity) || []
    : [];

  const handleBusTypeChange = (busType: BusType) => {
    onBusTypeChange(busType);

    // Auto-select first available capacity
    const firstCapacity = SEAT_LAYOUTS[busType]?.[0]?.seatCapacity;
    if (firstCapacity) {
      onSeatCapacityChange(firstCapacity);
    }
  };

  return (
    <div className="space-y-6">
      {/* Bus Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Bus Type *
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.values(BusType).map((type) => (
            <div key={type}>
              <input
                type="radio"
                id={`busType-${type}`}
                name="busType"
                value={type}
                checked={selectedBusType === type}
                onChange={() => handleBusTypeChange(type)}
                className="sr-only peer"
              />
              <label
                htmlFor={`busType-${type}`}
                className="flex flex-col items-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 peer-checked:border-blue-500 peer-checked:bg-blue-50 transition-colors"
              >
                <span className="text-sm font-medium capitalize text-gray-700">
                  {type}
                </span>
                <SeatLayoutPreview
                  busType={type}
                  seatCapacity={
                    SEAT_LAYOUTS[type]?.[0]?.seatCapacity ||
                    SeatCapacity.SEAT_32
                  }
                  className="mt-2 scale-75 border-0 shadow-sm"
                />
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Seat Capacity Selection */}
      {selectedBusType && availableCapacities.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Seat Capacity *
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {availableCapacities.map((capacity) => {
              const layout = SEAT_LAYOUTS[selectedBusType]?.find(
                (l) => l.seatCapacity === capacity,
              );
              return (
                <div key={capacity}>
                  <input
                    type="radio"
                    id={`capacity-${capacity}`}
                    name="seatCapacity"
                    value={capacity}
                    checked={selectedSeatCapacity === capacity}
                    onChange={() => onSeatCapacityChange(capacity)}
                    className="sr-only peer"
                  />
                  <label
                    htmlFor={`capacity-${capacity}`}
                    className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 peer-checked:border-blue-500 peer-checked:bg-blue-50 transition-colors"
                  >
                    <span className="text-lg font-bold text-gray-700 mb-1">
                      {capacity.replace("SEAT_", "")}
                    </span>
                    <span className="text-xs text-gray-500 mb-3 text-center">
                      {selectedBusType === BusType.SLEEPER ? "beds" : "seats"}
                    </span>
                    <SeatLayoutPreview
                      busType={selectedBusType}
                      seatCapacity={capacity}
                      className="border-0 shadow-sm scale-90"
                    />
                    <div className="text-xs text-gray-400 mt-2 text-center">
                      {layout?.description}
                    </div>
                  </label>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected Layout Preview */}
      {selectedBusType && selectedSeatCapacity && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Selected Configuration
          </h3>
          <div className="flex justify-center">
            <SeatLayoutPreview
              busType={selectedBusType}
              seatCapacity={selectedSeatCapacity}
              className="p-6 shadow-md"
            />
          </div>
        </div>
      )}
    </div>
  );
}
