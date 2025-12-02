import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./baseQuery";
import { type Route } from "@/store/type/routesType";
import {
  type QueryTripRouteParams,
  type TripRouteResponse,
} from "@/store/type/tripRoutesType";

interface ApiResponse<T> {
  message: string;
  data: T;
}

export interface Location {
  id: string;
  name: string;
  city: string;
  address?: string;
  latitude?: number;
  longitude?: number;
}

interface CreateRouteDto {
  originLocationId: string;
  destinationLocationId: string;
  description?: string;
}

interface UpdateRouteDto extends Partial<CreateRouteDto> {
  isActive?: boolean;
}

interface CreateTripRouteMapDto {
  tripId: string;
  routeId: string;
  manualPrice?: number;
}

interface TripRouteMap {
  tripId: string;
  routeId: string;
  price: number;
  createdAt?: string;
  updatedAt?: string;
}

interface TopPerformingRoute {
  routeId: string;
  routeName: string;
  origin: string;
  destination: string;
  totalBookings: number;
  totalRevenue: number;
}

interface TripRouteMapDetail {
  tripId: string;
  routeId: string;
  price: number;
  tripName: string;
  startTime?: string;
  endTime?: string;
  bus: {
    plate: string;
    amenities: string[];
  };
  routeName: string;
  origin: string;
  destination: string;
}

interface SearchTripParams {
  originCity?: string;
  destinationCity?: string;
  departureDate?: string;
  includeStops?: boolean;
  includeRoutes?: boolean;
  page?: number;
  limit?: number;
  [key: string]: string | number | boolean | undefined;
}

interface TripStop {
  id: string;
  sequence: number;
  locationId: string;
  arrivalTime?: string;
  departureTime?: string;
  location: Location;
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

interface SearchTripResult {
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

interface GetRouteTripsDto {
  startDate?: string;
  endDate?: string;
}

interface RouteTripAvailable {
  tripId: string;
  startTime: string;
  endTime: string;
  busName: string;
  amenities: string[];
  pickupLocation: string;
  dropoffLocation: string;
  pricing: {
    basePrice: number;
    surcharge: string;
    surchargeReason: string;
    finalPrice: number;
    currency: string;
  };
}

export const routesApi = createApi({
  reducerPath: "routesApi",
  baseQuery: baseQuery,
  tagTypes: ["Route", "TripRoute", "Location", "Dashboard"],

  endpoints: (builder) => ({
    getRoutes: builder.query<
      Route[],
      {
        originLocationId?: string;
        destinationLocationId?: string;
        isActive?: boolean;
      } | void
    >({
      query: (params) => ({
        url: "/routes",
        method: "GET",
        params: params || {},
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Route" as const, id })),
              { type: "Route", id: "LIST" },
            ]
          : [{ type: "Route", id: "LIST" }],
      transformResponse: (response: ApiResponse<Route[]>) => response.data,
    }),

    getRouteById: builder.query<Route, string>({
      query: (id) => `/routes/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Route", id }],
      transformResponse: (response: ApiResponse<Route>) => response.data,
    }),

    createRoute: builder.mutation<Route, CreateRouteDto>({
      query: (body) => ({
        url: "/routes",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Route", id: "LIST" }],
      transformResponse: (response: ApiResponse<Route>) => response.data,
    }),

    updateRoute: builder.mutation<Route, { id: string; data: UpdateRouteDto }>({
      query: ({ id, data }) => ({
        url: `/routes/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Route", id },
        { type: "Route", id: "LIST" },
        { type: "TripRoute", id: "LIST" },
      ],
      transformResponse: (response: ApiResponse<Route>) => response.data,
    }),

    deleteRoute: builder.mutation<void, string>({
      query: (id) => ({
        url: `/routes/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Route", id: "LIST" }],
    }),

    getTripsForRoute: builder.query<
      RouteTripAvailable[],
      { routeId: string; params: GetRouteTripsDto }
    >({
      query: ({ routeId, params }) => ({
        url: `/routes/${routeId}/trips`,
        method: "GET",
        params,
      }),
      transformResponse: (response: ApiResponse<RouteTripAvailable[]>) =>
        response.data,
    }),

    getTripRouteMap: builder.query<
      TripRouteResponse["data"],
      QueryTripRouteParams
    >({
      query: (params) => ({
        url: "/routes/trip-maps",
        method: "GET",
        params: params,
      }),
      providesTags: ["TripRoute"],
      transformResponse: (response: TripRouteResponse) => response.data,
    }),

    getTripRouteMapDetail: builder.query<
      TripRouteMapDetail,
      { tripId: string; routeId: string }
    >({
      query: ({ tripId, routeId }) => ({
        url: "/routes/trip-map/detail",
        params: { tripId, routeId },
      }),
      transformResponse: (response: ApiResponse<TripRouteMapDetail>) =>
        response.data,
    }),

    createTripRouteMap: builder.mutation<TripRouteMap, CreateTripRouteMapDto>({
      query: (body) => ({
        url: "/routes/trip-map",
        method: "POST",
        body,
      }),
      invalidatesTags: ["TripRoute", { type: "Route", id: "LIST" }],
      transformResponse: (response: ApiResponse<TripRouteMap>) => response.data,
    }),

    removeTripRouteMap: builder.mutation<
      { message: string },
      { tripId: string; routeId: string }
    >({
      query: (params) => ({
        url: "/routes/trip-map/remove",
        method: "DELETE",
        params,
      }),
      invalidatesTags: ["TripRoute"],
    }),

    getTopPerformingRoutes: builder.query<TopPerformingRoute[], number | void>({
      query: (limit) => ({
        url: "/routes/top-performing",
        params: { limit: limit || 5 },
      }),
      providesTags: ["Dashboard"],
      transformResponse: (response: ApiResponse<TopPerformingRoute[]>) =>
        response.data,
    }),

    getLocations: builder.query<
      Location[],
      { search?: string; city?: string } | void
    >({
      query: (params) => ({
        url: "/locations",
        params: params || undefined,
      }),
      providesTags: ["Location"],
      transformResponse: (response: ApiResponse<Location[]>) => response.data,
    }),

    searchTrips: builder.query<SearchTripResult[], SearchTripParams>({
      query: (params) => ({
        url: "/trips/search",
        params: params,
      }),
      transformResponse: (response: ApiResponse<SearchTripResult[]>) =>
        response.data,
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
        };
      },
    }),
  }),
});

export const {
  useGetRoutesQuery,
  useGetRouteByIdQuery,
  useCreateRouteMutation,
  useUpdateRouteMutation,
  useDeleteRouteMutation,
  useGetTripsForRouteQuery,
  useGetTripRouteMapQuery,
  useGetTripRouteMapDetailQuery,
  useCreateTripRouteMapMutation,
  useRemoveTripRouteMapMutation,
  useGetTopPerformingRoutesQuery,
  useGetLocationsQuery,
  useSearchTripsQuery,
  useGetTripByIdQuery,
} = routesApi;
