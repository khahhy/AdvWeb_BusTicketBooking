import React from "react";
import { NavLink } from "react-router-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { NavItem } from "./adminSidebar.config";

export const getNavLinkClass = (
  path: string,
  currentPath: string,
  isCollapsed: boolean,
  isSubItem = false
) => {
  const isActive = currentPath.startsWith(path);

  const baseClasses = [
    "flex",
    "items-center",
    "gap-3",
    "transition-all",
    "w-full",
    isActive
      ? "font-medium text-primary bg-primary-foreground"
      : "text-muted-foreground hover:text-primary",
  ];

  if (isCollapsed) {
    baseClasses.push("justify-center", "group-hover:justify-start");
    if (isSubItem) {
      baseClasses.push(
        "rounded-md",
        "px-4",
        "group-hover:pl-12",
        "group-hover:pr-4"
      );
    } else {
      baseClasses.push("rounded-lg", "p-4", "group-hover:px-4");
    }
  } else {
    baseClasses.push("justify-start", "rounded-lg", "py-4");
    if (isSubItem) {
      baseClasses.push("pl-12", "pr-4");
    } else {
      baseClasses.push("px-4");
    }
  }

  return cn(baseClasses);
};

export const NavLinkContent = ({
  icon: Icon,
  label,
  isCollapsed,
}: {
  icon: React.ElementType;
  label: string;
  isCollapsed: boolean;
}) => (
  <>
    <Icon className="h-5 w-5" />
    <span
      className={cn(
        "flex-1 whitespace-nowrap",
        isCollapsed && "hidden group-hover:inline"
      )}
    >
      {label}
    </span>
  </>
);

export const TooltipNavLink = ({
  isCollapsed,
  label,
  children,
}: {
  isCollapsed: boolean;
  label: string;
  children: React.ReactNode;
}) => {
  if (isCollapsed) {
    return (
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>
          <div className="group/tooltip">{children}</div>
        </TooltipTrigger>
        <TooltipContent
          side="right"
          className="group-hover/tooltip:hidden group-hover:hidden"
        >
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    );
  }
  return <>{children}</>;
};

export const SidebarLink = ({
  item,
  isCollapsed,
  currentPath,
}: {
  item: NavItem;
  isCollapsed: boolean;
  currentPath: string;
}) => (
  <TooltipNavLink isCollapsed={isCollapsed} label={item.label}>
    <NavLink
      to={item.path}
      end={item.path === "/admin"}
      className={getNavLinkClass(item.path, currentPath, isCollapsed)}
    >
      <div
        className={cn(
          "flex items-center gap-3",
          isCollapsed ? "justify-center group-hover:flex-1" : "flex-1"
        )}
      >
        <NavLinkContent
          icon={item.icon}
          label={item.label}
          isCollapsed={isCollapsed}
        />
      </div>
    </NavLink>
  </TooltipNavLink>
);

export const SidebarAccordion = ({
  item,
  isCollapsed,
  currentPath,
}: {
  item: NavItem;
  isCollapsed: boolean;
  currentPath: string;
}) => (
  <Accordion
    type="single"
    collapsible
    defaultValue={currentPath.startsWith(item.path) ? item.label : undefined}
    className="w-full"
  >
    <AccordionItem value={item.label} className="border-none">
      <TooltipNavLink isCollapsed={isCollapsed} label={item.label}>
        <AccordionTrigger
          className={cn(
            getNavLinkClass(item.path, currentPath, isCollapsed),
            "hover:no-underline",
            "[&>svg.shrink-0]:hidden"
          )}
        >
          <div
            className={cn(
              "flex items-center gap-3",
              isCollapsed ? "justify-center group-hover:flex-1" : "flex-1"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span
              className={cn(
                "flex-1 whitespace-nowrap text-left",
                isCollapsed && "hidden group-hover:inline"
              )}
            >
              {item.label}
            </span>
          </div>

          <svg
            className={cn(
              "h-4 w-4 transition-transform duration-200",
              currentPath.startsWith(item.path) ? "rotate-180" : "rotate-0",
              isCollapsed ? "hidden group-hover:inline" : "inline"
            )}
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </AccordionTrigger>
      </TooltipNavLink>

      <AccordionContent
        className={cn("pt-1", isCollapsed && "hidden group-hover:block")}
      >
        <nav className="grid gap-5">
          {item.subItems?.map((subItem) => (
            <TooltipNavLink
              key={subItem.path}
              isCollapsed={isCollapsed}
              label={subItem.label}
            >
              <NavLink
                to={subItem.path}
                className={getNavLinkClass(
                  subItem.path,
                  currentPath,
                  isCollapsed,
                  true
                )}
              >
                <NavLinkContent
                  icon={subItem.icon}
                  label={subItem.label}
                  isCollapsed={isCollapsed}
                />
              </NavLink>
            </TooltipNavLink>
          ))}
        </nav>
      </AccordionContent>
    </AccordionItem>
  </Accordion>
);
