export default function Features() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h3 className="text-3xl font-bold text-center mb-12">Why Choose Us?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-6xl mb-4">🎫</div>
            <h4 className="text-xl font-semibold mb-2">Easy Booking</h4>
            <p className="text-muted-foreground">
              Book your tickets quickly with just a few clicks
            </p>
          </div>
          <div className="text-center">
            <div className="text-6xl mb-4">🛡️</div>
            <h4 className="text-xl font-semibold mb-2">Safe & Secure</h4>
            <p className="text-muted-foreground">
              Your information is completely secure with us
            </p>
          </div>
          <div className="text-center">
            <div className="text-6xl mb-4">💰</div>
            <h4 className="text-xl font-semibold mb-2">Best Prices</h4>
            <p className="text-muted-foreground">
              Guaranteed best ticket prices in the market
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
