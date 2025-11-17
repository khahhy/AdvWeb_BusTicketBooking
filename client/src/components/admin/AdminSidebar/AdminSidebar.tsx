import AdminSidebarNav from "./AdminSidebarNav";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
  isCollapsed: boolean;
}

const AdminSidebar = ({ isCollapsed }: AdminSidebarProps) => {
  return (
    <div
      className={cn(
        "hidden md:flex flex-col",
        "bg-white dark:bg-gray-900 rounded-lg shadow-sm",
        "sticky top-4",
        "h-[calc(100vh-2rem)]",
        "transition-all duration-300 group",
        isCollapsed ? "w-[88px]" : "w-[280px]",
        isCollapsed && "hover:w-[280px] z-50"
      )}
    >
      <div className="flex-1 overflow-y-auto p-2 pt-4">
        <nav className="grid items-start text-sm font-medium">
          <AdminSidebarNav isCollapsed={isCollapsed} />
        </nav>
      </div>
    </div>
  );
};

export default AdminSidebar;
