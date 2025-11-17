import {
  LayoutDashboard,
  Users,
  User,
  UserCog,
  Workflow,
  MapPin,
  Bus,
  Network,
  Calendar,
  type LucideIcon,
} from "lucide-react";

export interface NavItemSub {
  label: string;
  icon: LucideIcon;
  path: string;
}

export interface NavItem {
  label: string;
  icon: LucideIcon;
  path: string;
  subItems?: NavItemSub[];
}

export const sidebarNavItems: NavItem[] = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/admin",
  },
  {
    label: "User Management",
    icon: Users,
    path: "/admin/users-management",
    subItems: [
      {
        label: "Passengers",
        icon: User,
        path: "/admin/users-management/passengers",
      },
      {
        label: "Administrators",
        icon: UserCog,
        path: "/admin/users-management/admins",
      },
    ],
  },
  {
    label: "Bus Operations",
    icon: Workflow,
    path: "/admin/bus-operations",
    subItems: [
      {
        label: "Locations",
        icon: MapPin,
        path: "/admin/bus-operations/locations",
      },
      {
        label: "Buses",
        icon: Bus,
        path: "/admin/bus-operations/buses",
      },
      {
        label: "Routes",
        icon: Network,
        path: "/admin/bus-operations/routes",
      },
      {
        label: "Trips",
        icon: Calendar,
        path: "/admin/bus-operations/trips",
      },
    ],
  },
];
