import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./baseQuery";
import { ApiResponse } from "@/store/type/shared";
import {
  Booking,
  BookingQueryParams,
  BookingStats,
  CreateBookingRequest,
  CreateBookingResult,
  LockSeatResponse,
  SeatLockRequest,
} from "@/store/type/bookingType";

export const bookingApi = createApi({
  reducerPath: "bookingsApi",
  baseQuery: baseQuery,
  tagTypes: ["Bookings", "BookingStats", "MyBookings"],

  endpoints: (builder) => ({
    lockSeat: builder.mutation<LockSeatResponse, SeatLockRequest>({
      query: (body) => ({
        url: "/bookings/lock",
        method: "POST",
        body,
      }),
    }),

    unlockSeat: builder.mutation<{ message: string }, SeatLockRequest>({
      query: (body) => ({
        url: "/bookings/unlock",
        method: "POST",
        body,
      }),
    }),

    createBooking: builder.mutation<
      ApiResponse<CreateBookingResult>,
      CreateBookingRequest
    >({
      query: (body) => ({
        url: "/bookings",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Bookings", "MyBookings", "BookingStats"],
    }),

    getBookings: builder.query<
      ApiResponse<Booking[]>,
      BookingQueryParams | void
    >({
      query: (params) => ({
        url: "/bookings",
        method: "GET",
        params: params || {},
      }),
      providesTags: (result) =>
        result
          ? [
              ...(result.data || []).map(({ id }) => ({
                type: "Bookings" as const,
                id,
              })),
              { type: "Bookings", id: "LIST" },
            ]
          : [{ type: "Bookings", id: "LIST" }],
    }),

    getMyBookings: builder.query<ApiResponse<Booking[]>, void>({
      query: () => ({
        url: "/bookings/my-bookings",
        method: "GET",
      }),
      providesTags: ["MyBookings"],
    }),

    // Booking Detail
    getBookingById: builder.query<ApiResponse<Booking>, string>({
      query: (id) => ({
        url: `/bookings/${id}`,
        method: "GET",
      }),
      providesTags: (_, __, id) => [{ type: "Bookings", id }],
    }),

    cancelBooking: builder.mutation<ApiResponse<Booking>, string>({
      query: (id) => ({
        url: `/bookings/${id}/cancel`,
        method: "PATCH",
      }),
      invalidatesTags: (_, __, id) => [
        { type: "Bookings", id },
        "MyBookings",
        "BookingStats",
      ],
    }),

    // Get Stats
    getBookingStats: builder.query<ApiResponse<BookingStats>, void>({
      query: () => ({
        url: "/bookings/stats",
        method: "GET",
      }),
      providesTags: ["BookingStats"],
    }),
  }),
});

export const {
  useLockSeatMutation,
  useUnlockSeatMutation,
  useCreateBookingMutation,
  useGetBookingsQuery,
  useGetMyBookingsQuery,
  useGetBookingByIdQuery,
  useCancelBookingMutation,
  useGetBookingStatsQuery,
} = bookingApi;
