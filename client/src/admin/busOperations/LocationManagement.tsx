import { useState } from "react";
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
import type {
  Location,
  CreateLocationRequest,
} from "@/store/type/locationsType";
import type { RouteTime } from "@/store/type/routesType";
import {
  useGetLocationsQuery,
  useGetCitiesQuery,
  useCreateLocationMutation,
  useUpdateLocationMutation,
  useDeleteLocationMutation,
} from "@/store/api/locationApi";
import { useDebounce } from "@/hooks/useDebounce";

const LocationManagement = () => {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null,
  );
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState<string | null>(null);

  const debouncedSearch = useDebounce(search, 500);

  const { data: locations = [], isLoading: isLoadingLocations } =
    useGetLocationsQuery({
      search: debouncedSearch || undefined,
      city: cityFilter === "all" ? undefined : cityFilter || undefined,
    });

  const { data: cities = [] } = useGetCitiesQuery();

  const [createLocation] = useCreateLocationMutation();
  const [updateLocation] = useUpdateLocationMutation();
  const [deleteLocation] = useDeleteLocationMutation();

  const handleCreateLocation = async (data: CreateLocationRequest) => {
    try {
      const payload = {
        name: data.name,
        city: data.city,
        address: data.address,
        latitude: data.latitude,
        longitude: data.longitude,
      };

      await createLocation(payload).unwrap();
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error("Failed to create location", error);
    }
  };

  const handleSaveLocation = async (
    id: string,
    data: { name: string; city: string; address: string },
  ) => {
    try {
      await updateLocation({ id, ...data }).unwrap();
      setIsSheetOpen(false);
      // Toast thành công
    } catch (error) {
      console.error("Failed to update location", error);
    }
  };

  const handleDeleteLocation = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this location?"))
      return;
    try {
      await deleteLocation(id).unwrap();
      setIsSheetOpen(false);
      setSelectedLocation(null);
    } catch (error) {
      console.error("Failed to delete location", error);
    }
  };

  const handleSelectLocation = (location: Location) => {
    setSelectedLocation(location);
    setIsSheetOpen(true);
  };

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
            {isLoadingLocations ? (
              <div className="text-center p-4">Loading...</div>
            ) : locations.length === 0 ? (
              <div className="text-center text-muted-foreground py-8 text-sm">
                No locations found.
              </div>
            ) : (
              locations.map((loc) => (
                <div
                  key={loc.id}
                  onClick={() => handleSelectLocation(loc)}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all hover:bg-accent",
                    selectedLocation?.id === loc.id
                      ? "bg-accent border-primary/50 ring-1 ring-primary/20"
                      : "bg-card border-transparent hover:border-border",
                  )}
                >
                  <div
                    className={cn(
                      "p-2 rounded-md mt-0.5",
                      selectedLocation?.id === loc.id
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground",
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
          locations={locations}
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
        onSave={handleSaveLocation}
        onDelete={handleDeleteLocation}
      />
    </div>
  );
};

const mockRelatedRoutes: RouteTime[] = [];

export default LocationManagement;
