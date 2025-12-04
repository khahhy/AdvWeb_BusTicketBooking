import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useCreateRouteMutation } from "@/store/api/routesApi";
import { useGetLocationsQuery } from "@/store/api/locationApi";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type FormData = {
  originLocationId: string;
  destinationLocationId: string;
  description: string;
  name: string; // Tạm hiển thị để user thấy, BE tự generate hoặc cho sửa
};

const CreateRouteDialog = ({ open, onOpenChange }: Props) => {
  const { data: locations = [] } = useGetLocationsQuery();
  const [createRoute, { isLoading }] = useCreateRouteMutation();

  const { register, setValue, watch, handleSubmit, reset } =
    useForm<FormData>();

  const originId = watch("originLocationId");
  const destId = watch("destinationLocationId");

  // Auto-generate name khi chọn location
  useEffect(() => {
    if (originId && destId && locations.length) {
      const origin = locations.find((l) => l.id === originId);
      const dest = locations.find((l) => l.id === destId);
      if (origin && dest) {
        setValue("name", `${origin.city} - ${dest.city}`);
      }
    }
  }, [originId, destId, locations, setValue]);

  const onSubmit = async (data: FormData) => {
    try {
      if (data.originLocationId === data.destinationLocationId) {
        toast.error("Origin and Destination cannot be the same");
        return;
      }

      await createRoute({
        originLocationId: data.originLocationId,
        destinationLocationId: data.destinationLocationId,
        description: data.description,
      }).unwrap();

      toast.success("Route created successfully!");
      reset();
      onOpenChange(false);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to create route");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Route</DialogTitle>
          <DialogDescription>
            Define a new path between two locations.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Origin Location</Label>
            <Select onValueChange={(val) => setValue("originLocationId", val)}>
              <SelectTrigger>
                <SelectValue placeholder="Select start point" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((loc) => (
                  <SelectItem key={loc.id} value={loc.id}>
                    {loc.city} ({loc.name})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Destination Location</Label>
            <Select
              onValueChange={(val) => setValue("destinationLocationId", val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select end point" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((loc) => (
                  <SelectItem key={loc.id} value={loc.id}>
                    {loc.city} ({loc.name})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Route Name (Preview)</Label>
            <Input {...register("name")} readOnly className="bg-muted" />
          </div>

          <div className="grid gap-2">
            <Label>Description (Optional)</Label>
            <Input
              {...register("description")}
              placeholder="e.g. Scenic route via QL20"
            />
          </div>

          <DialogFooter className="mt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Route
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateRouteDialog;
