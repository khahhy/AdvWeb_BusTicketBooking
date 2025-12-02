import { Trip } from "./tripsType";
import { BusType } from "./busType";

export interface TripRoute {
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

export interface QueryTripRouteParams {
  page?: number;
  limit?: number;
  routeId?: string;
  tripId?: string;
  locationId?: string;
  originLocationId?: string;
  destinationLocationId?: string;
  minPrice?: number;
  maxPrice?: number;
  sortByPrice?: "asc" | "desc";
  // Advanced filtering
  departureDate?: string;
  departureTimeStart?: string;
  departureTimeEnd?: string;
  busType?: BusType[];
  amenities?: string[];
  seatCapacity?: string[];
}

export interface TripRouteResponse {
  message: string;
  data: {
    items: TripRoute[];
    meta: {
      total: number;
      page: number;
      limit: number;
      lastPage: number;
    };
  };
}
