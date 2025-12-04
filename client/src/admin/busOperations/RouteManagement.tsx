import { useState } from "react";
import { Plus, MapPin, Activity, Search, Filter, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useGetRoutesQuery } from "@/store/api/routesApi";
import { useGetLocationsQuery } from "@/store/api/locationApi";
import {
  RouteDetailsDrawer,
  CreateRouteDialog,
  TripAssignmentDialog,
} from "@/components/admin";

const RouteManagement = () => {
  const { data: routes = [], isLoading } = useGetRoutesQuery();
  const { data: locations = [] } = useGetLocationsQuery();

  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isAssignmentDialogOpen, setIsAssignmentDialogOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterLocation, setFilterLocation] = useState("all");

  const filteredRoutes = routes.filter((route) => {
    const searchLower = searchTerm.toLowerCase();
    const routeName = route.name || "";
    const originName = route.origin?.city || "";
    const destName = route.destination?.city || "";

    const matchesSearch =
      routeName.toLowerCase().includes(searchLower) ||
      originName.toLowerCase().includes(searchLower) ||
      destName.toLowerCase().includes(searchLower);

    const matchesStatus =
      filterStatus === "all"
        ? true
        : filterStatus === "active"
          ? route.isActive
          : !route.isActive;

    const matchesLocation =
      filterLocation === "all"
        ? true
        : route.originLocationId === filterLocation ||
          route.destinationLocationId === filterLocation;

    return matchesSearch && matchesStatus && matchesLocation;
  });

  const handleRouteClick = (id: string) => {
    setSelectedRouteId(id);
    setIsDrawerOpen(true);
  };

  const handleOpenAssignment = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedRouteId(id);
    setIsAssignmentDialogOpen(true);
  };

  const selectedRoute = routes.find((r) => r.id === selectedRouteId) || null;

  return (
    <div className="flex flex-col h-full p-6 gap-6 bg-muted/10 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Route Management
          </h1>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Route
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search routes by name or city..."
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
            {locations.map((loc) => (
              <SelectItem key={loc.id} value={loc.id}>
                {loc.city} - {loc.name}
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

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredRoutes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRoutes.map((route) => (
            <Card
              key={route.id}
              className={cn(
                "cursor-pointer hover:border-primary/50 transition-all hover:shadow-md group relative",
                !route.isActive && "opacity-75 bg-muted/30",
              )}
              onClick={() => handleRouteClick(route.id)}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <Badge variant="outline" className="font-mono text-xs">
                    {route.origin?.city.substring(0, 3).toUpperCase()}-
                    {route.destination?.city.substring(0, 3).toUpperCase()}
                  </Badge>
                  {route.isActive ? (
                    <span className="flex items-center gap-1.5 text-[10px] font-medium text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500" />{" "}
                      Active
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground bg-gray-100 px-2 py-0.5 rounded-full">
                      <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />{" "}
                      Inactive
                    </span>
                  )}
                </div>
                <CardTitle className="text-lg leading-snug mt-2 line-clamp-1">
                  {route.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 shrink-0" />
                    <span className="truncate">
                      {route.origin?.city} <span className="mx-1">→</span>{" "}
                      {route.destination?.city}
                    </span>
                  </div>

                  <div className="pt-2 mt-2 border-t flex justify-end">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-xs h-7 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      onClick={(e) => handleOpenAssignment(e, route.id)}
                    >
                      <Activity className="mr-1 h-3 w-3" /> Find & Assign Trips
                    </Button>
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

      <CreateRouteDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />

      <RouteDetailsDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        routeId={selectedRouteId}
      />

      {selectedRoute && (
        <TripAssignmentDialog
          open={isAssignmentDialogOpen}
          onOpenChange={setIsAssignmentDialogOpen}
          route={selectedRoute}
        />
      )}
    </div>
  );
};

export default RouteManagement;
