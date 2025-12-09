import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./baseQuery";
import { ApiResponse } from "@/store/type/shared";
import {
  GeneralSettingsDto,
  BookingRulesSettingsDto,
  BusAmenitiesSettingsDto,
  PaymentGatewaySettingsDto,
  BusTypePricingDto,
  PricingPoliciesDto,
} from "../type/settingType";

export const settingApi = createApi({
  reducerPath: "settingApi",
  baseQuery: baseQuery,
  tagTypes: ["Settings"],

  endpoints: (builder) => ({
    getGeneralSettings: builder.query<GeneralSettingsDto, void>({
      query: () => "/settings/general",
      providesTags: ["Settings"],
      transformResponse: (response: ApiResponse<GeneralSettingsDto>) =>
        response.data,
    }),
    updateGeneralSettings: builder.mutation<void, GeneralSettingsDto>({
      query: (body) => ({ url: "/settings/general", method: "PATCH", body }),
      invalidatesTags: ["Settings"],
    }),

    getBookingRules: builder.query<BookingRulesSettingsDto, void>({
      query: () => "/settings/booking-rules",
      providesTags: ["Settings"],
      transformResponse: (response: ApiResponse<BookingRulesSettingsDto>) =>
        response.data,
    }),
    updateBookingRules: builder.mutation<void, BookingRulesSettingsDto>({
      query: (body) => ({
        url: "/settings/booking-rules",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Settings"],
    }),

    getBusAmenities: builder.query<BusAmenitiesSettingsDto, void>({
      query: () => "/settings/bus-amenities",
      providesTags: ["Settings"],
      transformResponse: (response: ApiResponse<BusAmenitiesSettingsDto>) =>
        response.data,
    }),
    updateBusAmenities: builder.mutation<void, BusAmenitiesSettingsDto>({
      query: (body) => ({
        url: "/settings/bus-amenities",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Settings"],
    }),

    getPaymentGateways: builder.query<PaymentGatewaySettingsDto, void>({
      query: () => "/settings/payment-gateways",
      providesTags: ["Settings"],
      transformResponse: (response: ApiResponse<PaymentGatewaySettingsDto>) =>
        response.data,
    }),
    updatePaymentGateways: builder.mutation<void, PaymentGatewaySettingsDto>({
      query: (body) => ({
        url: "/settings/payment-gateways",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Settings"],
    }),

    getBusTypePricing: builder.query<BusTypePricingDto, void>({
      query: () => "/settings/bus-type-pricing",
      providesTags: ["Settings"],
      transformResponse: (response: ApiResponse<BusTypePricingDto>) =>
        response.data,
    }),
    updateBusTypePricing: builder.mutation<void, BusTypePricingDto>({
      query: (body) => ({
        url: "/settings/bus-type-pricing",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Settings"],
    }),

    getPricingPolicies: builder.query<PricingPoliciesDto, void>({
      query: () => "/settings/pricing-policies",
      providesTags: ["Settings"],
      transformResponse: (response: ApiResponse<PricingPoliciesDto>) =>
        response.data,
    }),
    updatePricingPolicies: builder.mutation<void, PricingPoliciesDto>({
      query: (body) => ({
        url: "/settings/pricing-policies",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Settings"],
    }),
  }),
});

export const {
  useGetGeneralSettingsQuery,
  useUpdateGeneralSettingsMutation,
  useGetBookingRulesQuery,
  useUpdateBookingRulesMutation,
  useGetBusAmenitiesQuery,
  useUpdateBusAmenitiesMutation,
  useGetPaymentGatewaysQuery,
  useUpdatePaymentGatewaysMutation,
  useGetBusTypePricingQuery,
  useUpdateBusTypePricingMutation,
  useGetPricingPoliciesQuery,
  useUpdatePricingPoliciesMutation,
} = settingApi;
