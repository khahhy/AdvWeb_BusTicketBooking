export enum BusType {
  STANDARD = "standard",
  VIP = "vip",
  SLEEPER = "sleeper",
  LIMOUSINE = "limousine",
}

export interface BusAmenities {
  tv: boolean;
  wifi: boolean;
  snack: boolean;
  water: boolean;
  toilet: boolean;
  blanket: boolean;
  charger: boolean;
  airCondition: boolean;
  entertainment?: boolean;
  usb?: boolean;
  reclining?: boolean;
}

export interface Bus {
  id: string;
  plate: string;
  busType: BusType;
  amenities: BusAmenities;
  createdAt: string;
  updatedAt: string;
}

export interface SeatLayout {
  busType: BusType;
  totalSeats: number;
  layout: {
    columns: number[];
    rows: number;
    aisles: number[];
  };
  description: string;
}

export interface CreateBusRequest {
  plate: string;
  busType: BusType;
  amenities: BusAmenities;
}

export interface UpdateBusRequest extends CreateBusRequest {
  id: string;
}
