import { ETicketViewer } from "@/components/ticket";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/dashboard/Footer";
import { useEffect } from "react";

/**
 * Demo page to showcase the E-Ticket template design
 * This demonstrates the professional e-ticket layout with branding
 */
export default function ETicketDemoPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Sample data for demonstration
  const sampleTicketData = {
    bookingCode: "BUS7X2K9M4P",
    passengerName: "NGUYEN VAN MINH",
    passengerId: "079234567890",
    email: "nguyenvanminh@example.com",
    phone: "+84 912 345 678",
    tripFrom: "Ho Chi Minh City",
    tripTo: "Da Lat",
    fromTerminal: "Ho Chi Minh City Central Bus Station",
    toTerminal: "Da Lat Bus Terminal",
    departureTime: "08:00 AM",
    arrivalTime: "02:30 PM",
    travelDate: "2025-12-15",
    duration: "6h 30m",
    seatNumber: "A12",
    busType: "VIP Sleeper 40 Seats",
    licensePlate: "51B-12345",
    ticketPrice: 280000,
    totalPrice: 295000,
    bookingDate: "2025-12-04",
    status: "CONFIRMED" as const,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 dark:bg-black">
      <Navbar />

      <div className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              E-Ticket Design Preview
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Professional e-ticket template with company branding
            </p>
          </div>

          {/* E-Ticket Viewer */}
          <ETicketViewer {...sampleTicketData} />
        </div>
      </div>

      <Footer />
    </div>
  );
}
