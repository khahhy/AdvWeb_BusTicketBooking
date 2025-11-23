import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Star,
  Send,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
} from "lucide-react";
import Navbar from "@/components/common/Navbar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Footer from "@/components/dashboard/Footer";
import backgroundImage from "@/assets/images/background.png";
import dayjs from "dayjs";

interface BookingData {
  id: string;
  bookingCode: string;
  from: string;
  to: string;
  date: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  busNumber: string;
  busType: string;
}

interface RatingCategory {
  id: string;
  label: string;
  rating: number;
}

// Mock booking data
const mockBookings: { [key: string]: BookingData } = {
  "1": {
    id: "1",
    bookingCode: "BUS123456",
    from: "Ho Chi Minh City",
    to: "Da Lat",
    date: "2024-11-15",
    departureTime: "08:00",
    arrivalTime: "14:30",
    duration: "6h 30m",
    busNumber: "SGN-DAL-001",
    busType: "Limousine 22 seats",
  },
  "2": {
    id: "2",
    bookingCode: "BUS789012",
    from: "Ho Chi Minh City",
    to: "Nha Trang",
    date: "2024-12-01",
    departureTime: "22:00",
    arrivalTime: "06:30",
    duration: "8h 30m",
    busNumber: "SGN-NTR-003",
    busType: "Sleeper Bus 34 beds",
  },
};

export default function FeedbackRatingPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [booking, setBooking] = useState<BookingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [overallRating, setOverallRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [categories, setCategories] = useState<RatingCategory[]>([
    { id: "comfort", label: "Comfort & Cleanliness", rating: 0 },
    { id: "punctuality", label: "On-time Performance", rating: 0 },
    { id: "staff", label: "Staff Service", rating: 0 },
    { id: "safety", label: "Safety & Driving", rating: 0 },
  ]);

  useEffect(() => {
    window.scrollTo(0, 0);

    // Simulate API call
    setTimeout(() => {
      if (id && mockBookings[id]) {
        setBooking(mockBookings[id]);
      }
      setLoading(false);
    }, 500);
  }, [id]);

  const formatDate = (dateStr: string) => {
    return dayjs(dateStr).format("DD/MM/YYYY");
  };

  const handleStarClick = (rating: number, categoryId?: string) => {
    if (categoryId) {
      setCategories((prev) =>
        prev.map((cat) => (cat.id === categoryId ? { ...cat, rating } : cat)),
      );
    } else {
      setOverallRating(rating);
    }
  };

  const handleStarHover = (rating: number, isOverall: boolean = false) => {
    if (isOverall) {
      console.log(hoverRating); // temporary to fix eslint
      setHoverRating(rating);
    }
  };

  const handleSubmit = async () => {
    if (overallRating === 0) {
      alert("Please provide an overall rating");
      return;
    }

    setSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);

      // Auto redirect after 3 seconds
      setTimeout(() => {
        navigate("/booking-history");
      }, 3000);
    }, 1500);
  };

  const StarRating = ({
    rating,
    onStarClick,
    onStarHover,
    size = "w-6 h-6",
    categoryId,
  }: {
    rating: number;
    onStarClick: (rating: number, categoryId?: string) => void;
    onStarHover?: (rating: number) => void;
    size?: string;
    categoryId?: string;
  }) => {
    const [localHover, setLocalHover] = useState(0);

    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onStarClick(star, categoryId)}
            onMouseEnter={() => {
              setLocalHover(star);
              onStarHover?.(star);
            }}
            onMouseLeave={() => {
              setLocalHover(0);
              onStarHover?.(0);
            }}
            className="transition-colors duration-200 hover:scale-110 transform"
            disabled={submitted}
          >
            <Star
              className={`${size} transition-all duration-200 ${
                star <= (localHover || rating)
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-gray-300 hover:text-yellow-300"
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading trip details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Trip Not Found
            </h2>
            <p className="text-gray-600 mb-6">
              The trip you're trying to rate doesn't exist.
            </p>
            <Button onClick={() => navigate("/booking-history")}>
              Go Back to History
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md mx-auto">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <CheckCircle2 className="w-16 h-16 text-success mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Thank You!
              </h2>
              <p className="text-gray-600 mb-6">
                Your feedback has been submitted successfully. We appreciate
                your time and will use your feedback to improve our services.
              </p>
              <div className="space-y-3">
                <Button
                  onClick={() => navigate("/booking-history")}
                  className="w-full"
                >
                  Back to Booking History
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/dashboard")}
                  className="w-full"
                >
                  Back to Home
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-50">
      <Navbar />

      {/* Header Section */}
      <div
        className="pt-40 pb-32 bg-cover bg-center bg-no-repeat relative"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-pink-50 via-pink-50/60 via-pink-50/30 to-transparent pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <Button
            variant="outline"
            onClick={() => navigate("/booking-history")}
            className="mb-6 bg-white/80 hover:bg-white border-white/50 opacity-0 animate-[fadeInDown_0.7s_ease-out_0.1s_forwards]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to History
          </Button>

          <h1 className="text-5xl font-bold text-foreground/80 mb-3 opacity-0 animate-[fadeInDown_0.7s_ease-out_0.2s_forwards]">
            Rate Your Trip
          </h1>
          <p className="text-xl text-foreground/60 opacity-0 animate-[fadeInDown_0.7s_ease-out_0.4s_forwards]">
            Help us improve our service with your feedback
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 pb-8 -mt-16 relative z-10">
        {/* Trip Summary */}
        <div className="opacity-0 animate-[fadeInUp_0.8s_ease-out_0.3s_forwards]">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Trip Summary
            </h3>

            <div className="flex items-center justify-between mb-4">
              <div className="w-40 flex-shrink-0">
                <div className="text-xl font-bold text-gray-900">
                  {booking.from}
                </div>
                <div className="text-base font-semibold text-gray-900 mt-1">
                  {booking.departureTime}
                </div>
              </div>

              <div className="flex-1 px-8 text-center">
                <div className="flex items-center justify-center gap-3 mb-1">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <div className="h-0.5 w-full border-t-2 border-dashed border-gray-300"></div>
                  <MapPin className="w-4 h-4 text-gray-400" />
                </div>
                <div className="text-sm text-gray-500 flex items-center justify-center gap-1">
                  <Clock className="w-3 h-3" />
                  {booking.duration}
                </div>
              </div>

              <div className="text-right w-40 flex-shrink-0">
                <div className="text-xl font-bold text-gray-900">
                  {booking.to}
                </div>
                <div className="text-base font-semibold text-gray-900 mt-1">
                  {booking.arrivalTime}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200 text-sm">
              <div>
                <span className="text-gray-600">Booking Code:</span>
                <div className="font-semibold text-gray-900">
                  {booking.bookingCode}
                </div>
              </div>
              <div>
                <span className="text-gray-600">Travel Date:</span>
                <div className="font-semibold text-gray-900 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(booking.date)}
                </div>
              </div>
              <div>
                <span className="text-gray-600">Bus Type:</span>
                <div className="font-semibold text-gray-900">
                  {booking.busType}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Overall Rating */}
        <div className="opacity-0 animate-[fadeInUp_0.8s_ease-out_0.4s_forwards]">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Overall Experience
            </h3>
            <p className="text-gray-600 mb-6">
              How would you rate your overall experience with this trip?
            </p>

            <div className="flex flex-col items-center">
              <StarRating
                rating={overallRating}
                onStarClick={handleStarClick}
                onStarHover={(rating) => handleStarHover(rating, true)}
                size="w-10 h-10"
              />
              <p className="text-sm text-gray-500 mt-3">
                {overallRating === 0 && "Click to rate"}
                {overallRating === 1 && "Poor"}
                {overallRating === 2 && "Fair"}
                {overallRating === 3 && "Good"}
                {overallRating === 4 && "Very Good"}
                {overallRating === 5 && "Excellent"}
              </p>
            </div>
          </div>
        </div>

        {/* Category Ratings */}
        <div className="opacity-0 animate-[fadeInUp_0.8s_ease-out_0.5s_forwards]">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              Rate Specific Aspects
            </h3>

            <div className="space-y-6">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between"
                >
                  <span className="text-gray-700 font-medium min-w-0 flex-1 mr-6">
                    {category.label}
                  </span>
                  <StarRating
                    rating={category.rating}
                    onStarClick={handleStarClick}
                    categoryId={category.id}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Written Feedback */}
        <div className="opacity-0 animate-[fadeInUp_0.8s_ease-out_0.6s_forwards]">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Additional Feedback
            </h3>
            <p className="text-gray-600 mb-4">
              Tell us more about your experience. What did we do well? What
              could we improve?
            </p>

            <Textarea
              placeholder="Share your experience, suggestions, or any issues you encountered..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="min-h-32 resize-none"
              disabled={submitting}
            />

            <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
              <span>Optional but appreciated</span>
              <span>{feedback.length}/500</span>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="opacity-0 animate-[fadeInUp_0.8s_ease-out_0.7s_forwards]">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={handleSubmit}
              disabled={overallRating === 0 || submitting}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-2xl font-semibold flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit Feedback
                </>
              )}
            </Button>

            <Button
              onClick={() => navigate("/booking-history")}
              variant="outline"
              className="flex-1 py-3 rounded-2xl font-semibold"
              disabled={submitting}
            >
              Skip for Now
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
