import { CheckCircle, Clock, XCircle, Activity } from "lucide-react";
import { NotificationStats as NotificationStatsType } from "@/store/api/notificationApi";

interface NotificationStatsProps {
  stats?: NotificationStatsType;
}

const NotificationStats = ({ stats }: NotificationStatsProps) => {
  const { total, sent, failed, pending } = stats || {
    total: 0,
    sent: 0,
    failed: 0,
    pending: 0,
  };

  const successRate = total > 0 ? Math.round((sent / total) * 100) : 0;

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border dark:border-gray-700 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Delivery Rate
          </p>
          <h3
            className={`text-2xl font-bold mt-1 ${
              successRate >= 95
                ? "text-green-600 dark:text-green-400"
                : "text-yellow-600 dark:text-yellow-400"
            }`}
          >
            {successRate}%
          </h3>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {sent} / {total} Delivered
          </span>
        </div>
        <div
          className={`h-10 w-10 rounded-full flex items-center justify-center ${
            successRate >= 95
              ? "bg-green-50 dark:bg-green-900/30"
              : "bg-yellow-50 dark:bg-yellow-900/30"
          }`}
        >
          <Activity
            className={`w-5 h-5 ${
              successRate >= 95
                ? "text-green-600 dark:text-green-400"
                : "text-yellow-600 dark:text-yellow-400"
            }`}
          />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border dark:border-gray-700 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Sent Successfully
          </p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {sent}
          </h3>
        </div>
        <div className="h-10 w-10 bg-green-50 dark:bg-green-900/30 rounded-full flex items-center justify-center">
          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border dark:border-gray-700 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Pending
          </p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {pending}
          </h3>
        </div>
        <div className="h-10 w-10 bg-yellow-50 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
          <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border dark:border-gray-700 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Failed
          </p>
          <h3
            className={`text-2xl font-bold mt-1 ${
              failed > 0
                ? "text-red-600 dark:text-red-400"
                : "text-gray-900 dark:text-white"
            }`}
          >
            {failed}
          </h3>
        </div>
        <div className="h-10 w-10 bg-red-50 dark:bg-red-900/30 rounded-full flex items-center justify-center">
          <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
        </div>
      </div>
    </div>
  );
};

export default NotificationStats;
