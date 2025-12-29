import Navbar from "@/components/common/Navbar";
import HeroSection from "@/components/dashboard/HeroSection";
import PopularRoutes from "@/components/dashboard/PopularRoutes";
import CustomerFeedback from "@/components/dashboard/CustomerFeedback";
import Features from "@/components/dashboard/Features";
import Footer from "@/components/dashboard/Footer";

export default function UserDashboard() {
  return (
    <div className="min-h-screen bg-pink-50 dark:bg-black text-foreground">
      {/* Responsive Navbar */}
      <Navbar />

      {/* Hero Section with Responsive Search Form */}
      <section className="">
        <HeroSection />
        {/* Gradient fade overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-pink-50 to-transparent dark:from-transparent dark:to-transparent pointer-events-none"></div>
      </section>

      {/* Popular Routes Section */}
      <section className="">
        <PopularRoutes />
        {/* Gradient fade overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-pink-50 to-transparent dark:from-transparent dark:to-transparent pointer-events-none"></div>
      </section>

      {/* Customer Feedback Section */}
      <section className="">
        <CustomerFeedback />
        {/* Gradient fade overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-pink-50 to-transparent dark:from-transparent dark:to-transparent pointer-events-none"></div>
      </section>

      {/* Features Section */}
      <section className="">
        <Features />
        {/* Gradient fade overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-pink-50 to-transparent dark:from-transparent dark:to-transparent pointer-events-none"></div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
