import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./baseQuery";
import { Bus, CreateBusRequest, UpdateBusRequest } from "../type/busType";
import { ApiResponse } from "@/store/type/shared";
import { BackendSeat } from "../type/routesType";

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
