import { Map, Activity, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

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

const RouteDetailsDrawer = ({
  route,
  open,
  onOpenChange,
  relatedTrips,
}: {
  route: RouteDefinition | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  relatedTrips: Trip[];
}) => {
  if (!route) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-xl overflow-y-auto">
        <SheetHeader className="mb-6">
          <div className="flex items-start justify-between">
            <div>
              <SheetTitle className="flex items-center gap-2 text-xl">
                <Map className="h-5 w-5 text-primary" />
                {route.name}
              </SheetTitle>
              <SheetDescription className="mt-1">
                Code: <span className="font-mono font-bold">{route.code}</span>{" "}
                •{" "}
                {route.active ? (
                  <span className="text-green-600 font-medium">Active</span>
                ) : (
                  <span className="text-muted-foreground">Inactive</span>
                )}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="bg-muted/40 border-none shadow-none">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground font-medium uppercase">
                Distance
              </p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-bold">{route.distanceKm}</span>
                <span className="text-sm text-muted-foreground">km</span>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-muted/40 border-none shadow-none">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground font-medium uppercase">
                Est. Duration
              </p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-bold">
                  {route.estDurationHours}
                </span>
                <span className="text-sm text-muted-foreground">hrs</span>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-muted/40 border-none shadow-none">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground font-medium uppercase">
                Total Trips
              </p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-bold">
                  {route.totalTrips.toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Activity className="h-4 w-4" /> Related Active Trips (Today)
          </h3>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bus</TableHead>
                  <TableHead>Departure</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {relatedTrips.length > 0 ? (
                  relatedTrips.map((trip) => (
                    <TableRow key={trip.id}>
                      <TableCell className="font-medium">
                        {trip.busName}
                      </TableCell>
                      <TableCell>
                        {format(trip.departureTime, "HH:mm")}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            trip.status === "Ongoing" ? "default" : "secondary"
                          }
                        >
                          {trip.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center text-muted-foreground h-24"
                    >
                      No active trips for today.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <SheetFooter className="mt-8 gap-2">
          <Button variant="outline" className="w-full sm:w-auto">
            <Edit className="mr-2 h-4 w-4" /> Edit Route
          </Button>
          <Button variant="destructive" className="w-full sm:w-auto">
            <Trash2 className="mr-2 h-4 w-4" /> Archive
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default RouteDetailsDrawer;
