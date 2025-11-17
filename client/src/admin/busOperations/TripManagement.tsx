import { useState } from "react";
import {
  Plus,
  Search,
  Calendar as CalendarIcon,
  MoreHorizontal,
  Eye,
  Edit,
  XCircle,
  Copy,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

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

const mockTripStopsView = {
  "T-001": [
    { name: "Bến xe Miền Đông", time: "08:00" },
    { name: "Trạm Dầu Giây", time: "09:30" },
    { name: "Bến xe Đà Lạt", time: "14:00" },
  ],
};
const mockRoutesView = {
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
  }
};

const TripManagement = () => {
  const navigate = useNavigate();
  const [date, setDate] = useState<Date | undefined>(new Date("2025-11-17"));
  const [isCancelAlertOpen, setIsCancelAlertOpen] = useState(false);

  const handleCreateTrip = () => {
    navigate("/admin/bus-operations/trips/new");
  };

  const handleEditTrip = (id: string) => {
    navigate(`/admin/bus-operations/trips/edit/${id}`);
  };

  const handleDuplicateTrip = (trip: Trip) => {
    navigate("/admin/bus-operations/trips/new", {
      state: { tripToDuplicate: trip },
    });
  };

  const handleCancelTrip = (id: string) => {
    console.log("Cancelling trip...", id);
    setIsCancelAlertOpen(false);
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Trip Management</CardTitle>
          <CardDescription>
            Manage all scheduled and past trips.
          </CardDescription>
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
                      !date && "text-muted-foreground"
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
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockTrips.map((trip) => (
                  <TableRow key={trip.id}>
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
                    <TableCell>
                      <Sheet>
                        <AlertDialog
                          open={isCancelAlertOpen}
                          onOpenChange={setIsCancelAlertOpen}
                        >
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>

                              <SheetTrigger asChild>
                                <DropdownMenuItem>
                                  <Eye className="mr-2 h-4 w-4" /> View Details
                                </DropdownMenuItem>
                              </SheetTrigger>

                              <DropdownMenuItem
                                onClick={() => handleEditTrip(trip.id)}
                              >
                                <Edit className="mr-2 h-4 w-4" /> Edit
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                onClick={() => handleDuplicateTrip(trip)}
                              >
                                <Copy className="mr-2 h-4 w-4" /> Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />

                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem className="text-destructive">
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Cancel Trip
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                            </DropdownMenuContent>
                          </DropdownMenu>

                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action will cancel the trip "
                                {trip.tripName}
                                ". This cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Close</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleCancelTrip(trip.id)}
                              >
                                Continue
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>

                        <SheetContent>
                          <SheetHeader>
                            <SheetTitle>
                              Trip Details: {trip.tripName}
                            </SheetTitle>
                          </SheetHeader>
                          <div className="grid gap-4 py-4">
                            <h4 className="font-semibold">Trip Stops</h4>

                            <ul className="list-disc pl-5">
                              {mockTripStopsView["T-001"].map((stop) => (
                                <li key={stop.name}>
                                  {stop.name} @ {stop.time}
                                </li>
                              ))}
                            </ul>
                            <h4 className="font-semibold">Commercial Routes</h4>
                            <ul className="list-disc pl-5">
                              {mockRoutesView["T-001"].map((r) => (
                                <li key={r.name}>
                                  {r.name} ({r.price} VNĐ)
                                </li>
                              ))}
                            </ul>
                          </div>
                        </SheetContent>
                      </Sheet>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TripManagement;
