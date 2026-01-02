import { Link, useNavigate } from "react-router-dom";
import { Menu, Bell, Calendar } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AdminSidebarNav } from "@/components/admin";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { AppLogo } from "@/components/AppLogo/AppLogo";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { useDispatch, useSelector } from "react-redux";
import { logOut, selectCurrentUser } from "@/store/slice/authSlice";

const AdminHeader = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector(selectCurrentUser);

  const getInitials = (name?: string) => {
    if (!name) return "AD";
    const words = name.trim().split(/\s+/);
    if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  };

  const handleLogout = () => {
    dispatch(logOut());
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
              <AppLogo className="h-8 w-auto object-contain" />
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
        <AppLogo className="h-8 w-auto object-contain" />
      </Link>

      <div className="flex-1" />

      <form className="hidden lg:block">
        <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-2 rounded-lg border dark:border-gray-700 shadow-sm">
          <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {new Date().toLocaleDateString("vi-VN")}
          </span>
        </div>
      </form>

      <div className="flex items-center gap-2">
        <ThemeToggle />

        <Button variant="ghost" size="icon" className="rounded-full">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Toggle notifications</span>
        </Button>

        <HoverCard openDelay={100}>
          <HoverCardTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarImage
                  src="https://github.com/shadcn.png"
                  alt="@shadcn"
                />
                <AvatarFallback>
                  {getInitials(user?.fullName ?? "Admin")}
                </AvatarFallback>
              </Avatar>
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </HoverCardTrigger>
          <HoverCardContent align="end" className="w-56 p-2">
            <div className="px-2 py-1.5 text-sm font-semibold">
              {user?.fullName || user?.email || "Admin"}
            </div>
            <Separator className="my-1" />
            <div className="space-y-1">
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
      </div>
    </header>
  );
};

export default AdminHeader;
