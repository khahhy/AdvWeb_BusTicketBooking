import { useEffect, useState } from "react";
import { useGetTripStatusQuery } from "@/store/api/tripsApi";
import { TripStatus } from "@/store/type/tripsType";

interface UseTripStatusPollingOptions {
  tripId: string;
  pollingInterval?: number; // in milliseconds, default 30000 (30 seconds)
  enabled?: boolean; // enable/disable polling
  onStatusChange?: (newStatus: TripStatus, oldStatus: TripStatus) => void;
}

/**
 * Custom hook to poll trip status and get live updates
 * @param options - Configuration options
 * @returns Current trip status data and loading state
 */
export const useTripStatusPolling = ({
  tripId,
  pollingInterval = 30000,
  enabled = true,
  onStatusChange,
}: UseTripStatusPollingOptions) => {
  const [previousStatus, setPreviousStatus] = useState<TripStatus | null>(null);

  const { data, isLoading, error, refetch } = useGetTripStatusQuery(tripId, {
    skip: !enabled || !tripId,
    pollingInterval: enabled ? pollingInterval : 0,
    refetchOnMountOrArgChange: true,
  });

  // Detect status changes and trigger callback
  useEffect(() => {
    if (data?.status && previousStatus && data.status !== previousStatus) {
      onStatusChange?.(data.status, previousStatus);
    }
    if (data?.status) {
      setPreviousStatus(data.status);
    }
  }, [data?.status, previousStatus, onStatusChange]);

  return {
    status: data?.status,
    tripData: data,
    isLoading,
    error,
    refetch,
  };
};
