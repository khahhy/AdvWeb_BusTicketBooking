export interface Trip {
  id: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  from: string;
  to: string;
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
    availableSeats: 18,
    totalSeats: 32,
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
    availableSeats: 10,
    totalSeats: 32,
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
    availableSeats: 22,
    totalSeats: 32,
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
): Seat[] => {
  const seats: Seat[] = [];
  const bookedIndices = new Set<number>();

  // Randomly select booked seats
  while (bookedIndices.size < bookedSeats) {
    bookedIndices.add(Math.floor(Math.random() * totalSeats));
  }

  for (let i = 0; i < totalSeats; i++) {
    const seatNumber = (i + 1).toString().padStart(2, "0");
    const isBooked = bookedIndices.has(i);

    seats.push({
      id: `seat-${seatNumber}`,
      number: seatNumber,
      type: isBooked ? "booked" : "available",
      price: basePrice,
    });
  }

  return seats;
};
