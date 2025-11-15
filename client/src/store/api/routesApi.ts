import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./baseQuery";
import { type Route } from "@/store/type/routesType";

export const routesApi = createApi({
  reducerPath: "api",
  baseQuery: baseQuery,
  tagTypes: ["Route"],

  endpoints: (builder) => ({
    getRoutes: builder.query<Route[], void>({
      query: () => "/routes",
      providesTags: ["Route"],
    }),

    getRouteById: builder.query<Route, string>({
      query: (id) => `/routes/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Route", id }],
    }),
  }),
});

export const { useGetRoutesQuery, useGetRouteByIdQuery } = routesApi;
