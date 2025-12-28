import { Eye, Star, Trash2, EyeOff, FileText, CheckCircle } from "lucide-react";
import { Review } from "@/admin/customerCare/ReviewManagement";
import { formatDate } from "@/utils/formatDate";

interface ReviewTableProps {
  reviews: Review[];
  onViewDetail: (review: Review) => void;
  onToggleVisibility: (review: Review) => void;
  onApprove: (review: Review) => void;
  onDelete: (review: Review) => void;
}

const ReviewTable = ({
  reviews,
  onViewDetail,
  onToggleVisibility,
  onApprove,
  onDelete,
}: ReviewTableProps) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-medium border-b dark:border-gray-600">
            <tr>
              <th className="px-6 py-3">Passenger</th>
              <th className="px-6 py-3">Rating</th>
              <th className="px-6 py-3 w-1/3">Comment</th>
              <th className="px-6 py-3">Trip Info</th>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-gray-700">
            {reviews.map((review) => (
              <tr
                key={review.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
              >
                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                  {review.userName}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-0.5">
                    <span className="font-bold mr-2 text-gray-700 dark:text-gray-300">
                      {review.rating}
                    </span>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3 h-3 ${
                          star <= review.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-200 dark:text-gray-600"
                        }`}
                      />
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p
                    className="truncate max-w-xs text-gray-600 dark:text-gray-400"
                    title={review.comment}
                  >
                    {review.comment?.trim() ? `"${review.comment}"` : "—"}
                  </p>
                </td>
                <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                  <div className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    {review.routeName}
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-400 dark:text-gray-400 text-xs whitespace-nowrap">
                  {formatDate(review.createdAt)}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      review.status === "visible"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200"
                        : review.status === "hidden"
                          ? "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200"
                    }`}
                  >
                    {review.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onViewDetail(review)}
                      className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/50 rounded-full"
                      title="View Detail"
                    >
                      <FileText className="w-4 h-4" />
                    </button>
                    {review.status === "flagged" && (
                      <button
                        onClick={() => onApprove(review)}
                        className="p-2 text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/50 rounded-full"
                        title="Approve Review"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => onToggleVisibility(review)}
                      className="p-2 text-gray-500 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/50 rounded-full"
                      title={
                        review.status === "hidden"
                          ? "Show Review"
                          : "Hide Review (Moderation)"
                      }
                    >
                      {review.status === "hidden" ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => onDelete(review)}
                      className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-full"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {reviews.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="text-center py-12 text-gray-500 dark:text-gray-400"
                >
                  No reviews found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReviewTable;
