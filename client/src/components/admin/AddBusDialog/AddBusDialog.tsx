import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Dispatch, SetStateAction } from "react";

export interface AddBusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name: string;
  plate: string;
  amenities: string[];
  setName: Dispatch<SetStateAction<string>>;
  setPlate: Dispatch<SetStateAction<string>>;
  onAmenityChange: (amenities: string[]) => void;
  onCreate: () => void;
}

const allPossibleAmenities = [
  { id: "wifi", label: "Wifi" },
  { id: "charging", label: "Cổng sạc USB" },
  { id: "wc", label: "WC (Nhà vệ sinh)" },
  { id: "blanket", label: "Chăn đắp" },
  { id: "water", label: "Nước uống" },
  { id: "cold_towel", label: "Khăn lạnh" },
];

const AddBusDialog = ({
  open,
  onOpenChange,
  name,
  plate,
  amenities,
  setName,
  setPlate,
  onAmenityChange,
  onCreate,
}: AddBusDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl w-full">
        <DialogHeader>
          <DialogTitle>Create New Bus</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-left">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="license" className="text-left">
              License Plate
            </Label>
            <Input
              id="license"
              value={plate}
              onChange={(e) => setPlate(e.target.value)}
              className="col-span-3"
            />
          </div>

          <div className="col-span-4">
            <Label className="mb-2 block">Amenities</Label>
            <div className="grid grid-cols-2 gap-4 rounded-md border p-4">
              {allPossibleAmenities.map((amenity) => (
                <div key={amenity.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={amenity.id}
                    checked={amenities.includes(amenity.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        onAmenityChange([...amenities, amenity.id]);
                      } else {
                        onAmenityChange(
                          amenities.filter((id) => id !== amenity.id),
                        );
                      }
                    }}
                  />
                  <label htmlFor={amenity.id} className="text-sm font-medium">
                    {amenity.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onCreate}>Create Bus</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddBusDialog;
