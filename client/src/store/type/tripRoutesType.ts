import { Trip } from "./tripsType";

export interface TripRoute {
  id: string;
  tripId: string;
  routeId: string;
  trip: Trip;
}
