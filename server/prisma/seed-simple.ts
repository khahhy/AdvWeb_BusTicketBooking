import { PrismaClient } from '@prisma/client';
import { BusType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Creating locations...');

  // Create locations
  const hcmcStation = await prisma.locations.create({
    data: {
      name: 'Ho Chi Minh City Central Station',
      address: '395 Nguyen Thi Minh Khai, District 3',
      city: 'Ho Chi Minh City',
      latitude: 10.7769,
      longitude: 106.6977,
    },
  });

  // const hanoiStation = await prisma.locations.create({
  //   data: {
  //     name: 'Hanoi My Dinh Station',
  //     address: 'My Dinh Bus Station, Nam Tu Liem',
  //     city: 'Hanoi',
  //     latitude: 21.0278,
  //     longitude: 105.8342,
  //   },
  // });

  const muineStation = await prisma.locations.create({
    data: {
      name: 'Mui Ne Station',
      address: 'Nguyen Dinh Chieu, Ham Tien',
      city: 'Mui Ne',
      latitude: 10.95,
      longitude: 108.2833,
    },
  });

  // const danangStation = await prisma.locations.create({
  //   data: {
  //     name: 'Da Nang Station',
  //     address: '33 Dien Bien Phu, Hai Chau',
  //     city: 'Da Nang',
  //     latitude: 16.0471,
  //     longitude: 108.2068,
  //   },
  // });

  console.log('Creating buses...');

  // Helper function to generate seats for a bus
  async function createSeatsForBus(busId: string, busType: BusType) {
    const seatConfigs = {
      [BusType.standard]: { count: 32, prefix: 'A' },
      [BusType.vip]: { count: 18, prefix: 'B' },
      [BusType.sleeper]: { count: 16, prefix: 'C' },
      [BusType.limousine]: { count: 16, prefix: 'D' },
    };

    const config = seatConfigs[busType];
    const seats: { busId: string; seatNumber: string }[] = [];

    for (let i = 1; i <= config.count; i++) {
      seats.push({
        busId: busId,
        seatNumber: `${config.prefix}${i}`,
      });
    }

    await prisma.seats.createMany({ data: seats });
    console.log(`  Created ${config.count} seats for ${busType} bus`);
  }

  // Create buses with different types and amenities
  const standardBus = await prisma.buses.create({
    data: {
      plate: '51A-12345',
      busType: BusType.standard,
      amenities: {
        wifi: true,
        airCondition: true,
        tv: false,
        charger: true,
        toilet: false,
        blanket: false,
        water: true,
        snack: false,
      },
    },
  });
  await createSeatsForBus(standardBus.id, BusType.standard);

  const vipBus = await prisma.buses.create({
    data: {
      plate: '51A-67890',
      busType: BusType.vip,
      amenities: {
        wifi: true,
        airCondition: true,
        tv: true,
        charger: true,
        toilet: true,
        blanket: true,
        water: true,
        snack: true,
      },
    },
  });
  await createSeatsForBus(vipBus.id, BusType.vip);

  const sleeperBus = await prisma.buses.create({
    data: {
      plate: '51A-11111',
      busType: BusType.sleeper,
      amenities: {
        wifi: true,
        airCondition: true,
        tv: true,
        charger: true,
        toilet: true,
        blanket: true,
        water: true,
        snack: false,
      },
    },
  });
  await createSeatsForBus(sleeperBus.id, BusType.sleeper);

  const limousineBus = await prisma.buses.create({
    data: {
      plate: '51A-22222',
      busType: BusType.limousine,
      amenities: {
        wifi: true,
        airCondition: true,
        tv: true,
        charger: true,
        toilet: true,
        blanket: true,
        water: true,
        snack: true,
      },
    },
  });
  await createSeatsForBus(limousineBus.id, BusType.limousine);

  console.log('Creating routes...');

  // Create routes
  const hcmcToMuine = await prisma.routes.create({
    data: {
      name: 'Ho Chi Minh City - Mui Ne',
      description: 'Route from Ho Chi Minh City to Mui Ne',
      originLocationId: hcmcStation.id,
      destinationLocationId: muineStation.id,
      isActive: true,
    },
  });

  // const hanoiToMuine = await prisma.routes.create({
  //   data: {
  //     name: 'Hanoi to Mui Ne',
  //     description: 'Long distance route from Hanoi to Mui Ne',
  //     originLocationId: hanoiStation.id,
  //     destinationLocationId: muineStation.id,
  //     isActive: true,
  //   },
  // });

  // const hcmcToDanang = await prisma.routes.create({
  //   data: {
  //     name: 'Ho Chi Minh City to Da Nang',
  //     description: 'Route from Ho Chi Minh City to Da Nang',
  //     originLocationId: hcmcStation.id,
  //     destinationLocationId: danangStation.id,
  //     isActive: true,
  //   },
  // });

  console.log('Creating trips...');

  // Create trips for next few days
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const trip1Start = new Date(tomorrow);
  trip1Start.setHours(6, 0, 0, 0);
  const trip1End = new Date(tomorrow);
  trip1End.setHours(10, 30, 0, 0);

  const trip1 = await prisma.trips.create({
    data: {
      busId: standardBus.id,
      tripName: 'HCMC-Mui Ne Morning',
      startTime: trip1Start,
      endTime: trip1End,
      tripStops: {
        create: [
          {
            locationId: hcmcStation.id,
            sequence: 1,
            departureTime: trip1Start,
          },
          {
            locationId: muineStation.id,
            sequence: 2,
            arrivalTime: trip1End,
          },
        ],
      },
    },
  });

  const trip2Start = new Date(tomorrow);
  trip2Start.setHours(8, 0, 0, 0);
  const trip2End = new Date(tomorrow);
  trip2End.setHours(12, 30, 0, 0);

  const trip2 = await prisma.trips.create({
    data: {
      busId: vipBus.id,
      tripName: 'HCMC-Mui Ne VIP',
      startTime: trip2Start,
      endTime: trip2End,
      tripStops: {
        create: [
          {
            locationId: hcmcStation.id,
            sequence: 1,
            departureTime: trip2Start,
          },
          {
            locationId: muineStation.id,
            sequence: 2,
            arrivalTime: trip2End,
          },
        ],
      },
    },
  });

  const trip3Start = new Date(tomorrow);
  trip3Start.setHours(14, 0, 0, 0);
  const trip3End = new Date(tomorrow);
  trip3End.setHours(18, 30, 0, 0);

  const trip3 = await prisma.trips.create({
    data: {
      busId: sleeperBus.id,
      tripName: 'HCMC-Mui Ne Sleeper',
      startTime: trip3Start,
      endTime: trip3End,
      tripStops: {
        create: [
          {
            locationId: hcmcStation.id,
            sequence: 1,
            departureTime: trip3Start,
          },
          {
            locationId: muineStation.id,
            sequence: 2,
            arrivalTime: trip3End,
          },
        ],
      },
    },
  });

  const trip4Start = new Date(tomorrow);
  trip4Start.setHours(16, 0, 0, 0);
  const trip4End = new Date(tomorrow);
  trip4End.setHours(20, 30, 0, 0);

  const trip4 = await prisma.trips.create({
    data: {
      busId: limousineBus.id,
      tripName: 'HCMC-Mui Ne Limousine',
      startTime: trip4Start,
      endTime: trip4End,
      tripStops: {
        create: [
          {
            locationId: hcmcStation.id,
            sequence: 1,
            departureTime: trip4Start,
          },
          {
            locationId: muineStation.id,
            sequence: 2,
            arrivalTime: trip4End,
          },
        ],
      },
    },
  });

  console.log('Creating trip route maps...');

  // Create trip route maps
  await prisma.tripRouteMap.create({
    data: {
      tripId: trip1.id,
      routeId: hcmcToMuine.id,
      price: 150000,
    },
  });

  await prisma.tripRouteMap.create({
    data: {
      tripId: trip2.id,
      routeId: hcmcToMuine.id,
      price: 200000,
    },
  });

  await prisma.tripRouteMap.create({
    data: {
      tripId: trip3.id,
      routeId: hcmcToMuine.id,
      price: 250000,
    },
  });

  await prisma.tripRouteMap.create({
    data: {
      tripId: trip4.id,
      routeId: hcmcToMuine.id,
      price: 350000,
    },
  });

  console.log('Creating test users and bookings...');

  // Hash password for test users
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create test users
  const testUser1 = await prisma.users.upsert({
    where: { email: 'user1@example.com' },
    update: {},
    create: {
      email: 'user1@example.com',
      fullName: 'Nguyen Van A',
      phoneNumber: '+84901234567',
      password: hashedPassword,
      role: 'passenger',
      status: 'active',
      emailVerified: true,
    },
  });

  const testUser2 = await prisma.users.upsert({
    where: { email: 'user2@example.com' },
    update: {},
    create: {
      email: 'user2@example.com',
      fullName: 'Tran Thi B',
      phoneNumber: '+84902345678',
      password: hashedPassword,
      role: 'passenger',
      status: 'active',
      emailVerified: true,
    },
  });

  // Get trip stops for bookings
  const trip1Stops = await prisma.tripStops.findMany({
    where: { tripId: trip1.id },
    orderBy: { sequence: 'asc' },
  });

  const trip2Stops = await prisma.tripStops.findMany({
    where: { tripId: trip2.id },
    orderBy: { sequence: 'asc' },
  });

  const trip3Stops = await prisma.tripStops.findMany({
    where: { tripId: trip3.id },
    orderBy: { sequence: 'asc' },
  });

  // Get seats for bookings
  const standardSeats = await prisma.seats.findMany({
    where: { busId: standardBus.id },
    take: 5,
  });

  const vipSeats = await prisma.seats.findMany({
    where: { busId: vipBus.id },
    take: 5,
  });

  const sleeperSeats = await prisma.seats.findMany({
    where: { busId: sleeperBus.id },
    take: 5,
  });

  // Create trip segments for locking
  const trip1Segments = await prisma.tripSegments.create({
    data: {
      tripId: trip1.id,
      fromStopId: trip1Stops[0].id,
      toStopId: trip1Stops[1].id,
      segmentIndex: 1,
      durationMinutes: 270, // 4.5 hours
    },
  });

  const trip2Segments = await prisma.tripSegments.create({
    data: {
      tripId: trip2.id,
      fromStopId: trip2Stops[0].id,
      toStopId: trip2Stops[1].id,
      segmentIndex: 1,
      durationMinutes: 270,
    },
  });

  const trip3Segments = await prisma.tripSegments.create({
    data: {
      tripId: trip3.id,
      fromStopId: trip3Stops[0].id,
      toStopId: trip3Stops[1].id,
      segmentIndex: 1,
      durationMinutes: 270,
    },
  });

  // Create bookings for test users
  // Booking 1: Confirmed (User1, Trip1)
  const booking1 = await prisma.bookings.create({
    data: {
      userId: testUser1.id,
      tripId: trip1.id,
      routeId: hcmcToMuine.id,
      seatId: standardSeats[0].id,
      pickupStopId: trip1Stops[0].id,
      dropoffStopId: trip1Stops[1].id,
      customerInfo: {
        fullName: 'Nguyen Van A',
        phoneNumber: '+84901234567',
        email: 'user1@example.com',
        idNumber: '001234567890',
      },
      price: 150000,
      status: 'confirmed',
      ticketCode: 'TKT' + Date.now() + '001',
    },
  });

  await prisma.seatSegmentLocks.create({
    data: {
      tripId: trip1.id,
      seatId: standardSeats[0].id,
      segmentId: trip1Segments.id,
      bookingId: booking1.id,
    },
  });

  await prisma.payments.create({
    data: {
      bookingId: booking1.id,
      amount: 150000,
      gateway: 'momo',
      status: 'successful',
      gatewayTransactionId: 'MOMO' + Date.now(),
    },
  });

  // Booking 2: Confirmed (User1, Trip2 - different date)
  const booking2 = await prisma.bookings.create({
    data: {
      userId: testUser1.id,
      tripId: trip2.id,
      routeId: hcmcToMuine.id,
      seatId: vipSeats[0].id,
      pickupStopId: trip2Stops[0].id,
      dropoffStopId: trip2Stops[1].id,
      customerInfo: {
        fullName: 'Nguyen Van A',
        phoneNumber: '+84901234567',
        email: 'user1@example.com',
        idNumber: '001234567890',
      },
      price: 200000,
      status: 'confirmed',
      ticketCode: 'TKT' + Date.now() + '002',
    },
  });

  await prisma.seatSegmentLocks.create({
    data: {
      tripId: trip2.id,
      seatId: vipSeats[0].id,
      segmentId: trip2Segments.id,
      bookingId: booking2.id,
    },
  });

  await prisma.payments.create({
    data: {
      bookingId: booking2.id,
      amount: 200000,
      gateway: 'zalopay',
      status: 'successful',
      gatewayTransactionId: 'ZALO' + Date.now(),
    },
  });

  // Booking 3: Pending Payment (User1, Trip3)
  const booking3 = await prisma.bookings.create({
    data: {
      userId: testUser1.id,
      tripId: trip3.id,
      routeId: hcmcToMuine.id,
      seatId: sleeperSeats[0].id,
      pickupStopId: trip3Stops[0].id,
      dropoffStopId: trip3Stops[1].id,
      customerInfo: {
        fullName: 'Nguyen Van A',
        phoneNumber: '+84901234567',
        email: 'user1@example.com',
        idNumber: '001234567890',
      },
      price: 250000,
      status: 'pendingPayment',
      ticketCode: 'TKT' + Date.now() + '003',
    },
  });

  await prisma.seatSegmentLocks.create({
    data: {
      tripId: trip3.id,
      seatId: sleeperSeats[0].id,
      segmentId: trip3Segments.id,
      bookingId: booking3.id,
    },
  });

  await prisma.payments.create({
    data: {
      bookingId: booking3.id,
      amount: 250000,
      status: 'pending',
    },
  });

  // Booking 4: Cancelled (User1)
  const yesterdayTrip = new Date(yesterday);
  yesterdayTrip.setHours(8, 0, 0, 0);

  const oldTrip = await prisma.trips.create({
    data: {
      busId: standardBus.id,
      tripName: 'HCMC-Mui Ne Past Trip',
      startTime: yesterdayTrip,
      endTime: new Date(yesterdayTrip.getTime() + 4.5 * 60 * 60 * 1000),
      status: 'completed',
      tripStops: {
        create: [
          {
            locationId: hcmcStation.id,
            sequence: 1,
            departureTime: yesterdayTrip,
          },
          {
            locationId: muineStation.id,
            sequence: 2,
            arrivalTime: new Date(
              yesterdayTrip.getTime() + 4.5 * 60 * 60 * 1000,
            ),
          },
        ],
      },
    },
  });

  const oldTripStops = await prisma.tripStops.findMany({
    where: { tripId: oldTrip.id },
    orderBy: { sequence: 'asc' },
  });

  await prisma.tripRouteMap.create({
    data: {
      tripId: oldTrip.id,
      routeId: hcmcToMuine.id,
      price: 150000,
    },
  });

  await prisma.bookings.create({
    data: {
      userId: testUser1.id,
      tripId: oldTrip.id,
      routeId: hcmcToMuine.id,
      seatId: standardSeats[1].id,
      pickupStopId: oldTripStops[0].id,
      dropoffStopId: oldTripStops[1].id,
      customerInfo: {
        fullName: 'Nguyen Van A',
        phoneNumber: '+84901234567',
        email: 'user1@example.com',
        idNumber: '001234567890',
      },
      price: 150000,
      status: 'cancelled',
      ticketCode: 'TKT' + Date.now() + '004',
    },
  });

  // Booking 5: Confirmed for User2
  const booking5 = await prisma.bookings.create({
    data: {
      userId: testUser2.id,
      tripId: trip1.id,
      routeId: hcmcToMuine.id,
      seatId: standardSeats[2].id,
      pickupStopId: trip1Stops[0].id,
      dropoffStopId: trip1Stops[1].id,
      customerInfo: {
        fullName: 'Tran Thi B',
        phoneNumber: '+84902345678',
        email: 'user2@example.com',
        idNumber: '009876543210',
      },
      price: 150000,
      status: 'confirmed',
      ticketCode: 'TKT' + Date.now() + '005',
    },
  });

  await prisma.seatSegmentLocks.create({
    data: {
      tripId: trip1.id,
      seatId: standardSeats[2].id,
      segmentId: trip1Segments.id,
      bookingId: booking5.id,
    },
  });

  await prisma.payments.create({
    data: {
      bookingId: booking5.id,
      amount: 150000,
      gateway: 'payos',
      status: 'successful',
      gatewayTransactionId: 'PAYOS' + Date.now(),
    },
  });

  console.log('Seed data created successfully!');
  console.log('Created:');
  console.log('- 4 locations');
  console.log('- 4 buses (different types and amenities)');
  console.log('- 3 routes');
  console.log('- 5 trips (including 1 past trip)');
  console.log('- 5 trip route maps');
  console.log('- 2 test users');
  console.log(
    '- 5 bookings (2 confirmed, 1 pending, 1 cancelled, 1 for user2)',
  );
  console.log('\nTest Users:');
  console.log('User 1: user1@example.com (Password: password123)');
  console.log('User 2: user2@example.com (Password: password123)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
