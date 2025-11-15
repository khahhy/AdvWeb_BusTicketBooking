import ResizableNavbar, { NavItem } from "@/components/ui/resizable-navbar";
import { Bus, Map, Ticket, User, Phone, MapPin, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import logoImage from "@/assets/images/logo.png";
import HeroSection from "@/components/dashboard/HeroSection";
import PopularRoutes from "@/components/dashboard/PopularRoutes";
import CustomerFeedback from "@/components/dashboard/CustomerFeedback";
import Features from "@/components/dashboard/Features";
import Footer from "@/components/dashboard/Footer";

export default function UserDashboard() {
  const navItems: NavItem[] = [
    {
      name: "Routes",
      link: "/routes",
      icon: <Map className="h-4 w-4" />,
      children: [
        {
          name: "Ho Chi Minh City - Da Lat",
          link: "/routes/hcm-dalat",
          icon: <Bus className="h-4 w-4 text-blue-500" />,
        },
        {
          name: "Ho Chi Minh City - Nha Trang",
          link: "/routes/hcm-nhatrang",
          icon: <MapPin className="h-4 w-4 text-green-500" />,
        },
        {
          name: "Hanoi - Sapa",
          link: "/routes/hn-sapa",
          icon: <MapPin className="h-4 w-4 text-purple-500" />,
        },
        {
          name: "Ho Chi Minh City - Can Tho",
          link: "/routes/hcm-cantho",
          icon: <Bus className="h-4 w-4 text-orange-500" />,
        },
      ],
    },
    {
      name: "Schedule",
      link: "/schedule",
      icon: <Calendar className="h-4 w-4" />,
    },
    {
      name: "Services",
      link: "/services",
      icon: <Ticket className="h-4 w-4" />,
      children: [
        {
          name: "Book Online",
          link: "/booking",
          icon: <Ticket className="h-4 w-4 text-blue-500" />,
        },
        {
          name: "Track Ticket",
          link: "/ticket-lookup",
          icon: <User className="h-4 w-4 text-green-500" />,
        },
        {
          name: "Customer Support",
          link: "/support",
          icon: <Phone className="h-4 w-4 text-orange-500" />,
        },
      ],
    },
    {
      name: "About Us",
      link: "/about",
      icon: <User className="h-4 w-4" />,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Resizable Navbar */}
      <ResizableNavbar
        items={navItems}
        logo={
          <img
            src={logoImage}
            alt="Bus logo"
            className="w-20 h-20 object-contain"
          />
        }
        button={
          <Button className="bg-white hover:bg-gray-50 text-black px-6 py-2 rounded-full border border-gray-200 shadow-sm text-base font-medium">
            Login
          </Button>
        }
      />

      {/* Hero Section with Search */}
      <HeroSection />

      {/* Popular Routes */}
      <PopularRoutes />

      {/* Customer Feedback */}
      <CustomerFeedback />

      {/* Features */}
      <Features />

      {/* Footer */}
      <Footer />
    </div>
  );
}
