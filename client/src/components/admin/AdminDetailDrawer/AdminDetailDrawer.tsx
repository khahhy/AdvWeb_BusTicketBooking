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
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { type Admin } from "@/store/type/usersType";
import { type ActivityLog } from "@/store/type/usersType";
import { type AdminUpdateData } from "@/store/type/usersType";

interface AdminDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  admin: Admin | null;
  logs: ActivityLog[];
  currentUserId: string;
  onSave: (adminId: string, data: AdminUpdateData) => void;
}

const AdminDetailDrawer = ({
  open,
  onOpenChange,
  admin,
  logs,
  currentUserId,
  onSave,
}: AdminDetailDrawerProps) => {
  const [editableName, setEditableName] = useState("");
  const [editableEmail, setEditableEmail] = useState("");
  const [editablePhone, setEditablePhone] = useState("");

  const canEdit = currentUserId === admin?.id;

  useEffect(() => {
    if (admin) {
      setEditableName(admin.name);
      setEditableEmail(admin.email);
      setEditablePhone(admin.phone || "");
    }
  }, [admin]);

  const handleSaveClick = () => {
    if (!canEdit || !admin) return;
    onSave(admin.id, {
      name: editableName,
      email: editableEmail,
      phone: editablePhone,
    });
  };

  if (!admin) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>Administrator Details</SheetTitle>
          <SheetDescription>
            View, edit, and check activity for this admin.
          </SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="details" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="logs">Activity Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            {!canEdit && (
              <div className="mb-4 flex items-center rounded-lg border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-800 dark:border-yellow-800 dark:bg-gray-800 dark:text-yellow-300">
                <Lock className="mr-2 h-4 w-4" />
                You can only edit your own profile.
              </div>
            )}
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">ID</Label>
                <span className="col-span-3 font-mono text-sm">{admin.id}</span>
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
                  disabled={!canEdit}
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
                  disabled={!canEdit}
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
                  disabled={!canEdit}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="logs">
            <div className="mt-4 space-y-4">
              {logs.length > 0 ? (
                logs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between rounded-md border p-3"
                  >
                    <p className="text-sm">{log.action}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(log.timestamp).toLocaleString()}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground">
                  No activity logs.
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <SheetFooter className="mt-6">
          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
          <Button onClick={handleSaveClick} disabled={!canEdit}>
            Save Changes
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default AdminDetailDrawer;
