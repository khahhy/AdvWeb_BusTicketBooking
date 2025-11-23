import Navbar from "@/components/common/Navbar";
import HeroSection from "@/components/dashboard/HeroSection";
import PopularRoutes from "@/components/dashboard/PopularRoutes";
import CustomerFeedback from "@/components/dashboard/CustomerFeedback";
import Features from "@/components/dashboard/Features";
import Footer from "@/components/dashboard/Footer";

export default function UserDashboard() {
  return (
    <div className="min-h-screen bg-background body">
      {/* Resizable Navbar */}
      <Navbar />

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
