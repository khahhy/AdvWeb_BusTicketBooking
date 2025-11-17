import { useState } from "react";
import {
  Calendar as CalendarIcon,
  Plus,
  Eye,
  Settings,
  Route,
  Clock,
  Bus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

type RouteDefinition = {
  id: string;
  name: string;
  startLocationId: string;
  endLocationId: string;
  durationHours: number;
};

type Trip = {
  id: string;
  routeId: string;
  busId: string;
  busName: string;
  departureTime: Date;
  seatsAvailable: number;
  price: number;
};

const mockRouteDefinitions: RouteDefinition[] = [
  {
    id: "R-001",
    name: "Sài Gòn - Đà Lạt",
    startLocationId: "LOC-001",
    endLocationId: "LOC-002",
    durationHours: 6,
  },
  {
    id: "R-002",
    name: "Sài Gòn - Đà Nẵng",
    startLocationId: "LOC-001",
    endLocationId: "LOC-003",
    durationHours: 16,
  },
  {
    id: "R-003",
    name: "Đà Nẵng - Sài Gòn",
    startLocationId: "LOC-003",
    endLocationId: "LOC-001",
    durationHours: 16,
  },
];

const today = new Date("2025-11-17T00:00:00Z");
const mockTrips: Trip[] = [
  {
    id: "T-001",
    routeId: "R-001",
    busId: "BUS-001",
    busName: "Xe 01",
    departureTime: new Date(today.setHours(8, 0, 0)),
    seatsAvailable: 20,
    price: 350000,
  },
  {
    id: "T-002",
    routeId: "R-001",
    busId: "BUS-002",
    busName: "Xe 02",
    departureTime: new Date(today.setHours(13, 0, 0)),
    seatsAvailable: 10,
    price: 350000,
  },
  {
    id: "T-003",
    routeId: "R-001",
    busId: "BUS-003",
    busName: "Xe 03",
    departureTime: new Date(today.setHours(22, 0, 0)),
    seatsAvailable: 32,
    price: 350000,
  },
  {
    id: "T-004",
    routeId: "R-002",
    busId: "BUS-001",
    busName: "Xe 01",
    departureTime: new Date(today.setHours(10, 0, 0)),
    seatsAvailable: 5,
    price: 900000,
  },
];

function TripCard({ trip }: { trip: Trip }) {
  return (
    <Card className="mb-4 hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            <span className="text-lg font-bold">
              {format(trip.departureTime, "HH:mm")}
            </span>
          </div>
          <Badge variant="outline">{trip.seatsAvailable} seats</Badge>
        </div>
        <div className="text-sm text-muted-foreground">
          <p className="flex items-center gap-2">
            <Bus className="h-4 w-4" /> {trip.busName}
          </p>
          <p className="mt-1">{trip.price.toLocaleString("vi-VN")} VNĐ</p>
        </div>
      </CardContent>
    </Card>
  );
}

function RouteDefinitionsSheet() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">
          <Settings className="mr-2 h-4 w-4" /> Manage Route Definitions
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>Route Definitions</SheetTitle>
          <SheetDescription>
            Manage the route templates (e.g., Sài Gòn - Đà Lạt).
          </SheetDescription>
        </SheetHeader>
        <div className="my-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Create New Route
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Route</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Input
                  id="name"
                  placeholder="Route Name (e.g. Sài Gòn - Đà Lạt)"
                />
                <Input id="startLoc" placeholder="Start Location ID" />
                <Input id="endLoc" placeholder="End Location ID" />
                <Input
                  id="duration"
                  type="number"
                  placeholder="Duration (hours)"
                />
              </div>
              <Button>Create</Button>
            </DialogContent>
          </Dialog>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockRouteDefinitions.map((route) => (
                <TableRow key={route.id}>
                  <TableCell>{route.name}</TableCell>
                  <TableCell>{route.durationHours}h</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <SheetFooter className="mt-4">
          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

const RouteManagement = () => {
  const [date, setDate] = useState<Date | undefined>(today);

  const dailyTrips = mockTrips.filter(
    (trip) =>
      format(trip.departureTime, "yyyy-MM-dd") ===
      format(date || new Date(), "yyyy-MM-dd")
  );

  return (
    <div className="flex flex-1 flex-col p-4 md:p-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">Daily Trip Schedule</h1>
          <p className="text-muted-foreground">
            Visual timeline of all trips for the selected day.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[280px] justify-start text-left font-normal",
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
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <RouteDefinitionsSheet />
        </div>
      </div>

      <div className="flex flex-1 gap-4 overflow-x-auto pb-4">
        {mockRouteDefinitions.map((routeDef) => {
          const tripsForThisRoute = dailyTrips
            .filter((trip) => trip.routeId === routeDef.id)
            .sort(
              (a, b) => a.departureTime.getTime() - b.departureTime.getTime()
            );

          return (
            <div key={routeDef.id} className="w-80 flex-shrink-0">
              <Card className="flex flex-col h-full bg-muted/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Route className="h-5 w-5" />
                    {routeDef.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto px-4">
                  {tripsForThisRoute.length > 0 ? (
                    tripsForThisRoute.map((trip) => (
                      <TripCard key={trip.id} trip={trip} />
                    ))
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-sm text-muted-foreground">
                        No trips for this route today.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RouteManagement;
