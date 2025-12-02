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
import { Dayjs } from "dayjs";
import { useGetTripsQuery } from "@/store/api/tripsApi";
import { TripStatus } from "@/store/type/tripsType";
import { useDebounce } from "@/hooks/useDebounce";

const TripManagement = () => {
  const navigate = useNavigate();
  const [date, setDate] = useState<Dayjs | undefined>(undefined);
  const [search] = useState("");
  const [statusFilter] = useState<string>("all");

  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const debouncedSearch = useDebounce(search, 500);

  const { data: trips = [], isLoading } = useGetTripsQuery({
    startTime: date ? date.toISOString() : undefined,
    status: statusFilter !== "all" ? (statusFilter as TripStatus) : undefined,
  });

  const handleCreateTrip = () => {
    navigate("/admin/bus-operations/trips/new");
  };

  const handleViewDetails = (tripId: string) => {
    setSelectedTripId(tripId);
    setIsDrawerOpen(true);
  };

  const handleEditTrip = (id: string) => {
    navigate(`/admin/bus-operations/trips/edit/${id}`);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "scheduled":
        return "default";
      case "ongoing":
        return "secondary";
      case "completed":
        return "outline";
      case "cancelled":
        return "destructive";
      default:
        return "default";
    }
  };

  const filteredTrips = trips.filter(
    (t) =>
      t.tripName?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      t.bus?.plate.toLowerCase().includes(debouncedSearch.toLowerCase()),
  );

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
                    {date ? (
                      date.format("DD/MM/YYYY")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    value={date}
                    onChange={(val) => setDate(val || undefined)}
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
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-24">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filteredTrips.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-24">
                      No trips found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTrips.map((trip) => (
                    <TableRow
                      key={trip.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleViewDetails(trip.id)}
                    >
                      <TableCell className="font-medium">
                        {trip.tripName}
                      </TableCell>

                      <TableCell>{trip.bus?.plate || "N/A"}</TableCell>
                      <TableCell>
                        {format(new Date(trip.startTime), "dd/MM/yy HH:mm")}
                      </TableCell>
                      <TableCell>
                        {format(new Date(trip.endTime), "dd/MM/yy HH:mm")}
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
                            handleViewDetails(trip.id);
                          }}
                        >
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <TripDetailsDrawer
            open={isDrawerOpen}
            onOpenChange={setIsDrawerOpen}
            tripId={selectedTripId}
            onEdit={handleEditTrip}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default TripManagement;
