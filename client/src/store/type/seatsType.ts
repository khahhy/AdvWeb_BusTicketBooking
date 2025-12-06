export interface SeatStatus {
  seatId: string;
  seatNumber: string;
  status: "AVAILABLE" | "BOOKED" | "LOCKED";
}

export interface TripSeatResult {
  seats: SeatStatus[];
  totalSeats: number;
  availableSeats: number;
}

export interface SocketSeatPayload {
  event: "SEAT_LOCKED" | "SEAT_UNLOCKED" | "SEAT_SOLD";
  data: {
    seatId: string;
    tripId: string;
  };
}
