import { Trip } from "./tripsType";
import { BusType } from "./busType";
import { PaginationParams } from "./shared";

export interface TripRouteMap {
  id: string;
  tripId: string;
  routeId: string;
  price: number;
  trip: Trip;
  route: {
    name: string;
    origin: {
      city: string;
      name: string;
    };
    destination: {
      city: string;
      name: string;
    };
  };
}

export interface TripRouteMapResponse {
  items: TripRouteMap[];
  meta: {
    total: number;
    page: number;
    limit: number;
    lastPage: number;
  };
}

export interface QueryTripRouteMapParams extends PaginationParams {
  routeId?: string;
  tripId?: string;
  locationId?: string;
  originLocationId?: string;
  destinationLocationId?: string;
  routeName?: string;
  minPrice?: number;
  maxPrice?: number;
  sortByPrice?: "asc" | "desc";
  departureDate?: string;
  departureTimeStart?: string;
  departureTimeEnd?: string;
  busType?: BusType[];
  amenities?: string[];
  seatCapacity?: string[];
}

export interface CreateTripRouteMapDto {
  tripId: string;
  routeId: string;
  manualPrice?: number;
}
