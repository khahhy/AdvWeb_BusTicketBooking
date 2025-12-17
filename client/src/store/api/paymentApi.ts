import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./baseQuery";

export interface CreatePaymentRequest {
  bookingId: string;
  bookingIds?: string[]; // For multiple seat bookings
  totalAmount?: number; // Total amount for all bookings
  buyerName?: string;
  buyerEmail?: string;
  buyerPhone?: string;
}

export interface CreatePaymentResponse {
  paymentId: string;
  checkoutUrl: string;
  qrCode: string;
  orderCode: number;
  amount: number;
}

export interface BookingInfo {
  bookingId: string;
  ticketCode?: string;
  seatNumber?: string;
  price: number;
}

export interface PaymentStatusResponse {
  bookingId: string;
  paymentId?: string;
  status: "pending" | "successful" | "failed";
  amount: number;
  gateway?: string;
  ticketCode?: string;
  paymentInfo?: Record<string, unknown>;
  // Additional fields for confirmation page redirect
  tripId?: string;
  routeId?: string;
  seatNumber?: string;
  passengerName?: string;
  email?: string;
  travelDate?: string;
  // Multi-seat booking support
  bookingCount?: number;
  bookings?: BookingInfo[];
}

export interface ApiResponse<T> {
  success?: boolean;
  data?: T;
  message?: string;
}

export const paymentApi = createApi({
  reducerPath: "paymentApi",
  baseQuery: baseQuery,
  tagTypes: ["Payment"],
  endpoints: (builder) => ({
    createPayment: builder.mutation<
      ApiResponse<CreatePaymentResponse>,
      CreatePaymentRequest
    >({
      query: (data: CreatePaymentRequest) => ({
        url: "/payments/create",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Payment"],
    }),

    getPaymentStatus: builder.query<
      ApiResponse<PaymentStatusResponse>,
      { bookingId: string }
    >({
      query: ({ bookingId }: { bookingId: string }) =>
        `/payments/status/${bookingId}`,
      providesTags: (_result, _error, { bookingId }: { bookingId: string }) => [
        { type: "Payment", id: bookingId },
      ],
    }),

    getPaymentStatusByOrderCode: builder.query<
      PaymentStatusResponse,
      { orderCode: string }
    >({
      query: ({ orderCode }: { orderCode: string }) =>
        `/payments/status-by-order/${orderCode}`,
    }),

    cancelPayment: builder.mutation<
      ApiResponse<{ success: boolean; message: string }>,
      { bookingId: string; reason?: string }
    >({
      query: ({
        bookingId,
        reason,
      }: {
        bookingId: string;
        reason?: string;
      }) => ({
        url: `/payments/cancel/${bookingId}`,
        method: "DELETE",
        body: { reason },
      }),
      invalidatesTags: (
        _result,
        _error,
        { bookingId }: { bookingId: string },
      ) => [{ type: "Payment", id: bookingId }],
    }),
  }),
});

export const {
  useCreatePaymentMutation,
  useGetPaymentStatusQuery,
  useGetPaymentStatusByOrderCodeQuery,
  useCancelPaymentMutation,
} = paymentApi;
