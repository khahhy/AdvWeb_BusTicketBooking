// Type definitions for chatbot service

export interface UserContext {
  id?: string;
  email?: string;
  fullName?: string;
}

export interface BookingState {
  stage: 'seat_selection' | 'passenger_info' | 'payment';
  tripId: string;
  routeId: string;
  price: number;
  startTime?: string;
  endTime?: string;
  selectedSeats?: string[];
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  personalId?: string;
  totalPrice?: number;
  bookingId?: string;
}

export interface PendingSearch {
  originCity?: string;
  destinationCity?: string;
  date?: string;
  originIds?: string[];
  destinationIds?: string[];
  originName?: string;
  destinationName?: string;
  needMoreInfo?: boolean;
  clarificationMessage?: string;
}

export interface ChatContext {
  user?: UserContext;
  bookingState?: BookingState;
  pendingSearch?: PendingSearch;
}

export interface ParsedIntent {
  intent: string;
  entities: {
    originCity?: string;
    destinationCity?: string;
    date?: string;
    originIds?: string[];
    destinationIds?: string[];
    originName?: string;
    destinationName?: string;
    needMoreInfo?: boolean;
    clarificationMessage?: string;
  };
}

export interface Location {
  id: string;
  name: string;
  city?: string | null;
  address?: string;
  latitude?: number | null;
  longitude?: number | null;
}

export interface TripRoute {
  routeId: string;
  price: number;
  route?: {
    id: string;
    origin: Location;
    destination: Location;
  };
}

export interface Trip {
  id: string;
  startTime: Date;
  endTime: Date;
  tripRoutes: TripRoute[];
  availableSeats: number;
}

export interface PaymentData {
  name?: string;
  email?: string;
  phone?: string;
}
