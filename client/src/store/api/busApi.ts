import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./baseQuery";
import {
  BusType,
  SeatCapacity,
  Bus,
  SeatLayout,
  CreateBusRequest,
  UpdateBusRequest,
} from "../type/busType";
import { ApiResponse } from "@/store/type/shared";
import { BackendSeat } from "../type/routesType";

export const SEAT_LAYOUTS: Record<BusType, SeatLayout[]> = {
  [BusType.STANDARD]: [
    {
      busType: BusType.STANDARD,
      seatCapacity: SeatCapacity.SEAT_32,
      layout: { columns: [2, 2], rows: 8, aisles: [2] },
      description: "Standard 32 seats (2-2 layout)",
    },
    {
      busType: BusType.STANDARD,
      seatCapacity: SeatCapacity.SEAT_28,
      layout: { columns: [2, 2], rows: 7, aisles: [2] },
      description: "Standard 28 seats (2-2 layout)",
    },
  ],
  [BusType.VIP]: [
    {
      busType: BusType.VIP,
      seatCapacity: SeatCapacity.SEAT_28,
      layout: { columns: [2, 1], rows: 7, aisles: [2] },
      description: "VIP 21 seats (2-1 layout)",
    },
    {
      busType: BusType.VIP,
      seatCapacity: SeatCapacity.SEAT_16,
      layout: { columns: [2, 1], rows: 6, aisles: [2] },
      description: "VIP 16 seats (2-1 layout)",
    },
  ],
  [BusType.SLEEPER]: [
    {
      busType: BusType.SLEEPER,
      seatCapacity: SeatCapacity.SEAT_16,
      layout: { columns: [1, 1], rows: 4, aisles: [1] },
      description: "Sleeper 16 beds (2 tiers, 8 beds per tier)",
    },
  ],
  [BusType.LIMOUSINE]: [
    {
      busType: BusType.LIMOUSINE,
      seatCapacity: SeatCapacity.SEAT_16,
      layout: { columns: [1, 2, 1], rows: 4, aisles: [1, 3] },
      description: "Limousine 16 seats (1-2-1 layout)",
    },
  ],
};

export const busApi = createApi({
  reducerPath: "busApi",
  baseQuery: baseQuery,
  tagTypes: ["Bus"],
  endpoints: (builder) => ({
    getBuses: builder.query<Bus[], void>({
      query: () => "/buses",
      providesTags: ["Bus"],
      transformResponse: (response: ApiResponse<Bus[]>) => response.data,
    }),

    getBusById: builder.query<Bus, string>({
      query: (id) => `/buses/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Bus", id }],
      transformResponse: (response: ApiResponse<Bus>) => response.data,
    }),

    createBus: builder.mutation<Bus, CreateBusRequest>({
      query: (data) => ({
        url: "/buses",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Bus"],
      transformResponse: (response: ApiResponse<Bus>) => response.data,
    }),

    updateBus: builder.mutation<Bus, UpdateBusRequest>({
      query: ({ id, ...data }) => ({
        url: `/buses/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Bus", id },
        "Bus",
      ],
      transformResponse: (response: ApiResponse<Bus>) => response.data,
    }),

    deleteBus: builder.mutation<void, string>({
      query: (id) => ({
        url: `/buses/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Bus"],
    }),

    getBusSeats: builder.query<BackendSeat[], string>({
      query: (busId) => `/buses/${busId}/seats`,
      transformResponse: (response: ApiResponse<BackendSeat[]>) =>
        response.data,
    }),
  }),
});

export const {
  useGetBusesQuery,
  useGetBusByIdQuery,
  useCreateBusMutation,
  useUpdateBusMutation,
  useDeleteBusMutation,
  useGetBusSeatsQuery,
} = busApi;
