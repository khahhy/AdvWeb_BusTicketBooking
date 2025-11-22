// API Configuration
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE || "http://localhost:3000";

// API Endpoints
export const API_ENDPOINTS = {
  auth: {
    profile: "/auth/profile",
    signup: "/auth/signup",
    signin: "/auth/signin",
    verifyEmail: "/auth/verify-email",
    forgotPassword: "/auth/forgot-password",
    resetPassword: "/auth/reset-password",
    me: "/auth/me",
  },
  users: {
    list: "/users",
    details: "/users/{id}",
  },
  bookings: {
    list: "/bookings",
    details: "/bookings/{id}",
  },
} as const;

// Helper function to build full URL
export const buildApiUrl = (endpoint: string): string => {
  return `${API_BASE_URL}${endpoint}`;
};
