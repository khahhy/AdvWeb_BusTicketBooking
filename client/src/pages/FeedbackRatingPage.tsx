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
import { toast } from "sonner";

interface BookingData {
  id: string;
  ticketCode: string;
  from: string;
  to: string;
  date: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  busNumber: string;
  busType: string;
}

type ReviewStatus = "visible" | "hidden" | "flagged";

const formatDuration = (start: Date, end: Date) => {
  const diffMs = end.getTime() - start.getTime();
  if (!Number.isFinite(diffMs) || diffMs <= 0) return "—";

  const totalMinutes = Math.round(diffMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours <= 0) {
    return `${minutes}m`;
  }

  return `${hours}h ${minutes}m`;
};

export default function FeedbackRatingPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [booking, setBooking] = useState<BookingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [overallRating, setOverallRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isViewOnly, setIsViewOnly] = useState(false);
  const [reviewStatus, setReviewStatus] = useState<ReviewStatus | null>(null);
  const [reviewReason, setReviewReason] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    setBooking(null);
    setLoading(true);
    setError(null);
    setOverallRating(0);
    setFeedback("");
    setSubmitted(false);
    setIsViewOnly(false);
    setReviewStatus(null);
    setReviewReason(null);

    const fetchBooking = async () => {
      if (!id) return;
      try {
        const token = localStorage.getItem("accessToken");
        const response = await fetch(`http://localhost:3000/bookings/${id}`, {
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : undefined,
        });

        if (!response.ok) {
          throw new Error("Failed to load booking");
        }

        const result = await response.json();
        const data = result.data;

        if (!data) {
          throw new Error("Booking not found");
        }

        const startTime = data.trip?.startTime;
        const arrivalTimeValue =
          data.dropoffStop?.arrivalTime || data.trip?.endTime;
        const tripStart = startTime ? dayjs(startTime) : null;
        const tripEnd = arrivalTimeValue ? dayjs(arrivalTimeValue) : null;
        const startDate = startTime ? new Date(startTime) : null;
        const endDate = arrivalTimeValue ? new Date(arrivalTimeValue) : null;

        setBooking({
          id: data.id,
          ticketCode: data.ticketCode || data.id,
          from:
            data.pickupStop?.location?.city ??
            data.pickupStop?.location?.name ??
            "Unknown",
          to:
            data.dropoffStop?.location?.city ??
            data.dropoffStop?.location?.name ??
            "Unknown",
          date: startTime ?? "",
          departureTime: tripStart ? tripStart.format("HH:mm") : "--:--",
          arrivalTime: tripEnd ? tripEnd.format("HH:mm") : "—",
          duration:
            startDate && endDate ? formatDuration(startDate, endDate) : "—",
          busNumber: data.trip?.bus?.plate ?? "—",
          busType: data.trip?.bus?.busType ?? "—",
        });
      } catch (err) {
        console.error("Error fetching booking for feedback", err);
        setError(err instanceof Error ? err.message : "Unable to load booking");
        toast.error("Unable to load booking for feedback");
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [id]);

  useEffect(() => {
    const fetchExistingReview = async () => {
      if (!id) return;
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      try {
        const response = await fetch(
          `http://localhost:3000/reviews/booking/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (response.status === 404) {
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to load existing review");
        }

        const result = await response.json();
        const review = result.data;

        if (review) {
          setOverallRating(review.rating ?? 0);
          setFeedback(review.comment ?? "");
          setReviewStatus(review.status ?? "visible");
          setReviewReason(review.flaggedReason ?? null);
          setIsViewOnly(true);
        }
      } catch (err) {
        console.error("Error fetching existing review", err);
      }
    };

    fetchExistingReview();
  }, [id]);

  const formatDate = (dateStr: string) => {
    return dateStr ? dayjs(dateStr).format("DD/MM/YYYY") : "N/A";
  };

  const handleStarClick = (rating: number) => {
    if (isViewOnly) return;
    setOverallRating(rating);
  };

  const handleStarHover = (rating: number, isOverall: boolean = false) => {
    if (isOverall) {
      console.log(hoverRating); // temporary to fix eslint
      setHoverRating(rating);
    }
  };

  const handleSubmit = async () => {
    if (isViewOnly) {
      if (reviewStatus === "hidden") {
        toast.info("Your feedback is hidden by admin moderation");
      } else if (reviewStatus === "flagged") {
        toast.info("Your feedback is pending admin approval");
      } else {
        toast.info("Feedback has already been submitted for this trip");
      }
      return;
    }

    if (overallRating === 0) {
      toast.error("Please provide an overall rating");
      return;
    }

    if (!booking) {
      toast.error("Booking details are not available");
      return;
    }

    const token = localStorage.getItem("accessToken");
    if (!token) {
      toast.error("Please login to submit feedback");
      navigate("/login");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("http://localhost:3000/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookingId: booking.id,
          rating: overallRating,
          comment: feedback.trim() || undefined,
        }),
      });

      if (response.status === 409) {
        toast.error("You already submitted feedback for this booking");
        setSubmitted(true);
        return;
      }

      if (response.status === 401) {
        toast.error("Session expired. Please login again.");
        navigate("/login");
        return;
      }

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => null);
        const message = errorPayload?.message || "Failed to submit feedback";
        throw new Error(message);
      }

      toast.success("Feedback submitted successfully");
      setSubmitted(true);

      setTimeout(() => {
        navigate("/booking-history");
      }, 3000);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Unable to submit feedback",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const moderationBannerClass =
    reviewStatus === "hidden"
      ? "bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-2xl px-4 py-3 mb-6 text-sm text-rose-800 dark:text-rose-200"
      : "bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-2xl px-4 py-3 mb-6 text-sm text-amber-800 dark:text-amber-200";
  const infoBannerClass =
    "bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-900 rounded-2xl px-4 py-3 mb-6 text-sm text-sky-800 dark:text-sky-200";

  const StarRating = ({
    rating,
    onStarClick,
    onStarHover,
    size = "w-6 h-6",
  }: {
    rating: number;
    onStarClick: (rating: number) => void;
    onStarHover?: (rating: number) => void;
    size?: string;
  }) => {
    const [localHover, setLocalHover] = useState(0);

    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onStarClick(star)}
            onMouseEnter={() => {
              setLocalHover(star);
              onStarHover?.(star);
            }}
            onMouseLeave={() => {
              setLocalHover(0);
              onStarHover?.(0);
            }}
            className="transition-colors duration-200 hover:scale-110 transform"
            disabled={submitted || isViewOnly}
          >
            <Star
              className={`${size} transition-all duration-200 ${
                star <= (localHover || rating)
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-gray-300 hover:text-yellow-300 dark:text-gray-600 dark:hover:text-yellow-300"
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-50 dark:bg-black dark:bg-none">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary dark:border-white mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">
              Loading trip details...
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
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {error ? "Unable to load booking" : "Trip Not Found"}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {error
                ? "We couldn't retrieve your booking details. Please try again from your booking history."
                : "The trip you're trying to rate doesn't exist."}
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
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-50 dark:bg-black dark:bg-none">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md mx-auto">
            <div className="bg-white dark:bg-black rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
              <CheckCircle2 className="w-16 h-16 text-success mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Thank You!
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-50 dark:bg-black dark:bg-none">
      <Navbar />

      {/* Header Section */}
      <div className="pt-40 pb-32 relative">
        {/* Background Image - only in light mode */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat dark:hidden"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />

        {/* Dark mode background */}
        <div className="absolute inset-0 bg-black hidden dark:block" />

        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-pink-50 to-transparent dark:from-black dark:to-transparent pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <Button
            variant="outline"
            onClick={() => navigate("/booking-history")}
            className="mb-6 bg-white/80 hover:bg-white border-white/50 opacity-0 animate-[fadeInDown_0.7s_ease-out_0.1s_forwards]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to History
          </Button>

          <h1 className="text-5xl font-bold text-foreground/80 dark:text-white mb-3 opacity-0 animate-[fadeInDown_0.7s_ease-out_0.2s_forwards]">
            Rate Your Trip
          </h1>
          <p className="text-xl text-foreground/60 dark:text-gray-300 opacity-0 animate-[fadeInDown_0.7s_ease-out_0.4s_forwards]">
            Help us improve our service with your feedback
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 pb-8 -mt-16 relative z-10">
        {/* Trip Summary */}
        <div className="opacity-0 animate-[fadeInUp_0.8s_ease-out_0.3s_forwards]">
          <div className="bg-white dark:bg-black rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Trip Summary
            </h3>

            <div className="flex items-center justify-between mb-4">
              <div className="w-40 flex-shrink-0">
                <div className="text-xl font-bold text-gray-900 dark:text-white">
                  {booking.from}
                </div>
                <div className="text-base font-semibold text-gray-900 dark:text-gray-300 mt-1">
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
                <div className="text-xl font-bold text-gray-900 dark:text-white">
                  {booking.to}
                </div>
                <div className="text-base font-semibold text-gray-900 dark:text-gray-300 mt-1">
                  {booking.arrivalTime}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">
                  Booking Code:
                </span>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {booking.ticketCode}
                </div>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">
                  Travel Date:
                </span>
                <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(booking.date)}
                </div>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">
                  Bus Type:
                </span>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {booking.busType}
                </div>
              </div>
            </div>
          </div>
        </div>

        {isViewOnly && reviewStatus !== "visible" && (
          <div className="opacity-0 animate-[fadeInUp_0.8s_ease-out_0.35s_forwards]">
            <div className={moderationBannerClass}>
              {reviewStatus === "hidden"
                ? "Your feedback has been hidden by an administrator."
                : "Your feedback is pending moderation approval."}
              {reviewReason ? ` Reason: ${reviewReason}` : ""}
            </div>
          </div>
        )}

        {isViewOnly && reviewStatus === "visible" && (
          <div className="opacity-0 animate-[fadeInUp_0.8s_ease-out_0.35s_forwards]">
            <div className={infoBannerClass}>
              You already submitted feedback for this trip. You can view it
              below.
            </div>
          </div>
        )}

        {/* Overall Rating */}
        <div className="opacity-0 animate-[fadeInUp_0.8s_ease-out_0.4s_forwards]">
          <div className="bg-white dark:bg-black rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Overall Experience
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              How would you rate your overall experience with this trip?
            </p>

            <div className="flex flex-col items-center">
              <StarRating
                rating={overallRating}
                onStarClick={handleStarClick}
                onStarHover={(rating) => handleStarHover(rating, true)}
                size="w-10 h-10"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
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

        {/* Written Feedback */}
        <div className="opacity-0 animate-[fadeInUp_0.8s_ease-out_0.6s_forwards]">
          <div className="bg-white dark:bg-black rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Additional Feedback
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Tell us more about your experience. What did we do well? What
              could we improve?
            </p>

            <Textarea
              placeholder="Share your experience, suggestions, or any issues you encountered..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="min-h-32 resize-none"
              maxLength={500}
              disabled={submitting || isViewOnly}
            />

            <div className="flex items-center justify-between mt-4 text-sm text-gray-500 dark:text-gray-400">
              <span>Optional but appreciated</span>
              <span>{feedback.length}/500</span>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="opacity-0 animate-[fadeInUp_0.8s_ease-out_0.7s_forwards]">
          {isViewOnly ? (
            <div className="flex justify-end">
              <Button
                onClick={() => navigate("/booking-history")}
                variant="outline"
                className="py-3 rounded-2xl font-semibold"
              >
                Back to Booking History
              </Button>
            </div>
          ) : (
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
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
