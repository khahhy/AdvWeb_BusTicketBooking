import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";

interface AuthState {
  accessToken?: string;
}

interface BaseQueryState {
  auth?: AuthState;
}

export const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as BaseQueryState)?.auth?.accessToken;
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
});
