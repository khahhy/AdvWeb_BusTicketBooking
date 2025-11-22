import { Mail, MessageSquare, XCircle, Activity } from "lucide-react";

interface NotificationStatsProps {
  logs: any[];
}

const NotificationStats = ({ logs }: NotificationStatsProps) => {
  const total = logs.length;

  const stats = logs.reduce(
    (acc, curr) => {
      if (curr.status === "sent") acc.sent++;
      if (curr.status === "failed") acc.failed++;
      if (curr.type === "email") acc.email++;
      if (curr.type === "sms") acc.sms++;
      return acc;
    },
    { sent: 0, failed: 0, email: 0, sms: 0 },
  );

  const successRate = total > 0 ? Math.round((stats.sent / total) * 100) : 0;

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <div className="bg-white p-6 rounded-xl border shadow-sm flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">Delivery Rate</p>
          <h3
            className={`text-2xl font-bold mt-1 ${
              successRate >= 95 ? "text-green-600" : "text-yellow-600"
            }`}
          >
            {successRate}%
          </h3>
          <span className="text-xs text-gray-400">Success / Attempts</span>
        </div>
        <div
          className={`h-10 w-10 rounded-full flex items-center justify-center ${
            successRate >= 95 ? "bg-green-50" : "bg-yellow-50"
          }`}
        >
          <Activity
            className={`w-5 h-5 ${
              successRate >= 95 ? "text-green-600" : "text-yellow-600"
            }`}
          />
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border shadow-sm flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">Emails Sent</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">
            {stats.email}
          </h3>
        </div>
        <div className="h-10 w-10 bg-blue-50 rounded-full flex items-center justify-center">
          <Mail className="w-5 h-5 text-blue-600" />
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border shadow-sm flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">SMS Sent</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.sms}</h3>
        </div>
        <div className="h-10 w-10 bg-purple-50 rounded-full flex items-center justify-center">
          <MessageSquare className="w-5 h-5 text-purple-600" />
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border shadow-sm flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">Failed</p>
          <h3
            className={`text-2xl font-bold mt-1 ${
              stats.failed > 0 ? "text-red-600" : "text-gray-900"
            }`}
          >
            {stats.failed}
          </h3>
          <span className="text-xs text-gray-400">Need attention</span>
        </div>
        <div className="h-10 w-10 bg-red-50 rounded-full flex items-center justify-center">
          <XCircle className="w-5 h-5 text-red-600" />
        </div>
      </div>
    </div>
  );
};

export default NotificationStats;
