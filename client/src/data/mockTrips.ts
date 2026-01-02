export interface Trip {
  id: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  from: string;
  to: string;
  fromTerminal?: string;
  toTerminal?: string;
  availableSeats: number;
  totalSeats: number;
  price: number;
  note?: string;
  busType?: string;
  amenities?: {
    [key: string]: boolean;
  };
}

export const mockTrips: Trip[] = [
  {
    id: "1",
    departureTime: "09:15",
    arrivalTime: "15:15",
    duration: "6 hours",
    from: "Ho Chi Minh City",
    to: "Mui Ne",
    fromTerminal: "Ho Chi Minh City Central Station",
    toTerminal: "Mui Ne Station",
    availableSeats: 24,
    totalSeats: 32,
    price: 200000,
    note: "Passengers are choosing a route that goes through Highway - Long Thanh - Dau Giay - Phan Thiet.",
    busType: "standard",
    amenities: {
      wifi: true,
      aircondition: true,
      water: true,
      charger: true,
    },
  },
  {
    id: "2",
    departureTime: "10:30",
    arrivalTime: "16:45",
    duration: "6 hours 15 min",
    from: "Ho Chi Minh City",
    to: "Da Lat",
    fromTerminal: "Mien Dong Bus Station",
    toTerminal: "Da Lat Central Terminal",
    availableSeats: 12,
    totalSeats: 18,
    price: 250000,
    busType: "vip",
    amenities: {
      wifi: true,
      tv: true,
      aircondition: true,
      water: true,
      snack: true,
      charger: true,
      blanket: true,
    },
  },
  {
    id: "3",
    departureTime: "12:00",
    arrivalTime: "18:30",
    duration: "6 hours 30 min",
    from: "Ho Chi Minh City",
    to: "Nha Trang",
    fromTerminal: "An Suong Bus Station",
    toTerminal: "Nha Trang Bus Terminal",
    availableSeats: 28,
    totalSeats: 32,
    price: 195000,
    busType: "standard",
    amenities: {
      wifi: true,
      aircondition: true,
      water: true,
    },
  },
  {
    id: "4",
    departureTime: "14:15",
    arrivalTime: "20:45",
    duration: "6 hours 30 min",
    from: "Da Lat",
    to: "Nha Trang",
    fromTerminal: "Da Lat Central Terminal",
    toTerminal: "Nha Trang Bus Terminal",
    availableSeats: 10,
    totalSeats: 16,
    price: 320000,
    busType: "limousine",
    amenities: {
      wifi: true,
      tv: true,
      aircondition: true,
      water: true,
      snack: true,
      toilet: true,
      charger: true,
      blanket: true,
    },
  },
  {
    id: "5",
    departureTime: "16:30",
    arrivalTime: "22:45",
    duration: "6 hours 15 min",
    from: "Ho Chi Minh City",
    to: "Ba Ria - Vung Tau",
    availableSeats: 10,
    totalSeats: 16,
    price: 205000,
    busType: "sleeper",
    amenities: {
      wifi: true,
      tv: true,
      aircondition: true,
      water: true,
      blanket: true,
      charger: true,
    },
  },
];

export interface Seat {
  id: string;
  number: string;
  type: "available" | "selected" | "booked";
  price: number;
}

export const generateSeats = (
  totalSeats: number,
  bookedSeats: number,
  basePrice: number,
  busType?: string,
): Seat[] => {
  const seats: Seat[] = [];
  const bookedIndices = new Set<number>();

  // Randomly select booked seats
  while (bookedIndices.size < bookedSeats) {
    bookedIndices.add(Math.floor(Math.random() * totalSeats));
  }

  // Generate seat labels based on bus type (matching admin layouts)
  const getSeatLabel = (index: number, type?: string): string => {
    const busTypeNormalized = type?.toLowerCase();

    if (busTypeNormalized === "standard") {
      // Standard: 2-2 layout, 8 rows, 4 seats per row (A1-D8)
      const row = Math.floor(index / 4) + 1;
      const col = ["A", "B", "C", "D"][index % 4];
      return `${col}${row}`;
    } else if (busTypeNormalized === "vip") {
      // VIP: 2-1 layout, 6 rows, 3 seats per row (A1-C6) = 18 seats
      const row = Math.floor(index / 3) + 1;
      const col = ["A", "B", "C"][index % 3];
      return `${col}${row}`;
    } else if (busTypeNormalized === "sleeper") {
      // Sleeper: 2 tiers, 4 rows, 2 beds per row (A1-B4, C1-D4) = 16 beds
      if (index < 8) {
        // Upper tier: A1-B4
        const row = Math.floor(index / 2) + 1;
        const col = ["A", "B"][index % 2];
        return `${col}${row}`;
      } else {
        // Lower tier: C1-D4
        const adjustedIndex = index - 8;
        const row = Math.floor(adjustedIndex / 2) + 1;
        const col = ["C", "D"][adjustedIndex % 2];
        return `${col}${row}`;
      }
    } else if (busTypeNormalized === "limousine") {
      // Limousine: 1-2-1 layout, 4 rows, 4 seats per row (A1-D4) = 16 seats
      const row = Math.floor(index / 4) + 1;
      const col = ["A", "B", "C", "D"][index % 4];
      return `${col}${row}`;
    }

    // Fallback for unknown types
    return (index + 1).toString().padStart(2, "0");
  };

  for (let i = 0; i < totalSeats; i++) {
    const seatNumber = getSeatLabel(i, busType);
    const isBooked = bookedIndices.has(i);

    seats.push({
      id: `seat-${i}`,
      number: seatNumber,
      type: isBooked ? "booked" : "available",
      price: basePrice,
    });
  }

  return seats;
};
