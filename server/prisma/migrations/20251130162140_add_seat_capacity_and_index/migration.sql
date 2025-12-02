-- CreateEnum
CREATE TYPE "SeatCapacity" AS ENUM ('SEAT_16', 'SEAT_28', 'SEAT_32');

-- AlterTable
ALTER TABLE "Buses" ADD COLUMN     "seatCapacity" "SeatCapacity" NOT NULL DEFAULT 'SEAT_16';

-- CreateIndex
CREATE INDEX "Bookings_userId_idx" ON "Bookings"("userId");

-- CreateIndex
CREATE INDEX "Bookings_tripId_idx" ON "Bookings"("tripId");

-- CreateIndex
CREATE INDEX "Bookings_routeId_idx" ON "Bookings"("routeId");

-- CreateIndex
CREATE INDEX "Bookings_seatId_idx" ON "Bookings"("seatId");

-- CreateIndex
CREATE INDEX "Notifications_userId_idx" ON "Notifications"("userId");

-- CreateIndex
CREATE INDEX "Notifications_bookingId_idx" ON "Notifications"("bookingId");

-- CreateIndex
CREATE INDEX "Payments_bookingId_idx" ON "Payments"("bookingId");

-- CreateIndex
CREATE INDEX "SeatSegmentLocks_tripId_idx" ON "SeatSegmentLocks"("tripId");

-- CreateIndex
CREATE INDEX "SeatSegmentLocks_seatId_idx" ON "SeatSegmentLocks"("seatId");

-- CreateIndex
CREATE INDEX "Seats_busId_idx" ON "Seats"("busId");

-- CreateIndex
CREATE INDEX "TripRouteMap_routeId_idx" ON "TripRouteMap"("routeId");

-- CreateIndex
CREATE INDEX "TripRouteMap_tripId_idx" ON "TripRouteMap"("tripId");

-- CreateIndex
CREATE INDEX "TripSegments_tripId_idx" ON "TripSegments"("tripId");

-- CreateIndex
CREATE INDEX "TripStops_tripId_idx" ON "TripStops"("tripId");

-- CreateIndex
CREATE INDEX "Trips_startTime_idx" ON "Trips"("startTime");

-- CreateIndex
CREATE INDEX "Trips_status_idx" ON "Trips"("status");
