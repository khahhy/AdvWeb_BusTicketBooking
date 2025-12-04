import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./baseQuery";
import { ApiResponse } from "../type/shared";
import {
  Trip,
  TripQueryParams,
  SearchTripParams,
  CreateTripRequest,
  UpdateTripRequest,
  TripStatus,
  SeatStatus,
} from "../type/tripsType";

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
  useGetTripsQuery, // get all + param
  useSearchTripsQuery, // get all again + param name...
  useGetTripByIdQuery, // get one
  useCreateTripMutation,
  useUpdateTripMutation,
  useUpdateTripStatusMutation,
  useDeleteTripMutation,
  useGetTripSeatsQuery, // realtime seats status (trip + route)
} = tripsApi;
