import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export interface MenuItem {
  title: string;
  href?: string;
  description?: string;
  icon?: React.ReactNode;
  children?: MenuItem[];
}

interface NavbarMenuProps {
  items: MenuItem[];
  className?: string;
  logo?: React.ReactNode;
  actions?: React.ReactNode;
}

export const NavbarMenu: React.FC<NavbarMenuProps> = ({
  items,
  className,
  logo,
  actions,
}) => {
  const [activeItem, setActiveItem] = useState<string | null>(null);

  return (
    <header className={cn("sticky top-0 z-50 py-6", className)}>
      <div className="w-[70%] mx-auto bg-white/80 backdrop-blur-md border border-gray-200/20 rounded-2xl shadow-lg px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">{logo}</div>

          {/* Navigation Menu */}
          <nav className="hidden md:flex items-center space-x-1">
            {items.map((item, index) => (
              <div
                key={index}
                className="relative"
                onMouseEnter={() => setActiveItem(item.title)}
                onMouseLeave={() => setActiveItem(null)}
              >
                <motion.a
                  href={item.href}
                  className={cn(
                    "flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-all duration-200 relative rounded-lg",
                    activeItem === item.title && "text-gray-900 bg-gray-50/50",
                  )}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {item.icon && <span className="mr-2">{item.icon}</span>}
                  {item.title}
                  {item.children && (
                    <ChevronDown
                      className={cn(
                        "ml-1 h-4 w-4 transition-transform duration-200",
                        activeItem === item.title && "rotate-180",
                      )}
                    />
                  )}
                </motion.a>

                {/* Dropdown Menu */}
                {item.children && (
                  <AnimatePresence>
                    {activeItem === item.title && (
                      <>
                        {/* Background overlay */}
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="fixed inset-0 bg-black/10 backdrop-blur-sm -z-10"
                        />

                        {/* Dropdown content */}
                        <motion.div
                          initial={{
                            opacity: 0,
                            y: 10,
                            scale: 0.95,
                            rotateX: -10,
                          }}
                          animate={{
                            opacity: 1,
                            y: 0,
                            scale: 1,
                            rotateX: 0,
                          }}
                          exit={{
                            opacity: 0,
                            y: 10,
                            scale: 0.95,
                            rotateX: -5,
                          }}
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 30,
                            duration: 0.2,
                          }}
                          className="absolute top-full left-1/2 transform -translate-x-1/2 mt-3 w-96 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 overflow-hidden"
                          style={{
                            transformOrigin: "top center",
                          }}
                        >
                          {/* Arrow */}
                          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white border-l border-t border-gray-200/50 rotate-45"></div>

                          <div className="p-6">
                            <div className="grid grid-cols-1 gap-3">
                              {item.children.map((child, childIndex) => (
                                <motion.a
                                  key={childIndex}
                                  href={child.href}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{
                                    delay: childIndex * 0.05,
                                    type: "spring",
                                    stiffness: 300,
                                    damping: 30,
                                  }}
                                  className="flex items-start p-4 rounded-xl hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-all duration-200 group border border-transparent hover:border-blue-100/50"
                                  whileHover={{ scale: 1.02, x: 4 }}
                                  whileTap={{ scale: 0.98 }}
                                >
                                  {child.icon && (
                                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center mr-4 group-hover:from-blue-200 group-hover:to-indigo-200 transition-all duration-200">
                                      {child.icon}
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors duration-200 text-sm">
                                      {child.title}
                                    </div>
                                    {child.description && (
                                      <div className="text-xs text-gray-500 mt-1 group-hover:text-blue-600/70 transition-colors duration-200">
                                        {child.description}
                                      </div>
                                    )}
                                  </div>
                                </motion.a>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                )}
              </div>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">{actions}</div>
        </div>
      </div>
    </header>
  );
};

export default NavbarMenu;
