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
import { format } from "date-fns";
import { Calendar, Clock, MapPin, Bus } from "lucide-react";

type TripStatus = "Scheduled" | "Ongoing" | "Completed" | "Cancelled";

const TripDetailsDrawer = ({
  open,
  onOpenChange,
  trip,
  stops,
  routes,
  onEdit,
  onCancel,
}: any) => {
  if (!trip) return null;

  const getStatusBadgeVariant = (status: TripStatus) => {
    switch (status) {
      case "Scheduled":
        return "default";
      case "Ongoing":
        return "secondary";
      case "Completed":
        return "outline";
      case "Cancelled":
        return "destructive";
      default:
        return "default";
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-2xl overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle className="flex items-center gap-3">
            {trip.tripName}
            <Badge variant={getStatusBadgeVariant(trip.status)}>
              {trip.status}
            </Badge>
          </SheetTitle>
          <SheetDescription>
            Trip ID: <span className="font-mono text-xs">{trip.id}</span>
          </SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="general">General Info</TabsTrigger>
            <TabsTrigger value="itinerary">Itinerary & Stops</TabsTrigger>
            <TabsTrigger value="pricing">Routes & Pricing</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <div className="grid gap-4 border rounded-md p-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Bus Info</Label>
                  <div className="flex items-center gap-2 font-medium">
                    <Bus className="h-4 w-4" />
                    {trip.busLicensePlate}
                    <span className="text-xs text-muted-foreground">
                      ({trip.busId})
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-muted-foreground">Date</Label>
                  <div className="flex items-center gap-2 font-medium">
                    <Calendar className="h-4 w-4" />
                    {format(trip.startTime, "dd/MM/yyyy")}
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-muted-foreground">Departure</Label>
                  <div className="flex items-center gap-2 font-medium">
                    <Clock className="h-4 w-4 text-green-600" />
                    {format(trip.startTime, "HH:mm")}
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-muted-foreground">
                    Arrival (Est.)
                  </Label>
                  <div className="flex items-center gap-2 font-medium">
                    <Clock className="h-4 w-4 text-orange-600" />
                    {format(trip.endTime, "HH:mm")} (+1 day if applicable)
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="outline"
                className="text-destructive border-destructive hover:bg-destructive/10"
                onClick={() => onCancel(trip.id)}
              >
                Cancel Trip
              </Button>
              <Button onClick={() => onEdit(trip.id)}>
                Edit Configuration
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="itinerary">
            <div className="rounded-md border p-4 space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <MapPin className="h-4 w-4" /> Scheduled Stops
              </h3>
              <Separator />
              {stops && stops.length > 0 ? (
                <div className="relative border-l-2 border-muted ml-2 pl-6 py-2 space-y-6">
                  {stops.map((stop: any, index: number) => (
                    <div key={index} className="relative">
                      <span className="absolute -left-[29px] top-1 bg-background border-2 border-primary rounded-full w-3 h-3"></span>
                      <p className="font-medium text-sm">{stop.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {stop.time}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  No stops configured.
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="pricing">
            <div className="rounded-md border">
              {routes && routes.length > 0 ? (
                <div className="divide-y">
                  {routes.map((route: any, index: number) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-4 hover:bg-muted/50 transition-colors"
                    >
                      <span className="font-medium">{route.name}</span>
                      <Badge variant="secondary" className="text-base">
                        {route.price} VNĐ
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-muted-foreground">
                  No routes configured
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};

export default TripDetailsDrawer;
