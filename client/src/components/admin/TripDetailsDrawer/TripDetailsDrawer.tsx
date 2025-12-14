import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { Calendar, Clock, MapPin, Bus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  useGetTripByIdQuery,
  useUpdateTripStatusMutation,
} from "@/store/api/tripsApi";
import { TripStatus } from "@/store/type/tripsType";

interface TripDetailsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tripId: string | null;
  onEdit: (tripId: string) => void;
}

const TripDetailsDrawer = ({
  open,
  onOpenChange,
  tripId,
  onEdit,
}: TripDetailsDrawerProps) => {
  const {
    data: trip,
    isLoading,
    refetch,
  } = useGetTripByIdQuery(tripId || "", {
    skip: !tripId,
  });

  const [updateStatus, { isLoading: isUpdating }] =
    useUpdateTripStatusMutation();

  const handleStatusChange = async (newStatus: string) => {
    if (!tripId) return;

    if (
      newStatus === "cancelled" &&
      !confirm("Are you sure you want to cancel this trip?")
    ) {
      return;
    }

    try {
      await updateStatus({
        id: tripId,
        status: newStatus as TripStatus,
      }).unwrap();
      refetch();
      toast.success(`Trip status updated to ${newStatus}`);
    } catch (error) {
      console.error("Failed to update status", error);
      toast.error("Failed to update trip status");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "default";
      case "ongoing":
        return "secondary";
      case "completed":
        return "outline";
      case "cancelled":
        return "destructive";
      case "delayed":
        return "destructive";
      default:
        return "default";
    }
  };

  if (!tripId) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-2xl overflow-y-auto">
        {isLoading || !trip ? (
          <div className="flex items-center justify-center h-40">
            Loading details...
          </div>
        ) : (
          <>
            <SheetHeader className="mb-4">
              <SheetTitle className="flex items-center gap-3">
                {trip.tripName}
                <Badge variant={getStatusColor(trip.status)}>
                  {trip.status}
                </Badge>
              </SheetTitle>
              <SheetDescription>
                Trip ID: <span className="font-mono text-xs">{trip.id}</span>
              </SheetDescription>
            </SheetHeader>

            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="general">General Info</TabsTrigger>
                <TabsTrigger value="itinerary">Itinerary & Stops</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-4">
                <div className="grid gap-4 border rounded-md p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-muted-foreground">Bus Info</Label>
                      <div className="flex items-center gap-2 font-medium">
                        <Bus className="h-4 w-4" />
                        {trip.bus?.plate}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-muted-foreground">Date</Label>
                      <div className="flex items-center gap-2 font-medium">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(trip.startTime), "dd/MM/yyyy")}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-muted-foreground">Departure</Label>
                      <div className="flex items-center gap-2 font-medium">
                        <Clock className="h-4 w-4 text-green-600" />
                        {format(new Date(trip.startTime), "HH:mm")}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-muted-foreground">
                        Arrival (Est.)
                      </Label>
                      <div className="flex items-center gap-2 font-medium">
                        <Clock className="h-4 w-4 text-orange-600" />
                        {format(new Date(trip.endTime), "HH:mm")}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 items-end">
                    <div className="space-y-2">
                      <Label htmlFor="status-select">Current Status</Label>
                      <Select
                        value={trip.status}
                        onValueChange={handleStatusChange}
                        disabled={isUpdating}
                      >
                        <SelectTrigger id="status-select" className="w-full">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                          <SelectItem value="ongoing">Ongoing</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="delayed">Delayed</SelectItem>
                          <SelectItem
                            value="cancelled"
                            className="text-destructive focus:text-destructive"
                          >
                            Cancelled
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="text-xs text-muted-foreground pb-2">
                      {isUpdating && (
                        <span className="flex items-center gap-1 text-primary">
                          <Loader2 className="h-3 w-3 animate-spin" />{" "}
                          Updating...
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-end pt-2">
                  <Button variant="outline" onClick={() => onEdit(trip.id)}>
                    Edit Full Configuration
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="itinerary">
                <div className="rounded-md border p-4 space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <MapPin className="h-4 w-4" /> Scheduled Stops
                  </h3>
                  <Separator />
                  {trip.tripStops && trip.tripStops.length > 0 ? (
                    <div className="relative border-l-2 border-muted ml-2 pl-6 py-2 space-y-6">
                      {trip.tripStops.map((stop) => (
                        <div key={stop.id} className="relative">
                          <span className="absolute -left-[29px] top-1 bg-background border-2 border-primary rounded-full w-3 h-3"></span>
                          <p className="font-medium text-sm">
                            {stop.location?.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {stop.location?.address}
                          </p>
                          <div className="flex gap-2 text-xs mt-1">
                            <span className="text-green-600">
                              Arrive:{" "}
                              {stop.arrivalTime
                                ? format(new Date(stop.arrivalTime), "HH:mm")
                                : "--"}
                            </span>
                            <span className="text-blue-600">
                              Depart:{" "}
                              {stop.departureTime
                                ? format(new Date(stop.departureTime), "HH:mm")
                                : "--"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      No stops data.
                    </p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default TripDetailsDrawer;
