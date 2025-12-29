import { useEffect, useMemo, useState } from "react";
import { Search, Filter } from "lucide-react";
import {
  ReviewDetailModal,
  ReviewStats,
  ReviewTable,
} from "@/components/admin";
import { toast } from "sonner";

export interface Review {
  id: string;
  bookingId: string;
  userId: string;
  userName: string;
  routeName: string;
  tripDate: string;
  rating: number;
  comment: string;
  createdAt: string;
  status: "visible" | "hidden" | "flagged";
  flaggedReason?: string | null;
  moderatedAt?: string | null;
  moderatedBy?: string | null;
}
type ReviewStatusFilter = Review["status"] | "all";

const ReviewManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState<number | "all">("all");
  const [statusFilter, setStatusFilter] = useState<ReviewStatusFilter>("all");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const fetchReviews = async (showLoading: boolean = true) => {
    if (showLoading) {
      setIsLoading(true);
    }

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        toast.error("Please login to view reviews");
        return;
      }

      const response = await fetch("http://localhost:3000/reviews/admin", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch reviews");
      }

      const result = await response.json();
      setReviews(Array.isArray(result.data) ? result.data : []);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error("Unable to load reviews");
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const filteredReviews = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return reviews.filter((review) => {
      const comment = review.comment ?? "";
      const flaggedReason = review.flaggedReason ?? "";
      const matchesSearch =
        review.userName.toLowerCase().includes(normalizedSearch) ||
        comment.toLowerCase().includes(normalizedSearch) ||
        review.routeName.toLowerCase().includes(normalizedSearch) ||
        flaggedReason.toLowerCase().includes(normalizedSearch);

      const matchesRating =
        ratingFilter === "all" || review.rating === ratingFilter;
      const matchesStatus =
        statusFilter === "all" || review.status === statusFilter;

      return matchesSearch && matchesRating && matchesStatus;
    });
  }, [reviews, searchTerm, ratingFilter, statusFilter]);

  const handleModerateReview = async (
    reviewId: string,
    status: Review["status"],
  ) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        toast.error("Please login to continue");
        return;
      }

      const response = await fetch(
        `http://localhost:3000/reviews/${reviewId}/moderate`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to update review status");
      }

      toast.success("Review status updated");
      await fetchReviews(false);
    } catch (error) {
      console.error("Error moderating review:", error);
      toast.error("Unable to update review status");
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review?")) {
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        toast.error("Please login to continue");
        return;
      }

      const response = await fetch(
        `http://localhost:3000/reviews/${reviewId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to delete review");
      }

      toast.success("Review deleted");
      setReviews((prev) => prev.filter((review) => review.id !== reviewId));
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error("Unable to delete review");
    }
  };

  return (
    <div className="p-6 space-y-6 min-h-screen font-sans text-gray-900 dark:text-white">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Customer Reviews
        </h1>
      </div>

      <ReviewStats reviews={filteredReviews} />

      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search comments, names..."
            className="w-full pl-10 pr-4 py-2 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-auto">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              className="w-full md:w-40 pl-10 pr-8 py-2 border dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white dark:bg-gray-700 dark:text-white"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as ReviewStatusFilter)
              }
            >
              <option value="all">All Statuses</option>
              <option value="visible">Visible</option>
              <option value="flagged">Flagged</option>
              <option value="hidden">Hidden</option>
            </select>
          </div>
          <div className="relative w-full md:w-auto">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              className="w-full md:w-40 pl-10 pr-8 py-2 border dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white dark:bg-gray-700 dark:text-white"
              value={ratingFilter}
              onChange={(e) =>
                setRatingFilter(
                  e.target.value === "all" ? "all" : Number(e.target.value),
                )
              }
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars Only</option>
              <option value="4">4 Stars Only</option>
              <option value="3">3 Stars Only</option>
              <option value="2">2 Stars Only</option>
              <option value="1">1 Star Only</option>
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          Loading reviews...
        </div>
      ) : (
        <ReviewTable
          reviews={filteredReviews}
          onViewDetail={(r) => {
            setSelectedReview(r);
            setIsDetailOpen(true);
          }}
          onToggleVisibility={(review) => {
            const nextStatus =
              review.status === "hidden" ? "visible" : "hidden";
            handleModerateReview(review.id, nextStatus);
          }}
          onApprove={(review) => handleModerateReview(review.id, "visible")}
          onDelete={(review) => handleDeleteReview(review.id)}
        />
      )}

      <ReviewDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        review={selectedReview}
      />
    </div>
  );
};

export default ReviewManagement;
