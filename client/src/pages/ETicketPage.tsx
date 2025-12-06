import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ETicketViewer } from "@/components/ticket";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/dashboard/Footer";
import { Loader2, ArrowLeft, AlertCircle } from "lucide-react";
import { API_BASE_URL } from "@/lib/api";

interface ETicketData {
  bookingCode: string;
  passengerName: string;
  passengerId: string;
  email: string;
  phone: string;
  tripFrom: string;
  tripTo: string;
  fromTerminal: string;
  toTerminal: string;
  departureTime: string;
  arrivalTime: string;
  travelDate: string;
  duration: string;
  seatNumber: string;
  busType: string;
  licensePlate: string;
  ticketPrice: number;
  totalPrice: number;
  bookingDate: string;
  status: "CONFIRMED" | "PENDING" | "CANCELLED";
}

export default function ETicketPage() {
  const { ticketCode } = useParams<{ ticketCode: string }>();
  const navigate = useNavigate();
  const [ticketData, setTicketData] = useState<ETicketData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchTicketData = async () => {
      console.log("ETicketPage: ticketCode from URL params:", ticketCode);
      
      if (!ticketCode) {
        setError("Invalid ticket code - no ticket code provided");
        setIsLoading(false);
        return;
      }

      try {
        const url = `${API_BASE_URL}/bookings/eticket/${ticketCode}`;
        console.log("ETicketPage: Fetching from URL:", url);
        
        const response = await fetch(url);
        console.log("ETicketPage: Response status:", response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("ETicketPage: Error response:", errorText);
          throw new Error(`Ticket not found: ${response.status}`);
        }

        const result = await response.json();
        console.log("ETicketPage: Result:", result);
        setTicketData(result.data);
      } catch (err) {
        console.error("ETicketPage: Error fetching ticket:", err);
        setError(`Failed to load e-ticket: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTicketData();
  }, [ticketCode]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 dark:bg-black dark:bg-none">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-pink-500 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-300">
              Loading your e-ticket...
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !ticketData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 dark:bg-black dark:bg-none">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md mx-auto px-6">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              E-Ticket Not Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {error || "We couldn't find your e-ticket."}
            </p>
            <button
              onClick={() => navigate("/track-ticket")}
              className="inline-flex items-center gap-2 bg-pink-500 hover:bg-pink-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
              Track Your Ticket
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 dark:bg-black dark:bg-none">
      <Navbar />

      <div className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Your E-Ticket
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Download or print your ticket for boarding
            </p>
          </div>

          {/* E-Ticket Viewer */}
          <ETicketViewer {...ticketData} />
        </div>
      </div>

      <Footer />
    </div>
  );
}

