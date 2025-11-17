import { useState, useMemo } from "react";
import { MapPin, Search, Plus, Trash2, AlertTriangle, Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Location = {
  id: string;
  name: string;
  city: string;
  address: string;
  mapPosition: { x: string; y: string };
  hasFutureRoutes: boolean;
};

type RelatedRoute = {
  id: string;
  name: string;
  departureTime: Date;
};

const mockLocations: Location[] = [
  {
    id: "LOC-001",
    name: "Bến xe Miền Đông",
    city: "TP. Hồ Chí Minh",
    address: "292 Đinh Bộ Lĩnh, P.26, Q. Bình Thạnh",
    mapPosition: { x: "55%", y: "60%" },
    hasFutureRoutes: true,
  },
  {
    id: "LOC-002",
    name: "Bến xe Đà Lạt",
    city: "TP. Đà Lạt",
    address: "01 Tô Hiến Thành, P.3, TP. Đà Lạt",
    mapPosition: { x: "60%", y: "45%" },
    hasFutureRoutes: false,
  },
  {
    id: "LOC-003",
    name: "Bến xe Trung tâm Đà Nẵng",
    city: "TP. Đà Nẵng",
    address: "201 Tôn Đức Thắng, P. Hòa Minh, Q. Liên Chiểu",
    mapPosition: { x: "70%", y: "20%" },
    hasFutureRoutes: false,
  },
];

const mockRelatedRoutes: RelatedRoute[] = [
  {
    id: "R-001",
    name: "SGN-DAL",
    departureTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: "R-002",
    name: "SGN-DAN",
    departureTime: new Date(Date.now() - 12 * 60 * 60 * 1000),
  },
  {
    id: "R-003",
    name: "DAN-SGN",
    departureTime: new Date(Date.now() + 6 * 60 * 60 * 1000),
  },
  {
    id: "R-004",
    name: "DAL-SGN",
    departureTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
  },
];

const LocationManagement = () => {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null
  );
  const [hoveredLocationId, setHoveredLocationId] = useState<string | null>(
    null
  );
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [editableName, setEditableName] = useState("");
  const [editableCity, setEditableCity] = useState("");
  const [editableAddress, setEditableAddress] = useState("");

  const handleSelectLocation = (location: Location) => {
    setSelectedLocation(location);
    setEditableName(location.name);
    setEditableCity(location.city);
    setEditableAddress(location.address);
    setIsSheetOpen(true);
  };

  const handleCreateLocation = () => {
    console.log("Creating new location...");
    setIsCreateModalOpen(false);
  };

  const handleSaveChanges = () => {
    if (!selectedLocation) return;
    console.log("Saving changes...", {
      id: selectedLocation.id,
      name: editableName,
      city: editableCity,
      address: editableAddress,
    });
    setIsSheetOpen(false);
  };

  const handleDeleteLocation = () => {
    if (!selectedLocation || selectedLocation.hasFutureRoutes) return;
    console.log("Deleting location...", selectedLocation.id);
    setIsSheetOpen(false);
  };

  const filteredRoutes = useMemo(() => {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneDayHence = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    return mockRelatedRoutes.filter((route) => {
      return (
        route.departureTime >= oneDayAgo && route.departureTime <= oneDayHence
      );
    });
  }, []);

  const canDelete = selectedLocation
    ? !selectedLocation.hasFutureRoutes
    : false;

  return (
    <div className="flex flex-1 gap-4 p-4 md:gap-8 md:p-8 h-[calc(100vh-10rem)]">
      <Card className="w-[30%] flex flex-col">
        <CardHeader>
          <CardTitle>Locations</CardTitle>
          <CardDescription>Manage your bus stop locations.</CardDescription>
          <div className="flex gap-2 pt-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search locations..." className="pl-8" />
            </div>

            <Dialog
              open={isCreateModalOpen}
              onOpenChange={setIsCreateModalOpen}
            >
              <DialogTrigger asChild>
                <Button size="icon" variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create New Location</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input id="name" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="city" className="text-right">
                      City
                    </Label>
                    <Input id="city" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="address" className="text-right">
                      Address
                    </Label>
                    <Input id="address" className="col-span-3" />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" onClick={handleCreateLocation}>
                    Create
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Address</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockLocations.map((location) => (
                <TableRow
                  key={location.id}
                  onClick={() => handleSelectLocation(location)}
                  className={cn(
                    "cursor-pointer",
                    selectedLocation?.id === location.id && "bg-muted/50"
                  )}
                >
                  <TableCell className="font-medium">{location.name}</TableCell>
                  <TableCell className="text-xs text-muted-foreground truncate">
                    {location.address}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-muted flex items-center justify-center">
          <Map className="h-24 w-24 text-gray-400" />
          <span className="text-2xl text-gray-400">Map Placeholder</span>
        </div>

        {mockLocations.map((location) => (
          <div
            key={location.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2"
            style={{
              left: location.mapPosition.x,
              top: location.mapPosition.y,
            }}
            onMouseEnter={() => setHoveredLocationId(location.id)}
            onMouseLeave={() => setHoveredLocationId(null)}
          >
            <button
              onClick={() => handleSelectLocation(location)}
              className={cn(
                "p-2 bg-primary rounded-full shadow-lg transition-all",
                selectedLocation?.id === location.id &&
                  "ring-4 ring-primary/50 scale-110"
              )}
            >
              <MapPin className="h-5 w-5 text-primary-foreground" />
            </button>

            {hoveredLocationId === location.id && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max rounded-md bg-background px-3 py-2 shadow-lg z-10">
                <p className="font-bold">{location.name}</p>
                <p className="text-sm text-muted-foreground">{location.city}</p>
              </div>
            )}
          </div>
        ))}
      </Card>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Location Details</SheetTitle>
            <SheetDescription>View and edit location details.</SheetDescription>
          </SheetHeader>

          {selectedLocation && (
            <Tabs defaultValue="details" className="mt-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="routes">Related Routes</TabsTrigger>
              </TabsList>

              <TabsContent value="details">
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">ID</Label>
                    <Input
                      value={selectedLocation.id}
                      disabled
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="name"
                      value={editableName}
                      onChange={(e) => setEditableName(e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="city" className="text-right">
                      City
                    </Label>
                    <Input
                      id="city"
                      value={editableCity}
                      onChange={(e) => setEditableCity(e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="address" className="text-right">
                      Address
                    </Label>
                    <Input
                      id="address"
                      value={editableAddress}
                      onChange={(e) => setEditableAddress(e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="routes">
                <p className="text-sm text-muted-foreground mb-2">
                  Showing routes from 1 day ago to 1 day from now.
                </p>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Route</TableHead>
                        <TableHead>Departure</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRoutes.map((route) => (
                        <TableRow key={route.id}>
                          <TableCell>{route.name}</TableCell>
                          <TableCell>
                            {route.departureTime.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredRoutes.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={2} className="text-center">
                            No related routes in this time range.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          )}

          <SheetFooter className="mt-6">
            <div className="flex w-full justify-between items-center">
              <Button
                variant="destructive"
                onClick={handleDeleteLocation}
                disabled={!canDelete}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
              <div className="flex gap-2">
                <SheetClose asChild>
                  <Button variant="outline">Cancel</Button>
                </SheetClose>
                <Button onClick={handleSaveChanges}>Save Changes</Button>
              </div>
            </div>
            {!canDelete && (
              <p className="w-full mt-2 text-xs text-destructive flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Cannot delete: This location is part of one or more future
                routes.
              </p>
            )}
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default LocationManagement;
