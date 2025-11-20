import { useState, useEffect } from "react";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AdminDetailDrawer, AddAdminDialog } from "@/components/admin";
import { type Admin } from "@/store/type/usersType";
import { type ActivityLog } from "@/store/type/usersType";

const mockAdmins: Admin[] = [
  {
    id: "ADM-001",
    name: "Admin Chính",
    email: "main@example.com",
    phone: "0901111111",
    createdDate: "2024-01-01T10:00:00Z",
  },
  {
    id: "ADM-002",
    name: "Admin Hỗ Trợ",
    email: "admin@example.com",
    phone: "0902222222",
    createdDate: "2024-05-15T14:30:00Z",
  },
  {
    id: "ADM-003",
    name: "Admin Mới",
    email: "support@example.com",
    createdDate: "2024-08-20T08:00:00Z",
  },
];

const mockLogs: ActivityLog[] = [
  {
    id: "LOG-1",
    action: "Logged in",
    timestamp: "2025-11-17T09:00:00Z",
  },
  {
    id: "LOG-2",
    action: "Updated passenger CUST-002 status to Banned",
    timestamp: "2025-11-16T15:30:00Z",
  },
];

const CURRENT_USER = {
  id: "ADM-002",
};

const AdminManagement = () => {
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [editableName, setEditableName] = useState("");
  const [editableEmail, setEditableEmail] = useState("");
  const [editablePhone, setEditablePhone] = useState("");

  const canEdit = CURRENT_USER.id === selectedAdmin?.id;

  useEffect(() => {
    if (selectedAdmin) {
      setEditableName(selectedAdmin.name);
      setEditableEmail(selectedAdmin.email);
      setEditablePhone(selectedAdmin.phone || "");
    }
  }, [selectedAdmin]);

  const handleViewClick = (admin: Admin) => {
    setSelectedAdmin(admin);
    setIsSheetOpen(true);
  };

  const handleSaveChanges = () => {
    if (!canEdit || !selectedAdmin) return;
    console.log("Saving admin...", selectedAdmin.id, {
      name: editableName,
      email: editableEmail,
      phone: editablePhone,
    });

    setIsSheetOpen(false);
  };

  const handleCreateAdmin = () => {
    console.log("Creating new admin...");
    setIsAddModalOpen(false);
  };

  return (
    <div className="flex flex-1 flex-col">
      <Card className="border-0 shadow-none">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Administrators List</CardTitle>
          </div>

          <AddAdminDialog
            open={isAddModalOpen}
            onOpenChange={setIsAddModalOpen}
            onCreate={handleCreateAdmin}
          />
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Date Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockAdmins.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell className="font-medium">{admin.name}</TableCell>
                    <TableCell>{admin.email}</TableCell>
                    <TableCell>{admin.phone || "N/A"}</TableCell>
                    <TableCell>
                      {new Date(admin.createdDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewClick(admin)}
                      >
                        <Eye className="mr-2 h-4 w-4" /> View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AdminDetailDrawer
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        admin={selectedAdmin}
        logs={mockLogs}
        currentUserId={CURRENT_USER.id}
        onSave={handleSaveChanges}
      />
    </div>
  );
};

export default AdminManagement;
