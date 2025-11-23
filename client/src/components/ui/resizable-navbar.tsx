"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ChevronDown, Menu, X } from "lucide-react";

export interface NavItem {
  name: string;
  link: string;
  children?: NavItem[];
  icon?: React.ReactNode;
  onClick?: () => void;
}

interface ResizableNavbarProps {
  items: NavItem[];
  logo: React.ReactNode;
  button?: React.ReactNode;
  className?: string;
  onItemClick?: (link: string, name: string) => void;
}

export const ResizableNavbar: React.FC<ResizableNavbarProps> = ({
  items,
  logo,
  button,
  className,
  onItemClick,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={false}
      animate={{
        width: isScrolled ? "60%" : "100%",
        borderRadius: isScrolled ? "9999px" : "0px",
        marginTop: isScrolled ? "16px" : "0px",
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
        duration: 0.3,
      }}
      className={cn(
        "fixed top-0 left-1/2 transform -translate-x-1/2 z-50 backdrop-blur-md border transition-all duration-300",
        isScrolled
          ? "bg-white/80 border-gray-200/20 shadow-lg"
          : "bg-transparent border-transparent shadow-none",
        className,
      )}
    >
      <motion.div
        className="transition-all duration-300"
        animate={{
          paddingTop: isScrolled ? "12px" : "16px",
          paddingBottom: isScrolled ? "12px" : "16px",
          paddingLeft: "24px",
          paddingRight: "24px",
        }}
      >
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div
            animate={{ scale: isScrolled ? 0.9 : 1 }}
            transition={{ duration: 0.2 }}
            className="flex-shrink-0"
          >
            {logo}
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {items.map((item, index) => (
              <div
                key={index}
                className="relative"
                onMouseEnter={() => setActiveDropdown(item.name)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <motion.a
                  href={item.link}
                  className={cn(
                    "flex items-center px-4 py-2 text-base font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200 rounded-lg",
                    activeDropdown === item.name &&
                      "text-gray-900 bg-gray-50/50",
                  )}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {item.icon && <span className="mr-2">{item.icon}</span>}
                  <span
                    className={cn(
                      "transition-all duration-200",
                      isScrolled && "text-sm",
                    )}
                  >
                    {item.name}
                  </span>
                  {item.children && (
                    <ChevronDown
                      className={cn(
                        "ml-1 h-4 w-4 transition-transform duration-200",
                        activeDropdown === item.name && "rotate-180",
                        isScrolled && "h-3 w-3",
                      )}
                    />
                  )}
                </motion.a>

                {/* Dropdown Menu */}
                {item.children && (
                  <AnimatePresence>
                    {activeDropdown === item.name && (
                      <motion.div
                        initial={{
                          opacity: 0,
                          y: 10,
                          scale: 0.95,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                          scale: 1,
                        }}
                        exit={{
                          opacity: 0,
                          y: 10,
                          scale: 0.95,
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 30,
                        }}
                        className="absolute top-full right-0 mt-2 w-72 bg-white/95 backdrop-blur-xl rounded-xl shadow-xl border border-gray-200/50 overflow-hidden z-50"
                      >
                        <div className="p-4">
                          <div className="grid grid-cols-1 gap-2">
                            {item.children.map((child, childIndex) => (
                              <motion.div
                                key={childIndex}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: childIndex * 0.05 }}
                                className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 group cursor-pointer"
                                whileHover={{ scale: 1.02 }}
                                onClick={() => {
                                  if (onItemClick) {
                                    onItemClick(child.link, child.name);
                                  } else if (child.link !== "#") {
                                    window.location.href = child.link;
                                  }
                                  setActiveDropdown(null);
                                }}
                              >
                                {child.icon && (
                                  <div className="mr-3 p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                                    {child.icon}
                                  </div>
                                )}
                                <div>
                                  <div className="font-medium text-gray-900 group-hover:text-blue-600 text-sm">
                                    {child.name}
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            ))}
          </div>

          {/* Right side content */}
          <div className="flex items-center space-x-4">
            {/* Button */}
            <motion.div
              animate={{ scale: isScrolled ? 0.9 : 1 }}
              transition={{ duration: 0.2 }}
              className="hidden md:block"
            >
              {button}
            </motion.div>

            {/* Mobile menu button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-gray-200/20 bg-white/90 backdrop-blur-md"
          >
            <div className="p-4 space-y-2">
              {items.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <a
                    href={item.link}
                    className="flex items-center px-4 py-3 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.icon && <span className="mr-3">{item.icon}</span>}
                    {item.name}
                  </a>
                  {item.children && (
                    <div className="ml-6 mt-2 space-y-1">
                      {item.children.map((child, childIndex) => (
                        <a
                          key={childIndex}
                          href={child.link}
                          className="block px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {child.name}
                        </a>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
              <div className="pt-4 border-t border-gray-200/20">{button}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default ResizableNavbar;
