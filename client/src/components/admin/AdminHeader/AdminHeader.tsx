import { Link, useNavigate } from "react-router-dom";
import { Menu, Search, Bell } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AdminSidebarNav } from "@/components/admin";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import logoImage from "@/assets/images/logo.png";

const AdminHeader = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <header
      className={cn(
        "flex h-16 items-center gap-4 rounded-lg shadow-sm bg-white dark:bg-gray-900 px-4 lg:px-6",
        "sticky top-0 z-50",
      )}
    >
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col p-0">
          <div className="flex h-16 items-center border-b px-4">
            <Link to="/admin" className="flex items-center gap-2 font-semibold">
              <img
                src={logoImage}
                alt="Logo"
                className="h-8 w-auto object-contain"
              />
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <AdminSidebarNav isCollapsed={false} />
          </div>
        </SheetContent>
      </Sheet>

      <Link
        to="/admin"
        className="hidden md:flex items-center gap-2 font-semibold ml-2"
      >
        <img src={logoImage} alt="Logo" className="h-8 w-auto object-contain" />
      </Link>

      <div className="flex-1" />

      <form className="hidden lg:block">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-full appearance-none bg-background pl-8 shadow-none lg:w-[300px]"
          />
        </div>
      </form>

      <Button variant="ghost" size="icon" className="rounded-full">
        <Bell className="h-5 w-5" />
        <span className="sr-only">Toggle notifications</span>
      </Button>

      <HoverCard openDelay={100}>
        <HoverCardTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Avatar className="h-9 w-9">
              <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
              <AvatarFallback>YW</AvatarFallback>
            </Avatar>
            <span className="sr-only">Toggle user menu</span>
          </Button>
        </HoverCardTrigger>
        <HoverCardContent align="end" className="w-56 p-2">
          <div className="px-2 py-1.5 text-sm font-semibold">My Account</div>
          <Separator className="my-1" />
          <div className="space-y-1">
            <Button
              variant="ghost"
              className="w-full justify-start text-sm font-normal"
            >
              Settings
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-sm font-normal"
            >
              Support
            </Button>
            <Separator className="my-1" />
            <Button
              variant="ghost"
              className="w-full justify-start text-sm font-normal"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        </HoverCardContent>
      </HoverCard>
    </header>
  );
};

export default AdminHeader;
