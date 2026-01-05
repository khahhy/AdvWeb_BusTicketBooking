import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTripStatusPolling } from "@/hooks/useTripStatusPolling";
import { TripStatus } from "@/store/type/tripsType";
import { Clock, CheckCircle, PlayCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

interface LiveTripStatusProps {
  tripId: string;
  showPollingIndicator?: boolean;
}

const statusConfig = {
  [TripStatus.Scheduled]: {
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    icon: Clock,
    label: "Scheduled",
  },
  [TripStatus.Ongoing]: {
    color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    icon: PlayCircle,
    label: "Ongoing",
  },
  [TripStatus.Completed]: {
    color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
    icon: CheckCircle,
    label: "Completed",
  },
  [TripStatus.Cancelled]: {
    color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    icon: XCircle,
    label: "Cancelled",
  },
  [TripStatus.Delayed]: {
    color:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    icon: Clock,
    label: "Delayed",
  },
};

export const LiveTripStatus = ({
  tripId,
  showPollingIndicator = true,
}: LiveTripStatusProps) => {
  const { status, tripData, isLoading } = useTripStatusPolling({
    tripId,
    pollingInterval: 30000, // Poll every 30 seconds
    enabled: true,
    onStatusChange: (newStatus, oldStatus) => {
      // Show notification when status changes
      toast.info(`Trip status changed from ${oldStatus} to ${newStatus}`);
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2" />
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!status || !tripData) {
    return null;
  }

  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <span>Live Trip Status</span>
          {showPollingIndicator && (
            <span className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              Auto-updating
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <StatusIcon className="w-5 h-5" />
            <Badge className={config.color}>{config.label}</Badge>
          </div>

          <div className="text-sm text-muted-foreground space-y-1">
            <div>Start: {new Date(tripData.startTime).toLocaleString()}</div>
            <div>End: {new Date(tripData.endTime).toLocaleString()}</div>
            <div className="text-xs">
              Last updated: {new Date(tripData.updatedAt).toLocaleString()}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
