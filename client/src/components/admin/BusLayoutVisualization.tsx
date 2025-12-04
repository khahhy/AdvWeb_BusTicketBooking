import React, { useState } from "react";
import { ChevronLeft, ChevronRight, User, Armchair, Bed } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BusType } from "@/store/type/busType";

interface BusLayoutVisualizationProps {
  className?: string;
}

const BusLayoutVisualization: React.FC<BusLayoutVisualizationProps> = ({
  className = "",
}) => {
  const [currentLayoutIndex, setCurrentLayoutIndex] = useState(0);

  const busLayouts = [
    {
      type: BusType.STANDARD,
      name: "Standard Bus",
      description: "2-2 Layout",
      capacity: 32,
      color: "bg-blue-100 text-blue-800",
      seats: generateStandardSeats(8), // 8 rows × 4 seats = 32
    },
    {
      type: BusType.VIP,
      name: "VIP Bus",
      description: "2-1 Layout",
      capacity: 16,
      color: "bg-purple-100 text-purple-800",
      seats: generateVIPSeats(6), // ~6 rows × 3 seats = 18, close to 16
    },
    {
      type: BusType.SLEEPER,
      name: "Sleeper Bus",
      description: "2-tier Layout",
      capacity: 16,
      color: "bg-green-100 text-green-800",
      seats: generateSleeperBeds(4), // 4 rows × 2 tiers × 2 beds = 16
    },
    {
      type: BusType.LIMOUSINE,
      name: "Limousine Bus",
      description: "1-2-1 Layout",
      capacity: 16,
      color: "bg-yellow-100 text-yellow-800",
      seats: generateLimousineSeats(4), // 4 rows × 4 seats = 16
    },
  ];

  const nextLayout = () => {
    setCurrentLayoutIndex((prev) => (prev + 1) % busLayouts.length);
  };

  const prevLayout = () => {
    setCurrentLayoutIndex(
      (prev) => (prev - 1 + busLayouts.length) % busLayouts.length,
    );
  };

  const currentLayout = busLayouts[currentLayoutIndex];

  return (
    <Card className={`border shadow-sm ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={prevLayout}
            className="p-2"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="text-center">
            <h3 className="text-lg font-semibold">{currentLayout.name}</h3>
            <Badge className={currentLayout.color}>
              {currentLayout.description} • {currentLayout.capacity}{" "}
              {currentLayout.type === BusType.SLEEPER ? "beds" : "seats"}
            </Badge>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={nextLayout}
            className="p-2"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-xl border-2 border-gray-300 dark:border-gray-600 w-full max-w-[350px] mx-auto relative">
          {/* Bus Front */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gray-300 dark:bg-gray-600 w-24 h-4 rounded-b-lg text-[10px] text-center text-gray-600 dark:text-gray-300 font-bold uppercase tracking-wider">
            FRONT
          </div>

          {/* Driver & Entry */}
          <div className="flex justify-between items-end mb-4 mt-2 border-b-2 border-dashed border-gray-300 dark:border-gray-600 pb-2">
            <div className="flex flex-col items-center gap-1">
              <div className="p-2 bg-slate-800 dark:bg-slate-700 rounded-lg text-white shadow-sm">
                <User size={20} />
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Driver
              </span>
            </div>
            <div className="text-xs text-gray-400 dark:text-gray-500 italic pr-2">
              Entry Door
            </div>
          </div>

          {/* Seat Layout */}
          <div className="space-y-2">{currentLayout.seats}</div>

          {/* Bus Back */}
          <div className="mt-6 flex justify-center">
            <div className="h-2 w-32 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
          </div>
        </div>

        {/* Layout Info */}
        <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>Click arrows to switch between bus types</p>
        </div>
      </CardContent>
    </Card>
  );
};

function generateStandardSeats(numRows: number = 8) {
  const rows = Array.from({ length: numRows }, (_, i) => i + 1);

  return (
    <>
      {/* Column Headers */}
      <div className="grid grid-cols-5 gap-x-1 mb-2">
        <div className="text-center text-xs font-medium text-gray-400 dark:text-gray-500">
          A
        </div>
        <div className="text-center text-xs font-medium text-gray-400 dark:text-gray-500">
          B
        </div>
        <div className="w-4"></div>
        <div className="text-center text-xs font-medium text-gray-400 dark:text-gray-500">
          C
        </div>
        <div className="text-center text-xs font-medium text-gray-400 dark:text-gray-500">
          D
        </div>
      </div>

      {rows.map((row) => (
        <div key={row} className="grid grid-cols-5 gap-x-1 gap-y-2">
          <SeatIcon label={`A${row}`} />
          <SeatIcon label={`B${row}`} />
          <div className="flex justify-center items-center">
            <span className="text-[10px] text-gray-300 font-mono">{row}</span>
          </div>
          <SeatIcon label={`C${row}`} />
          <SeatIcon label={`D${row}`} />
        </div>
      ))}
    </>
  );
}

function generateVIPSeats(numRows: number = 6) {
  const rows = Array.from({ length: numRows }, (_, i) => i + 1);

  return (
    <>
      {/* Column Headers */}
      <div className="grid grid-cols-4 gap-x-2 mb-2">
        <div className="text-center text-xs font-medium text-gray-400 dark:text-gray-500">
          A
        </div>
        <div className="text-center text-xs font-medium text-gray-400 dark:text-gray-500">
          B
        </div>
        <div className="w-4"></div>
        <div className="text-center text-xs font-medium text-gray-400 dark:text-gray-500">
          C
        </div>
      </div>

      {rows.map((row) => (
        <div key={row} className="grid grid-cols-4 gap-x-2 gap-y-2">
          <VIPSeatIcon label={`A${row}`} />
          <VIPSeatIcon label={`B${row}`} />
          <div className="flex justify-center items-center">
            <span className="text-[10px] text-gray-300 font-mono">{row}</span>
          </div>
          <VIPSeatIcon label={`C${row}`} />
        </div>
      ))}
    </>
  );
}

function generateSleeperBeds(numRows: number = 4) {
  const rows = Array.from({ length: numRows }, (_, i) => i + 1);

  return (
    <>
      {/* Double-decker header */}
      <div className="text-center text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
        Double-decker (2 tiers)
      </div>

      {/* Upper tier */}
      <div className="bg-gray-200 dark:bg-gray-700 rounded p-2 mb-2">
        <div className="text-center text-[10px] text-gray-600 dark:text-gray-400 mb-1">
          Upper Tier
        </div>
        <div className="grid grid-cols-3 gap-x-2 mb-1">
          <div className="text-center text-xs font-medium text-gray-400 dark:text-gray-500">
            A
          </div>
          <div className="w-4"></div>
          <div className="text-center text-xs font-medium text-gray-400 dark:text-gray-500">
            B
          </div>
        </div>
        {rows.map((row) => (
          <div
            key={`upper-${row}`}
            className="grid grid-cols-3 gap-x-2 gap-y-1 mb-1"
          >
            <BedIcon label={`A${row}`} />
            <div className="flex justify-center items-center">
              <span className="text-[9px] text-gray-300 font-mono">{row}</span>
            </div>
            <BedIcon label={`B${row}`} />
          </div>
        ))}
      </div>

      {/* Lower tier */}
      <div className="bg-gray-200 dark:bg-gray-700 rounded p-2">
        <div className="text-center text-[10px] text-gray-600 dark:text-gray-400 mb-1">
          Lower Tier
        </div>
        <div className="grid grid-cols-3 gap-x-2 mb-1">
          <div className="text-center text-xs font-medium text-gray-400 dark:text-gray-500">
            C
          </div>
          <div className="w-4"></div>
          <div className="text-center text-xs font-medium text-gray-400 dark:text-gray-500">
            D
          </div>
        </div>
        {rows.map((row) => (
          <div
            key={`lower-${row}`}
            className="grid grid-cols-3 gap-x-2 gap-y-1 mb-1"
          >
            <BedIcon label={`C${row}`} />
            <div className="flex justify-center items-center">
              <span className="text-[9px] text-gray-300 font-mono">{row}</span>
            </div>
            <BedIcon label={`D${row}`} />
          </div>
        ))}
      </div>
    </>
  );
}

function generateLimousineSeats(numRows: number = 4) {
  const rows = Array.from({ length: numRows }, (_, i) => i + 1);

  return (
    <>
      {/* Column Headers */}
      <div className="grid grid-cols-5 gap-x-1 mb-2">
        <div className="text-center text-xs font-medium text-gray-400 dark:text-gray-500">
          A
        </div>
        <div className="text-center text-xs font-medium text-gray-400 dark:text-gray-500">
          B
        </div>
        <div className="text-center text-xs font-medium text-gray-400 dark:text-gray-500">
          C
        </div>
        <div className="w-4"></div>
        <div className="text-center text-xs font-medium text-gray-400 dark:text-gray-500">
          D
        </div>
      </div>

      {rows.map((row) => (
        <div key={row} className="grid grid-cols-5 gap-x-1 gap-y-2">
          <LuxurySeatIcon label={`A${row}`} />
          <LuxurySeatIcon label={`B${row}`} />
          <LuxurySeatIcon label={`C${row}`} />
          <div className="flex justify-center items-center">
            <span className="text-[10px] text-gray-300 font-mono">{row}</span>
          </div>
          <LuxurySeatIcon label={`D${row}`} />
        </div>
      ))}
    </>
  );
}

const SeatIcon = ({ label }: { label: string }) => (
  <div
    className="group flex flex-col items-center gap-0.5 cursor-pointer hover:scale-105 transition-transform"
    title={`Seat ${label}`}
  >
    <div className="p-1.5 bg-white dark:bg-gray-700 border border-blue-200 dark:border-blue-600 rounded-md shadow-sm text-blue-500 dark:text-blue-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-900 group-hover:border-blue-400 dark:group-hover:border-blue-500 transition-colors">
      <Armchair size={16} strokeWidth={2.5} />
    </div>
    <span className="text-[9px] font-medium text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400">
      {label}
    </span>
  </div>
);

const VIPSeatIcon = ({ label }: { label: string }) => (
  <div
    className="group flex flex-col items-center gap-0.5 cursor-pointer hover:scale-105 transition-transform"
    title={`VIP Seat ${label}`}
  >
    <div className="p-2 bg-purple-50 dark:bg-purple-900 border border-purple-200 dark:border-purple-600 rounded-lg shadow-sm text-purple-600 dark:text-purple-400 group-hover:bg-purple-100 dark:group-hover:bg-purple-800 transition-colors">
      <Armchair size={18} strokeWidth={2.5} />
    </div>
    <span className="text-[9px] font-medium text-purple-600 dark:text-purple-400 group-hover:text-purple-700 dark:group-hover:text-purple-300">
      {label}
    </span>
  </div>
);

const BedIcon = ({ label }: { label: string }) => (
  <div
    className="group flex flex-col items-center gap-0.5 cursor-pointer hover:scale-105 transition-transform"
    title={`Bed ${label}`}
  >
    <div className="p-2 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-600 rounded-lg shadow-sm text-green-600 dark:text-green-400 group-hover:bg-green-100 dark:group-hover:bg-green-800 transition-colors">
      <Bed size={20} strokeWidth={2.5} />
    </div>
    <span className="text-[9px] font-medium text-green-600 dark:text-green-400 group-hover:text-green-700 dark:group-hover:text-green-300">
      {label}
    </span>
  </div>
);

const LuxurySeatIcon = ({ label }: { label: string }) => (
  <div
    className="group flex flex-col items-center gap-0.5 cursor-pointer hover:scale-105 transition-transform"
    title={`Luxury Seat ${label}`}
  >
    <div className="p-2 bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-600 rounded-lg shadow-sm text-yellow-600 dark:text-yellow-400 group-hover:bg-yellow-100 dark:group-hover:bg-yellow-800 transition-colors">
      <Armchair size={20} strokeWidth={2.5} />
    </div>
    <span className="text-[9px] font-medium text-yellow-600 dark:text-yellow-400 group-hover:text-yellow-700 dark:group-hover:text-yellow-300">
      {label}
    </span>
  </div>
);

export default BusLayoutVisualization;
