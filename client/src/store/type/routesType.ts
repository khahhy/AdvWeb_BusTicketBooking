import { Location } from "./locationsType";
import { TripRouteMap } from "./tripRoutesType";

export interface Route {
  id: string;
  originLocationId: string;
  destinationLocationId: string;
  name: string;
  description: string | null;
  price: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  origin: Location;
  destination: Location;
  tripRouteMaps: TripRouteMap[];
}

export interface RouteTime extends Route {
  departureTime: Date;
}
export interface CreateRouteDto {
  originLocationId: string;
  destinationLocationId: string;
  description?: string;
}

export interface UpdateRouteDto extends Partial<CreateRouteDto> {
  isActive?: boolean;
}

export interface GetRouteTripsDto {
  startDate?: string;
  endDate?: string;
}

export interface TripRouteMapDetail {
  tripId: string;
  routeId: string;
  price: number;
  tripName: string;
  startTime?: string;
  endTime?: string;
  bus: {
    id: string;
    plate: string;
    busType: string;
    amenities: string[];
  };
  routeName: string;
  origin: string;
  originCity: string;
  destination: string;
  destinationCity: string;
}

export interface BackendSeat {
  id: string;
  busId: string;
  seatNumber: string;
}

export interface TopPerformingRoute {
  routeId: string;
  routeName: string;
  origin: string;
  destination: string;
  totalBookings: number;
  totalRevenue: number;
  minPrice?: number;
  duration?: string;
}

export interface SearchTripRouteResult {
  tripId: string;
  startTime: string;
  endTime: string;
  price: number;
  busName: string;
  amenities: string[];
  pickupLocation: string;
  dropoffLocation: string;
  availableSeats?: number;
}

export interface RouteTripAvailable {
  tripId: string;
  startTime: string;
  endTime: string;
  busName: string;
  busType: string;
  amenities: string[];
  pickupLocation: string;
  dropoffLocation: string;
  pricing: {
    basePrice: number;
    surcharge: string;
    surchargeReason: string;
    busTypeFactor: number;
    finalPrice: number;
    currency: string;
  };
}

export interface TripResponseRaw {
  id: string;
  tripName: string;
  startTime: string;
  endTime: string;
  tripStops?: {
    id: string;
    sequence: number;
    locationId: string;
    location: Location;
  }[];
  bus?: {
    id: string;
    plate: string;
    busType: string;
    amenities: Record<string, unknown>;
  };
}
