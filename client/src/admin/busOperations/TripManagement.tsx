import { useState } from "react";
import { Plus, Search, Calendar as CalendarIcon, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { TripDetailsDrawer } from "@/components/admin";

type TripStatus = "Scheduled" | "Ongoing" | "Completed" | "Cancelled";

type Trip = {
  id: string;
  tripName: string;
  busId: string;
  busLicensePlate: string;
  startTime: Date;
  endTime: Date;
  status: TripStatus;
};

const mockTripStopsView: any = {
  "T-001": [
    { name: "Bến xe Miền Đông", time: "08:00" },
    { name: "Trạm Dầu Giây", time: "09:30" },
    { name: "Bến xe Đà Lạt", time: "14:00" },
  ],
};
const mockRoutesView: any = {
  "T-001": [{ name: "Sài Gòn - Đà Lạt", price: "350,000" }],
};

const mockTrips: Trip[] = [
  {
    id: "T-001",
    tripName: "SGN-DAL 08:00 17/11",
    busId: "BUS-001",
    busLicensePlate: "51B-123.45",
    startTime: new Date("2025-11-17T08:00:00Z"),
    endTime: new Date("2025-11-17T14:00:00Z"),
    status: "Scheduled",
  },
  {
    id: "T-002",
    tripName: "SGN-DAL 13:00 17/11",
    busId: "BUS-002",
    busLicensePlate: "29A-678.90",
    startTime: new Date("2025-11-17T13:00:00Z"),
    endTime: new Date("2025-11-17T19:00:00Z"),
    status: "Scheduled",
  },
  {
    id: "T-003",
    tripName: "SGN-DAN 10:00 16/11",
    busId: "BUS-001",
    busLicensePlate: "51B-123.45",
    startTime: new Date("2025-11-16T10:00:00Z"),
    endTime: new Date("2025-11-17T02:00:00Z"),
    status: "Completed",
  },
  {
    id: "T-004",
    tripName: "SGN-DAL 22:00 16/11",
    busId: "BUS-003",
    busLicensePlate: "30E-555.55",
    startTime: new Date("2025-11-16T22:00:00Z"),
    endTime: new Date("2025-11-17T04:00:00Z"),
    status: "Cancelled",
  },
];

const getStatusBadgeVariant = (status: TripStatus) => {
  switch (status) {
    case "Scheduled":
      return "default";
    case "Ongoing":
      return "secondary";
    case "Completed":
      return "outline";
    case "Cancelled":
      return "destructive";
    default:
      return "default";
  }
};

const TripManagement = () => {
  const navigate = useNavigate();
  const [date, setDate] = useState<Date | undefined>(new Date("2025-11-17"));

  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleCreateTrip = () => {
    navigate("/admin/bus-operations/trips/new");
  };

  const handleViewDetails = (trip: Trip) => {
    setSelectedTrip(trip);
    setIsDrawerOpen(true);
  };

  const handleEditTrip = (id: string) => {
    console.log("Navigating to edit:", id);
    navigate(`/admin/bus-operations/trips/edit/${id}`);
  };

  const handleCancelTrip = (id: string) => {
    console.log("Logic cancel trip:", id);
    setIsDrawerOpen(false);
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-2 md:p-2 border-0 shadow-none">
      <Card className="border-0 shadow-none">
        <CardHeader>
          <CardTitle>Trip Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
            <div className="flex flex-col md:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or license plate..."
                  className="pl-8 w-full md:w-64"
                />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Scheduled">Scheduled</SelectItem>
                  <SelectItem value="Ongoing">Ongoing</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full md:w-60 justify-start text-left font-normal",
                      !date && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    autoFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <Button onClick={handleCreateTrip}>
              <Plus className="mr-2 h-4 w-4" /> Create New Trip
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Trip Name</TableHead>
                  <TableHead>Bus</TableHead>
                  <TableHead>Start Time</TableHead>
                  <TableHead>End Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[80px] text-center">View</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockTrips.map((trip) => (
                  <TableRow
                    key={trip.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleViewDetails(trip)}
                  >
                    <TableCell className="font-medium">
                      {trip.tripName}
                    </TableCell>
                    <TableCell>{trip.busLicensePlate}</TableCell>
                    <TableCell>
                      {format(trip.startTime, "dd/MM/yy HH:mm")}
                    </TableCell>
                    <TableCell>
                      {format(trip.endTime, "dd/MM/yy HH:mm")}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(trip.status)}>
                        {trip.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(trip);
                        }}
                      >
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <TripDetailsDrawer
            open={isDrawerOpen}
            onOpenChange={setIsDrawerOpen}
            trip={selectedTrip}
            stops={selectedTrip ? mockTripStopsView[selectedTrip.id] : []}
            routes={selectedTrip ? mockRoutesView[selectedTrip.id] : []}
            onEdit={handleEditTrip}
            onCancel={handleCancelTrip}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default TripManagement;
