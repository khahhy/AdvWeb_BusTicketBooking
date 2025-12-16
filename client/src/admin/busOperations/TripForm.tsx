import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Bus,
  MapPin,
  Check,
  GripVertical,
  Loader2,
  Pencil,
  Trash2,
  ArrowDownRight,
  ArrowUpRight,
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
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
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

import { useGetLocationsQuery } from "@/store/api/locationApi";
import { useGetBusesQuery } from "@/store/api/busApi";
import {
  useCreateTripMutation,
  useUpdateTripMutation,
  useGetTripByIdQuery,
} from "@/store/api/tripsApi";
import type { Location } from "@/store/type/locationsType";
import { toast } from "sonner";
import type { ApiError } from "@/store/type/apiError";

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

type TripStopState = {
  id: string;
  locationId: string;
  locationCity: string;
  locationName: string;
  locationAddress: string;
  arrivalTime: string;
  departureTime: string;
};

interface SortableItemProps {
  stop: TripStopState;
  onEdit: (stop: TripStopState) => void;
  onDelete: (id: string) => void;
}

const SortableTripStopItem = ({
  stop,
  onEdit,
  onDelete,
}: SortableItemProps) => {
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
      className="flex items-start gap-2 p-3 bg-card rounded-md border shadow-sm group hover:border-primary/50 transition-colors relative"
    >
      <div
        className="cursor-grab active:cursor-grabbing mt-1 p-1 hover:bg-muted rounded"
        {...listeners}
        {...attributes}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>

      <div className="flex-1 min-w-0 pr-14">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-semibold text-sm truncate">{stop.locationName}</p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          <div className="bg-muted/50 p-1.5 rounded">
            <ArrowDownRight className="h-3 w-3 text-green-600 shrink-0" />
            {stop.arrivalTime
              ? new Date(stop.arrivalTime).toLocaleTimeString([], {
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })
              : "--:--"}
          </div>
          <div className="bg-muted/50 p-1.5 rounded">
            <ArrowUpRight className="h-3 w-3 text-blue-600 shrink-0" />
            {stop.departureTime
              ? new Date(stop.departureTime).toLocaleTimeString([], {
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })
              : "--:--"}
          </div>
        </div>
      </div>

      <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 hover:text-blue-600"
          onClick={() => onEdit(stop)}
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 hover:text-red-600"
          onClick={() => onDelete(stop.id)}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
};

const TripForm = () => {
  const navigate = useNavigate();

  const { tripId } = useParams();
  const [searchParams] = useSearchParams();
  const duplicateFromId = searchParams.get("duplicateFrom");

  const isEditMode = !!tripId;
  const isDuplicateMode = !isEditMode && !!duplicateFromId;

  const [createTrip, { isLoading: isCreating }] = useCreateTripMutation();
  const [updateTrip, { isLoading: isUpdating }] = useUpdateTripMutation();

  const fetchId = isEditMode ? tripId : duplicateFromId;

  const { data: tripData, isLoading: isLoadingTripData } = useGetTripByIdQuery(
    fetchId || "",
    { skip: !fetchId },
  );

  const { data: locations = [], isLoading: isLoadingLocations } =
    useGetLocationsQuery();
  const { data: buses = [], isLoading: isLoadingBuses } = useGetBusesQuery();

  const [tripName, setTripName] = useState("");
  const [selectedBusId, setSelectedBusId] = useState<string>();
  const [tripStops, setTripStops] = useState<TripStopState[]>([]);

  const [initialTripStops, setInitialTripStops] = useState<TripStopState[]>([]);
  const [editingStopId, setEditingStopId] = useState<string | null>(null);

  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location>();
  const [tempArrivalTime, setTempArrivalTime] = useState("");
  const [tempDepartureTime, setTempDepartureTime] = useState("");

  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    if (tripData && (isEditMode || isDuplicateMode)) {
      if (tripData.tripStops) {
        const mappedStops: TripStopState[] = tripData.tripStops.map((stop) => ({
          id: isDuplicateMode ? `stop-${Math.random()}` : stop.id,
          locationId: stop.locationId,
          locationCity: stop.location?.city || "",
          locationName: stop.location?.name || "",
          locationAddress: stop.location?.address || "",

          arrivalTime: isDuplicateMode ? "" : stop.arrivalTime || "",
          departureTime: isDuplicateMode ? "" : stop.departureTime || "",
        }));

        setTripStops(mappedStops);

        if (isEditMode) {
          setInitialTripStops(mappedStops);
        }
      }

      if (isEditMode) {
        setTripName(tripData.tripName ?? "");
        setSelectedBusId(tripData.busId);
      } else if (isDuplicateMode) {
        setSelectedBusId(undefined);
      }
    }
  }, [tripData, isEditMode, isDuplicateMode]);

  useEffect(() => {
    if (tripStops.length >= 2) {
      const startNode = tripStops[0];
      const endNode = tripStops[tripStops.length - 1];
      const startName = startNode.locationCity || startNode.locationName;
      const endName = endNode.locationCity || endNode.locationName;

      setTripName(`${startName} - ${endName}`);
    } else if (tripStops.length === 1) {
      const startNode = tripStops[0];
      setTripName(`${startNode.locationCity || startNode.locationName}`);
    } else {
      setTripName("");
    }
  }, [tripStops]);

  const handleEditClick = (stop: TripStopState) => {
    setEditingStopId(stop.id);

    const locationObj = locations.find((l) => l.id === stop.locationId);
    setSelectedLocation(locationObj);

    setTempArrivalTime(stop.arrivalTime.slice(0, 16));
    setTempDepartureTime(stop.departureTime.slice(0, 16));

    setIsMapModalOpen(true);
  };

  const handleDeleteClick = (stopId: string) => {
    setTripStops((prev) => prev.filter((item) => item.id !== stopId));
    toast.success("Removed stop from route.");
  };

  const handleConfirmStop = () => {
    if (!tempArrivalTime || !tempDepartureTime) {
      toast.error("Please fill in both times.");
      return;
    }

    const arrivalISO = new Date(tempArrivalTime).toISOString();
    const departureISO = new Date(tempDepartureTime).toISOString();

    if (editingStopId) {
      setTripStops((prev) =>
        prev.map((stop) =>
          stop.id === editingStopId
            ? { ...stop, arrivalTime: arrivalISO, departureTime: departureISO }
            : stop,
        ),
      );
      toast.success("Updated stop time.");
    } else {
      if (!selectedLocation) return;
      setTripStops((prev) => [
        ...prev,
        {
          id: `stop-${Date.now()}`,
          locationId: selectedLocation.id,
          locationName: selectedLocation.name,
          locationCity: selectedLocation.city || "",
          locationAddress: selectedLocation.address || "",
          arrivalTime: arrivalISO,
          departureTime: departureISO,
        },
      ]);
    }

    setEditingStopId(null);
    setIsMapModalOpen(false);
  };

  const handleMapMarkerClick = (location: Location) => {
    setEditingStopId(null);
    setSelectedLocation(location);

    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    const localIsoString = now.toISOString().slice(0, 16);

    setTempArrivalTime(localIsoString);
    setTempDepartureTime(localIsoString);
    setIsMapModalOpen(true);
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

  const handleSaveTrip = async () => {
    if (!selectedBusId || tripStops.length < 2) {
      toast.error("Please select a bus and at least 2 stops.");
      return;
    }

    const payload = {
      busId: selectedBusId,
      stops: tripStops.map((s) => ({
        locationId: s.locationId,
        arrivalTime: s.arrivalTime || s.departureTime,
        departureTime: s.departureTime || s.arrivalTime,
      })),
    };

    try {
      if (isEditMode && tripId) {
        await updateTrip({ id: tripId, ...payload }).unwrap();
        toast.success("Trip updated successfully!");
      } else {
        await createTrip(payload).unwrap();
        toast.success("Trip created successfully!");
      }
      navigate("/admin/bus-operations/trips");
    } catch (error) {
      const err = error as ApiError;
      console.error("Operation failed:", err?.data?.message);
      const errorMessage = err?.data?.message || "Operation failed.";
      if (Array.isArray(errorMessage)) {
        toast.error(errorMessage.join("\n"));
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const handleArrivalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newArrivalValue = e.target.value;
    setTempArrivalTime(newArrivalValue);
    if (newArrivalValue) {
      const arrivalDate = new Date(newArrivalValue);

      const departureDate = new Date(arrivalDate.getTime() + 10 * 60000);

      const tzOffset = departureDate.getTimezoneOffset() * 60000;
      const localDepartureDate = new Date(departureDate.getTime() - tzOffset);

      const departureString = localDepartureDate.toISOString().slice(0, 16);

      setTempDepartureTime(departureString);
    }
  };

  const isStep1Done = !!tripName && !!selectedBusId;
  const isStep2Done = tripStops.length >= 2;
  const defaultCenter = [10.7769, 106.7009]; // TP.HCM
  const isSubmitting = isCreating || isUpdating;

  const hasChanges = isEditMode
    ? selectedBusId !== tripData?.busId ||
      JSON.stringify(tripStops) !== JSON.stringify(initialTripStops)
    : true;

  if (isEditMode && isLoadingTripData) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">
          Loading trip configuration...
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col p-2 h-screen overflow-hidden">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {isEditMode ? "Edit Trip Configuration" : "Create New Trip"}
            </h1>
          </div>
        </div>
        <Button
          onClick={handleSaveTrip}
          disabled={
            !isStep1Done ||
            !isStep2Done ||
            isSubmitting ||
            (isEditMode && !hasChanges)
          }
          className={isEditMode && !hasChanges ? "opacity-70" : ""}
        >
          {isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Check className="mr-2 h-4 w-4" />
          )}
          {isSubmitting
            ? isEditMode
              ? "Updating..."
              : "Saving..."
            : isEditMode
              ? "Update Changes"
              : "Save & Activate"}
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-3 h-full overflow-hidden">
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

              {!isLoadingLocations &&
                locations.map((loc) => {
                  if (!loc.latitude || !loc.longitude) return null;
                  return (
                    <Marker
                      key={loc.id}
                      position={[loc.latitude, loc.longitude]}
                      eventHandlers={{
                        click: () => handleMapMarkerClick(loc),
                        mouseover: (event) => event.target.openPopup(),
                        mouseout: (event) => event.target.closePopup(),
                      }}
                    >
                      <Popup closeButton={false} offset={[0, -30]}>
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

            <div className="absolute top-4 right-4 bg-background/90 backdrop-blur p-2 rounded-md shadow text-xs border">
              Click on markers to add them to the schedule
            </div>
          </CardContent>
        </Card>
        <div className="md:col-span-1 flex flex-col gap-3 overflow-y-auto">
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
                      <SortableTripStopItem
                        key={stop.id}
                        stop={stop}
                        onEdit={handleEditClick}
                        onDelete={handleDeleteClick}
                      />
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
                        {bus.plate} ({bus.busType})
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
        </div>
      </div>

      <Dialog open={isMapModalOpen} onOpenChange={setIsMapModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Stop: {selectedLocation?.name}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="arrival" className="text-left">
                Arrival
              </Label>
              <Input
                id="arrival"
                type="datetime-local"
                value={tempArrivalTime}
                onChange={handleArrivalChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="departure" className="text-left">
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
            <Button onClick={handleConfirmStop}>
              {editingStopId ? "Update Stop" : "Add to Route"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TripForm;
