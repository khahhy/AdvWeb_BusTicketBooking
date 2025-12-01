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
  }),
});

export const {
  useGetRoutesQuery,
  useGetRouteByIdQuery,
  useGetTripRouteMapQuery,
  useGetLocationsQuery,
} = routesApi;
