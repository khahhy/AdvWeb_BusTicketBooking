import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export interface MenuItem {
  title: string;
  href?: string;
  description?: string;
  children?: MenuItem[];
}

interface NavbarMenuProps {
  items: MenuItem[];
  className?: string;
}

export const NavbarMenu: React.FC<NavbarMenuProps> = ({ items, className }) => {
  const [activeItem, setActiveItem] = useState<string | null>(null);

  return (
    <nav className={cn("relative", className)}>
      <ul className="flex items-center space-x-8">
        {items.map((item, index) => (
          <li
            key={index}
            className="relative"
            onMouseEnter={() => setActiveItem(item.title)}
            onMouseLeave={() => setActiveItem(null)}
          >
            <a
              href={item.href}
              className={cn(
                "px-4 py-2 text-sm font-medium text-gray-700 hover:text-black transition-colors duration-200 relative z-10",
                activeItem === item.title && "text-black",
              )}
            >
              {item.title}
            </a>

            {item.children && (
              <AnimatePresence>
                {activeItem === item.title && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 30,
                      duration: 0.2,
                    }}
                    className="absolute top-full left-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50"
                  >
                    <div className="p-6">
                      <div className="grid grid-cols-1 gap-4">
                        {item.children.map((child, childIndex) => (
                          <motion.a
                            key={childIndex}
                            href={child.href}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: childIndex * 0.1 }}
                            className="block p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 group"
                          >
                            <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                              {child.title}
                            </div>
                            {child.description && (
                              <div className="text-sm text-gray-500 mt-1">
                                {child.description}
                              </div>
                            )}
                          </motion.a>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default NavbarMenu;
