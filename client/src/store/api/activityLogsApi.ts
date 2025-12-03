import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./baseQuery";
import {
  ActivityLogsResponse,
  ActivityLogHistoryResponse,
  ActivityLogQueryParams,
} from "@/store/type/activityLogsType";

export const activityLogsApi = createApi({
  reducerPath: "activityLogsApi",
  baseQuery: baseQuery,
  tagTypes: ["ActivityLogs"],

  endpoints: (builder) => ({
    getAllActivityLogs: builder.query<
      ActivityLogsResponse,
      ActivityLogQueryParams
    >({
      query: (params) => ({
        url: "/activity-logs",
        method: "GET",
        params: {
          page: params.page || 1,
          limit: params.limit || 20,
        },
      }),
      providesTags: ["ActivityLogs"],
    }),

    getActivityLogsByUser: builder.query<ActivityLogHistoryResponse, string>({
      query: (userId) => ({
        url: `/activity-logs/user/${userId}`,
        method: "GET",
      }),
    }),

    getActivityLogsByEntity: builder.query<
      ActivityLogHistoryResponse,
      { type: string; id: string }
    >({
      query: ({ type, id }) => ({
        url: `/activity-logs/entity/${type}/${id}`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useGetAllActivityLogsQuery,
  useGetActivityLogsByUserQuery,
  useGetActivityLogsByEntityQuery,
} = activityLogsApi;
