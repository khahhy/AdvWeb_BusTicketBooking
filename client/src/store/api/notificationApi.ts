import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./baseQuery";

export interface NotificationLog {
  id: string;
  userId: string;
  userName: string;
  contactInfo: string;
  bookingId?: string;
  bookingTicketCode?: string;
  type: "email" | "sms";
  template: string;
  content: string;
  status: "pending" | "sent" | "failed";
  sentAt?: string;
  createdAt: string;
}

export interface NotificationStats {
  total: number;
  sent: number;
  failed: number;
  pending: number;
}

export interface GetNotificationsResponse {
  data: NotificationLog[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  stats: NotificationStats;
}

export interface NotificationQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: "email" | "sms";
  status?: "pending" | "sent" | "failed";
}

export interface SendNotificationRequest {
  userId: string;
  type: "email" | "sms";
  template?: string;
  content: string;
  bookingId?: string;
}

export interface SendNotificationResponse {
  success: boolean;
  message: string;
}

export const notificationApi = createApi({
  reducerPath: "notificationApi",
  baseQuery,
  tagTypes: ["Notification"],
  endpoints: (builder) => ({
    getNotifications: builder.query<
      GetNotificationsResponse,
      NotificationQueryParams | void
    >({
      query: (params) => ({
        url: "/notifications/admin/list",
        method: "GET",
        params: params || {},
      }),
      providesTags: ["Notification"],
    }),

    sendNotification: builder.mutation<
      SendNotificationResponse,
      SendNotificationRequest
    >({
      query: (body) => ({
        url: "/notifications/send-manual",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Notification"],
    }),
  }),
});

export const { useGetNotificationsQuery, useSendNotificationMutation } =
  notificationApi;
