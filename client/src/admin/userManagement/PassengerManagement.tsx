import { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  UserCheck,
  Search,
  Filter,
  ArrowUpDown,
  Eye,
} from "lucide-react";
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PassengerDetailDrawer, StatCard } from "@/components/admin";
import { type Passenger } from "@/store/type/usersType";

const mockPassengers: Passenger[] = [
  {
    id: "CUST-001",
    name: "Nguyễn Văn A",
    email: "vana@example.com",
    phone: "0901234567",
    status: "Active",
    joinDate: "2024-10-01T10:00:00Z",
    bookings: [
      {
        id: "B-001",
        trip: "Sài Gòn - Đà Lạt",
        date: "2024-10-20",
        status: "Completed",
      },
    ],
  },
  {
    id: "CUST-002",
    name: "Trần Thị B",
    email: "thib@example.com",
    phone: "0901234568",
    status: "Active",
    joinDate: "2024-09-15T14:30:00Z",
    bookings: [
      {
        id: "B-002",
        trip: "Hà Nội - Hải Phòng",
        date: "2024-09-30",
        status: "Completed",
      },
    ],
  },
  {
    id: "CUST-003",
    name: "Phạm Văn C",
    email: "vanc@example.com",
    phone: "0901234569",
    status: "Banned",
    joinDate: "2024-08-05T08:00:00Z",
    bookings: [
      {
        id: "B-003",
        trip: "Đà Nẵng - Huế",
        date: "2024-08-10",
        status: "Cancelled",
      },
    ],
  },
];

const PassengerManagement = () => {
  const [selectedPassenger, setSelectedPassenger] = useState<Passenger | null>(
    null,
  );
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const [editableName, setEditableName] = useState("");
  const [editableEmail, setEditableEmail] = useState("");
  const [editablePhone, setEditablePhone] = useState("");

  useEffect(() => {
    if (selectedPassenger) {
      setEditableName(selectedPassenger.name);
      setEditableEmail(selectedPassenger.email);
      setEditablePhone(selectedPassenger.phone);
    }
  }, [selectedPassenger]);

  const handleViewClick = (passenger: Passenger) => {
    setSelectedPassenger(passenger);
    setIsSheetOpen(true);
  };

  const handleSaveUser = () => {
    if (!selectedPassenger) return;
    console.log("Saving user...", selectedPassenger.id, {
      name: editableName,
      email: editableEmail,
      phone: editablePhone,
    });

    setIsSheetOpen(false);
  };

  const handleBanUser = () => {
    if (!selectedPassenger) return;
    console.log("Banning user...", selectedPassenger.id);
    setIsSheetOpen(false);
  };

  const handleUnbanUser = () => {
    if (!selectedPassenger) return;
    console.log("Unbanning user...", selectedPassenger.id);
    setIsSheetOpen(false);
  };

  return (
    <div className="flex flex-1 flex-col gap-2 md:gap-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Users"
          value="1,250"
          icon={Users}
          description="+20.1% from last month"
        />
        <StatCard
          title="New Users"
          value="+180"
          icon={UserPlus}
          description="+15.2% from last month"
        />
        <StatCard
          title="Active Users"
          value="890"
          icon={UserCheck}
          description="+5.1% from last month"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Passengers List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-2 py-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by name, email, or phone..."
                className="w-full pl-8 md:w-1/2 lg:w-1/3"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">
                  <Filter className="mr-2 h-4 w-4" /> Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filter by status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem checked>
                  Active
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>Banned</DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button variant="ghost">
                      Name <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockPassengers.map((passenger) => (
                  <TableRow key={passenger.id}>
                    <TableCell className="font-medium">
                      {passenger.name}
                    </TableCell>
                    <TableCell>{passenger.email}</TableCell>
                    <TableCell>{passenger.phone}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          passenger.status === "Active"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {passenger.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewClick(passenger)}
                      >
                        <Eye className="mr-2 h-4 w-4" /> View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-end pt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">1</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" isActive>
                    2
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">3</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext href="#" />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>

      <PassengerDetailDrawer
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        passenger={selectedPassenger}
        onSave={handleSaveUser}
        onBan={handleBanUser}
        onUnban={handleUnbanUser}
      />
    </div>
  );
};

export default PassengerManagement;
