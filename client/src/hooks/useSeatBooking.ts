import { useState, useEffect, useMemo, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useGetTripSeatsQuery } from "@/store/api/tripsApi";
import {
  useLockSeatMutation,
  useUnlockSeatMutation,
} from "@/store/api/bookingApi";
import { SeatStatus, SocketSeatPayload } from "@/store/type/seatsType";
import type { ApiError } from "@/store/type/apiError";

const SOCKET_URL = import.meta.env.VITE_API_BASE || "http://localhost:3000";

interface UseSeatBookingProps {
  tripId: string;
  routeId: string;
  basePrice: number;
  isOpen: boolean;
}

export const useSeatBooking = ({
  tripId,
  routeId,
  basePrice,
  isOpen,
}: UseSeatBookingProps) => {
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const socketRef = useRef<Socket | null>(null);

  const {
    data: seatResult,
    isLoading,
    refetch,
  } = useGetTripSeatsQuery({ tripId, routeId }, { skip: !isOpen });

  const [realtimeSeats, setRealtimeSeats] = useState<SeatStatus[]>([]);

  const [lockSeat] = useLockSeatMutation();
  const [unlockSeat] = useUnlockSeatMutation();

  useEffect(() => {
    if (seatResult?.seats) {
      const formattedSeats: SeatStatus[] = seatResult.seats.map((s) => ({
        seatId: s.seatId,
        seatNumber: s.seatNumber,
        status:
          s.status === "BOOKED" || s.status === "LOCKED"
            ? "BOOKED"
            : "AVAILABLE",
      }));
      setRealtimeSeats(formattedSeats);
    }
  }, [seatResult]);

  useEffect(() => {
    if (!isOpen) {
      socketRef.current?.disconnect();
      return;
    }

    socketRef.current = io(SOCKET_URL);

    socketRef.current.on(`trip.${tripId}`, (payload: SocketSeatPayload) => {
      const { event, data } = payload;

      setRealtimeSeats((prev) =>
        prev.map((seat) => {
          if (seat.seatId !== data.seatId) return seat;

          let newStatus = seat.status;
          if (event === "SEAT_LOCKED" || event === "SEAT_SOLD")
            newStatus = "BOOKED";
          if (event === "SEAT_UNLOCKED") newStatus = "AVAILABLE";

          return { ...seat, status: newStatus };
        }),
      );
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [isOpen, tripId, selectedSeats]);

  const toggleSeat = async (seatId: string) => {
    const seat = realtimeSeats.find((s) => s.seatId === seatId);
    const isSelected = selectedSeats.includes(seatId);

    if (!seat || (seat.status === "BOOKED" && !isSelected)) return;

    const payload = { tripId, seatId, routeId };

    setSelectedSeats((prev) => {
      if (isSelected) return prev.filter((id) => id !== seatId);
      return [...prev, seatId];
    });

    try {
      if (isSelected) {
        await unlockSeat(payload).unwrap();
      } else {
        await lockSeat(payload).unwrap();
      }
    } catch (error) {
      const err = error as ApiError;
      if (isSelected) {
        setSelectedSeats((prev) => [...prev, seatId]);
      } else {
        setSelectedSeats((prev) => prev.filter((id) => id !== seatId));
      }

      if (err?.status === 409) {
        setRealtimeSeats((prev) =>
          prev.map((s) =>
            s.seatId === seatId ? { ...s, status: "BOOKED" } : s,
          ),
        );
      }
    }
  };

  const totalPrice = useMemo(() => {
    return selectedSeats.length * basePrice;
  }, [selectedSeats, basePrice]);

  const resetSelection = () => {
    setSelectedSeats([]);
  };

  const handleTimeout = async () => {
    const unlockPromises = selectedSeats.map((seatId) =>
      unlockSeat({ tripId, seatId, routeId })
        .unwrap()
        .catch((err) => console.error("Auto unlock failed", err)),
    );

    await Promise.all(unlockPromises);
    setSelectedSeats([]);
  };

  return {
    seats: realtimeSeats,
    selectedSeats,
    isLoading,
    toggleSeat,
    totalPrice,
    availableSeatsCount: seatResult?.availableSeats || 0,
    handleTimeout,
    refetch,
    resetSelection,
  };
};
