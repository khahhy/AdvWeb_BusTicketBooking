import { useState, useEffect } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { User } from "@/store/type/usersType";
import { useUpdateUserMutation } from "@/store/api/usersApi";
import { useGetActivityLogsByUserQuery } from "@/store/api/activityLogsApi";
import type { ApiError } from "@/store/type/apiError";

interface AdminDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  admin: User | null;
  currentUserId: string;
}

const AdminDetailDrawer = ({
  open,
  onOpenChange,
  admin,
  currentUserId,
}: AdminDetailDrawerProps) => {
  const [editableName, setEditableName] = useState("");
  const [editableEmail, setEditableEmail] = useState("");
  const [editablePhone, setEditablePhone] = useState("");
  const [activeTab, setActiveTab] = useState("details");

  const canEdit = currentUserId === admin?.id;

  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();

  const { data: logsData, isLoading: isLoadingLogs } =
    useGetActivityLogsByUserQuery(admin?.id || "", {
      skip: !admin || !open || activeTab !== "logs",
    });

  useEffect(() => {
    if (admin) {
      setEditableName(admin.fullName || "");
      setEditableEmail(admin.email);
      setEditablePhone(admin.phoneNumber || "");
    }
  }, [admin]);

  const handleSaveClick = async () => {
    if (!canEdit || !admin) return;

    try {
      await updateUser({
        id: admin.id,
        data: {
          fullName: editableName,
          email: editableEmail,
          phoneNumber: editablePhone,
        },
      }).unwrap();
      toast.success("Profile updated successfully");
      onOpenChange(false);
    } catch (error) {
      const err = error as ApiError;
      toast.error(err?.data?.message || "Failed to update profile");
    }
  };

  if (!admin) return null;

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
            <TabsTrigger value="logs">Activity Logs</TabsTrigger>
          </TabsList>

          <TabsContent
            value="details"
            className="flex-1 overflow-y-auto py-4 px-1"
          >
            <div className="grid gap-4">
              {!canEdit && (
                <div className="flex items-center rounded-lg border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-800 dark:border-yellow-800 dark:bg-gray-800 dark:text-yellow-300">
                  <Lock className="mr-2 h-4 w-4" />
                  You can only edit your own profile.
                </div>
              )}

              <div className="grid grid-cols-4 items-center gap-4">
                <Label>ID</Label>
                <span className="col-span-3 font-mono text-xs text-muted-foreground">
                  {admin.id}
                </span>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={editableName}
                  onChange={(e) => setEditableName(e.target.value)}
                  className="col-span-3"
                  disabled={!canEdit}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={editableEmail}
                  onChange={(e) => setEditableEmail(e.target.value)}
                  className="col-span-3"
                  disabled={!canEdit}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={editablePhone}
                  onChange={(e) => setEditablePhone(e.target.value)}
                  className="col-span-3"
                  disabled={!canEdit}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                onClick={handleSaveClick}
                disabled={!canEdit || isUpdating}
              >
                {isUpdating && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Changes
              </Button>
            </div>
          </TabsContent>

          <TabsContent
            value="logs"
            className="flex-1 overflow-hidden flex flex-col py-4"
          >
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-4">
                {isLoadingLogs ? (
                  <div className="flex justify-center p-4">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : logsData?.data && logsData.data.length > 0 ? (
                  logsData.data.map((log) => (
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
                      <div className="text-muted-foreground text-xs">
                        IP: {log.ipAddress || "N/A"}
                      </div>
                      {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <div className="mt-2 bg-muted/50 p-2 rounded text-xs font-mono break-all">
                          {JSON.stringify(log.metadata)}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground">
                    No activity logs found.
                  </p>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};

export default AdminDetailDrawer;
