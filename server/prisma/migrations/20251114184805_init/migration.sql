-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('passenger', 'admin');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('active', 'banned');

-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('local', 'google', 'firebase');

-- CreateEnum
CREATE TYPE "TripStatus" AS ENUM ('scheduled', 'ongoing', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('pendingPayment', 'confirmed', 'cancelled');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('pending', 'successful', 'failed');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('email', 'sms');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('pending', 'sent', 'failed');

-- CreateEnum
CREATE TYPE "SeatType" AS ENUM ('upperDeck', 'lowerDeck', 'window');

-- CreateEnum
CREATE TYPE "GatewayType" AS ENUM ('momo', 'zalopay', 'payos', 'paypal_sandbox');

-- CreateTable
CREATE TABLE "Users" (
    "id" TEXT NOT NULL,
    "fullName" TEXT,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "password" TEXT,
    "authProvider" "AuthProvider" NOT NULL DEFAULT 'local',
    "providerId" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'passenger',
    "status" "UserStatus" NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Locations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Buses" (
    "id" TEXT NOT NULL,
    "plate" TEXT NOT NULL,
    "busType" TEXT,
    "amenities" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Buses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Seats" (
    "id" TEXT NOT NULL,
    "busId" TEXT NOT NULL,
    "seatNumber" TEXT NOT NULL,
    "seatType" "SeatType",
    "coordinates" JSONB,

    CONSTRAINT "Seats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trips" (
    "id" TEXT NOT NULL,
    "busId" TEXT NOT NULL,
    "tripName" TEXT,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "status" "TripStatus" NOT NULL DEFAULT 'scheduled',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Trips_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TripStops" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "arrivalTime" TIMESTAMP(3),
    "departureTime" TIMESTAMP(3),

    CONSTRAINT "TripStops_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TripSegments" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "fromStopId" TEXT NOT NULL,
    "toStopId" TEXT NOT NULL,
    "segmentIndex" INTEGER NOT NULL,
    "durationMinutes" INTEGER,

    CONSTRAINT "TripSegments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Routes" (
    "id" TEXT NOT NULL,
    "originLocationId" TEXT NOT NULL,
    "destinationLocationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(65,30) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Routes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TripRouteMap" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,

    CONSTRAINT "TripRouteMap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bookings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,
    "seatId" TEXT NOT NULL,
    "pickupStopId" TEXT NOT NULL,
    "dropoffStopId" TEXT NOT NULL,
    "customerInfo" JSONB NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "status" "BookingStatus" NOT NULL,
    "ticketCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeatSegmentLocks" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "seatId" TEXT NOT NULL,
    "segmentId" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,

    CONSTRAINT "SeatSegmentLocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payments" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "gateway" "GatewayType",
    "gatewayTransactionId" TEXT,
    "status" "PaymentStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reviews" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bookingId" TEXT,
    "type" "NotificationType" NOT NULL,
    "template" TEXT,
    "content" TEXT,
    "status" "NotificationStatus" NOT NULL DEFAULT 'pending',
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Users_phoneNumber_key" ON "Users"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Buses_plate_key" ON "Buses"("plate");

-- CreateIndex
CREATE UNIQUE INDEX "Seats_busId_seatNumber_key" ON "Seats"("busId", "seatNumber");

-- CreateIndex
CREATE UNIQUE INDEX "TripStops_tripId_sequence_key" ON "TripStops"("tripId", "sequence");

-- CreateIndex
CREATE UNIQUE INDEX "TripSegments_tripId_segmentIndex_key" ON "TripSegments"("tripId", "segmentIndex");

-- CreateIndex
CREATE UNIQUE INDEX "TripRouteMap_tripId_routeId_key" ON "TripRouteMap"("tripId", "routeId");

-- CreateIndex
CREATE UNIQUE INDEX "Bookings_ticketCode_key" ON "Bookings"("ticketCode");

-- CreateIndex
CREATE UNIQUE INDEX "SeatSegmentLocks_tripId_seatId_segmentId_key" ON "SeatSegmentLocks"("tripId", "seatId", "segmentId");

-- AddForeignKey
ALTER TABLE "Seats" ADD CONSTRAINT "Seats_busId_fkey" FOREIGN KEY ("busId") REFERENCES "Buses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trips" ADD CONSTRAINT "Trips_busId_fkey" FOREIGN KEY ("busId") REFERENCES "Buses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripStops" ADD CONSTRAINT "TripStops_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trips"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripStops" ADD CONSTRAINT "TripStops_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripSegments" ADD CONSTRAINT "TripSegments_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trips"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripSegments" ADD CONSTRAINT "TripSegments_fromStopId_fkey" FOREIGN KEY ("fromStopId") REFERENCES "TripStops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripSegments" ADD CONSTRAINT "TripSegments_toStopId_fkey" FOREIGN KEY ("toStopId") REFERENCES "TripStops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Routes" ADD CONSTRAINT "Routes_originLocationId_fkey" FOREIGN KEY ("originLocationId") REFERENCES "Locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Routes" ADD CONSTRAINT "Routes_destinationLocationId_fkey" FOREIGN KEY ("destinationLocationId") REFERENCES "Locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripRouteMap" ADD CONSTRAINT "TripRouteMap_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trips"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripRouteMap" ADD CONSTRAINT "TripRouteMap_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Routes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bookings" ADD CONSTRAINT "Bookings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bookings" ADD CONSTRAINT "Bookings_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trips"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bookings" ADD CONSTRAINT "Bookings_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Routes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bookings" ADD CONSTRAINT "Bookings_seatId_fkey" FOREIGN KEY ("seatId") REFERENCES "Seats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bookings" ADD CONSTRAINT "Bookings_pickupStopId_fkey" FOREIGN KEY ("pickupStopId") REFERENCES "TripStops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bookings" ADD CONSTRAINT "Bookings_dropoffStopId_fkey" FOREIGN KEY ("dropoffStopId") REFERENCES "TripStops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeatSegmentLocks" ADD CONSTRAINT "SeatSegmentLocks_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trips"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeatSegmentLocks" ADD CONSTRAINT "SeatSegmentLocks_seatId_fkey" FOREIGN KEY ("seatId") REFERENCES "Seats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeatSegmentLocks" ADD CONSTRAINT "SeatSegmentLocks_segmentId_fkey" FOREIGN KEY ("segmentId") REFERENCES "TripSegments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeatSegmentLocks" ADD CONSTRAINT "SeatSegmentLocks_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payments" ADD CONSTRAINT "Payments_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reviews" ADD CONSTRAINT "Reviews_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reviews" ADD CONSTRAINT "Reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notifications" ADD CONSTRAINT "Notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notifications" ADD CONSTRAINT "Notifications_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;
