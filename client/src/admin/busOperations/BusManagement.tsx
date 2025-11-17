import { useState, useEffect } from "react";
import { Bus, Plus, Eye, Wifi, Plug } from "lucide-react";
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

const allPossibleAmenities = [
  { id: "wifi", label: "Wifi" },
  { id: "charging", label: "Cổng sạc USB" },
  { id: "wc", label: "WC (Nhà vệ sinh)" },
  { id: "blanket", label: "Chăn đắp" },
  { id: "water", label: "Nước uống" },
  { id: "cold_towel", label: "Khăn lạnh" },
];

type Bus = {
  id: string;
  name: string;
  licensePlate: string;
  status: "Active" | "Maintenance";
  amenities: string[];
};

type RelatedTrip = {
  id: string;
  routeName: string;
  departureTime: Date;
};

const mockBuses: Bus[] = [
  {
    id: "BUS-001",
    name: "Xe 01",
    licensePlate: "51B-123.45",
    status: "Active",
    amenities: ["wifi", "charging", "water", "cold_towel"],
  },
  {
    id: "BUS-002",
    name: "Xe 02",
    licensePlate: "29A-678.90",
    status: "Active",
    amenities: ["wifi", "charging", "wc", "blanket", "water", "cold_towel"],
  },
  {
    id: "BUS-003",
    name: "Xe 03",
    licensePlate: "30E-555.55",
    status: "Maintenance",
    amenities: ["wifi", "water"],
  },
];

const mockRelatedTrips: RelatedTrip[] = [
  {
    id: "TRIP-001",
    routeName: "Sài Gòn - Đà Lạt",
    departureTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
  },
  {
    id: "TRIP-002",
    routeName: "Sài Gòn - Đà Lạt",
    departureTime: new Date(Date.now() + 26 * 60 * 60 * 1000),
  },
];

const AmenitiesCheckboxes = ({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (amenityId: string, checked: boolean) => void;
}) => (
  <div className="grid grid-cols-2 gap-4 rounded-md border p-4">
    {allPossibleAmenities.map((amenity) => (
      <div key={amenity.id} className="flex items-center space-x-2">
        <Checkbox
          id={amenity.id}
          checked={selected.includes(amenity.id)}
          onCheckedChange={(checked) => onChange(amenity.id, !!checked)}
        />
        <label
          htmlFor={amenity.id}
          className="text-sm font-medium leading-none"
        >
          {amenity.label}
        </label>
      </div>
    ))}
  </div>
);

const BusManagement = () => {
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [editableName, setEditableName] = useState("");
  const [editableLicensePlate, setEditableLicensePlate] = useState("");
  const [editableAmenities, setEditableAmenities] = useState<string[]>([]);

  useEffect(() => {
    if (selectedBus) {
      setEditableName(selectedBus.name);
      setEditableLicensePlate(selectedBus.licensePlate);
      setEditableAmenities(selectedBus.amenities);
    }
  }, [selectedBus]);

  const handleViewClick = (bus: Bus) => {
    setSelectedBus(bus);
    setIsSheetOpen(true);
  };

  const handleOpenCreateModal = () => {
    setEditableName("");
    setEditableLicensePlate("");
    setEditableAmenities([]);
    setIsCreateModalOpen(true);
  };

  const handleAmenityChange = (amenityId: string, checked: boolean) => {
    setEditableAmenities((prev) => {
      if (checked) {
        return [...prev, amenityId];
      } else {
        return prev.filter((id) => id !== amenityId);
      }
    });
  };

  const handleSaveChanges = () => {
    if (!selectedBus) return;
    console.log("Saving changes...", {
      id: selectedBus.id,
      name: editableName,
      licensePlate: editableLicensePlate,
      amenities: editableAmenities,
    });
    setIsSheetOpen(false);
  };

  const handleCreateBus = () => {
    console.log("Creating new bus...", {
      name: editableName,
      licensePlate: editableLicensePlate,
      amenities: editableAmenities,
    });
    setIsCreateModalOpen(false);
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Bus Management</CardTitle>
            <CardDescription>
              Manage all 32-seat buses in your fleet.
            </CardDescription>
          </div>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleOpenCreateModal}>
                <Plus className="mr-2 h-4 w-4" /> Add New Bus
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Bus</DialogTitle>
                <DialogDescription>
                  All buses are 32-seat by default.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    placeholder="E.g., Xe 01, Xe 02..."
                    value={editableName}
                    onChange={(e) => setEditableName(e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="license" className="text-right">
                    License Plate
                  </Label>
                  <Input
                    id="license"
                    placeholder="E.g., 51B-123.45"
                    value={editableLicensePlate}
                    onChange={(e) => setEditableLicensePlate(e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="col-span-4">
                  <Label className="mb-2 block">Amenities</Label>
                  <AmenitiesCheckboxes
                    selected={editableAmenities}
                    onChange={handleAmenityChange}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={handleCreateBus}>
                  Create Bus
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {/* 3. Bảng Dữ Liệu */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>License Plate</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Amenities</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockBuses.map((bus) => (
                  <TableRow key={bus.id}>
                    <TableCell className="font-medium">{bus.name}</TableCell>
                    <TableCell>{bus.licensePlate}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          bus.status === "Active" ? "secondary" : "destructive"
                        }
                      >
                        {bus.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {bus.amenities.includes("wifi") && (
                          <Wifi className="h-4 w-4" title="Wifi" />
                        )}
                        {bus.amenities.includes("charging") && (
                          <Plug className="h-4 w-4" title="Cổng sạc" />
                        )}
                        {bus.amenities.length > 2 && (
                          <span className="text-xs text-muted-foreground">
                            +{bus.amenities.length - 2} more
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewClick(bus)}
                      >
                        <Eye className="mr-2 h-4 w-4" /> View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* 4. Sheet (Drawer) Chi Tiết */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Bus Details</SheetTitle>
            <SheetDescription>
              View, edit, and check associated trips.
            </SheetDescription>
          </SheetHeader>

          {selectedBus && (
            <Tabs defaultValue="details" className="mt-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">Details & Amenities</TabsTrigger>
                <TabsTrigger value="trips">Associated Trips</TabsTrigger>
              </TabsList>

              {/* Tab 1: Chi tiết & Tiện ích */}
              <TabsContent value="details">
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="edit-name"
                      value={editableName}
                      onChange={(e) => setEditableName(e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-license" className="text-right">
                      License
                    </Label>
                    <Input
                      id="edit-license"
                      value={editableLicensePlate}
                      onChange={(e) => setEditableLicensePlate(e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Status</Label>
                    <Badge
                      className="col-span-1 w-fit"
                      variant={
                        selectedBus.status === "Active"
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {selectedBus.status}
                    </Badge>
                  </div>
                  <div className="col-span-4">
                    <Label className="mb-2 block">Amenities</Label>
                    <AmenitiesCheckboxes
                      selected={editableAmenities}
                      onChange={handleAmenityChange}
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Tab 2: Các chuyến đi liên quan */}
              <TabsContent value="trips">
                <div className="mt-4 space-y-4">
                  {mockRelatedTrips.length > 0 ? (
                    mockRelatedTrips.map((trip) => (
                      <Card key={trip.id}>
                        <CardContent className="pt-4">
                          <p className="font-semibold">{trip.routeName}</p>
                          <p className="text-sm text-muted-foreground">
                            Departure: {trip.departureTime.toLocaleString()}
                          </p>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground">
                      No associated trips.
                    </p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}

          <SheetFooter className="mt-6">
            <SheetClose asChild>
              <Button variant="outline">Cancel</Button>
            </SheetClose>
            <Button onClick={handleSaveChanges}>Save Changes</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default BusManagement;
