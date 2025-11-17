import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Passenger, PassengerUpdateData } from "@/store/type/usersType";

interface PassengerDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  passenger: Passenger | null;
  onSave: (passengerId: string, data: PassengerUpdateData) => void;
  onBan: (passengerId: string) => void;
  onUnban: (passengerId: string) => void;
}

const PassengerDetailDrawer = ({
  open,
  onOpenChange,
  passenger,
  onSave,
  onBan,
  onUnban,
}: PassengerDetailDrawerProps) => {
  const [editableName, setEditableName] = useState("");
  const [editableEmail, setEditableEmail] = useState("");
  const [editablePhone, setEditablePhone] = useState("");

  useEffect(() => {
    if (passenger) {
      setEditableName(passenger.name);
      setEditableEmail(passenger.email);
      setEditablePhone(passenger.phone);
    }
  }, [passenger]);

  if (!passenger) {
    return null;
  }

  const handleSaveClick = () => {
    onSave(passenger.id, {
      name: editableName,
      email: editableEmail,
      phone: editablePhone,
    });
  };

  const handleBanClick = () => {
    onBan(passenger.id);
  };

  const handleUnbanClick = () => {
    onUnban(passenger.id);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>Passenger Details</SheetTitle>
          <SheetDescription>
            View and manage passenger information.
          </SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="details" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="history">Booking History</TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">ID</Label>
                <span className="col-span-3 font-mono text-sm">
                  {passenger.id}
                </span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Joined</Label>
                <span className="col-span-3 text-sm">
                  {new Date(passenger.joinDate).toLocaleString()}
                </span>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={editableName}
                  onChange={(e) => setEditableName(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  value={editableEmail}
                  onChange={(e) => setEditableEmail(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">
                  Phone
                </Label>
                <Input
                  id="phone"
                  value={editablePhone}
                  onChange={(e) => setEditablePhone(e.target.value)}
                  className="col-span-3"
                />
              </div>
            </div>
            <Button onClick={handleSaveClick}>Save Changes</Button>
          </TabsContent>

          <TabsContent value="history">
            <div className="mt-4 space-y-4">
              {passenger.bookings.length > 0 ? (
                passenger.bookings.map((booking) => (
                  <Card key={booking.id}>
                    <CardContent className="pt-4">
                      <p className="font-semibold">{booking.trip}</p>
                      <p className="text-sm text-muted-foreground">
                        Date: {booking.date}
                      </p>
                      <Badge
                        className="mt-2"
                        variant={
                          booking.status === "Completed"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {booking.status}
                      </Badge>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p className="text-center text-muted-foreground">
                  No booking history.
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <SheetFooter className="mt-6">
          <SheetClose asChild>
            <Button variant="outline">Cancel</Button>
          </SheetClose>
          {passenger.status === "Active" ? (
            <Button variant="destructive" onClick={handleBanClick}>
              Ban Passenger
            </Button>
          ) : (
            <Button variant="secondary" onClick={handleUnbanClick}>
              Unban Passenger
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default PassengerDetailDrawer;
