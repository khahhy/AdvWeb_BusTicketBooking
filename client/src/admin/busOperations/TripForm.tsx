import { useState, useEffect } from "react";
import { ArrowLeft, Bus, MapPin, Check, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const mockBuses = [
  { id: "BUS-001", name: "Xe 01 (51B-123.45)" },
  { id: "BUS-002", name: "Xe 02 (29A-678.90)" },
];

const mockLocations = [
  {
    id: "LOC-001",
    name: "Bến xe Miền Đông",
    address: "292 Đinh Bộ Lĩnh, P.26, Q. Bình Thạnh, TPHCM",
    lat: 10.8142,
    lng: 106.7025,
  },
  {
    id: "LOC-002",
    name: "Trạm Dầu Giây (Đồng Nai)",
    address: "QL1A, H. Thống Nhất, Đồng Nai",
    lat: 10.9414,
    lng: 107.1622,
  },
  {
    id: "LOC-003",
    name: "Bến xe Đà Lạt",
    address: "01 Tô Hiến Thành, P.3, TP. Đà Lạt",
    lat: 11.9381,
    lng: 108.4459,
  },
  {
    id: "LOC-004",
    name: "Trạm Bảo Lộc",
    address: "QL20, TP. Bảo Lộc, Lâm Đồng",
    lat: 11.5473,
    lng: 107.8061,
  },
];

type TripStop = {
  id: string;
  locationId: string;
  locationName: string;
  locationAddress: string;
  arrivalTime: string;
  departureTime: string;
};

const SortableTripStopItem = ({ stop }: { stop: TripStop }) => {
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
      className="flex items-center gap-2 p-3 bg-background rounded-md border hover:border-primary/50 transition-colors"
    >
      <Button
        variant="ghost"
        size="icon"
        className="cursor-grab"
        {...listeners}
      >
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </Button>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          <p className="font-medium text-sm">{stop.locationName}</p>
        </div>
        <div className="flex gap-4 mt-1 text-xs text-muted-foreground ml-6">
          <span>
            Đến:{" "}
            {stop.arrivalTime ? stop.arrivalTime.replace("T", " ") : "--:--"}
          </span>
          <span>
            Đi:{" "}
            {stop.departureTime
              ? stop.departureTime.replace("T", " ")
              : "--:--"}
          </span>
        </div>
      </div>
    </div>
  );
};

const TripForm = () => {
  const navigate = useNavigate();

  const [tripName, setTripName] = useState("");
  const [selectedBusId, setSelectedBusId] = useState<string>();
  const [tripStops, setTripStops] = useState<TripStop[]>([]);

  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [tempArrivalTime, setTempArrivalTime] = useState("");
  const [tempDepartureTime, setTempDepartureTime] = useState("");

  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    if (tripStops.length >= 2) {
      const startNode = tripStops[0];
      const endNode = tripStops[tripStops.length - 1];
      setTripName(`${startNode.locationName} - ${endNode.locationName}`);
    } else if (tripStops.length === 1) {
      setTripName(`${tripStops[0].locationName} - ???`);
    } else {
      setTripName("");
    }
  }, [tripStops]);

  const handleMapMarkerClick = (location: any) => {
    setSelectedLocation(location);

    const now = new Date().toISOString().slice(0, 16);
    setTempArrivalTime(now);
    setTempDepartureTime(now);
    setIsMapModalOpen(true);
  };

  const handleAddStop = () => {
    if (!selectedLocation) return;
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

  const handleSaveTrip = () => {
    console.log("Saving Trip...", { tripName, selectedBusId, tripStops });
    navigate("/admin/bus-operations/trips");
  };

  const isStep1Done = !!tripName && !!selectedBusId;
  const isStep2Done = tripStops.length >= 2;

  const defaultCenter = [11.3, 107.5];

  return (
    <div className="flex flex-1 flex-col p-2 h-screen overflow-hidden">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Create New Trip</h1>
          </div>
        </div>
        <Button
          onClick={handleSaveTrip}
          disabled={!isStep1Done || !isStep2Done}
        >
          <Check className="mr-2 h-4 w-4" /> Save & Activate
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-3 h-full overflow-hidden ">
        <div className="md:col-span-1 flex flex-col gap-3 overflow-y-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bus className="h-5 w-5" /> General Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-2">
                <Label htmlFor="bus">Bus</Label>
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

              <div className="space-y-2">
                <Label htmlFor="tripName">Trip Name</Label>
                <Input
                  id="tripName"
                  placeholder="Auto-generated from stops..."
                  value={tripName}
                  readOnly
                  className="bg-muted text-muted-foreground font-semibold"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="flex-1 flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" /> Stops ({tripStops.length})
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
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
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg p-4">
                  <MapPin className="h-8 w-8 mb-2 opacity-50" />
                  <p className="text-center text-sm">
                    No stops selected.
                    <br />
                    Click markers on the map to add.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="md:col-span-2 flex flex-col overflow-hidden h-[600px] md:h-auto">
          <CardHeader className="py-3 px-6 shrink-0">
            <CardTitle>Stop Map</CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 relative">
            <MapContainer
              center={defaultCenter as [number, number]}
              zoom={8}
              scrollWheelZoom={true}
              className="h-full w-full z-0"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {mockLocations.map((loc) => (
                <Marker
                  key={loc.id}
                  position={[loc.lat, loc.lng]}
                  eventHandlers={{
                    click: () => handleMapMarkerClick(loc),
                  }}
                >
                  <Popup>
                    <div className="text-sm">
                      <strong>{loc.name}</strong>
                      <br />
                      {loc.address}
                      <br />
                      <span className="text-primary cursor-pointer font-semibold">
                        Click marker to add
                      </span>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>

            <div className="absolute top-4 right-4 bg-background/90 backdrop-blur p-2 rounded-md shadow text-xs z-[400]">
              Click on markers to add them to the schedule
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isMapModalOpen} onOpenChange={setIsMapModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Stop: {selectedLocation?.name}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="arrival" className="text-right">
                Arrival
              </Label>
              <Input
                id="arrival"
                type="datetime-local"
                value={tempArrivalTime}
                onChange={(e) => setTempArrivalTime(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="departure" className="text-right">
                Departure
              </Label>
              <Input
                id="departure"
                type="datetime-local"
                value={tempDepartureTime}
                onChange={(e) => setTempDepartureTime(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAddStop}>Confirm Stop</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TripForm;
