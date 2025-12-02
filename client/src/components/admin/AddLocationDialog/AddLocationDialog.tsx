import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogOverlay,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import AddressAutocompleteWithMap from "./AddressAutocompleteWithMap";

interface AddLocationFormData {
  name: string;
  city: string;
  address: string;
  lat: number;
  lng: number;
}

interface AddLocationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: AddLocationFormData) => void;
}

const AddLocationDialog = ({
  open,
  onOpenChange,
  onSubmit,
}: AddLocationDialogProps) => {
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);

  useEffect(() => {
    if (open) {
      setName("");
      setCity("");
      setAddress("");
      setLat(null);
      setLng(null);
    }
  }, [open]);

  const handleSubmit = () => {
    if (!lat || !lng) {
      alert("You have not selected a valid address!");
      return;
    }
    onSubmit({ name, city, address, lat, lng });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogOverlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]" />

      <DialogContent className="sm:max-w-[600px] z-[9998] max-h-[90vh] p-0 overflow-hidden flex flex-col gap-0">
        <DialogHeader className="p-6 pb-2 shrink-0">
          <DialogTitle className="text-xl font-semibold">
            Create New Location
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 pt-2">
          <div className="grid gap-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Input
                  id="name"
                  placeholder="Location Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Input
                  id="city"
                  placeholder="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <AddressAutocompleteWithMap
                apiKey={import.meta.env.VITE_GEOAPIFY_KEY}
                onSelect={({
                  address: newAddress,
                  lat: newLat,
                  lng: newLng,
                }) => {
                  if (newAddress) setAddress(newAddress);
                  setLat(newLat);
                  setLng(newLng);
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Input
                  id="lat"
                  value={lat || ""}
                  readOnly
                  className="bg-muted font-mono text-sm"
                  placeholder="Latitude"
                />
              </div>
              <div className="space-y-2">
                <Input
                  id="lng"
                  value={lng || ""}
                  readOnly
                  className="bg-muted font-mono text-sm"
                  placeholder="Longitude"
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="p-6 pt-4 shrink-0 bg-white z-10">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Create Location</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddLocationDialog;
