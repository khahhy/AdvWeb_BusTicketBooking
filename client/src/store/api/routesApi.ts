import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./baseQuery";
import { ApiResponse } from "@/store/type/shared";

import {
  TripRouteMap,
  CreateTripRouteMapDto,
  QueryTripRouteMapParams,
  TripRouteMapResponse,
} from "@/store/type/tripRoutesType";

import {
  Route,
  CreateRouteDto,
  UpdateRouteDto,
  RouteTripAvailable,
  GetRouteTripsDto,
  TripRouteMapDetail,
  TopPerformingRoute,
} from "@/store/type/routesType";

export const routesApi = createApi({
  reducerPath: "routesApi",
  baseQuery: baseQuery,
  tagTypes: ["Route", "TripRouteMap", "Location", "Dashboard"],

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
        "TripRouteMap",
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

    // just for admin
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

    // get trip route map (sold)
    getTripRouteMap: builder.query<
      TripRouteMapResponse, // type response for pagination
      QueryTripRouteMapParams
    >({
      query: (params) => {
        // Custom serialization for array params to match NestJS expectations
        const searchParams = new URLSearchParams();

        Object.entries(params).forEach(([key, value]) => {
          if (value === undefined || value === null) return;

          if (Array.isArray(value)) {
            // For arrays, append each value with the same key (busType=vip&busType=sleeper)
            value.forEach((item) => {
              if (item !== undefined && item !== null) {
                searchParams.append(key, String(item));
              }
            });
          } else {
            searchParams.append(key, String(value));
          }
        });

        return {
          url: `/routes/trip-maps?${searchParams.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["TripRouteMap"],
      transformResponse: (response: ApiResponse<TripRouteMapResponse>) =>
        response.data,
    }),

    // Returns pricing, schedule, and bus info for a specific trip on a specific route.
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
      invalidatesTags: ["TripRouteMap", { type: "Route", id: "LIST" }],
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
      invalidatesTags: ["TripRouteMap"],
    }),

    // Dashboard
    getTopPerformingRoutes: builder.query<TopPerformingRoute[], number | void>({
      query: (limit) => ({
        url: "/routes/top-performing",
        params: { limit: limit || 5 },
      }),
      providesTags: ["Dashboard"],
      transformResponse: (response: ApiResponse<TopPerformingRoute[]>) =>
        response.data,
    }),
  }),
});

export const {
  useGetRoutesQuery,
  useGetRouteByIdQuery,
  useCreateRouteMutation,
  useUpdateRouteMutation,
  useDeleteRouteMutation,
  useGetTripsForRouteQuery, // just for admin
  useGetTripRouteMapQuery, // for buyer search
  useGetTripRouteMapDetailQuery, // for buyer
  useCreateTripRouteMapMutation,
  useRemoveTripRouteMapMutation,
  useGetTopPerformingRoutesQuery, // dashboard
} = routesApi;
