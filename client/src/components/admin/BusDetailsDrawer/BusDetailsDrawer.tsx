import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dispatch, SetStateAction } from "react";

// temporary to fix eslint
export interface BusDetailsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bus: Bus | null;
  name: string;
  plate: string;
  amenities: string[];
  setName: Dispatch<SetStateAction<string>>;
  setPlate: Dispatch<SetStateAction<string>>;
  onAmenityChange: (amenities: string[]) => void;
  relatedTrips: Trip[];
  onSave: () => void;
}

export interface Bus {
  id: string;
  name: string;
  plate: string;
  amenities: string[];
  status: string;
}

export interface Trip {
  id: string;
  routeName: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
}

const allPossibleAmenities = [
  { id: "wifi", label: "Wifi" },
  { id: "charging", label: "Cổng sạc USB" },
  { id: "wc", label: "WC (Nhà vệ sinh)" },
  { id: "blanket", label: "Chăn đắp" },
  { id: "water", label: "Nước uống" },
  { id: "cold_towel", label: "Khăn lạnh" },
];

const BusDetailsDrawer = ({
  open,
  onOpenChange,
  bus,
  name,
  plate,
  amenities,
  setName,
  setPlate,
  onAmenityChange,
  relatedTrips,
  onSave,
}: BusDetailsDrawerProps) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-2xl">
        {bus && (
          <Tabs defaultValue="details" className="mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="trips">Trips</TabsTrigger>
            </TabsList>

            <TabsContent value="details">
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label>Name</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="col-span-3"
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label>License</Label>
                  <Input
                    value={plate}
                    onChange={(e) => setPlate(e.target.value)}
                    className="col-span-3"
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label>Status</Label>

                  <Badge
                    className="px-2 py-0.5 col-span-2 justify-center"
                    variant={
                      bus.status === "Active" ? "secondary" : "destructive"
                    }
                  >
                    {bus.status}
                  </Badge>
                </div>

                <div className="col-span-4">
                  <Label className="mb-2 block">Amenities</Label>
                  <div className="grid grid-cols-2 gap-4 rounded-md border p-4">
                    {allPossibleAmenities.map((amenity) => (
                      <div
                        key={amenity.id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={amenity.id}
                          checked={amenities.includes(amenity.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              onAmenityChange([...amenities, amenity.id]);
                            } else {
                              onAmenityChange(
                                amenities.filter((id) => id !== amenity.id),
                              );
                            }
                          }}
                        />
                        <label
                          htmlFor={amenity.id}
                          className="text-sm font-medium"
                        >
                          {amenity.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button onClick={onSave}>Save</Button>
              </div>
            </TabsContent>

            <TabsContent value="trips">
              <div className="mt-4 space-y-4">
                {relatedTrips.length ? (
                  relatedTrips.map((trip: Trip) => (
                    <div key={trip.id} className="p-4 border rounded-md">
                      <p className="font-semibold">{trip.routeName}</p>
                      <p className="text-sm">
                        {trip.departureTime.toLocaleString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <p>No trips.</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default BusDetailsDrawer;
