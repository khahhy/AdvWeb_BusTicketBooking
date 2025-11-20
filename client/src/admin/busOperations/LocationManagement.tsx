import { useState, useMemo } from "react";
import { Search, MapPin, Plus, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  LocationDetailsDrawer,
  AddLocationDialog,
  LocationMap,
} from "@/components/admin";
import type { Location } from "@/store/type/locationsType";
import type { RouteTime } from "@/store/type/routesType";

const LocationManagement = () => {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null
  );
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState<string | null>(null);

  const handleSelectLocation = (location: Location) => {
    setSelectedLocation(location);
    setIsSheetOpen(true);
  };

  const handleCreateLocation = () => {
    console.log("Creating new location...");
    setIsCreateModalOpen(false);
  };

  const cities = useMemo(() => {
    const set = new Set(mockLocations.map((l) => l.city));
    return Array.from(set);
  }, []);

  const filteredLocations = useMemo(() => {
    return mockLocations.filter((loc) => {
      const matchSearch = loc.name.toLowerCase().includes(search.toLowerCase());
      const matchCity = cityFilter ? loc.city === cityFilter : true;
      return matchSearch && matchCity;
    });
  }, [search, cityFilter]);

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] gap-4 md:flex-row">
      <Card className="w-full md:w-[350px] lg:w-[400px] flex flex-col border shadow-sm h-full">
        <CardHeader className="pb-3 space-y-3">
          <div className="flex items-center justify-between">
            <CardTitle>Locations</CardTitle>
            <Button size="sm" onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search name..."
                className="pl-8 h-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select
              onValueChange={(val) => setCityFilter(val === "all" ? null : val)}
              value={cityFilter ?? "all"}
            >
              <SelectTrigger className="w-[110px] h-9">
                <SelectValue placeholder="City" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {cities.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <Separator />

        <CardContent className="flex-1 p-0 overflow-hidden">
          <div className="h-full overflow-y-auto p-3 space-y-2">
            {filteredLocations.length === 0 ? (
              <div className="text-center text-muted-foreground py-8 text-sm">
                No locations found.
              </div>
            ) : (
              filteredLocations.map((loc) => (
                <div
                  key={loc.id}
                  onClick={() => handleSelectLocation(loc)}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all hover:bg-accent",
                    selectedLocation?.id === loc.id
                      ? "bg-accent border-primary/50 ring-1 ring-primary/20"
                      : "bg-card border-transparent hover:border-border"
                  )}
                >
                  <div
                    className={cn(
                      "p-2 rounded-md mt-0.5",
                      selectedLocation?.id === loc.id
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">{loc.name}</h4>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <Building2 className="h-3 w-3" />
                      <span className="truncate">{loc.city}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate pl-4">
                      {loc.address}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex-1 border rounded-xl overflow-hidden shadow-sm bg-gray-100 relative">
        <LocationMap
          locations={filteredLocations}
          selectedId={selectedLocation?.id}
          onSelect={handleSelectLocation}
        />
      </div>

      <AddLocationDialog
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSubmit={handleCreateLocation}
      />

      <LocationDetailsDrawer
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        location={selectedLocation}
        allRoutes={mockRelatedRoutes}
        onSave={() => setIsSheetOpen(false)}
        onDelete={() => setIsSheetOpen(false)}
      />
    </div>
  );
};

const mockLocations: Location[] = [
  {
    id: "LOC-001",
    name: "Bến xe Miền Đông",
    city: "TP. Hồ Chí Minh",
    address: "292 Đinh Bộ Lĩnh, P.26, Q. Bình Thạnh",
  },
  {
    id: "LOC-002",
    name: "Bến xe Đà Lạt",
    city: "TP. Đà Lạt",
    address: "01 Tô Hiến Thành, P.3, TP. Đà Lạt",
  },
  {
    id: "LOC-003",
    name: "Bến xe Trung tâm Đà Nẵng",
    city: "TP. Đà Nẵng",
    address: "201 Tôn Đức Thắng, P. Hòa Minh, Q. Liên Chiểu",
  },
];

const mockRelatedRoutes: RouteTime[] = [
  {
    id: "R-001",

    name: "SGN-DAL",

    originLocationId: "LOC-001",

    destinationLocationId: "LOC-002",

    description: null,

    price: 100,

    isActive: true,

    createdAt: new Date().toISOString(),

    updatedAt: new Date().toISOString(),

    origin: {
      id: "LOC-001",

      name: "SGN",

      address: "Bến xe Miền Đông",

      city: "TP. Hồ Chí Minh",
    },

    destination: {
      id: "LOC-002",

      name: "DAL",

      address: "Bến xe Miền Đông",

      city: "TP. Hồ Chí Minh",
    },

    tripRoutes: [],

    departureTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },

  {
    id: "R-002",

    name: "SGN-DAN",

    originLocationId: "LOC-001",

    destinationLocationId: "LOC-003",

    description: null,

    price: 120,

    isActive: true,

    createdAt: new Date().toISOString(),

    updatedAt: new Date().toISOString(),

    origin: {
      id: "LOC-001",

      name: "SGN",

      address: "Bến xe Miền Đông",

      city: "TP. Hồ Chí Minh",
    },

    destination: {
      id: "LOC-003",

      name: "DAN",

      address: "Bến xe Miền Đông",

      city: "TP. Hồ Chí Minh",
    },

    tripRoutes: [],

    departureTime: new Date(Date.now() - 12 * 60 * 60 * 1000),
  },

  {
    id: "R-003",

    name: "DAN-SGN",

    originLocationId: "LOC-003",

    destinationLocationId: "LOC-001",

    description: null,

    price: 150,

    isActive: true,

    createdAt: new Date().toISOString(),

    updatedAt: new Date().toISOString(),

    origin: {
      id: "LOC-003",

      name: "DAN",

      address: "Bến xe Miền Đông",

      city: "TP. Hồ Chí Minh",
    },

    destination: {
      id: "LOC-001",

      name: "SGN",

      address: "Bến xe Miền Đông",

      city: "TP. Hồ Chí Minh",
    },

    tripRoutes: [],

    departureTime: new Date(Date.now() + 6 * 60 * 60 * 1000),
  },

  {
    id: "R-004",

    name: "DAL-SGN",

    originLocationId: "LOC-002",

    destinationLocationId: "LOC-001",

    description: null,

    price: 130,

    isActive: true,

    createdAt: new Date().toISOString(),

    updatedAt: new Date().toISOString(),

    origin: {
      id: "LOC-002",

      name: "DAL",

      address: "Bến xe Miền Đông",

      city: "TP. Hồ Chí Minh",
    },

    destination: {
      id: "LOC-001",

      name: "SGN",

      address: "Bến xe Miền Đông",

      city: "TP. Hồ Chí Minh",
    },

    tripRoutes: [],

    departureTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
  },
];

export default LocationManagement;
