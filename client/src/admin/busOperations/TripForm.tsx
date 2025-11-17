import { useState } from "react";
import {
  ArrowLeft,
  Bus,
  MapPin,
  Check,
  Plus,
  GripVertical,
  Map,
  Route,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const mockBuses = [
  { id: "BUS-001", name: "Xe 01 (51B-123.45)" },
  { id: "BUS-002", name: "Xe 02 (29A-678.90)" },
];
const mockLocations = [
  {
    id: "LOC-001",
    name: "Bến xe Miền Đông",
    address: "292 Đinh Bộ Lĩnh, P.26, Q. Bình Thạnh, TPHCM",
    mapPos: { x: "55%", y: "60%" },
  },
  {
    id: "LOC-002",
    name: "Trạm Dầu Giây",
    address: "QL1A, H. Thống Nhất, Đồng Nai",
    mapPos: { x: "58%", y: "55%" },
  },
  {
    id: "LOC-003",
    name: "Bến xe Đà Lạt",
    address: "01 Tô Hiến Thành, P.3, TP. Đà Lạt",
    mapPos: { x: "60%", y: "45%" },
  },
];
const mockRouteDefinitions = [
  { id: "R-001", name: "Sài Gòn - Đà Lạt", price: 350000 },
  { id: "R-002", name: "Sài Gòn - Đồng Nai", price: 150000 },
];

type TripStop = {
  id: string;
  locationId: string;
  locationName: string;
  locationAddress: string;
  arrivalTime: string;
  departureTime: string;
};

type AssignedRoute = {
  id: string;
  routeDefId: string;
  routeDefName: string;
  pickupStopId: string;
  dropoffStopId: string;
};

function SortableTripStopItem({ stop }: { stop: TripStop }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: stop.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="flex items-center gap-2 p-3 bg-background rounded-md border"
    >
      <Button variant="ghost" size="icon" {...listeners}>
        <GripVertical className="h-5 w-5" />
      </Button>
      <div className="flex-1">
        <p className="font-medium">{stop.locationName}</p>
        <p className="text-sm text-muted-foreground">
          Đến: {stop.arrivalTime} - Đi: {stop.departureTime}
        </p>
      </div>
    </div>
  );
}

const TripForm = () => {
  const navigate = useNavigate();

  const [tripName, setTripName] = useState("");
  const [selectedBusId, setSelectedBusId] = useState<string>();

  const [tripStops, setTripStops] = useState<TripStop[]>([]);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [tempArrivalTime, setTempArrivalTime] = useState("");
  const [tempDepartureTime, setTempDepartureTime] = useState("");

  const [assignedRoutes, setAssignedRoutes] = useState<AssignedRoute[]>([]);
  const [isRouteModalOpen, setIsRouteModalOpen] = useState(false);
  const [tempRouteId, setTempRouteId] = useState<string>();
  const [tempPickupId, setTempPickupId] = useState<string>();
  const [tempDropoffId, setTempDropoffId] = useState<string>();

  const sensors = useSensors(useSensor(PointerSensor));

  const handleMapMarkerClick = (location: any) => {
    setSelectedLocation(location);
    setTempArrivalTime("");
    setTempDepartureTime("");
    setIsMapModalOpen(true);
  };

  const handleAddStop = () => {
    if (!selectedLocation || !tempArrivalTime || !tempDepartureTime) return;
    setTripStops((prev) => [
      ...prev,
      {
        id: `stop-${Date.now()}`,
        locationId: selectedLocation.id,
        locationName: selectedLocation.name,
        locationAddress: selectedLocation.address,
        arrivalTime: tempArrivalTime,
        departureTime: tempDepartureTime,
      },
    ]);
    setIsMapModalOpen(false);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setTripStops((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over!.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleAddRoute = () => {
    if (!tempRouteId || !tempPickupId || !tempDropoffId) return;
    const routeDef = mockRouteDefinitions.find((r) => r.id === tempRouteId);
    if (!routeDef) return;

    setAssignedRoutes((prev) => [
      ...prev,
      {
        id: `ar-${Date.now()}`,
        routeDefId: routeDef.id,
        routeDefName: routeDef.name,
        pickupStopId: tempPickupId,
        dropoffStopId: tempDropoffId,
      },
    ]);
    setIsRouteModalOpen(false);
    setTempRouteId(undefined);
    setTempPickupId(undefined);
    setTempDropoffId(undefined);
  };

  const handleSaveTrip = () => {
    console.log("Saving Trip...");
    console.log("Step 1:", { tripName, selectedBusId });
    console.log("Step 2:", tripStops);
    console.log("Step 3:", assignedRoutes);

    navigate("/admin/bus-operations/trips");
  };

  const isStep1Done = !!tripName && !!selectedBusId;
  const isStep2Done = tripStops.length >= 2;
  const isStep3Done = assignedRoutes.length >= 1;

  return (
    <div className="flex flex-1 flex-col p-4 md:p-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Create New Trip</h1>
            <p className="text-muted-foreground">
              Fill the steps to schedule a new trip.
            </p>
          </div>
        </div>
        <Button
          onClick={handleSaveTrip}
          disabled={!isStep1Done || !isStep2Done || !isStep3Done}
        >
          <Check className="mr-2 h-4 w-4" /> Save & Activate
        </Button>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bus className="h-5 w-5" /> Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tripName">Trip Name</Label>
              <Input
                id="tripName"
                placeholder="E.g., Chuyến 8:00 Sài Gòn - Đà Lạt 17/11"
                value={tripName}
                onChange={(e) => setTripName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bus">Select Bus</Label>
              <Select value={selectedBusId} onValueChange={setSelectedBusId}>
                <SelectTrigger id="bus">
                  <SelectValue placeholder="Select a bus..." />
                </SelectTrigger>
                <SelectContent>
                  {mockBuses.map((bus) => (
                    <SelectItem key={bus.id} value={bus.id}>
                      {bus.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" /> Schedule & Stops
            </CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <div className="relative h-96 rounded-md border bg-muted flex items-center justify-center">
              <Map className="h-24 w-24 text-gray-400" />
              <span className="text-2xl text-gray-400">Map Placeholder</span>

              {mockLocations.map((loc) => (
                <button
                  key={loc.id}
                  className="absolute p-2 bg-primary rounded-full shadow-lg"
                  style={{ top: loc.mapPos.y, left: loc.mapPos.x }}
                  onClick={() => handleMapMarkerClick(loc)}
                >
                  <MapPin className="h-5 w-5 text-primary-foreground" />
                </button>
              ))}
            </div>

            <div className="h-96 overflow-y-auto pr-2">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={tripStops}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {tripStops.map((stop) => (
                      <SortableTripStopItem key={stop.id} stop={stop} />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
              {tripStops.length === 0 && (
                <p className="text-center text-muted-foreground pt-16">
                  Click on map markers to add stops.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Route className="h-5 w-5" /> Assign Routes
            </CardTitle>
            <CardDescription>
              Assign which commercial routes this trip will service.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setIsRouteModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Commercial Route
            </Button>
            <div className="mt-4 space-y-2">
              {assignedRoutes.map((ar) => (
                <Badge
                  key={ar.id}
                  variant="secondary"
                  className="p-2 text-base"
                >
                  {ar.routeDefName}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isMapModalOpen} onOpenChange={setIsMapModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add to Schedule: {selectedLocation?.name}</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">{selectedLocation?.address}</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="arrival">Arrival Time</Label>
              <Input
                id="arrival"
                type="datetime-local"
                value={tempArrivalTime}
                onChange={(e) => setTempArrivalTime(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="departure">Departure Time</Label>
              <Input
                id="departure"
                type="datetime-local"
                value={tempDepartureTime}
                onChange={(e) => setTempDepartureTime(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAddStop}>Add to Schedule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isRouteModalOpen} onOpenChange={setIsRouteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Commercial Route</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Commercial Route</Label>
              <Select value={tempRouteId} onValueChange={setTempRouteId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a route..." />
                </SelectTrigger>
                <SelectContent>
                  {mockRouteDefinitions.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name} ({r.price.toLocaleString()} VNĐ)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Pickup Stop</Label>
              <Select
                value={tempPickupId}
                onValueChange={setTempPickupId}
                disabled={tripStops.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select pickup stop..." />
                </SelectTrigger>
                <SelectContent>
                  {tripStops.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.locationName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Dropoff Stop</Label>
              <Select
                value={tempDropoffId}
                onValueChange={setTempDropoffId}
                disabled={tripStops.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select dropoff stop..." />
                </SelectTrigger>
                <SelectContent>
                  {tripStops.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.locationName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAddRoute}>Assign Route</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TripForm;
