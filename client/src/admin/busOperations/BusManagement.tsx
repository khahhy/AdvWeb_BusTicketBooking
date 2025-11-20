import { useState, useEffect } from "react";
import { Bus, Eye, Wifi, Plug, Armchair, User } from "lucide-react";
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
import { AddBusDialog, BusDetailsDrawer } from "@/components/admin";

const amenities = [
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

const SeatMap = () => {
  const rows = Array.from({ length: 8 }, (_, i) => i + 1);

  return (
    <div className="bg-gray-100 p-3 rounded-xl border-2 border-gray-300 w-full max-w-[300px] mx-auto relative">
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gray-300 w-24 h-4 rounded-b-lg text-[10px] text-center text-gray-600 font-bold uppercase tracking-wider">
        FRONT
      </div>

      <div className="flex justify-between items-end mb-2 mt-2 border-b-2 border-dashed border-gray-300 pb-2">
        <div className="flex flex-col items-center gap-1">
          <div className="p-2 bg-slate-800 rounded-lg text-white shadow-sm">
            <User size={24} />
          </div>
          <span className="text-xs font-bold text-slate-700">Driver</span>
        </div>
        <div className="text-xs text-gray-400 italic pr-2">Entry Door</div>
      </div>

      <div className="grid grid-cols-5 gap-y-2 gap-x-1">
        <div className="text-center text-xs font-medium text-gray-400 mb-1">
          A
        </div>
        <div className="text-center text-xs font-medium text-gray-400 mb-1">
          B
        </div>
        <div className="w-4"></div>
        <div className="text-center text-xs font-medium text-gray-400 mb-1">
          C
        </div>
        <div className="text-center text-xs font-medium text-gray-400 mb-1">
          D
        </div>
        {rows.map((row) => (
          <>
            <div className="flex justify-center">
              <SeatIcon label={`A${row}`} />
            </div>
            <div className="flex justify-center">
              <SeatIcon label={`B${row}`} />
            </div>
            <div className="flex justify-center items-center">
              <span className="text-[10px] text-gray-300 font-mono">{row}</span>
            </div>
            <div className="flex justify-center">
              <SeatIcon label={`C${row}`} />
            </div>
            <div className="flex justify-center">
              <SeatIcon label={`D${row}`} />
            </div>
          </>
        ))}
      </div>
      <div className="mt-6 flex justify-center">
        <div className="h-2 w-32 bg-gray-300 rounded-full"></div>
      </div>
    </div>
  );
};

const SeatIcon = ({ label }: { label: string }) => (
  <div
    className="group flex flex-col items-center gap-0.5 cursor-pointer hover:scale-105 transition-transform"
    title={`Ghế ${label}`}
  >
    <div className="p-1.5 bg-white border border-blue-200 rounded-md shadow-sm text-blue-500 group-hover:bg-blue-50 group-hover:border-blue-400 transition-colors">
      <Armchair size={18} strokeWidth={2.5} />
    </div>
    <span className="text-[10px] font-medium text-gray-500 group-hover:text-blue-600">
      {label}
    </span>
  </div>
);

const BusManagement = () => {
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [name, setName] = useState("");
  const [plate, setPlate] = useState("");
  const [currentAmenities, setCurrentAmenities] = useState<string[]>([]);

  useEffect(() => {
    if (selectedBus) {
      setName(selectedBus.name);
      setPlate(selectedBus.licensePlate);
      setCurrentAmenities(selectedBus.amenities);
    }
  }, [selectedBus]);

  function handleAmenityChange(id: string, checked: boolean) {
    setCurrentAmenities((prev) =>
      checked ? [...prev, id] : prev.filter((x) => x !== id)
    );
  }

  function handleOpenCreate() {
    setName("");
    setPlate("");
    setCurrentAmenities([]);
    setIsCreateOpen(true);
  }

  return (
    <div className="flex flex-1 flex-col gap-4 md:gap-8 md:p-2">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <Card className="lg:col-span-1 border-0 shadow-none h-full">
          <CardContent className="flex justify-center pb-8">
            <SeatMap />
          </CardContent>
        </Card>

        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                Bus Management
              </h2>
            </div>
            <Button onClick={handleOpenCreate} className="shadow-lg">
              Add New Bus
            </Button>
          </div>
          <Card className="lg:col-span-2 border shadow-sm">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-4">Name</TableHead>
                    <TableHead>License Plate</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Amenities</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockBuses.map((bus) => (
                    <TableRow key={bus.id}>
                      <TableCell className="font-medium pl-4">
                        {bus.name}
                      </TableCell>
                      <TableCell>{bus.licensePlate}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            bus.status === "Active"
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {bus.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {bus.amenities.includes("wifi") && (
                            <Wifi
                              className="h-4 w-4 text-blue-500"
                              title="Wifi"
                            />
                          )}
                          {bus.amenities.includes("charging") && (
                            <Plug
                              className="h-4 w-4 text-green-500"
                              title="Cổng sạc"
                            />
                          )}
                          {bus.amenities.length > 2 && (
                            <span className="text-xs text-muted-foreground bg-slate-100 px-1.5 py-0.5 rounded">
                              +{bus.amenities.length - 2}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedBus(bus);
                            setIsSheetOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" /> Chi tiết
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <AddBusDialog
          open={isCreateOpen}
          onOpenChange={setIsCreateOpen}
          name={name}
          plate={plate}
          amenities={currentAmenities}
          setName={setName}
          setPlate={setPlate}
          onAmenityChange={handleAmenityChange}
          onCreate={() => setIsCreateOpen(false)}
        />

        <BusDetailsDrawer
          open={isSheetOpen}
          onOpenChange={setIsSheetOpen}
          bus={selectedBus}
          name={name}
          plate={plate}
          amenities={currentAmenities}
          setName={setName}
          setPlate={setPlate}
          onAmenityChange={handleAmenityChange}
          relatedTrips={mockRelatedTrips}
          onSave={() => setIsSheetOpen(false)}
        />
      </div>
    </div>
  );
};

export default BusManagement;
