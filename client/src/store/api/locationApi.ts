import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./baseQuery";
import { ApiResponse } from "@/store/type/apiResponse";
import {
  Location,
  CreateLocationRequest,
  UpdateLocationRequest,
  QueryLocationParams,
} from "@/store/type/locationsType";

export const locationsApi = createApi({
  reducerPath: "locationsApi",
  baseQuery: baseQuery,
  tagTypes: ["Location", "City"],

  endpoints: (builder) => ({
    getLocations: builder.query<Location[], QueryLocationParams | void>({
      query: (params) => ({
        url: "/locations",
        method: "GET",
        params: params || undefined,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Location" as const, id })),
              { type: "Location", id: "LIST" },
            ]
          : [{ type: "Location", id: "LIST" }],
      transformResponse: (response: ApiResponse<Location[]>) => response.data,
    }),

    getLocationById: builder.query<Location, string>({
      query: (id) => `/locations/${id}`,
      providesTags: (_, __, id) => [{ type: "Location", id }],
      transformResponse: (response: ApiResponse<Location>) => response.data,
    }),

    getCities: builder.query<string[], void>({
      query: () => "/locations/cities",
      providesTags: ["City"],
      transformResponse: (response: ApiResponse<string[]>) => response.data,
    }),

    createLocation: builder.mutation<Location, CreateLocationRequest>({
      query: (body) => ({
        url: "/locations",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Location", id: "LIST" }, "City"],
    }),

    updateLocation: builder.mutation<Location, UpdateLocationRequest>({
      query: ({ id, ...body }) => ({
        url: `/locations/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_, __, { id }) => [
        { type: "Location", id },
        { type: "Location", id: "LIST" },
        "City",
      ],
    }),

    deleteLocation: builder.mutation<void, string>({
      query: (id) => ({
        url: `/locations/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_, __, id) => [
        { type: "Location", id },
        { type: "Location", id: "LIST" },
        "City",
      ],
    }),
  }),
});

export const {
  useGetLocationsQuery,
  useGetLocationByIdQuery,
  useGetCitiesQuery,
  useCreateLocationMutation,
  useUpdateLocationMutation,
  useDeleteLocationMutation,
} = locationsApi;
