import { PaginationParams } from "@/store/type/shared";

export enum BookingStatus {
  pendingPayment = "pendingPayment",
  confirmed = "confirmed",
  cancelled = "cancelled",
}

export enum PaymentStatus {
  pending = "pending",
  successful = "successful",
  failed = "failed",
}

export interface CustomerInfo {
  fullName: string;
  email: string;
  phoneNumber: string;
  identificationCard: string;
}

export interface SeatLockRequest {
  tripId: string;
  seatId: string;
  routeId: string;
}

export interface CreateBookingRequest {
  userId?: string;
  tripId: string;
  routeId: string;
  seatId: string;
  customerInfo: CustomerInfo;
}

export interface CreateBookingResult {
  bookingId: string;
  ticketCode: string;
  status: BookingStatus;
  expiresAt: string;
}

export interface LockSeatResponse {
  message: string;
  expiresIn: number;
}
export interface BookingQueryParams extends PaginationParams {
  status?: BookingStatus;
  userId?: string;
  tripId?: string;
  dateFrom?: string; // YYYY-MM-DD
  dateTo?: string; // YYYY-MM-DD
}

export interface Booking {
  id: string;
  userId: string;
  tripId: string;
  routeId: string;
  seatId: string;
  pickupStopId: string;
  dropoffStopId: string;
  customerInfo: CustomerInfo;
  price: number;
  status: BookingStatus;
  ticketCode?: string;
  createdAt: string;
  updatedAt: string;

  trip?: {
    tripName: string | null;
    startTime: string;
  };
  route?: {
    name: string;
  };
  seat?: {
    seatNumber: string;
  };
  user?: {
    fullName: string | null;
    email: string;
    phoneNumber: string | null;
  };
  pickupStop?: {
    location: {
      name: string;
      address: string | null;
    };
  };
  dropoffStop?: {
    location: {
      name: string;
      address: string | null;
    };
  };
}

export interface BookingStats {
  bookings: {
    total: number;
    today: number;
    breakdown: {
      pendingPayment: number;
      confirmed: number;
      cancelled: number;
    };
  };
  revenue: {
    total: number;
    today: number;
  };
}

export interface SeatSocketPayload {
  event: "SEAT_LOCKED" | "SEAT_UNLOCKED" | "SEAT_SOLD";
  data: {
    seatId: string;
    segmentIds: string[];
  };
}

export interface GuestLookupRequest {
  email: string;
  phoneNumber: string;
}

export interface TicketLookupParams {
  ticketCode: string;
  email: string;
}

export interface GuestCancelRequest {
  email: string;
}

export interface RevenueChartData {
  date: string; // YYYY-MM-DD
  revenue: number;
}

export interface BookingTrendData {
  hour: string; // "0:00", "1:00", ...
  bookings: number;
}

export interface OccupancyRateData {
  averageOccupancy: number;
  totalTrips: number;
}
