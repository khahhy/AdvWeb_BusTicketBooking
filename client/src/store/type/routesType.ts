import { TripRoute } from "./tripRoutesType";
import { Location } from "./locationsType";

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
  tripRoutes: TripRoute[];
}

export interface RouteTime extends Route {
  departureTime: Date;
}
