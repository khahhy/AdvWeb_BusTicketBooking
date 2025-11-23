import { Star, MessageSquare, AlertTriangle } from "lucide-react";

interface ReviewStatsProps {
  reviews: any[];
}

const ReviewStats = ({ reviews }: ReviewStatsProps) => {
  const totalReviews = reviews.length;
  const averageRating =
    totalReviews > 0
      ? (
          reviews.reduce((acc, cur) => acc + cur.rating, 0) / totalReviews
        ).toFixed(1)
      : "0.0";

  const starCounts = reviews.reduce(
    (acc, cur) => {
      acc[cur.rating] = (acc[cur.rating] || 0) + 1;
      return acc;
    },
    {} as Record<number, number>,
  );

  const lowRatingCount = (starCounts[1] || 0) + (starCounts[2] || 0);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="bg-white p-6 rounded-xl border shadow-sm flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">Average Rating</p>
          <div className="flex items-end gap-2 mt-2">
            <h3 className="text-3xl font-bold text-gray-900">
              {averageRating}
            </h3>
            <span className="text-sm text-gray-500 mb-1">/ 5.0</span>
          </div>
          <div className="flex gap-1 mt-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  star <= Math.round(Number(averageRating))
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>
        </div>
        <div className="h-12 w-12 bg-yellow-50 rounded-full flex items-center justify-center">
          <Star className="w-6 h-6 text-yellow-500" />
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border shadow-sm flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Reviews</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">
              {totalReviews}
            </h3>
          </div>
          <div className="h-10 w-10 bg-blue-50 rounded-full flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-blue-500" />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 text-sm">
          <AlertTriangle className="w-4 h-4 text-red-500" />
          <span className="font-medium text-red-600">
            {lowRatingCount} Negative Reviews
          </span>
          <span className="text-gray-400">(1-2 stars) needs attention</span>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <p className="text-sm font-medium text-gray-500 mb-3">
          Star Distribution
        </p>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = starCounts[star] || 0;
            const percent = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-3 text-xs">
                <span className="w-3 font-medium">{star}</span>
                <Star className="w-3 h-3 text-gray-400" />
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      star >= 4
                        ? "bg-green-500"
                        : star === 3
                          ? "bg-yellow-400"
                          : "bg-red-500"
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <span className="w-6 text-right text-gray-500">{count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ReviewStats;
