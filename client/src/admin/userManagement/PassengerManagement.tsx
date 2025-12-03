import { useState } from "react";
import {
  Users,
  UserPlus,
  UserCheck,
  Search,
  Filter,
  ArrowUpDown,
  Eye,
  Loader2,
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
import { useGetUsersQuery, useGetUserStatsQuery } from "@/store/api/usersApi";
import { User, UserRole, UserStatus } from "@/store/type/usersType";
import { useDebounce } from "@/hooks/useDebounce";

const PassengerManagement = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [selectedPassenger, setSelectedPassenger] = useState<User | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const { data: statsData } = useGetUserStatsQuery();

  const {
    data: usersData,
    isLoading,
    isFetching,
  } = useGetUsersQuery({
    page: page,
    limit: 10,
    search: debouncedSearch,
    role: UserRole.passenger,
  });

  const users = usersData?.data || [];
  const meta = usersData?.meta;

  const handleViewClick = (passenger: User) => {
    setSelectedPassenger(passenger);
    setIsSheetOpen(true);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= (meta?.totalPages || 1)) {
      setPage(newPage);
    }
  };

  const getStatusBadgeVariant = (status: UserStatus) => {
    switch (status) {
      case UserStatus.active:
        return "secondary";
      case UserStatus.banned:
        return "destructive";
      case UserStatus.unverified:
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-2 md:gap-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Users"
          value={statsData?.data.total.value.toLocaleString() || "..."}
          icon={Users}
          description={`${statsData?.data.total.growth || 0}% from last month`}
        />
        <StatCard
          title="New Users (Month)"
          value={statsData?.data.newThisMonth.value.toLocaleString() || "..."}
          icon={UserPlus}
          description={`${statsData?.data.newThisMonth.growth || 0}% growth`}
        />
        <StatCard
          title="Active Users"
          value={statsData?.data.active.value.toLocaleString() || "..."}
          icon={UserCheck}
          description={`${statsData?.data.active.growth || 0}% active rate`}
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
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
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
                  <TableHead>Joined</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading || isFetching ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <Loader2 className="mr-2 h-6 w-6 animate-spin inline" />{" "}
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No passengers found.
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((passenger) => (
                    <TableRow key={passenger.id}>
                      <TableCell className="font-medium">
                        {passenger.fullName || "—"}
                      </TableCell>
                      <TableCell>{passenger.email}</TableCell>
                      <TableCell>{passenger.phoneNumber || "—"}</TableCell>
                      <TableCell>
                        {new Date(passenger.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={getStatusBadgeVariant(passenger.status)}
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
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-end pt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handlePageChange(page - 1)}
                    className={
                      page <= 1
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink isActive>{page}</PaginationLink>
                </PaginationItem>

                <PaginationItem>
                  <PaginationNext
                    onClick={() => handlePageChange(page + 1)}
                    className={
                      page >= (meta?.totalPages || 1)
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
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
      />
    </div>
  );
};

export default PassengerManagement;
