import { useState } from "react";
import { format } from "date-fns";
import { Loader2, AlertCircle, CheckCircle2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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
import { Route, RouteTripAvailable } from "@/store/type/routesType";
import { toast } from "sonner";
import type { ApiError } from "@/store/type/apiError";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  route: Route;
};

const TripAssignmentDialog = ({ open, onOpenChange, route }: Props) => {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [editedPrices, setEditedPrices] = useState<Record<string, string>>({});

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

  const getDisplayPrice = (trip: RouteTripAvailable) => {
    if (editedPrices[trip.tripId] !== undefined) {
      return editedPrices[trip.tripId];
    }
    return trip.pricing.finalPrice.toString();
  };

  const handlePriceChange = (tripId: string, value: string) => {
    setEditedPrices((prev) => ({
      ...prev,
      [tripId]: value,
    }));
  };

  const handleAssign = async (tripItem: RouteTripAvailable) => {
    try {
      const finalPriceInput = editedPrices[tripItem.tripId];
      const priceToSave = finalPriceInput
        ? Number(finalPriceInput)
        : tripItem.pricing.finalPrice;

      if (isNaN(priceToSave) || priceToSave < 0) {
        toast.error("Invalid price value");
        return;
      }

      await assignTrip({
        tripId: tripItem.tripId,
        routeId: route.id,
        manualPrice: priceToSave,
      }).unwrap();

      setAssignedTripIds((prev) => new Set(prev).add(tripItem.tripId));
      toast.success("Trip assigned to route successfully!");
    } catch (error) {
      const err = error as ApiError;
      toast.error(err?.data?.message || "Failed to assign trip");
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

                  const basePrice = trip.pricing.basePrice;
                  const busFactor = trip.pricing.busTypeFactor;
                  const surchargeStr = trip.pricing.surcharge;

                  const priceAfterBusType = basePrice * busFactor;

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
                      <TableCell className="align-top p-4">
                        <div className="flex flex-col gap-2 min-w-[300px]">
                          {/* Block */}
                          <div className="bg-slate-50 rounded-lg border p-3 text-xs space-y-2">
                            {/* Base Price */}
                            <div className="flex justify-between items-center text-slate-600">
                              <span className="font-medium">
                                Base Fare (Distance)
                              </span>
                              <span className="font-mono tabular-nums">
                                {formatCurrency(basePrice)}
                              </span>
                            </div>

                            {/* Bus Type Upgrade */}
                            {busFactor > 1 && (
                              <div className="flex justify-between items-center text-blue-700">
                                <div className="flex items-center gap-1.5">
                                  <span>{trip.busType}</span>
                                  <span className="px-1.5 py-0.5 rounded-full bg-blue-100 text-[10px] font-bold">
                                    x{busFactor}
                                  </span>
                                </div>
                                <span className="font-mono tabular-nums font-medium">
                                  +{" "}
                                  {formatCurrency(
                                    priceAfterBusType - basePrice,
                                  )}
                                </span>
                              </div>
                            )}

                            {/* Surcharge (weekend/..) */}
                            {surchargeStr !== "0%" && (
                              <div className="flex justify-between items-center text-orange-700">
                                <div className="flex items-center gap-1.5">
                                  <span>Surcharge</span>
                                  <span className="px-1.5 py-0.5 rounded-full bg-orange-100 text-[10px] font-bold">
                                    {trip.pricing.surchargeReason ===
                                    "Weekend surcharge"
                                      ? "Weekend"
                                      : "Holiday"}{" "}
                                    {surchargeStr}
                                  </span>
                                </div>

                                <span className="font-mono tabular-nums font-medium">
                                  +{" "}
                                  {formatCurrency(
                                    trip.pricing.finalPrice -
                                      Math.ceil(priceAfterBusType / 1000) *
                                        1000,
                                  )}
                                </span>
                              </div>
                            )}

                            <div className="border-t border-slate-200 my-1" />

                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-slate-700">
                                Suggested Price
                              </span>
                              <span className="font-mono tabular-nums font-bold text-slate-900">
                                {formatCurrency(trip.pricing.finalPrice)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Input
                            type="number"
                            className="text-right font-bold text-green-700 h-9"
                            value={getDisplayPrice(trip)}
                            onChange={(e) =>
                              handlePriceChange(trip.tripId, e.target.value)
                            }
                            disabled={isAssigned}
                          />
                        </div>
                        {getDisplayPrice(trip) !==
                          trip.pricing.finalPrice.toString() && (
                          <div className="text-[10px] text-orange-500 text-right mt-1">
                            Manual Override
                          </div>
                        )}
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
