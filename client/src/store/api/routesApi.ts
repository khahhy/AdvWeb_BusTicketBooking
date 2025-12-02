import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./baseQuery";
import { type Route } from "@/store/type/routesType";
import {
  type QueryTripRouteParams,
  type TripRouteResponse,
} from "@/store/type/tripRoutesType";

interface Location {
  id: string;
  name: string;
  city: string;
  address?: string;
}

interface SearchTripParams {
  originCity?: string;
  destinationCity?: string;
  departureDate?: string;
  includeStops?: string;
  includeRoutes?: string;
}

interface TripStop {
  id: string;
  sequence: number;
  locationId: string;
  arrivalTime?: string;
  departureTime?: string;
  location: Location;
}

interface TripRoute {
  id: string;
  price: number;
  // Add other route properties as needed
}

interface TripResponse {
  id: string;
  tripName: string;
  startTime: string;
  endTime: string;
  tripStops?: TripStop[];
  bus?: {
    id: string;
    plate: string;
    busType: string;
    seatCapacity: string;
    amenities: Record<string, unknown>;
  };
}

export interface SearchTripResult {
  id: string;
  tripName: string;
  routeName: string;
  departureTime: string;
  arrivalTime: string;
  originStop: TripStop;
  destinationStop: TripStop;
  bus: {
    id: string;
    plate: string;
    busType: string;
    seatCapacity: string;
    amenities?: { [key: string]: boolean };
  };
  tripStops?: TripStop[];
  tripRoutes?: TripRoute[];
}

interface SearchTripResponse {
  message: string;
  data: SearchTripResult[];
  count: number;
  searchCriteria: {
    originCity?: string;
    destinationCity?: string;
    departureDate?: string;
    foundOriginLocations: number;
    foundDestinationLocations: number;
  };
}

interface ApiResponse<T> {
  message: string;
  data: T;
}

export const routesApi = createApi({
  reducerPath: "api",
  baseQuery: baseQuery,
  tagTypes: ["Route", "TripRoute", "Location"],

  endpoints: (builder) => ({
    getRoutes: builder.query<Route[], void>({
      query: () => "/routes",
      providesTags: ["Route"],
      transformResponse: (response: ApiResponse<Route[]>) => response.data,
    }),

    getRouteById: builder.query<Route, string>({
      query: (id) => `/routes/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Route", id }],
      transformResponse: (response: ApiResponse<Route>) => response.data,
    }),

    getLocations: builder.query<
      Location[],
      { search?: string; city?: string } | void
    >({
      query: (params) => {
        if (!params) return "/locations";
        const searchParams = new URLSearchParams();
        if (params.search) searchParams.append("search", params.search);
        if (params.city) searchParams.append("city", params.city);
        return `/locations?${searchParams.toString()}`;
      },
      providesTags: ["Location"],
      transformResponse: (response: ApiResponse<Location[]>) => response.data,
    }),

    getTripRouteMap: builder.query<
      TripRouteResponse["data"],
      QueryTripRouteParams
    >({
      query: (params) => {
        const searchParams = new URLSearchParams();

        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              value.forEach((item) =>
                searchParams.append(key, item.toString()),
              );
            } else {
              searchParams.append(key, value.toString());
            }
          }
        });

        return `/routes/trip-maps?${searchParams.toString()}`;
      },
      providesTags: ["TripRoute"],
      transformResponse: (response: TripRouteResponse) => response.data,
    }),

    searchTrips: builder.query<SearchTripResult[], SearchTripParams>({
      query: (params) => {
        const searchParams = new URLSearchParams();

        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            searchParams.append(key, value.toString());
          }
        });

        return `/trips/search?${searchParams.toString()}`;
      },
      providesTags: ["TripRoute"],
      transformResponse: (response: SearchTripResponse) => response.data,
    }),

    getTripById: builder.query<SearchTripResult, string>({
      query: (id) => `/trips/${id}?includeRoutes=true`,
      providesTags: (_result, _error, id) => [{ type: "TripRoute", id }],
      transformResponse: (trip: TripResponse) => {
        // Transform the response to match SearchTripResult format
        const originStop = trip.tripStops?.find((stop) => stop.sequence === 1);
        const destinationStop = trip.tripStops?.find(
          (stop) =>
            stop.sequence ===
            Math.max(...(trip.tripStops?.map((s) => s.sequence) || [0])),
        );

        return {
          id: trip.id,
          tripName: trip.tripName,
          routeName: `${originStop?.location?.city || ""} - ${destinationStop?.location?.city || ""}`,
          departureTime: trip.startTime,
          arrivalTime: trip.endTime,
          originStop: originStop || {
            id: "",
            sequence: 1,
            locationId: "",
            departureTime: trip.startTime,
            location: { id: "", name: "", city: "" },
          },
          destinationStop: destinationStop || {
            id: "",
            sequence: 2,
            locationId: "",
            arrivalTime: trip.endTime,
            location: { id: "", name: "", city: "" },
          },
          bus: trip.bus || {
            id: "",
            plate: "Unknown",
            busType: "standard",
            seatCapacity: "SEAT_32",
            amenities: {},
          },
          tripStops: trip.tripStops || [],
          tripRoutes: trip.tripRoutes || [],
        };
      },
    }),
  }),
});

export const {
  useGetRoutesQuery,
  useGetRouteByIdQuery,
  useGetTripRouteMapQuery,
  useGetLocationsQuery,
  useSearchTripsQuery,
  useGetTripByIdQuery,
} = routesApi;
