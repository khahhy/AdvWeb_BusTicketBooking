/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { format } from "date-fns";
import { Loader2, AlertCircle, CheckCircle2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  useCreateTripRouteMapMutation,
  useGetTripsForRouteQuery,
} from "@/store/api/routesApi";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  route: any;
};

const TripAssignmentDialog = ({ open, onOpenChange, route }: Props) => {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const {
    data: potentialTrips = [],
    isLoading,
    isFetching,
    refetch,
  } = useGetTripsForRouteQuery(
    {
      routeId: route.id,
      params: { startDate, endDate },
    },
    { skip: !open },
  );

  const [assignTrip, { isLoading: isAssigning }] =
    useCreateTripRouteMapMutation();
  const [assignedTripIds, setAssignedTripIds] = useState<Set<string>>(
    new Set(),
  );

  const handleAssign = async (tripItem: any) => {
    try {
      await assignTrip({
        tripId: tripItem.tripId,
        routeId: route.id,
        manualPrice: tripItem.pricing.finalPrice,
      }).unwrap();

      setAssignedTripIds((prev) => new Set(prev).add(tripItem.tripId));
      toast.success("Trip assigned to route successfully!");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to assign trip");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Assign Trips to {route.name}</DialogTitle>
          <DialogDescription>
            Find existing trips that match this route's path. Prices are
            calculated automatically based on distance and dates.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-4 items-end py-4 border-b">
          <div className="grid gap-1.5">
            <Label>From Date</Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label>To Date</Label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isLoading || isFetching}
          >
            {isLoading || isFetching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Calendar className="h-4 w-4 mr-2" />
            )}
            Find Trips
          </Button>
        </div>

        <ScrollArea className="flex-1 mt-4 border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bus & Trip Info</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Pricing Breakdown</TableHead>
                <TableHead className="text-right">Final Price</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {potentialTrips.length > 0 ? (
                potentialTrips.map((trip) => {
                  const isAssigned = assignedTripIds.has(trip.tripId);

                  return (
                    <TableRow
                      key={trip.tripId}
                      className={isAssigned ? "bg-muted/50" : ""}
                    >
                      <TableCell>
                        <div className="font-medium">{trip.busName}</div>
                        <div className="text-xs text-muted-foreground">
                          {trip.pickupLocation} → {trip.dropoffLocation}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {format(new Date(trip.startTime), "dd/MM/yyyy")}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(trip.startTime), "HH:mm")} -{" "}
                          {format(new Date(trip.endTime), "HH:mm")}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs space-y-1">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Base:</span>
                            <span>
                              {formatCurrency(trip.pricing.basePrice)}
                            </span>
                          </div>
                          {trip.pricing.surcharge !== "0%" && (
                            <div className="flex justify-between text-orange-600 font-medium">
                              <span>
                                {trip.pricing.surchargeReason} (
                                {trip.pricing.surcharge}):
                              </span>
                              <span>
                                +
                                {(
                                  trip.pricing.finalPrice -
                                  trip.pricing.basePrice
                                ).toLocaleString()}
                              </span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-bold text-green-600 text-lg">
                        {formatCurrency(trip.pricing.finalPrice)}
                      </TableCell>
                      <TableCell>
                        {isAssigned ? (
                          <Button
                            disabled
                            variant="ghost"
                            size="sm"
                            className="w-full text-green-600"
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" /> Linked
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="default"
                            className="w-full"
                            onClick={() => handleAssign(trip)}
                            disabled={isAssigning}
                          >
                            Assign
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-32">
                    {!isLoading && !isFetching && (
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <AlertCircle className="h-8 w-8" />
                        <p>No trips found containing stops for this route.</p>
                      </div>
                    )}
                    {(isLoading || isFetching) && (
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default TripAssignmentDialog;
