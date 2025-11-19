import { useState, useEffect, useMemo } from "react";
import { Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetOverlay,
  SheetContent,
  SheetFooter,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Location } from "@/store/type/locationsType";
import type { RouteTime } from "@/store/type/routesType";

interface LocationDetailsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  location: Location | null;
  allRoutes: RouteTime[];
  onSave: (id: string, data: any) => void;
  onDelete: (id: string) => void;
}

const LocationDetailsDrawer = ({
  open,
  onOpenChange,
  location,
  allRoutes,
  onSave,
  onDelete,
}: LocationDetailsDrawerProps) => {
  const [editableName, setEditableName] = useState("");
  const [editableCity, setEditableCity] = useState("");
  const [editableAddress, setEditableAddress] = useState("");

  useEffect(() => {
    if (location) {
      setEditableName(location.name);
      setEditableCity(location.city);
      setEditableAddress(location.address ?? "");
    }
  }, [location]);

  const handleSave = () => {
    if (location) {
      onSave(location.id, {
        name: editableName,
        city: editableCity,
        address: editableAddress,
      });

      onOpenChange(false);
    }
  };

  const filteredRouteTimes = useMemo(() => {
    if (!location) return [];

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneDayHence = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    return allRoutes.filter((routeTime) => {
      const departureTime = new Date(routeTime.departureTime);
      return departureTime >= oneDayAgo && departureTime <= oneDayHence;
    });
  }, [allRoutes, location]);

  const hasFutureRoutes = useMemo(() => {
    if (!location) return true;
    const now = new Date();

    return allRoutes.some((routeTime) => {
      const departureTime = new Date(routeTime.departureTime);

      return departureTime > now;
    });
  }, [allRoutes, location]);

  const canDelete = !hasFutureRoutes;

  if (!location) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetOverlay className="bg-black/50 backdrop-blur-sm z-[9999]" />
      <SheetContent className="sm:max-w-2xl z-[9999] flex flex-col h-full">
        <SheetTitle>Location Details</SheetTitle>
        <Tabs defaultValue="details" className="mt-4 flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="RouteTimes">Related RouteTimes</TabsTrigger>
          </TabsList>

          <TabsContent
            value="details"
            className="flex flex-col gap-4 focus:outline-none focus-visible:ring-0"
          >
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-left">ID</Label>
                <Input value={location.id} disabled className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="sheet-name" className="text-left">
                  Name
                </Label>
                <Input
                  id="sheet-name"
                  value={editableName}
                  onChange={(e) => setEditableName(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="sheet-city" className="text-left">
                  City
                </Label>
                <Input
                  id="sheet-city"
                  value={editableCity}
                  onChange={(e) => setEditableCity(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="sheet-address" className="text-left">
                  Address
                </Label>
                <Input
                  id="sheet-address"
                  value={editableAddress}
                  onChange={(e) => setEditableAddress(e.target.value)}
                  className="col-span-3"
                />
              </div>
            </div>

            <SheetFooter className="mt-auto pt-4">
              <div className="flex w-full justify-between items-center">
                <Button
                  variant="destructive"
                  onClick={() => onDelete(location.id)}
                  disabled={!canDelete}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
                <div className="flex gap-2">
                  <Button onClick={handleSave}>Save Changes</Button>
                </div>
              </div>
              {!canDelete && (
                <p className="w-full mt-2 text-xs text-destructive flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Cannot delete: This location is part of one or more future
                  RouteTimes.
                </p>
              )}
            </SheetFooter>
          </TabsContent>

          <TabsContent value="RouteTimes" className="flex-1 overflow-auto">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>RouteTime</TableHead>
                    <TableHead>Departure</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRouteTimes.map((routeTime) => (
                    <TableRow key={routeTime.id}>
                      <TableCell>{routeTime.name}</TableCell>
                      <TableCell>
                        {new Date(routeTime.departureTime).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredRouteTimes.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center">
                        No related RouteTimes in this time range (24h).
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};

export default LocationDetailsDrawer;
