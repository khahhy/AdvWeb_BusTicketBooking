import { useState } from "react";
import {
  Eye,
  Wifi,
  Tv,
  Coffee,
  Droplets,
  Bath,
  ShirtIcon,
  Zap,
  Snowflake,
  Trash2,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  useGetBusesQuery,
  useDeleteBusMutation,
  useCreateBusMutation,
  useUpdateBusMutation,
} from "@/store/api/busApi";
import { useGetBusAmenitiesQuery } from "@/store/api/settingApi";
import { useGetTripsQuery } from "@/store/api/tripsApi";
import { BusType, Bus, BusAmenities } from "@/store/type/busType";
import { Trip } from "@/store/type/tripsType";
import BusLayoutVisualization from "@/components/admin/BusLayoutVisualization";
import SeatLayoutPreview from "@/components/admin/SeatLayoutPreview";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BusDetailsDrawer } from "@/components/admin";

const BusManagement = () => {
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [plate, setPlate] = useState("");
  const [selectedBusType, setSelectedBusType] = useState<BusType>(
    BusType.STANDARD,
  );
  const [selectedAmenities, setSelectedAmenities] = useState<
    Record<string, boolean>
  >({});

  const [editingPlate, setEditingPlate] = useState("");
  const [editingAmenities, setEditingAmenities] = useState<string[]>([]);

  const { data: buses = [], isLoading, error, refetch } = useGetBusesQuery();
  const { data: settingsAmenitiesData } = useGetBusAmenitiesQuery();
  const availableAmenities = settingsAmenitiesData?.amenities || [];

  const { data: relatedTrips = [] } = useGetTripsQuery(
    { busId: selectedBus?.id },
    { skip: !selectedBus?.id },
  );

  const [deleteBus] = useDeleteBusMutation();
  const [createBus] = useCreateBusMutation();
  const [updateBus] = useUpdateBusMutation();

  const convertAmenitiesObjToArray = (amenitiesObj: BusAmenities): string[] => {
    return Object.entries(amenitiesObj)
      .filter(([, enabled]) => enabled)
      .map(([key]) => key);
  };

  const convertAmenitiesArrayToObj = (amenitiesArr: string[]): BusAmenities => {
    const result: Record<string, boolean> = {};
    availableAmenities.forEach((key) => {
      result[key] = false;
    });
    amenitiesArr.forEach((key) => {
      result[key] = true;
    });
    return result as unknown as BusAmenities;
  };

  const handleDeleteBus = async (busId: string) => {
    if (window.confirm("Are you sure you want to delete this bus?")) {
      try {
        await deleteBus(busId).unwrap();
        refetch();
      } catch (error) {
        console.error("Failed to delete bus:", error);
      }
    }
  };

  const handleOpenCreate = () => {
    setPlate("");
    setSelectedBusType(BusType.STANDARD);

    const initialAmenities: Record<string, boolean> = {};
    availableAmenities.forEach((item) => {
      initialAmenities[item] = false;
    });
    setSelectedAmenities(initialAmenities);
    setIsCreateOpen(true);
  };

  const handleCreateBus = async () => {
    if (!plate.trim()) {
      alert("Please enter a license plate");
      return;
    }

    try {
      await createBus({
        plate: plate.trim(),
        busType: selectedBusType,
        amenities: selectedAmenities as unknown as BusAmenities,
      }).unwrap();

      setIsCreateOpen(false);
      refetch();
    } catch (error) {
      console.error("Failed to create bus:", error);
      alert("Failed to create bus. Please try again.");
    }
  };

  const handleAmenityToggle = (amenity: string) => {
    setSelectedAmenities((prev) => ({
      ...prev,
      [amenity]: !prev[amenity],
    }));
  };

  const handleViewDetails = (bus: Bus) => {
    setSelectedBus(bus);
    setEditingPlate(bus.plate);
    setEditingAmenities(convertAmenitiesObjToArray(bus.amenities));
    setIsSheetOpen(true);
  };

  const handleDrawerAmenityChange = (id: string, checked: boolean) => {
    setEditingAmenities((prev) =>
      checked ? [...prev, id] : prev.filter((item) => item !== id),
    );
  };

  const handleDrawerSave = async () => {
    if (!selectedBus) return;
    try {
      await updateBus({
        id: selectedBus.id,
        plate: editingPlate,
        busType: selectedBus.busType,
        amenities: convertAmenitiesArrayToObj(editingAmenities),
      }).unwrap();

      setIsSheetOpen(false);
      refetch();
    } catch (err) {
      console.error("Failed to update bus", err);
    }
  };

  const getAmenityIcon = (amenityName: string, enabled: boolean) => {
    const iconClass = `w-4 h-4 ${enabled ? "text-green-600" : "text-gray-300"}`;
    const key = amenityName.toLowerCase().replace(/\s/g, "");

    if (key.includes("tv") || key.includes("lcd"))
      return <Tv className={iconClass} />;
    if (key.includes("wifi") || key.includes("internet"))
      return <Wifi className={iconClass} />;
    if (key.includes("snack") || key.includes("food"))
      return <Coffee className={iconClass} />;
    if (key.includes("water") || key.includes("drink"))
      return <Droplets className={iconClass} />;
    if (key.includes("toilet") || key.includes("wc"))
      return <Bath className={iconClass} />;
    if (key.includes("blanket") || key.includes("pillow"))
      return <ShirtIcon className={iconClass} />;
    if (key.includes("charger") || key.includes("usb") || key.includes("power"))
      return <Zap className={iconClass} />;
    if (key.includes("air") || key.includes("cool"))
      return <Snowflake className={iconClass} />;

    return <Star className={iconClass} />;
  };

  const getBusTypeColor = (busType: BusType) => {
    switch (busType) {
      case BusType.STANDARD:
        return "bg-blue-100 text-blue-800";
      case BusType.VIP:
        return "bg-purple-100 text-purple-800";
      case BusType.SLEEPER:
        return "bg-green-100 text-green-800";
      case BusType.LIMOUSINE:
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading)
    return <div className="flex justify-center py-8">Loading buses...</div>;
  if (error)
    return (
      <div className="text-red-500 text-center py-8">Error loading buses</div>
    );

  return (
    <div className="flex flex-1 flex-col gap-4 md:gap-8 md:p-2">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Bus Management</h2>
        </div>
        <Button onClick={handleOpenCreate} className="shadow-lg">
          Add New Bus
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-1">
          <BusLayoutVisualization />
        </div>

        <div className="lg:col-span-2 flex flex-col gap-4">
          <Card className="border shadow-sm">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-4">License Plate</TableHead>
                    <TableHead>Bus Type</TableHead>
                    <TableHead>Amenities</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {buses.map((bus) => (
                    <TableRow key={bus.id}>
                      <TableCell className="font-medium pl-4">
                        {bus.plate}
                      </TableCell>
                      <TableCell>
                        <Badge className={getBusTypeColor(bus.busType)}>
                          {bus.busType.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 flex-wrap">
                          {bus.amenities &&
                            Object.entries(bus.amenities).map(
                              ([amenity, enabled]) =>
                                enabled ? (
                                  <div key={amenity} title={amenity}>
                                    {getAmenityIcon(amenity, true)}
                                  </div>
                                ) : null,
                            )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(bus)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteBus(bus.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Bus Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Bus</DialogTitle>
          </DialogHeader>

          <div className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="plate">License Plate</Label>
              <Input
                id="plate"
                value={plate}
                onChange={(e) => setPlate(e.target.value)}
                placeholder="Enter license plate number"
              />
            </div>

            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="busType">Bus Type</Label>
                <Select
                  value={selectedBusType}
                  onValueChange={(value: BusType) => setSelectedBusType(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select bus type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={BusType.STANDARD}>
                      Standard (2-2)
                    </SelectItem>
                    <SelectItem value={BusType.VIP}>VIP (2-1)</SelectItem>
                    <SelectItem value={BusType.SLEEPER}>
                      Sleeper (1-1)
                    </SelectItem>
                    <SelectItem value={BusType.LIMOUSINE}>
                      Limousine (3-1)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedBusType && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Label className="mb-3 block">Layout Preview</Label>
                  <SeatLayoutPreview busType={selectedBusType} />
                </div>
              )}
            </div>

            <div className="grid gap-4">
              <Label>Amenities</Label>
              {availableAmenities.length === 0 ? (
                <p className="text-sm text-gray-500 italic">
                  No amenities configured in System Settings.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {availableAmenities.map((amenityName) => (
                    <div key={amenityName} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={amenityName}
                        checked={selectedAmenities[amenityName] || false}
                        onChange={() => handleAmenityToggle(amenityName)}
                        className="rounded"
                      />
                      <Label
                        htmlFor={amenityName}
                        className="flex items-center gap-2 cursor-pointer capitalize"
                      >
                        {getAmenityIcon(
                          amenityName,
                          selectedAmenities[amenityName] || false,
                        )}
                        {amenityName}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateBus}>Create Bus</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bus Details Drawer */}
      <BusDetailsDrawer
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        bus={selectedBus as Bus}
        plate={editingPlate}
        amenities={editingAmenities}
        setPlate={setEditingPlate}
        onAmenityChange={handleDrawerAmenityChange}
        relatedTrips={relatedTrips as Trip[]}
        onSave={handleDrawerSave}
      />
    </div>
  );
};

export default BusManagement;
