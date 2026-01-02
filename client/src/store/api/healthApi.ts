import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./baseQuery";
import { SystemHealth } from "@/store/type/healthType";

export const healthApi = createApi({
  reducerPath: "healthApi",
  baseQuery: baseQuery,
  endpoints: (builder) => ({
    getSystemHealth: builder.query<SystemHealth, void>({
      query: () => ({
        url: "/health",
        method: "GET",
      }),
    }),
  }),
});

export const { useGetSystemHealthQuery } = healthApi;
