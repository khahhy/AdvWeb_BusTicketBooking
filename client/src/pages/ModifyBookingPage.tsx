import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  AlertTriangle,
  MapPin,
  Calendar,
  Clock,
  Loader2,
  Info,
} from "lucide-react";
import Navbar from "@/components/common/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Footer from "@/components/dashboard/Footer";
import { toast } from "sonner";
import dayjs from "dayjs";
import backgroundImage from "@/assets/images/background.png";
import { API_BASE_URL } from "@/lib/api";

interface Booking {
  id: string;
  ticketCode: string;
  status: "pendingPayment" | "confirmed" | "cancelled";
  price: number;
  customerInfo: {
    fullName: string;
    phoneNumber: string;
    email: string;
    idNumber?: string;
  };
  trip: {
    tripName: string;
    startTime: string;
  };
  route: {
    name: string;
  };
  seat: {
    seatNumber: string;
  };
  pickupStop: {
    location: {
      name: string;
      city: string;
    };
  };
  dropoffStop: {
    location: {
      name: string;
      city: string;
    };
  };
}

export default function ModifyBookingPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [booking, setBooking] = useState<Booking | null>(
    location.state?.booking || null,
  );
  const [loading, setLoading] = useState(!location.state?.booking);
  const [saving, setSaving] = useState(false);

  // Modifiable customer info
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [idNumber, setIdNumber] = useState("");

  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (!booking && id) {
      fetchBooking();
    } else if (booking) {
      initializeForm();
    }
  }, [booking, id]);

  useEffect(() => {
    if (booking) {
      const changed =
        fullName !== booking.customerInfo.fullName ||
        phoneNumber !== booking.customerInfo.phoneNumber ||
        email !== booking.customerInfo.email ||
        idNumber !== (booking.customerInfo.idNumber || "");
      setHasChanges(changed);
    }
  }, [fullName, phoneNumber, email, idNumber, booking]);

  const fetchBooking = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`${API_BASE_URL}/bookings/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch booking");

      const result = await response.json();
      setBooking(result.data);
      initializeFormWithData(result.data);
    } catch (error) {
      console.error("Error fetching booking:", error);
      toast.error("Unable to load booking information");
      navigate("/booking-history");
    } finally {
      setLoading(false);
    }
  };

  const initializeFormWithData = (bookingData: Booking) => {
    setFullName(bookingData.customerInfo.fullName);
    setPhoneNumber(bookingData.customerInfo.phoneNumber);
    setEmail(bookingData.customerInfo.email);
    setIdNumber(bookingData.customerInfo.idNumber || "");
  };

  const initializeForm = () => {
    if (booking) {
      initializeFormWithData(booking);
    }
  };

  const handleSave = async () => {
    if (!booking || !hasChanges) return;

    // Validate form
    if (!fullName.trim()) {
      toast.error("Please enter full name");
      return;
    }
    if (!phoneNumber.trim()) {
      toast.error("Please enter phone number");
      return;
    }
    if (!email.trim()) {
      toast.error("Please enter email");
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        `${API_BASE_URL}/bookings/${booking.id}/modify`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            customerInfo: {
              fullName: fullName.trim(),
              phoneNumber: phoneNumber.trim(),
              email: email.trim(),
              idNumber: idNumber.trim() || undefined,
            },
          }),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to modify booking");
      }
      toast.success("Booking updated successfully!");
      navigate("/booking-history");
    } catch (error) {
      console.error("Error modifying booking:", error);
      toast.error(
        error instanceof Error ? error.message : "Unable to update booking",
      );
    } finally {
      setSaving(false);
    }
  };

  const canModify = () => {
    if (!booking) return false;
    const now = new Date();
    const tripStartTime = new Date(booking.trip.startTime);
    return booking.status === "confirmed" && tripStartTime > now;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-50 dark:bg-black dark:bg-none">
        <Navbar />
        <div className="container mx-auto px-4 py-16 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">
              Loading booking details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-50 dark:bg-black dark:bg-none">
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900 dark:text-red-100 mb-1">
                  Booking Not Found
                </h3>
                <p className="text-red-700 dark:text-red-300 text-sm">
                  The booking you're looking for doesn't exist or has been
                  removed.
                </p>
              </div>
            </div>
          </div>
          <Button
            onClick={() => navigate("/booking-history")}
            className="mt-4"
            variant="outline"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Booking History
          </Button>
        </div>
      </div>
    );
  }

  if (!canModify()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-50 dark:bg-black dark:bg-none">
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900 dark:text-red-100 mb-1">
                  Cannot Modify Booking
                </h3>
                <p className="text-red-700 dark:text-red-300 text-sm">
                  This booking cannot be modified because the trip has already
                  departed or the booking has been cancelled.
                </p>
              </div>
            </div>
          </div>
          <Button
            onClick={() => navigate("/booking-history")}
            className="mt-4"
            variant="outline"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Booking History
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-50 dark:bg-black dark:bg-none">
      <Navbar />

      {/* Header Section */}
      <div className="pt-32 pb-32 relative">
        {/* Background Image - only in light mode */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat dark:hidden"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />

        {/* Dark mode background */}
        <div className="absolute inset-0 bg-black hidden dark:block" />

        {/* Gradient fade overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-pink-50 to-transparent dark:from-black dark:to-transparent pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex items-center gap-4 mb-4 opacity-0 animate-[fadeInDown_0.7s_ease-out_0.1s_forwards]">
            <Button
              variant="ghost"
              onClick={() => navigate("/booking-history")}
              className="text-black dark:text-white hover:bg-white/20 dark:hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
          <h1 className="text-5xl font-bold text-black dark:text-white mb-3 opacity-0 animate-[fadeInDown_0.7s_ease-out_0.2s_forwards]">
            Modify Booking
          </h1>
          <p className="text-xl text-black/80 dark:text-white/80 opacity-0 animate-[fadeInDown_0.7s_ease-out_0.4s_forwards]">
            Update your booking information
          </p>
          {booking && (
            <p className="text-lg text-black/70 dark:text-white/70 mt-2 opacity-0 animate-[fadeInDown_0.7s_ease-out_0.5s_forwards]">
              Ticket Code:{" "}
              <span className="font-mono font-semibold">
                {booking.ticketCode}
              </span>
            </p>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 pb-16 -mt-16 relative z-10 dark:bg-black">
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Current Booking Info */}
          <div className="bg-white dark:bg-black rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 opacity-0 animate-[fadeInUp_0.8s_ease-out_0.2s_forwards]">
            <div className="mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Trip Information
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                This information cannot be changed
              </p>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Route
                    </p>
                    <p className="font-semibold">
                      {booking.pickupStop.location.city} →{" "}
                      {booking.dropoffStop.location.city}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Departure Date
                    </p>
                    <p className="font-semibold">
                      {dayjs(booking.trip.startTime).format("DD/MM/YYYY HH:mm")}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Seat Number
                    </p>
                    <p className="font-semibold">{booking.seat.seatNumber}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Ticket Price
                    </p>
                    <p className="font-semibold text-primary">
                      {booking.price.toLocaleString("vi-VN")}VND
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-blue-900 dark:text-blue-100">
                      Currently you can only edit passenger information. To
                      change seat or trip, please cancel this booking and make a
                      new reservation.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Editable Customer Info */}
          <div className="bg-white dark:bg-black rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 opacity-0 animate-[fadeInUp_0.8s_ease-out_0.4s_forwards]">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Passenger Information
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Update your contact information
              </p>
            </div>
            <div>
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter full name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number *</Label>
                  <Input
                    id="phoneNumber"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+84"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="idNumber">ID Number (Optional)</Label>
                  <Input
                    id="idNumber"
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                    placeholder="ID or Passport number"
                  />
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-6 justify-end opacity-0 animate-[fadeInUp_0.8s_ease-out_0.6s_forwards]">
          <Button
            variant="outline"
            onClick={() => navigate("/booking-history")}
            disabled={saving}
            className="px-6 py-2.5 rounded-xl"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-xl font-semibold"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  );
}
