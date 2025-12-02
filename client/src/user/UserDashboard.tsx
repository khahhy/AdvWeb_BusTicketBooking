import Navbar from "@/components/common/Navbar";
import HeroSection from "@/components/dashboard/HeroSection";
import PopularRoutes from "@/components/dashboard/PopularRoutes";
import CustomerFeedback from "@/components/dashboard/CustomerFeedback";
import Features from "@/components/dashboard/Features";
import Footer from "@/components/dashboard/Footer";

export default function UserDashboard() {
  return (
    <div className="min-h-screen bg-background dark:bg-black text-foreground">
      {/* Responsive Navbar */}
      <Navbar />

      {/* Hero Section with Responsive Search Form */}
      <HeroSection />

      {/* Popular Routes Section */}
      <section className="py-12 sm:py-16 md:py-20">
        <PopularRoutes />
      </section>

      {/* Customer Feedback Section */}
      <section className="py-12 sm:py-16 md:py-20">
        <CustomerFeedback />
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 md:py-20">
        <Features />
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
