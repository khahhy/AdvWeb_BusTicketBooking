import { useLocation } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { sidebarNavItems } from "./adminSidebar.config";
import { SidebarLink, SidebarAccordion } from "./SidebarComponents";

interface AdminSidebarNavProps {
  isCollapsed: boolean;
}

const AdminSidebarNav = ({ isCollapsed }: AdminSidebarNavProps) => {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className="overflow-x-hidden">
      <TooltipProvider>
        {sidebarNavItems.map((item) =>
          item.subItems ? (
            <SidebarAccordion
              key={item.path}
              item={item}
              isCollapsed={isCollapsed}
              currentPath={currentPath}
            />
          ) : (
            <SidebarLink
              key={item.path}
              item={item}
              isCollapsed={isCollapsed}
              currentPath={currentPath}
            />
          ),
        )}
      </TooltipProvider>
    </div>
  );
};

export default AdminSidebarNav;
