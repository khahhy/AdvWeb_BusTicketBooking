import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetFooter } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { User, UserStatus } from "@/store/type/usersType";
import {
  useUpdateUserMutation,
  useUpdateUserStatusMutation,
} from "@/store/api/usersApi";
import { useGetActivityLogsByUserQuery } from "@/store/api/activityLogsApi";
import type { ApiError } from "@/store/type/apiError";

interface PassengerDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  passenger: User | null;
}

const PassengerDetailDrawer = ({
  open,
  onOpenChange,
  passenger,
}: PassengerDetailDrawerProps) => {
  const [editableName, setEditableName] = useState("");
  const [editableEmail, setEditableEmail] = useState("");
  const [editablePhone, setEditablePhone] = useState("");
  const [activeTab, setActiveTab] = useState("details");

  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [updateStatus, { isLoading: isUpdatingStatus }] =
    useUpdateUserStatusMutation();

  const { data: historyData, isLoading: isLoadingHistory } =
    useGetActivityLogsByUserQuery(passenger?.id || "", {
      skip: !passenger || !open || activeTab !== "history",
    });

  useEffect(() => {
    if (passenger) {
      setEditableName(passenger.fullName || "");
      setEditableEmail(passenger.email);
      setEditablePhone(passenger.phoneNumber || "");
    }
  }, [passenger]);

  if (!passenger) {
    return null;
  }

  const handleSaveClick = async () => {
    try {
      await updateUser({
        id: passenger.id,
        data: {
          fullName: editableName,
          email: editableEmail,
          phoneNumber: editablePhone,
        },
      }).unwrap();
      toast.success("Passenger updated successfully");
      onOpenChange(false);
    } catch (error) {
      const err = error as ApiError;
      toast.error(err?.data?.message || "Failed to update passenger");
    }
  };

  const handleStatusChange = async (newStatus: UserStatus) => {
    try {
      await updateStatus({
        id: passenger.id,
        status: newStatus,
      }).unwrap();
      toast.success(`User ${newStatus} successfully`);
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-2xl flex flex-col h-full [&>button]:hidden">
        <Tabs
          defaultValue="details"
          value={activeTab}
          onValueChange={setActiveTab}
          className="mt-4 flex-1 flex flex-col overflow-hidden"
        >
          <TabsList className="grid w-full grid-cols-2 shrink-0">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="history">Booking History</TabsTrigger>
          </TabsList>

          <TabsContent
            value="details"
            className="flex-1 overflow-y-auto py-4 px-1"
          >
            <div className="grid gap-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label>ID</Label>
                <span className="col-span-3 font-mono text-sm">
                  {passenger.id}
                </span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label>Joined</Label>
                <span className="col-span-3 text-sm">
                  {new Date(passenger.createdAt).toLocaleString()}
                </span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label>Bookings</Label>
                <Badge variant="secondary" className="w-fit">
                  {passenger._count?.bookings || 0} trips
                </Badge>
              </div>

              <div className="border-t my-2"></div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={editableName}
                  onChange={(e) => setEditableName(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={editableEmail}
                  onChange={(e) => setEditableEmail(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={editablePhone}
                  onChange={(e) => setEditablePhone(e.target.value)}
                  className="col-span-3"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button onClick={handleSaveClick} disabled={isUpdating}>
                {isUpdating && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Changes
              </Button>
            </div>
          </TabsContent>

          <TabsContent
            value="history"
            className="flex-1 overflow-y-auto py-4 px-1"
          >
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-4">
                {isLoadingHistory ? (
                  <div className="flex justify-center p-4">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : historyData?.data && historyData.data.length > 0 ? (
                  historyData.data.map((log) => (
                    <div
                      key={log.id}
                      className="flex flex-col border rounded-lg p-3 text-sm"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-semibold text-primary">
                          {log.action}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(log.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-muted-foreground text-xs mb-2">
                        IP: {log.ipAddress || "N/A"}
                      </div>

                      {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <div className="bg-muted/50 p-2 rounded text-xs font-mono">
                          {JSON.stringify(log.metadata, null, 2)}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground">
                    No activity history found
                  </p>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {activeTab === "details" && (
          <SheetFooter className="mt-auto border-t pt-4 shrink-0">
            {passenger.status === UserStatus.active ? (
              <Button
                variant="destructive"
                onClick={() => handleStatusChange(UserStatus.banned)}
                className="w-full sm:w-auto"
                disabled={isUpdatingStatus}
              >
                Ban Passenger
              </Button>
            ) : (
              <Button
                variant="secondary"
                onClick={() => handleStatusChange(UserStatus.active)}
                className="w-full sm:w-auto"
                disabled={isUpdatingStatus}
              >
                Activate Passenger
              </Button>
            )}
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default PassengerDetailDrawer;
