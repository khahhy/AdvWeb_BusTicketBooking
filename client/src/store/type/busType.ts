export enum BusType {
  STANDARD = 'standard',
  VIP = 'vip',
  SLEEPER = 'sleeper',
  LIMOUSINE = 'limousine',
}

export interface Bus {
  id: string;
  plate: string;
  busType: BusType;
  amenities: Record<string, boolean>;
  createdAt: string;
  updatedAt: string;
}

export interface BusAmenities {
  wifi?: boolean;
  airCondition?: boolean;
  tv?: boolean;
  toilet?: boolean;
  blanket?: boolean;
  snack?: boolean;
  entertainment?: boolean;
  usb?: boolean;
  reclining?: boolean;
}
