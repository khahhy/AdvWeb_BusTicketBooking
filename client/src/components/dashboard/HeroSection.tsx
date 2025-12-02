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

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 relative z-10">
        <div className="text-center mb-8 md:mb-16">
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 md:mb-6 leading-tight">
            <span className="inline-flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
              Effortless{" "}
              <img
                src={busLogoImage}
                alt="Bus logo"
                className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 object-contain dark:hidden"
              />
              <img
                src={busLogoWhite}
                alt="Bus logo"
                className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 object-contain hidden dark:block"
              />
              <span className="italic font-light">Booking</span>
            </span>
            <span className="block sm:inline">,</span>
            <br className="hidden sm:block" />
            <span className="font-black">Smarter Journeys</span>
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl opacity-90 max-w-2xl mx-auto px-4">
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
