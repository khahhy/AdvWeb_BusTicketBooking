import { PrismaClient } from '@prisma/client';
import { BusType, SeatCapacity } from '@prisma/client';

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

  // Create buses with different types and amenities
  const standardBus = await prisma.buses.create({
    data: {
      plate: '51A-12345',
      busType: BusType.standard,
      seatCapacity: SeatCapacity.SEAT_32,
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

  const vipBus = await prisma.buses.create({
    data: {
      plate: '51A-67890',
      busType: BusType.vip,
      seatCapacity: SeatCapacity.SEAT_16,
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

  const sleeperBus = await prisma.buses.create({
    data: {
      plate: '51A-11111',
      busType: BusType.sleeper,
      seatCapacity: SeatCapacity.SEAT_32,
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

  const limousineBus = await prisma.buses.create({
    data: {
      plate: '51A-22222',
      busType: BusType.limousine,
      seatCapacity: SeatCapacity.SEAT_16,
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

  console.log('Creating routes...');

  // Create routes
  const hcmcToMuine = await prisma.routes.create({
    data: {
      name: 'Ho Chi Minh City to Mui Ne',
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

  const trip1 = await prisma.trips.create({
    data: {
      busId: standardBus.id,
      tripName: 'HCMC-Mui Ne Morning',
      startTime: new Date(tomorrow.setHours(6, 0, 0, 0)),
      endTime: new Date(tomorrow.setHours(10, 30, 0, 0)),
    },
  });

  const trip2 = await prisma.trips.create({
    data: {
      busId: vipBus.id,
      tripName: 'HCMC-Mui Ne VIP',
      startTime: new Date(tomorrow.setHours(8, 0, 0, 0)),
      endTime: new Date(tomorrow.setHours(12, 30, 0, 0)),
    },
  });

  const trip3 = await prisma.trips.create({
    data: {
      busId: sleeperBus.id,
      tripName: 'HCMC-Mui Ne Sleeper',
      startTime: new Date(tomorrow.setHours(14, 0, 0, 0)),
      endTime: new Date(tomorrow.setHours(18, 30, 0, 0)),
    },
  });

  const trip4 = await prisma.trips.create({
    data: {
      busId: limousineBus.id,
      tripName: 'HCMC-Mui Ne Limousine',
      startTime: new Date(tomorrow.setHours(16, 0, 0, 0)),
      endTime: new Date(tomorrow.setHours(20, 30, 0, 0)),
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

  console.log('Seed data created successfully!');
  console.log('Created:');
  console.log('- 4 locations');
  console.log('- 4 buses (different types and amenities)');
  console.log('- 3 routes');
  console.log('- 4 trips');
  console.log('- 4 trip route maps');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
