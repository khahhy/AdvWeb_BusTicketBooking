import {
  Activity,
  Server,
  Database,
  Cpu,
  Clock,
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { useGetSystemHealthQuery } from "@/store/api/healthApi";

const formatUptime = (seconds: number) => {
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  const parts = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  parts.push(`${s}s`);
  return parts.join(" ");
};

const StatusBadge = ({ status }: { status: string }) => {
  const isOk = status === "ok" || status === "connected";
  const isError = status === "error" || status === "disconnected";

  if (isOk) {
    return (
      <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs font-medium border border-green-200">
        <CheckCircle2 className="w-3 h-3" /> Good
      </span>
    );
  }
  if (isError) {
    return (
      <span className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-full text-xs font-medium border border-red-200">
        <XCircle className="w-3 h-3" /> Error
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full text-xs font-medium border border-yellow-200">
      <AlertCircle className="w-3 h-3" /> Unknown
    </span>
  );
};

const ProgressBar = ({
  value,
  colorClass = "bg-blue-600",
}: {
  value: number;
  colorClass?: string;
}) => (
  <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 overflow-hidden">
    <div
      className={`h-2.5 rounded-full transition-all duration-500 ease-out ${colorClass}`}
      style={{ width: `${Math.min(value, 100)}%` }}
    ></div>
  </div>
);

const SystemHealth = () => {
  const { data, isLoading, isFetching, refetch } = useGetSystemHealthQuery(
    undefined,
    { pollingInterval: 3000 },
  );

  if (isLoading && !data) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-2 text-gray-500">
          <RotateCcw className="w-8 h-8 animate-spin" />
          <p>Analyzing system vitals...</p>
        </div>
      </div>
    );
  }

  const health = data || {
    status: "error",
    timestamp: new Date().toISOString(),
    database: { status: "disconnected" },
    system: {
      uptime: 0,
      os: "Unknown",
      memory: { used: 0, free: 0, total: 100, percent: 0, heap: 0 },
      cpu: { load: 0, cores: 1 },
    },
  };

  return (
    <div className="p-6 max-w-6xl mx-auto min-h-screen font-sans text-gray-900 dark:text-white space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="w-6 h-6 text-blue-600" /> System Health Monitor
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Real-time server performance metrics. Last updated:{" "}
            {new Date(health.timestamp).toLocaleTimeString()}
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-4 py-2 rounded-lg flex items-center gap-2 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors"
        >
          <RotateCcw
            className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* API Status */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border dark:border-gray-700 shadow-sm space-y-3">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg dark:bg-blue-900/20 dark:text-blue-400">
              <Server className="w-5 h-5" />
            </div>
            <StatusBadge status={health.status} />
          </div>
          <div>
            <div className="text-2xl font-bold uppercase">{health.status}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              API Server Status
            </div>
          </div>
        </div>

        {/* Database Status */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border dark:border-gray-700 shadow-sm space-y-3">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg dark:bg-purple-900/20 dark:text-purple-400">
              <Database className="w-5 h-5" />
            </div>
            <StatusBadge status={health.database.status} />
          </div>
          <div>
            <div className="text-2xl font-bold capitalize">
              {health.database.status}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              PostgreSQL Connection
            </div>
          </div>
        </div>

        {/* Uptime */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border dark:border-gray-700 shadow-sm space-y-3">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg dark:bg-orange-900/20 dark:text-orange-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-xl font-bold truncate">
              {formatUptime(health.system.uptime)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Continuous Uptime
            </div>
          </div>
        </div>

        {/* OS Info */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border dark:border-gray-700 shadow-sm space-y-3">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-gray-100 text-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-300">
              <Server className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded-full dark:bg-gray-700">
              {health.system.cpu.cores} Cores
            </span>
          </div>
          <div>
            <div
              className="text-sm font-bold line-clamp-2 min-h-[2rem]"
              title={health.system.os}
            >
              {health.system.os}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Operating System
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Memory Usage */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-500" /> Memory Usage
            </h3>
            <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {health.system.memory.percent}%
            </span>
          </div>

          <div className="space-y-4">
            {/* System RAM */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-300">
                  System RAM
                </span>
                <span className="font-medium">
                  {health.system.memory.used} / {health.system.memory.total} MB
                </span>
              </div>
              <ProgressBar
                value={health.system.memory.percent}
                colorClass={
                  health.system.memory.percent > 90
                    ? "bg-red-500"
                    : health.system.memory.percent > 75
                      ? "bg-yellow-500"
                      : "bg-indigo-500"
                }
              />
            </div>

            {/* Application Heap */}
            <div className="space-y-2 pt-2 border-t dark:border-gray-700">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-300">
                  Node.js App Heap
                </span>
                <span className="font-medium">
                  {health.system.memory.heap} MB
                </span>
              </div>
              <ProgressBar
                value={(health.system.memory.heap / 512) * 100}
                colorClass="bg-emerald-500"
              />
              <p className="text-xs text-gray-400 text-right">
                * App memory footprint
              </p>
            </div>
          </div>
        </div>

        {/* CPU Load */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Cpu className="w-5 h-5 text-pink-500" /> CPU Load
            </h3>
            <span className="text-2xl font-bold text-pink-600 dark:text-pink-400">
              {health.system.cpu.load.toFixed(2)}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-300">
                1 Min Load Average
              </span>
              <span className="font-medium">
                {health.system.cpu.load.toFixed(2)} / {health.system.cpu.cores}{" "}
                Cores
              </span>
            </div>
            {/* Visualizing load vs cores */}
            <ProgressBar
              value={(health.system.cpu.load / health.system.cpu.cores) * 100}
              colorClass="bg-pink-500"
            />
          </div>

          <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg text-sm text-gray-500 space-y-2">
            <p>
              <span className="font-semibold text-gray-700 dark:text-gray-300">
                Performance Note:
              </span>{" "}
              If CPU Load Average consistently exceeds the number of cores (
              {health.system.cpu.cores}), the server may be experiencing
              bottlenecks.
            </p>
            {health.system.os.includes("Windows") && (
              <p className="text-xs italic text-orange-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Note: Node.js loadavg() returns 0 on Windows.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemHealth;
