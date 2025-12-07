import { BusType } from "@/store/type/busType";
import SeatLayoutPreview from "./SeatLayoutPreview";

interface BusLayoutSelectorProps {
  selectedBusType?: BusType;
  onBusTypeChange: (busType: BusType) => void;
}

export default function BusLayoutSelector({
  selectedBusType,
  onBusTypeChange,
}: BusLayoutSelectorProps) {
  const handleBusTypeChange = (busType: BusType) => {
    onBusTypeChange(busType);
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
                  className="mt-2 scale-75 border-0 shadow-sm"
                />
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Layout Preview */}
      {selectedBusType && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Selected Configuration
          </h3>
          <div className="flex justify-center">
            <SeatLayoutPreview
              busType={selectedBusType}
              className="p-6 shadow-md"
            />
          </div>
        </div>
      )}
    </div>
  );
}
