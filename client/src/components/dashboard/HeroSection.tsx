import SearchBar from "./SearchBar";
import LogoLoop from "@/components/ui/logo-loop";
import backgroundImage from "@/assets/images/background.png";
import busLogoImage from "@/assets/images/bus.png";
import busLogoWhite from "@/assets/images/bus-white.svg";

export default function HeroSection() {
  return (
    <section className="relative text-black dark:text-white min-h-screen flex items-center transition-colors duration-300">
      {/* Background Image - only in light mode */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat dark:hidden"
        style={{
          backgroundImage: `url(${backgroundImage})`,
        }}
      />

      {/* Dark mode background */}
      <div className="absolute inset-0 bg-black hidden dark:block" />

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="inline-flex items-center gap-3">
              Effortless{" "}
              <img
                src={busLogoImage}
                alt="Bus logo"
                className="w-20 h-20 object-contain dark:hidden"
              />
              <img
                src={busLogoWhite}
                alt="Bus logo"
                className="w-20 h-20 object-contain hidden dark:block"
              />
              <span className="italic font-light"> Booking</span>
            </span>
            ,<br />
            <span className="font-black">Smarter Journeys</span>
          </h2>
          <p className="text-xl md:text-2xl opacity-90 max-w-2xl mx-auto">
            Discover seamless travel experiences with our booking platform
          </p>
        </div>

        <SearchBar />

        {/* Partner Logos */}
        <div className="mt-20 text-center">
          <p className="text-black/80 dark:text-white/80 text-sm mb-8 font-medium">
            Trusted by leading transport companies
          </p>
          <LogoLoop className="opacity-60" speed="slow">
            <div className="text-black/60 dark:text-white/60 font-bold text-lg px-8">
              Emirates
            </div>
            <div className="text-black/60 dark:text-white/60 font-bold text-lg px-8">
              KLM
            </div>
            <div className="text-black/60 dark:text-white/60 font-bold text-lg italic px-8">
              AirAsia
            </div>
            <div className="text-black/60 dark:text-white/60 font-bold text-lg px-8">
              AIR INDIA
            </div>
            <div className="text-black/60 dark:text-white/60 font-bold text-lg px-8">
              ETIHAD
            </div>
            <div className="text-black/60 dark:text-white/60 font-bold text-lg px-8">
              Singapore Airlines
            </div>
            <div className="text-black/60 dark:text-white/60 font-bold text-lg px-8">
              Qatar Airways
            </div>
            <div className="text-black/60 dark:text-white/60 font-bold text-lg px-8">
              Turkish Airlines
            </div>
          </LogoLoop>
        </div>
      </div>
    </section>
  );
}
