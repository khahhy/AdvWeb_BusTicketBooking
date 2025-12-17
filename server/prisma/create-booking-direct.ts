import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createTestBooking() {
  console.log('🔍 Finding user thuythanhluu161@gmail.com...');

  // Find or create user
  let user = await prisma.users.findFirst({
    where: {
      OR: [
        { email: 'thuythanhluu161@gmail.com' },
        { email: { contains: 'thuythanhluu' } },
      ],
    },
  });

  if (!user) {
    console.log('❌ User not found. Creating new user...');
    user = await prisma.users.create({
      data: {
        email: 'thuythanhluu161@gmail.com',
        fullName: 'Thuy Thanh Luu',
        phoneNumber: '+84899150904', // UPDATE WITH REAL PHONE NUMBER
        password: null,
        role: 'passenger',
        status: 'active',
        emailVerified: true,
      },
    });
  }

  console.log('✅ User found:', user.email, '- ID:', user.id);

  // Find any scheduled trip with route and seats
  console.log('\n🔍 Finding available trip...');

  // First check if any TripRouteMap exists
  const routeMap = await prisma.tripRouteMap.findFirst({
    where: {
      trip: {
        status: 'scheduled',
      },
    },
    include: {
      trip: {
        include: {
          bus: {
            include: {
              seats: { take: 5 },
            },
          },
          tripStops: {
            include: {
              location: true,
            },
            orderBy: {
              sequence: 'asc',
            },
          },
        },
      },
      route: true,
    },
  });

  if (!routeMap || !routeMap.trip) {
    console.log('❌ No trip with route found! Checking database...');

    // Debug: Check what exists
    const tripCount = await prisma.trips.count();
    const routeMapCount = await prisma.tripRouteMap.count();
    const stopCount = await prisma.tripStops.count();

    console.log(`   Trips: ${tripCount}`);
    console.log(`   TripRouteMaps: ${routeMapCount}`);
    console.log(`   TripStops: ${stopCount}`);

    return;
  }

  const trip = routeMap.trip;

  console.log('✅ Trip found:', trip.id);
  console.log('   Start time:', trip.startTime);

  // Update trip to be 3 hours from now
  const futureTime = new Date(Date.now() + 3 * 60 * 60 * 1000);
  await prisma.trips.update({
    where: { id: trip.id },
    data: {
      startTime: futureTime,
      endTime: new Date(futureTime.getTime() + 4 * 60 * 60 * 1000),
    },
  });
  console.log('   Updated to:', futureTime);

  if (trip.tripStops.length < 2) {
    console.log('❌ Trip has no stops!');
    return;
  }

  if (!trip.bus || !trip.bus.seats || trip.bus.seats.length === 0) {
    console.log('❌ Bus has no seats!');
    return;
  }

  const route = routeMap;
  const seat = trip.bus.seats[0];
  const pickupStop = trip.tripStops[0];
  const dropoffStop = trip.tripStops[trip.tripStops.length - 1];

  console.log('✅ Route ID:', route.routeId);
  console.log('✅ Seat ID:', seat.id, '- Number:', seat.seatNumber);
  console.log('✅ Pickup:', pickupStop.location.name);
  console.log('✅ Dropoff:', dropoffStop.location.name);

  // Create booking
  console.log('\n📝 Creating booking...');
  const booking = await prisma.bookings.create({
    data: {
      userId: user.id,
      tripId: trip.id,
      routeId: route.routeId,
      seatId: seat.id,
      pickupStopId: pickupStop.id,
      dropoffStopId: dropoffStop.id,
      status: 'confirmed',
      price: route.price,
      ticketCode: `TEST${Date.now()}`,
      customerInfo: {
        email: user.email,
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
      },
    },
  });

  console.log('\n✅ BOOKING CREATED SUCCESSFULLY!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📧 Email:', user.email);
  console.log('📱 Phone:', user.phoneNumber);
  console.log('🎫 Ticket Code:', booking.ticketCode);
  console.log('🚌 Trip Time:', futureTime);
  console.log('💺 Seat:', seat.seatNumber);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n⏰ Notification scheduler will send:');
  console.log('   - Email reminder 24h before trip');
  console.log('   - SMS reminder 24h before trip');
  console.log('   - Check cron job logs in server console');
  console.log('\n💡 To trigger immediately, modify trip time to be within 24h');
}

createTestBooking()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
