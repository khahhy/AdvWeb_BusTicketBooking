import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Bus,
  MapPin,
  Check,
  GripVertical,
  Loader2,
} from "lucide-react";
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

// IMPORT API
import { useGetLocationsQuery } from "@/store/api/locationApi";
import { useGetBusesQuery } from "@/store/api/busApi";
import { useCreateTripMutation } from "@/store/api/tripsApi";
import { toast } from "sonner";

// --- Config Leaflet Icon ---
const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// --- Types ---
// Type cho Stop trong Form state (Local state dùng cho UI & DragDrop)
type TripStopState = {
  id: string; // ID tạm thời để dùng cho thư viện Dnd-kit
  locationId: string;
  locationName: string;
  locationAddress: string;
  arrivalTime: string; // ISO String
  departureTime: string; // ISO String
};

// --- Component Sortable Item ---
const SortableTripStopItem = ({ stop }: { stop: TripStopState }) => {
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
        className="cursor-grab active:cursor-grabbing"
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
            {stop.arrivalTime
              ? new Date(stop.arrivalTime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "--:--"}
          </span>
          <span>
            Đi:{" "}
            {stop.departureTime
              ? new Date(stop.departureTime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "--:--"}
          </span>
        </div>
      </div>
    </div>
  );
};

// --- Main Component ---
const TripForm = () => {
  const navigate = useNavigate();

  // 1. API Hooks
  const [createTrip, { isLoading: isSubmitting }] = useCreateTripMutation();
  const { data: locations = [], isLoading: isLoadingLocations } =
    useGetLocationsQuery();
  const { data: buses = [], isLoading: isLoadingBuses } = useGetBusesQuery();

  // 2. Form State
  const [tripName, setTripName] = useState("");
  const [selectedBusId, setSelectedBusId] = useState<string>();
  const [tripStops, setTripStops] = useState<TripStopState[]>([]);

  // 3. Modal & Selection State
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedLocation, setSelectedLocation] = useState<any>(null); // Location từ API
  const [tempArrivalTime, setTempArrivalTime] = useState("");
  const [tempDepartureTime, setTempDepartureTime] = useState("");

  const sensors = useSensors(useSensor(PointerSensor));

  // Tự động tạo tên Trip dựa trên điểm đi - điểm đến
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

  // Xử lý khi click vào Marker trên bản đồ
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleMapMarkerClick = (location: any) => {
    setSelectedLocation(location);

    // Set mặc định giờ hiện tại (Local time để hiển thị input type="datetime-local")
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    const localIsoString = now.toISOString().slice(0, 16);

    setTempArrivalTime(localIsoString);
    setTempDepartureTime(localIsoString);
    setIsMapModalOpen(true);
  };

  // Confirm thêm điểm dừng
  const handleAddStop = () => {
    if (!selectedLocation) return;

    // Convert từ Local Input Time sang ISO String chuẩn để lưu DB
    const arrivalISO = new Date(tempArrivalTime).toISOString();
    const departureISO = new Date(tempDepartureTime).toISOString();

    setTripStops((prev) => [
      ...prev,
      {
        id: `stop-${Date.now()}`, // Tạo ID unique tạm thời cho DragDrop
        locationId: selectedLocation.id,
        locationName: selectedLocation.name,
        locationAddress: selectedLocation.address || "",
        arrivalTime: arrivalISO,
        departureTime: departureISO,
      },
    ]);
    setIsMapModalOpen(false);
  };

  // Xử lý kéo thả sắp xếp stops
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

  // Submit Form gọi API
  const handleSaveTrip = async () => {
    if (!selectedBusId || tripStops.length < 2) {
      toast.error("Please select a bus and at least 2 stops.");
      return;
    }

    try {
      const payload = {
        busId: selectedBusId,
        stops: tripStops.map((s) => ({
          locationId: s.locationId,
          arrivalTime: s.arrivalTime,
          departureTime: s.departureTime,
        })),
      };

      await createTrip(payload).unwrap();
      toast.success("Trip created successfully!");
      navigate("/admin/bus-operations/trips");
    } catch (error) {
      console.error("Create trip failed:", error);
      toast.error("Failed to create trip. Please try again.");
    }
  };

  const isStep1Done = !!tripName && !!selectedBusId;
  const isStep2Done = tripStops.length >= 2;
  const defaultCenter = [10.7769, 106.7009]; // TP.HCM

  return (
    <div className="flex flex-1 flex-col p-2 h-screen overflow-hidden">
      {/* HEADER */}
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
          disabled={!isStep1Done || !isStep2Done || isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Check className="mr-2 h-4 w-4" />
          )}
          {isSubmitting ? "Saving..." : "Save & Activate"}
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-3 h-full overflow-hidden">
        {/* LEFT PANEL: CONFIG */}
        <div className="md:col-span-1 flex flex-col gap-3 overflow-y-auto">
          {/* Card: Bus Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bus className="h-5 w-5" /> General Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bus">Bus</Label>
                <Select value={selectedBusId} onValueChange={setSelectedBusId}>
                  <SelectTrigger id="bus">
                    <SelectValue
                      placeholder={
                        isLoadingBuses ? "Loading buses..." : "Select a bus..."
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {buses.map((bus) => (
                      <SelectItem key={bus.id} value={bus.id}>
                        {bus.plate} ({bus.seatCapacity} seats)
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

          {/* Card: Stops List (Draggable) */}
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
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg p-4 mt-2">
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

        {/* RIGHT PANEL: MAP */}
        <Card className="md:col-span-2 flex flex-col overflow-hidden h-[600px] md:h-auto">
          <CardHeader className="py-3 px-6 shrink-0">
            <CardTitle>Select Stops</CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 relative">
            <MapContainer
              center={defaultCenter as [number, number]}
              zoom={10}
              scrollWheelZoom={true}
              className="h-full w-full z-0"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Render Locations from API */}
              {!isLoadingLocations &&
                locations.map((loc) => {
                  if (!loc.latitude || !loc.longitude) return null;
                  return (
                    <Marker
                      key={loc.id}
                      position={[loc.latitude, loc.longitude]}
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
                          <span className="text-primary cursor-pointer font-semibold hover:underline">
                            Click marker to add stop
                          </span>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
            </MapContainer>

            <div className="absolute top-4 right-4 bg-background/90 backdrop-blur p-2 rounded-md shadow text-xs z-[400] border">
              Click on markers to add them to the schedule
            </div>
          </CardContent>
        </Card>
      </div>

      {/* DIALOG ADD STOP */}
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
