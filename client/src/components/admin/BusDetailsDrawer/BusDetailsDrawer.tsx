import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dispatch, SetStateAction } from "react";
import { Bus } from "@/store/type/busType";
import { Trip, TripStatus } from "@/store/type/tripsType";
import { useGetBusAmenitiesQuery } from "@/store/api/settingApi";
import {
  Wifi,
  Tv,
  Coffee,
  Droplets,
  Bath,
  Shirt,
  Zap,
  Snowflake,
  Star,
  Calendar,
  MapPin,
  Clock,
} from "lucide-react";

export interface BusDetailsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bus: Bus | null;
  plate: string;
  amenities: string[];
  setPlate: Dispatch<SetStateAction<string>>;
  onAmenityChange: (id: string, checked: boolean) => void;
  relatedTrips: Trip[];
  onSave: () => void;
}

const BusDetailsDrawer = ({
  open,
  onOpenChange,
  bus,
  plate,
  amenities,
  setPlate,
  onAmenityChange,
  relatedTrips,
  onSave,
}: BusDetailsDrawerProps) => {
  const { data: settingsAmenitiesData } = useGetBusAmenitiesQuery();
  const allPossibleAmenities = settingsAmenitiesData?.amenities || [];

  const formatDateTime = (isoString: string) => {
    if (!isoString) return "N/A";
    return new Date(isoString).toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getAmenityIcon = (amenityName: string) => {
    const key = amenityName.toLowerCase().replace(/\s/g, "");
    const className = "w-4 h-4 text-gray-500";

    if (key.includes("tv") || key.includes("lcd"))
      return <Tv className={className} />;
    if (key.includes("wifi") || key.includes("internet"))
      return <Wifi className={className} />;
    if (key.includes("snack") || key.includes("food"))
      return <Coffee className={className} />;
    if (key.includes("water") || key.includes("drink"))
      return <Droplets className={className} />;
    if (key.includes("toilet") || key.includes("wc"))
      return <Bath className={className} />;
    if (key.includes("blanket") || key.includes("pillow"))
      return <Shirt className={className} />;
    if (key.includes("charger") || key.includes("usb") || key.includes("power"))
      return <Zap className={className} />;
    if (key.includes("air") || key.includes("cool"))
      return <Snowflake className={className} />;

    return <Star className={className} />;
  };

  const getStatusColor = (status: TripStatus) => {
    switch (status) {
      case TripStatus.Scheduled:
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case TripStatus.Ongoing:
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case TripStatus.Completed:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
      case TripStatus.Cancelled:
        return "bg-red-100 text-red-800 hover:bg-red-100";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-2xl flex flex-col h-full">
        <SheetHeader>
          <SheetTitle>Bus Details</SheetTitle>
          <SheetDescription>
            Manage information and trips for bus {plate}
          </SheetDescription>
        </SheetHeader>

        {bus && (
          <Tabs defaultValue="details" className="mt-6 flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Details & Amenities</TabsTrigger>
              <TabsTrigger value="trips">Related Trips</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="flex-1 overflow-y-auto">
              <div className="grid gap-6 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="plate" className="text-base font-semibold">
                    License Plate
                  </Label>
                  <Input
                    id="plate"
                    value={plate}
                    onChange={(e) => setPlate(e.target.value)}
                    placeholder="e.g. 51B-123.45"
                  />
                </div>

                <div className="grid gap-2">
                  <Label className="text-base font-semibold">
                    Bus Amenities
                  </Label>
                  <div className="rounded-lg border p-4 bg-gray-50 dark:bg-gray-900/50">
                    {allPossibleAmenities.length === 0 ? (
                      <p className="text-sm text-gray-500 italic">
                        No amenities configured in System Settings.
                      </p>
                    ) : (
                      <div className="grid grid-cols-2 gap-4">
                        {allPossibleAmenities.map((amenityName) => {
                          const isChecked = amenities.some(
                            (a) =>
                              a.toLowerCase() === amenityName.toLowerCase(),
                          );
                          return (
                            <div
                              key={amenityName}
                              className="flex items-center space-x-3 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                              <Checkbox
                                id={`drawer-${amenityName}`}
                                checked={isChecked}
                                onCheckedChange={(checked) =>
                                  onAmenityChange(
                                    amenityName,
                                    checked as boolean,
                                  )
                                }
                              />
                              <label
                                htmlFor={`drawer-${amenityName}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2 cursor-pointer capitalize"
                              >
                                {getAmenityIcon(amenityName)}
                                {amenityName}
                              </label>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end sticky bottom-0 bg-white dark:bg-background py-4 border-t">
                <Button onClick={onSave} className="w-full sm:w-auto">
                  Save Changes
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="trips" className="flex-1 overflow-hidden">
              <ScrollArea className="h-[calc(100vh-200px)] pr-4">
                <div className="space-y-4 py-4">
                  {relatedTrips.length > 0 ? (
                    relatedTrips.map((trip: Trip) => (
                      <div
                        key={trip.id}
                        className="flex flex-col gap-3 p-4 border rounded-xl bg-card hover:shadow-sm transition-all"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-blue-500" />
                            <span className="font-semibold text-base">
                              {trip.tripName || "Unknown Trip"}
                            </span>
                          </div>
                          <Badge
                            variant="secondary"
                            className={getStatusColor(trip.status)}
                          >
                            {trip.status}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm mt-1">
                          <div className="flex flex-col gap-1">
                            <span className="text-muted-foreground text-xs uppercase font-bold flex items-center gap-1">
                              <Calendar className="w-3 h-3" /> Departure
                            </span>
                            <span className="font-medium">
                              {formatDateTime(trip.startTime)}
                            </span>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-muted-foreground text-xs uppercase font-bold flex items-center gap-1">
                              <Clock className="w-3 h-3" /> Arrival
                            </span>
                            <span className="font-medium">
                              {formatDateTime(trip.endTime)}
                            </span>
                          </div>
                        </div>

                        {trip.tripName && (
                          <div className="text-xs text-muted-foreground border-t pt-2 mt-1">
                            Trip Ref: {trip.tripName}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground bg-gray-50 rounded-lg border border-dashed">
                      <Calendar className="w-10 h-10 mb-2 opacity-20" />
                      <p>No trips found for this bus.</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default BusDetailsDrawer;
