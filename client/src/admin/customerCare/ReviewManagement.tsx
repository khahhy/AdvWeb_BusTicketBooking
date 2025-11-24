import { useState, useMemo } from "react";
import { Search, Filter } from "lucide-react";
import {
  ReviewDetailModal,
  ReviewStats,
  ReviewTable,
} from "@/components/admin";

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
  status: "visible" | "hidden";
}

const MOCK_REVIEWS: Review[] = [
  {
    id: "r1",
    bookingId: "b1",
    userId: "u1",
    userName: "Nguyen Van An",
    routeName: "Saigon - Da Lat",
    tripDate: "2025-11-15T08:00:00Z",
    rating: 5,
    comment: "Xe mới, sạch sẽ, bác tài chạy êm. Rất hài lòng!",
    createdAt: "2025-11-16T10:00:00Z",
    status: "visible",
  },
  {
    id: "r2",
    bookingId: "b2",
    userId: "u2",
    userName: "Tran Thi Bich",
    routeName: "Da Nang - Saigon",
    tripDate: "2025-11-14T20:00:00Z",
    rating: 2,
    comment: "Xe đến trễ 30 phút mà không báo trước. Wifi hỏng.",
    createdAt: "2025-11-15T09:30:00Z",
    status: "visible",
  },
  {
    id: "r3",
    bookingId: "b3",
    userId: "u3",
    userName: "Le Hoang Nam",
    routeName: "Nha Trang - Saigon",
    tripDate: "2025-11-10T14:00:00Z",
    rating: 4,
    comment: "Dịch vụ tốt nhưng máy lạnh hơi lạnh quá.",
    createdAt: "2025-11-11T16:20:00Z",
    status: "visible",
  },
  {
    id: "r4",
    bookingId: "b4",
    userId: "u4",
    userName: "Pham Van D",
    routeName: "Saigon - Vung Tau",
    tripDate: "2025-11-18T07:00:00Z",
    rating: 1,
    comment: "Thái độ nhân viên lơ xe rất tệ.",
    createdAt: "2025-11-18T12:00:00Z",
    status: "visible",
  },
  {
    id: "r5",
    bookingId: "b5",
    userId: "u5",
    userName: "Hoang Thi E",
    routeName: "Saigon - Da Lat",
    tripDate: "2025-11-19T22:00:00Z",
    rating: 5,
    comment: "Tuyệt vời! Sẽ ủng hộ lần sau.",
    createdAt: "2025-11-20T08:00:00Z",
    status: "visible",
  },
];

const ReviewManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState<number | "all">("all");

  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const filteredReviews = useMemo(() => {
    return MOCK_REVIEWS.filter((review) => {
      const matchesSearch =
        review.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.routeName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRating =
        ratingFilter === "all" || review.rating === ratingFilter;

      return matchesSearch && matchesRating;
    });
  }, [searchTerm, ratingFilter]);

  return (
    <div className="p-6 space-y-6 min-h-screen font-sans text-gray-900 dark:text-white">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Customer Reviews</h1>
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

      <ReviewTable
        reviews={filteredReviews}
        onViewDetail={(r) => {
          setSelectedReview(r);
          setIsDetailOpen(true);
        }}
      />

      <ReviewDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        review={selectedReview}
      />
    </div>
  );
};

export default ReviewManagement;
