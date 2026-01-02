import { BusType } from "@/store/type/busType";

export interface SeatLayoutConfig {
  busType: BusType;
  totalSeats: number;
  layout: {
    columns: number[];
    rows: number;
    aisles: number[];
  };
  description: string;
}

export const BUS_LAYOUT_CONFIGS: Record<BusType, SeatLayoutConfig[]> = {
  [BusType.STANDARD]: [
    {
      busType: BusType.STANDARD,
      totalSeats: 32,
      layout: { columns: [2, 2], rows: 8, aisles: [2] },
      description: "Standard 32 seats (2-2 layout)",
    },
  ],
  [BusType.VIP]: [
    {
      busType: BusType.VIP,
      totalSeats: 18,
      layout: { columns: [2, 1], rows: 6, aisles: [2] },
      description: "VIP 18 seats (2-1 layout)",
    },
  ],
  [BusType.SLEEPER]: [
    {
      busType: BusType.SLEEPER,
      totalSeats: 16,
      layout: { columns: [1, 1], rows: 4, aisles: [1] },
      description: "Sleeper 16 beds (1-1 layout)",
    },
  ],
  [BusType.LIMOUSINE]: [
    {
      busType: BusType.LIMOUSINE,
      totalSeats: 16,
      layout: { columns: [1, 1, 1, 1], rows: 4, aisles: [1, 2, 3] },
      description: "Limousine 16 seats (1-1-1-1 layout)",
    },
  ],
};
