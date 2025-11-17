import type { Booking } from "./bookingType";

export type Admin = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  createdDate: string;
};

export type ActivityLog = {
  id: string;
  action: string;
  timestamp: string;
};

export type AdminUpdateData = {
  name: string;
  email: string;
  phone: string;
};

export type AdminCreateData = {
  name: string;
  email: string;
  phone?: string;
  password?: string;
};

export type Passenger = {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: "Active" | "Banned";
  joinDate: string;
  bookings: Booking[];
};

export type PassengerUpdateData = {
  name: string;
  email: string;
  phone: string;
};
