import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./baseQuery";
import { ApiResponse } from "@/store/type/apiResponse";
import { Location } from "@/store/type/locationsType";
import { Bus } from "@/store/type/busType";

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

export interface UpdateTripRequest extends Partial<CreateTripRequest> {
  id: string;
}

export interface SeatStatus {
  seatId: string;
  seatNumber: string;
  coordinates?: Record<string, unknown> | null;
  status: "AVAILABLE" | "BOOKED" | "LOCKED";
}

export const tripsApi = createApi({
  reducerPath: "tripsApi",
  baseQuery: baseQuery,
  tagTypes: ["Trips", "TripDetail", "Seats"],

  endpoints: (builder) => ({
    getTrips: builder.query<Trip[], TripQueryParams | void>({
      query: (params) => ({
        url: "/trips",
        method: "GET",
        params: params || undefined,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Trips" as const, id })),
              { type: "Trips", id: "LIST" },
            ]
          : [{ type: "Trips", id: "LIST" }],
    }),

    searchTrips: builder.query<Trip[], SearchTripParams>({
      query: (params) => ({
        url: "/trips/search",
        method: "GET",
        params,
      }),
      transformResponse: (response: ApiResponse<Trip[]>) => response.data,
      providesTags: [{ type: "Trips", id: "SEARCH_LIST" }],
    }),

    getTripById: builder.query<Trip, string>({
      query: (id) => `/trips/${id}`,
      providesTags: (_, __, id) => [{ type: "TripDetail", id }],
    }),

    createTrip: builder.mutation<Trip, CreateTripRequest>({
      query: (body) => ({
        url: "/trips",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Trips", id: "LIST" }],
    }),

    updateTrip: builder.mutation<Trip, UpdateTripRequest>({
      query: ({ id, ...body }) => ({
        url: `/trips/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_, __, { id }) => [
        { type: "Trips", id: "LIST" },
        { type: "TripDetail", id },
        { type: "Trips", id: "SEARCH_LIST" },
      ],
    }),

    updateTripStatus: builder.mutation<
      Trip,
      { id: string; status: TripStatus }
    >({
      query: ({ id, status }) => ({
        url: `/trips/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (_, __, { id }) => [
        { type: "Trips", id: "LIST" },
        { type: "TripDetail", id },
        { type: "Trips", id: "SEARCH_LIST" },
      ],
    }),

    deleteTrip: builder.mutation<void, string>({
      query: (id) => ({
        url: `/trips/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_, __, id) => [
        { type: "Trips", id: "LIST" },
        { type: "TripDetail", id },
        { type: "Trips", id: "SEARCH_LIST" },
      ],
    }),

    getTripSeats: builder.query<
      SeatStatus[],
      { tripId: string; routeId: string }
    >({
      query: ({ tripId, routeId }) => ({
        url: `/trips/${tripId}/seats`,
        method: "GET",
        params: { routeId },
      }),
      transformResponse: (response: ApiResponse<SeatStatus[]>) => response.data,
      keepUnusedDataFor: 60,
      providesTags: (_, __, { tripId }) => [{ type: "Seats", id: tripId }],
    }),
  }),
});

export const {
  useGetTripsQuery,
  useSearchTripsQuery,
  useGetTripByIdQuery,
  useCreateTripMutation,
  useUpdateTripMutation,
  useUpdateTripStatusMutation,
  useDeleteTripMutation,
  useGetTripSeatsQuery,
} = tripsApi;
