import { Map, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
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
import {
  useGetRouteByIdQuery,
  useDeleteRouteMutation,
  useGetTripRouteMapQuery,
} from "@/store/api/routesApi";
import { TripRouteMap } from "@/store/type/tripRoutesType";
import { toast } from "sonner";

type Props = {
  routeId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

interface ApiError {
  data?: {
    message?: string;
  };
}

const RouteDetailsDrawer = ({ routeId, open, onOpenChange }: Props) => {
  const { data: route, isLoading } = useGetRouteByIdQuery(routeId || "", {
    skip: !routeId,
  });

  const { data: tripMapsData } = useGetTripRouteMapQuery(
    { routeId: routeId || undefined, limit: 5 },
    { skip: !routeId },
  );

  const [deleteRoute, { isLoading: isDeleting }] = useDeleteRouteMutation();

  const handleDelete = async () => {
    if (!routeId) return;
    try {
      await deleteRoute(routeId).unwrap();
      toast.success("Route deleted successfully");
      onOpenChange(false);
    } catch (error) {
      const err = error as ApiError;
      toast.error(err?.data?.message || "Cannot delete route");
    }
  };

  if (!route && !isLoading) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-xl overflow-y-auto w-full">
        <SheetHeader className="mb-6">
          <SheetTitle className="flex items-center gap-2 text-xl">
            <Map className="h-5 w-5 text-primary" />
            {isLoading ? "Loading..." : route?.name}
          </SheetTitle>
          <SheetDescription>
            {route?.origin?.city} - {route?.destination?.city}
            <div className="mt-1">
              {route?.isActive ? (
                <Badge variant="default" className="bg-green-600">
                  Active
                </Badge>
              ) : (
                <Badge variant="secondary">Inactive</Badge>
              )}
            </div>
          </SheetDescription>
        </SheetHeader>

        {route && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-muted/40 border-none shadow-none">
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground font-medium uppercase">
                    Description
                  </p>
                  <p className="text-sm font-medium mt-1">
                    {route.description || "No description"}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-muted/40 border-none shadow-none">
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground font-medium uppercase">
                    Assigned Trips
                  </p>
                  <p className="text-2xl font-bold mt-1">
                    {tripMapsData?.meta?.total || 0}
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-sm flex items-center justify-between">
                <span>Recent Assigned Trips</span>
              </h3>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bus</TableHead>
                      <TableHead>Departure</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tripMapsData?.items && tripMapsData.items.length > 0 ? (
                      tripMapsData.items.map((item: TripRouteMap) => (
                        <TableRow key={item.tripId}>
                          <TableCell className="font-medium">
                            {item.trip?.bus?.plate || "Unknown Bus"}
                          </TableCell>
                          <TableCell>
                            {item.trip?.startTime
                              ? format(
                                  new Date(item.trip.startTime),
                                  "dd/MM HH:mm",
                                )
                              : "N/A"}
                          </TableCell>
                          <TableCell className="text-right">
                            {new Intl.NumberFormat("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            }).format(item.price)}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          className="text-center text-muted-foreground h-24"
                        >
                          No trips assigned yet. Use "Find & Assign Trips" in
                          the main list.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        )}

        <SheetFooter className="mt-8 gap-2 sm:justify-between">
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash2 className="mr-2 h-4 w-4" /> Delete Route
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default RouteDetailsDrawer;
