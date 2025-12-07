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
    myBookings: "/bookings/my-bookings",
    details: "/bookings/{id}",
    cancel: "/bookings/{id}/cancel",
    modify: "/bookings/{id}/modify",
    lockSeat: "/bookings/lock",
    unlockSeat: "/bookings/unlock",
    guestLookup: "/bookings/guest/lookup",
    lookupByTicketCode: "/bookings/lookup/{ticketCode}",
    guestCancel: "/bookings/guest/{ticketCode}/cancel",
  },
  buses: {
    list: "/buses",
    details: "/buses/{id}",
  },
  routes: {
    list: "/routes",
    tripMaps: "/routes/trip-maps",
    details: "/routes/{id}",
  },
} as const;

// Helper function to build full URL
export const buildApiUrl = (endpoint: string): string => {
  return `${API_BASE_URL}${endpoint}`;
};
