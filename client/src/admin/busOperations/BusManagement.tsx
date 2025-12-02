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
  BusType,
  SeatCapacity,
  BusAmenities,
} from "@/store/api/busApi";
import BusLayoutVisualization from "@/components/admin/BusLayoutVisualization";
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
// import BusDetailsDrawer from "@/components/admin/BusDetailsDrawer/BusDetailsDrawer";

// Bus type definitions and layout configurations are now in busApi.ts

const BusManagement = () => {
  // const [selectedBus, setSelectedBus] = useState<Bus | null>(null);
  // const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [plate, setPlate] = useState("");
  const [selectedBusType, setSelectedBusType] = useState<BusType>(
    BusType.STANDARD,
  );
  const [selectedSeatCapacity, setSelectedSeatCapacity] =
    useState<SeatCapacity>(SeatCapacity.SEAT_16);
  const [selectedAmenities, setSelectedAmenities] = useState<BusAmenities>({
    tv: false,
    wifi: false,
    snack: false,
    water: false,
    toilet: false,
    blanket: false,
    charger: false,
    airCondition: false,
  });

  const { data: buses = [], isLoading, error, refetch } = useGetBusesQuery();
  const [deleteBus] = useDeleteBusMutation();
  const [createBus] = useCreateBusMutation();

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

  // const handleViewDetails = (bus: Bus) => {
  //   setSelectedBus(bus);
  //   setIsSheetOpen(true);
  // };

  const getAmenityIcon = (amenity: keyof BusAmenities, enabled: boolean) => {
    const iconClass = `w-4 h-4 ${enabled ? "text-green-600" : "text-gray-300"}`;

    switch (amenity) {
      case "tv":
        return <Tv className={iconClass} />;
      case "wifi":
        return <Wifi className={iconClass} />;
      case "snack":
        return <Coffee className={iconClass} />;
      case "water":
        return <Droplets className={iconClass} />;
      case "toilet":
        return <Bath className={iconClass} />;
      case "blanket":
        return <ShirtIcon className={iconClass} />;
      case "charger":
        return <Zap className={iconClass} />;
      case "airCondition":
        return <Snowflake className={iconClass} />;
      default:
        return null;
    }
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

  function handleOpenCreate() {
    setPlate("");
    setSelectedBusType(BusType.STANDARD);
    setSelectedSeatCapacity(SeatCapacity.SEAT_16);
    setSelectedAmenities({
      tv: false,
      wifi: false,
      snack: false,
      water: false,
      toilet: false,
      blanket: false,
      charger: false,
      airCondition: false,
    });
    setIsCreateOpen(true);
  }

  const handleCreateBus = async () => {
    if (!plate.trim()) {
      alert("Please enter a license plate");
      return;
    }

    try {
      await createBus({
        plate: plate.trim(),
        busType: selectedBusType,
        seatCapacity: selectedSeatCapacity,
        amenities: selectedAmenities,
      }).unwrap();

      setIsCreateOpen(false);
      refetch();
    } catch (error) {
      console.error("Failed to create bus:", error);
      alert("Failed to create bus. Please try again.");
    }
  };

  const handleAmenityToggle = (amenity: keyof BusAmenities) => {
    setSelectedAmenities((prev) => ({
      ...prev,
      [amenity]: !prev[amenity],
    }));
  };

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
        {/* Left side - Interactive Bus Layout Visualization */}
        <div className="lg:col-span-1">
          <BusLayoutVisualization />
        </div>

        {/* Right side - Bus Table */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <Card className="border shadow-sm">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-4">License Plate</TableHead>
                    <TableHead>Bus Type</TableHead>
                    <TableHead>Capacity</TableHead>
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
                        {bus.seatCapacity.replace("SEAT_", "")}{" "}
                        {bus.busType === BusType.SLEEPER ? "beds" : "seats"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 flex-wrap">
                          {Object.entries(bus.amenities).map(
                            ([amenity, enabled]) =>
                              getAmenityIcon(
                                amenity as keyof BusAmenities,
                                enabled,
                              ),
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => console.log("View details:", bus)}
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

            <div className="grid grid-cols-2 gap-4">
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
                      <div className="flex items-center gap-2">
                        <Badge className="bg-blue-100 text-blue-800">
                          Standard
                        </Badge>
                        <span className="text-sm text-gray-600">
                          2-2 Layout
                        </span>
                      </div>
                    </SelectItem>
                    <SelectItem value={BusType.VIP}>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-purple-100 text-purple-800">
                          VIP
                        </Badge>
                        <span className="text-sm text-gray-600">
                          2-1 Layout
                        </span>
                      </div>
                    </SelectItem>
                    <SelectItem value={BusType.SLEEPER}>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-100 text-green-800">
                          Sleeper
                        </Badge>
                        <span className="text-sm text-gray-600">
                          1-1 Layout
                        </span>
                      </div>
                    </SelectItem>
                    <SelectItem value={BusType.LIMOUSINE}>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-yellow-100 text-yellow-800">
                          Limousine
                        </Badge>
                        <span className="text-sm text-gray-600">
                          1-2-1 Layout
                        </span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="seatCapacity">Seat Capacity</Label>
                <Select
                  value={selectedSeatCapacity}
                  onValueChange={(value: SeatCapacity) =>
                    setSelectedSeatCapacity(value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select capacity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={SeatCapacity.SEAT_16}>
                      <Badge variant="outline">16 seats</Badge>
                    </SelectItem>
                    <SelectItem value={SeatCapacity.SEAT_28}>
                      <Badge variant="outline">28 seats</Badge>
                    </SelectItem>
                    <SelectItem value={SeatCapacity.SEAT_32}>
                      <Badge variant="outline">32 seats</Badge>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4">
              <Label>Amenities</Label>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(selectedAmenities).map(([amenity, enabled]) => (
                  <div key={amenity} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={amenity}
                      checked={enabled}
                      onChange={() =>
                        handleAmenityToggle(amenity as keyof BusAmenities)
                      }
                      className="rounded"
                    />
                    <Label
                      htmlFor={amenity}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      {getAmenityIcon(amenity as keyof BusAmenities, enabled)}
                      {amenity.charAt(0).toUpperCase() + amenity.slice(1)}
                    </Label>
                  </div>
                ))}
              </div>
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
    </div>
  );
};

export default BusManagement;
