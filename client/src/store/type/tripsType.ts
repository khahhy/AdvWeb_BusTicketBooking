import { Bus } from "./busType";
import { Location } from "./locationsType";

export enum TripStatus {
  Scheduled = "scheduled",
  Ongoing = "ongoing",
  Completed = "completed",
  Cancelled = "cancelled",
  Delayed = "delayed",
}

export interface TripStop {
  id: string;
  locationId: string;
  sequence: number;
  arrivalTime: string | null;
  departureTime: string | null;
  location?: Location;
}

export interface TripSegment {
  id: string;
  fromStopId: string;
  toStopId: string;
  segmentIndex: number;
  durationMinutes: number | null;
}

export interface Trip {
  id: string;
  busId: string;
  tripName?: string;
  startTime: string;
  endTime: string;
  status: TripStatus;
  createdAt: string;
  updatedAt: string;
  bus?: Bus;
  tripStops?: TripStop[];
  segments?: TripSegment[];
  routeName?: string;
  originStop?: TripStop;
  destinationStop?: TripStop;
}

export interface CreateTripRequest {
  busId: string;
  stops: {
    locationId: string;
    arrivalTime?: string;
    departureTime?: string;
  }[];
}

export interface UpdateTripRequest extends Partial<CreateTripRequest> {
  id: string;
}

export interface TripQueryParams {
  startTime?: string;
  endTime?: string;
  origin?: string;
  destination?: string;
  busId?: string;
  status?: TripStatus;
  includeStops?: boolean;
  includeSegments?: boolean;
}

export interface SearchTripParams {
  originCity?: string;
  destinationCity?: string;
  departureDate?: string;
  includeStops?: boolean;
  includeRoutes?: boolean;
}

export interface SeatStatus {
  seatId: string;
  seatNumber: string;
  coordinates?: Record<string, unknown> | null;
  status: "AVAILABLE" | "BOOKED" | "LOCKED";
}
