import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/dashboard/Footer";
import { Loader2, CheckCircle2, XCircle, Clock, Ticket } from "lucide-react";
import { useGetPaymentStatusByOrderCodeQuery } from "@/store/api/paymentApi";
import dayjs from "dayjs";

export default function PaymentResultPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Get params from PayOS callback
  const orderCode = searchParams.get("orderCode");
  const payosStatus = searchParams.get("status"); // PAID, CANCELLED

  // Additional params for display
  const seat = searchParams.get("seat") || "";
  const passengerName = searchParams.get("passengerName") || "";
  const email = searchParams.get("email") || "";
  const travelDate = searchParams.get("date") || "";

  const [pollingCount, setPollingCount] = useState(0);
  const maxPollingAttempts = 10; // Poll for ~30 seconds (3s interval)

  useEffect(() => {
    window.scrollTo(0, 0);
    console.log(
      "PaymentResultPage - orderCode:",
      orderCode,
      "payosStatus:",
      payosStatus,
    );
  }, [orderCode, payosStatus]);

  // Query payment status from our backend using orderCode
  const { data, isLoading, isError, refetch } =
    useGetPaymentStatusByOrderCodeQuery(
      { orderCode: orderCode || "" },
      {
        skip: !orderCode,
        pollingInterval:
          payosStatus === "PAID" && pollingCount < maxPollingAttempts
            ? 3000
            : undefined,
      },
    );

  console.log("Payment status data:", data, "isError:", isError);

  useEffect(() => {
    if (data?.status === "successful") {
      // Stop polling when confirmed
      setPollingCount(maxPollingAttempts);

      // Redirect to confirmation page with all needed params from backend
      const bookingData = data;
      const params = new URLSearchParams();

      if (bookingData) {
        if (bookingData.tripId) params.append("tripId", bookingData.tripId);
        if (bookingData.routeId) params.append("routeId", bookingData.routeId);
        if (bookingData.ticketCode)
          params.append("ticketCode", bookingData.ticketCode);
        if (bookingData.seatNumber)
          params.append("seat", bookingData.seatNumber);
        if (bookingData.passengerName)
          params.append("passengerName", bookingData.passengerName);
        if (bookingData.email) params.append("email", bookingData.email);
        if (bookingData.travelDate) {
          params.append(
            "date",
            new Date(bookingData.travelDate).toISOString().split("T")[0],
          );
        }

        setTimeout(() => {
          navigate(`/confirmation?${params.toString()}`);
        }, 2000);
      }
    } else if (pollingCount < maxPollingAttempts) {
      setPollingCount((prev) => prev + 1);
    }
  }, [data, pollingCount, navigate]);

  const status = data?.status;
  const ticketCode = data?.ticketCode;

  const renderStatusIcon = () => {
    // If PayOS says PAID but we're still waiting for webhook confirmation
    if (payosStatus === "PAID" && status === "pending") {
      return (
        <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mb-4">
          <Loader2 className="w-10 h-10 text-yellow-600 animate-spin" />
        </div>
      );
    }

    if (status === "successful" || payosStatus === "PAID") {
      return (
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
      );
    }

    if (status === "failed" || payosStatus === "CANCELLED") {
      return (
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
          <XCircle className="w-10 h-10 text-red-600" />
        </div>
      );
    }

    return (
      <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mb-4">
        <Clock className="w-10 h-10 text-yellow-600" />
      </div>
    );
  };

  const getTitle = () => {
    if (payosStatus === "PAID" && status === "pending") {
      return "Processing Payment...";
    }
    if (status === "successful" || payosStatus === "PAID") {
      return "Payment Successful!";
    }
    if (status === "failed" || payosStatus === "CANCELLED") {
      return "Payment Cancelled";
    }
    return "Payment Pending";
  };

  const getSubtitle = () => {
    if (payosStatus === "PAID" && status === "pending") {
      return "We received your payment. Confirming your booking...";
    }
    if (status === "successful") {
      return "Your booking is confirmed! We've sent your e-ticket to your email.";
    }
    if (status === "failed" || payosStatus === "CANCELLED") {
      return "Your payment was cancelled. Please try booking again.";
    }
    return "Checking payment status...";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 dark:bg-black dark:bg-none">
      <Navbar />
      <div className="pt-32 pb-20 max-w-3xl mx-auto px-6">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-8 text-center">
          {isLoading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-10 h-10 animate-spin text-pink-500" />
              <p className="text-gray-600 dark:text-gray-300">
                Checking payment status...
              </p>
            </div>
          ) : isError || !status ? (
            <div className="flex flex-col items-center gap-3">
              <XCircle className="w-12 h-12 text-red-500" />
              <p className="text-red-500">Unable to fetch payment status.</p>
              <button
                onClick={() => refetch()}
                className="px-4 py-2 bg-pink-500 text-white rounded-lg"
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              <div className="flex flex-col items-center">
                {renderStatusIcon()}
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {getTitle()}
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md">
                  {getSubtitle()}
                </p>

                {/* Show order code if available */}
                {orderCode && (
                  <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Order Code
                    </p>
                    <p className="text-lg font-mono font-semibold text-gray-900 dark:text-white">
                      {orderCode}
                    </p>
                  </div>
                )}

                {/* Show booking details if confirmed */}
                {(status === "successful" ||
                  (payosStatus === "PAID" && status === "pending")) && (
                  <div className="w-full max-w-md space-y-4 mb-8">
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                        Booking Details
                      </h3>
                      <div className="space-y-2 text-sm">
                        {passengerName && (
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">
                              Passenger:
                            </span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {passengerName}
                            </span>
                          </div>
                        )}
                        {seat && (
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">
                              Seat:
                            </span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {seat}
                            </span>
                          </div>
                        )}
                        {travelDate && (
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">
                              Travel Date:
                            </span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {dayjs(travelDate).format("MMM DD, YYYY")}
                            </span>
                          </div>
                        )}
                        {email && (
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">
                              Email:
                            </span>
                            <span className="font-medium text-gray-900 dark:text-white text-right break-all">
                              {email}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-3 flex-wrap justify-center">
                  {status === "successful" && ticketCode && (
                    <button
                      onClick={() => navigate(`/eticket/${ticketCode}`)}
                      className="px-6 py-3 bg-pink-500 text-white rounded-lg font-medium hover:bg-pink-600 transition-colors flex items-center gap-2"
                    >
                      <Ticket className="w-5 h-5" />
                      View E-Ticket
                    </button>
                  )}

                  {(status === "failed" || payosStatus === "CANCELLED") && (
                    <button
                      onClick={() => navigate("/search")}
                      className="px-6 py-3 bg-pink-500 text-white rounded-lg font-medium hover:bg-pink-600 transition-colors"
                    >
                      Book Another Trip
                    </button>
                  )}

                  {status === "pending" &&
                    payosStatus === "PAID" &&
                    pollingCount >= maxPollingAttempts && (
                      <button
                        onClick={() => {
                          setPollingCount(0);
                          refetch();
                        }}
                        className="px-6 py-3 bg-pink-500 text-white rounded-lg font-medium hover:bg-pink-600 transition-colors"
                      >
                        Check Status Again
                      </button>
                    )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
