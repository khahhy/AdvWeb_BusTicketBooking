import { XCircle, Star, MapPin, Calendar, Quote } from "lucide-react";
import { Review } from "@/admin/customerCare/ReviewManagement";
import { formatDate } from "@/utils/formatDate";

interface ReviewDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  review: Review | null;
}

const ReviewDetailModal = ({
  isOpen,
  onClose,
  review,
}: ReviewDetailModalProps) => {
  if (!isOpen || !review) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white">Review Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full p-1"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-6 border-r md:pr-6 border-gray-100 dark:border-gray-700">
            <div>
              <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
                Customer
              </h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                  {review.userName.charAt(0)}
                </div>
                <div>
                  <div className="font-medium text-sm text-gray-900 dark:text-white">{review.userName}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Verified Passenger
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
                Trip Context
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-400 dark:text-gray-500 mt-0.5" />
                  <span className="font-medium text-gray-900 dark:text-white">{review.routeName}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(review.tripDate)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      star <= review.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-200 dark:text-gray-600"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {formatDate(review.createdAt)}
              </span>
            </div>

            <div className="relative bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
              <Quote className="absolute top-4 left-4 w-8 h-8 text-gray-200 dark:text-gray-600 -z-0" />
              <p className="text-gray-700 dark:text-gray-300 italic relative z-10 leading-relaxed">
                "{review.comment}"
              </p>
            </div>

            <div className="pt-4 border-t dark:border-gray-700">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Admin Reply (Simulation)
              </label>
              <textarea
                className="w-full border dark:border-gray-600 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                rows={3}
                placeholder="Type a response to the customer..."
              ></textarea>
              <div className="mt-2 flex justify-end">
                <button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  Send Reply
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewDetailModal;
