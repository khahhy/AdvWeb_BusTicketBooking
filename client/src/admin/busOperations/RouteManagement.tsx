import { useState, useMemo } from "react";
import {
  Plus,
  ArrowRight,
  Save,
  Clock,
  MapPin,
  Activity,
  Search,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { RouteDetailsDrawer } from "@/components/admin";

type RouteDefinition = {
  id: string;
  code: string;
  name: string;
  startLocation: string;
  endLocation: string;
  distanceKm: number;
  estDurationHours: number;
  active: boolean;
  totalTrips: number;
};

type Trip = {
  id: string;
  busName: string;
  tripName: string;
  departureTime: Date;
  startLocation: string;
  endLocation: string;
  routeId?: string;
  status: "Completed" | "Scheduled" | "Ongoing";
};

const initialRoutes: RouteDefinition[] = [
  {
    id: "R-001",
    code: "SGN-DLT",
    name: "Tuyến Sài Gòn - Đà Lạt (QL20)",
    startLocation: "Bến xe Miền Đông",
    endLocation: "Bến xe Đà Lạt",
    distanceKm: 300,
    estDurationHours: 7,
    active: true,
    totalTrips: 1240,
  },
  {
    id: "R-002",
    code: "SGN-VT",
    name: "Tuyến Sài Gòn - Vũng Tàu",
    startLocation: "Bến xe Miền Đông",
    endLocation: "Bến xe Vũng Tàu",
    distanceKm: 95,
    estDurationHours: 2.5,
    active: true,
    totalTrips: 850,
  },
  {
    id: "R-003",
    code: "DLT-SGN",
    name: "Tuyến Đà Lạt - Sài Gòn (QL20)",
    startLocation: "Bến xe Đà Lạt",
    endLocation: "Bến xe Miền Đông",
    distanceKm: 300,
    estDurationHours: 7,
    active: false,
    totalTrips: 1100,
  },
];

const mockRecentTrips: Trip[] = [
  {
    id: "T-101",
    busName: "Xe 51B-12345",
    tripName: "SG-DL 08:00",
    departureTime: new Date("2025-11-19T08:00:00"),
    startLocation: "Bến xe Miền Đông",
    endLocation: "Bến xe Đà Lạt",
    routeId: "R-001",
    status: "Completed",
  },
  {
    id: "T-104",
    busName: "Xe 51B-99999",
    tripName: "SG-DL 14:00",
    departureTime: new Date("2025-11-19T14:00:00"),
    startLocation: "Bến xe Miền Đông",
    endLocation: "Bến xe Đà Lạt",
    routeId: "R-001",
    status: "Ongoing",
  },
  {
    id: "T-102",
    busName: "Xe 29A-99999",
    tripName: "Chuyến đặc biệt: SG - Nha Trang",
    departureTime: new Date("2025-11-16T20:00:00"),
    startLocation: "Sài Gòn",
    endLocation: "Nha Trang",
    routeId: undefined,
    status: "Completed",
  },
];

const RouteManagement = () => {
  const [routes, setRoutes] = useState<RouteDefinition[]>(initialRoutes);
  const [selectedRoute, setSelectedRoute] = useState<RouteDefinition | null>(
    null,
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterLocation, setFilterLocation] = useState("all");

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [tripToConvert, setTripToConvert] = useState<Trip | null>(null);
  const [newRouteName, setNewRouteName] = useState("");
  const [newRouteCode, setNewRouteCode] = useState("");

  const uniqueLocations = useMemo(() => {
    const locs = new Set<string>();
    routes.forEach((r) => {
      locs.add(r.startLocation);
      locs.add(r.endLocation);
    });
    return Array.from(locs).sort();
  }, [routes]);

  const filteredRoutes = routes.filter((route) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      route.name.toLowerCase().includes(searchLower) ||
      route.code.toLowerCase().includes(searchLower) ||
      route.startLocation.toLowerCase().includes(searchLower) ||
      route.endLocation.toLowerCase().includes(searchLower);

    const matchesStatus =
      filterStatus === "all"
        ? true
        : filterStatus === "active"
          ? route.active
          : !route.active;

    const matchesLocation =
      filterLocation === "all"
        ? true
        : route.startLocation === filterLocation ||
          route.endLocation === filterLocation;

    return matchesSearch && matchesStatus && matchesLocation;
  });

  const handleRouteClick = (route: RouteDefinition) => {
    setSelectedRoute(route);
    setIsDrawerOpen(true);
  };

  const handleConvertClick = (trip: Trip) => {
    setTripToConvert(trip);
    setNewRouteName(`Tuyến ${trip.startLocation} - ${trip.endLocation}`);
    setNewRouteCode(
      `${trip.startLocation.substring(0, 3).toUpperCase()}-${trip.endLocation
        .substring(0, 3)
        .toUpperCase()}`,
    );
    setIsCreateDialogOpen(true);
  };

  const handleSaveRoute = () => {
    if (!tripToConvert) return;
    const newRoute: RouteDefinition = {
      id: `R-${Date.now()}`,
      code: newRouteCode,
      name: newRouteName,
      startLocation: tripToConvert.startLocation,
      endLocation: tripToConvert.endLocation,
      distanceKm: 0,
      estDurationHours: 0,
      active: true,
      totalTrips: 0,
    };
    setRoutes([...routes, newRoute]);
    setIsCreateDialogOpen(false);
  };

  return (
    <div className="flex flex-col h-full p-6 gap-6 bg-muted/10 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Route Management
          </h1>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> New Route
        </Button>
      </div>

      <Tabs defaultValue="library" className="flex-1 flex flex-col gap-4">
        <TabsList className="w-fit">
          <TabsTrigger value="library">Route Library</TabsTrigger>
          <TabsTrigger value="discovery">
            Trip Discovery
            <Badge
              variant="secondary"
              className="ml-2 text-xs bg-blue-100 text-blue-700 hover:bg-blue-100"
            >
              {mockRecentTrips.filter((t) => !t.routeId).length} New
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="library" className="mt-2 flex flex-col gap-4">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="pl-8 bg-background"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Select value={filterLocation} onValueChange={setFilterLocation}>
              <SelectTrigger className="w-full lg:w-[220px] bg-background">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Filter Location" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {uniqueLocations.map((loc) => (
                  <SelectItem key={loc} value={loc}>
                    {loc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full lg:w-[180px] bg-background">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Status" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active Only</SelectItem>
                <SelectItem value="inactive">Inactive Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredRoutes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRoutes.map((route) => (
                <Card
                  key={route.id}
                  className={cn(
                    "cursor-pointer hover:border-primary/50 transition-all hover:shadow-md",
                    !route.active && "opacity-75 bg-muted/30",
                  )}
                  onClick={() => handleRouteClick(route)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <Badge variant="outline" className="font-mono">
                        {route.code}
                      </Badge>
                      {route.active ? (
                        <span
                          className="h-2 w-2 rounded-full bg-green-500"
                          title="Active"
                        />
                      ) : (
                        <span
                          className="h-2 w-2 rounded-full bg-gray-300"
                          title="Inactive"
                        />
                      )}
                    </div>
                    <CardTitle className="text-lg leading-snug mt-2">
                      {route.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>
                          {route.startLocation} <span className="mx-1">→</span>{" "}
                          {route.endLocation}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="flex items-center gap-1">
                          <Activity className="h-3 w-3" /> {route.distanceKm} km
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {route.estDurationHours}
                          h
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
              <p>No routes found matching your criteria.</p>
              <Button
                variant="link"
                onClick={() => {
                  setSearchTerm("");
                  setFilterStatus("all");
                  setFilterLocation("all");
                }}
              >
                Clear all filters
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="discovery">
          <Card>
            <CardHeader>
              <CardTitle>Unassigned Trips</CardTitle>
              <CardDescription>
                Convert these one-off trips into standard routes for future use.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Trip Details</TableHead>
                    <TableHead>Path</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockRecentTrips
                    .filter((trip) => !trip.routeId)
                    .map((trip) => (
                      <TableRow key={trip.id}>
                        <TableCell>
                          <div className="font-medium">{trip.tripName}</div>
                          <div className="text-xs text-muted-foreground">
                            {trip.busName}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm">
                            {trip.startLocation}{" "}
                            <ArrowRight className="h-3 w-3" />{" "}
                            {trip.endLocation}
                          </div>
                        </TableCell>
                        <TableCell>
                          {format(trip.departureTime, "dd/MM/yyyy")}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleConvertClick(trip)}
                          >
                            <Save className="mr-2 h-4 w-4" /> Save as Route
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  {mockRecentTrips.filter((t) => !t.routeId).length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-8 text-muted-foreground"
                      >
                        All trips are assigned to routes.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <RouteDetailsDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        route={selectedRoute}
        relatedTrips={
          selectedRoute
            ? mockRecentTrips.filter((t) => t.routeId === selectedRoute.id)
            : []
        }
      />

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Route from Trip</DialogTitle>
            <DialogDescription>
              Standardize "{tripToConvert?.tripName}" into a reusable route
              template.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Route Name
              </Label>
              <Input
                id="name"
                value={newRouteName}
                onChange={(e) => setNewRouteName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="code" className="text-right">
                Code
              </Label>
              <Input
                id="code"
                value={newRouteCode}
                onChange={(e) => setNewRouteCode(e.target.value)}
                className="col-span-3 font-mono uppercase"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Start</Label>
              <Input
                disabled
                value={tripToConvert?.startLocation}
                className="col-span-3 bg-muted"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">End</Label>
              <Input
                disabled
                value={tripToConvert?.endLocation}
                className="col-span-3 bg-muted"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleSaveRoute}>
              Create Route
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RouteManagement;
