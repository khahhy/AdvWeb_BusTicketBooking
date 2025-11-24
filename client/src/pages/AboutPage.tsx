import Navbar from "@/components/common/Navbar";
import Footer from "@/components/dashboard/Footer";
import backgroundImage from "@/assets/images/background.png";
import {
  Users,
  Star,
  MapPin,
  Award,
  Bus,
  CheckCircle,
  Target,
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-50 dark:bg-black">
      <Navbar />

      {/* Hero Section */}
      <div className="pt-56 pb-48 relative">
        {/* Background Image - only in light mode */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat dark:hidden"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />

        {/* Dark mode background */}
        <div className="absolute inset-0 bg-black hidden dark:block" />

        {/* Gradient fade overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-pink-50 to-transparent dark:from-black dark:to-transparent pointer-events-none"></div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <h1 className="text-4xl font-bold text-black dark:text-white mb-2 text-center opacity-0 animate-[fadeInDown_0.7s_ease-out_0.2s_forwards]">
            About Us
          </h1>
          <p className="text-center mb-8 text-black/80 dark:text-white/80 opacity-0 animate-[fadeInDown_0.7s_ease-out_0.4s_forwards]">
            Your trusted partner for safe and comfortable bus travel across Vietnam
          </p>
        </div>
      </div>

      {/* Company Story - Dashboard Style */}
      <section className="py-16 bg-muted/30 dark:bg-black">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="lg:pr-8">
              <h2 className="text-4xl font-bold mb-6">
                Leading Bus Transportation Since 2014
              </h2>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                Bus Ticket Booking has been Vietnam's premier bus transportation
                service for over a decade. We started with a simple vision: to
                make bus travel safe, comfortable, and accessible for everyone.
              </p>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Today, we operate one of the largest and most modern bus fleets
                in the country, serving millions of passengers annually across
                major cities and destinations in Vietnam.
              </p>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="font-medium">
                  Trusted by over 2 million customers
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center p-6 bg-background rounded-lg shadow-sm">
                <Users className="w-12 h-12 mx-auto mb-4 text-pink-400" />
                <div className="text-3xl font-bold mb-2">2M+</div>
                <div className="text-sm text-muted-foreground">
                  Happy Travelers
                </div>
              </div>
              <div className="text-center p-6 bg-background rounded-lg shadow-sm">
                <Bus className="w-12 h-12 mx-auto mb-4 text-pink-400" />
                <div className="text-3xl font-bold mb-2">500+</div>
                <div className="text-sm text-muted-foreground">
                  Active Routes
                </div>
              </div>
              <div className="text-center p-6 bg-background rounded-lg shadow-sm">
                <MapPin className="w-12 h-12 mx-auto mb-4 text-pink-400" />
                <div className="text-3xl font-bold mb-2">63</div>
                <div className="text-sm text-muted-foreground">
                  Destinations
                </div>
              </div>
              <div className="text-center p-6 bg-background rounded-lg shadow-sm">
                <Award className="w-12 h-12 mx-auto mb-4 text-pink-400" />
                <div className="text-3xl font-bold mb-2">10+</div>
                <div className="text-sm text-muted-foreground">
                  Years Leading
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision - Dashboard Style */}
      <section className="py-16 bg-muted/30 dark:bg-black">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12">Our Purpose</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="text-center p-8 bg-background rounded-lg shadow-sm">
              <Target className="w-16 h-16 mx-auto mb-6 text-pink-400" />
              <h4 className="text-2xl font-bold mb-4">Our Mission</h4>
              <p className="text-muted-foreground text-lg leading-relaxed">
                To provide safe, reliable, and comfortable bus transportation
                services that connect communities and enable people to travel
                with confidence and peace of mind.
              </p>
            </div>
            <div className="text-center p-8 bg-background rounded-lg shadow-sm">
              <Star className="w-16 h-16 mx-auto mb-6 text-rose-400" />
              <h4 className="text-2xl font-bold mb-4">Our Vision</h4>
              <p className="text-muted-foreground text-lg leading-relaxed">
                To be Vietnam's leading bus transportation company, known for
                excellence in service, innovation in technology, and commitment
                to sustainable travel solutions.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
