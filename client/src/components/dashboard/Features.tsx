import { Ticket, Shield, DollarSign } from "lucide-react";

export default function Features() {
  return (
    <section className="py-16 dark:bg-black">
      <div className="container mx-auto px-4">
        <h3 className="text-3xl font-bold text-center mb-12">Why Choose Us?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
            <div className="flex justify-center mb-6">
              <div className="bg-pink-100 dark:bg-pink-900/30 p-4 rounded-full">
                <Ticket className="w-10 h-10 text-pink-600 dark:text-pink-400" />
              </div>
            </div>
            <h4 className="text-xl font-semibold mb-3 text-center">
              Easy Booking
            </h4>
            <p className="text-muted-foreground text-center">
              Book your tickets quickly with just a few clicks
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
            <div className="flex justify-center mb-6">
              <div className="bg-pink-100 dark:bg-pink-900/30 p-4 rounded-full">
                <Shield className="w-10 h-10 text-pink-600 dark:text-pink-400" />
              </div>
            </div>
            <h4 className="text-xl font-semibold mb-3 text-center">
              Safe & Secure
            </h4>
            <p className="text-muted-foreground text-center">
              Your information is completely secure with us
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
            <div className="flex justify-center mb-6">
              <div className="bg-pink-100 dark:bg-pink-900/30 p-4 rounded-full">
                <DollarSign className="w-10 h-10 text-pink-600 dark:text-pink-400" />
              </div>
            </div>
            <h4 className="text-xl font-semibold mb-3 text-center">
              Best Prices
            </h4>
            <p className="text-muted-foreground text-center">
              Guaranteed best ticket prices in the market
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
