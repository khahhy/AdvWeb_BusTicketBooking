import { useGetTopPerformingRoutesQuery } from "@/store/api/routesApi";
import { BlurText } from "@/components/ui/blur-text";
import { Highlight } from "@/components/ui/hero-highlight";

export default function PopularRoutes() {
  const { data: routes, isLoading, error } = useGetTopPerformingRoutesQuery(4);

  if (isLoading) return <div>Loading popular routes...</div>;
  if (error) {
    console.error("Routes API error:", error);
    return <div>Failed to load routes.</div>;
  }

  if (!routes || !Array.isArray(routes) || routes.length === 0) {
    return <div>No routes available.</div>;
  }

  const popularRoutes = routes.map((route) => {
    const price = `$${Number(route.minPrice || 0).toFixed(2)}`;

    return {
      id: route.routeId,
      originName: route.origin,
      destinationName: route.destination,
      price,
      duration: route.duration || "N/A",
    };
  });

  return (
    <section className="bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="text-center lg:text-left lg:pr-8">
            <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 dark:text-white mb-4 lg:mb-6">
              <BlurText
                text="Discover Vietnam's Most"
                className="inline"
                animateBy="words"
                direction="top"
                delay={150}
                stepDuration={0.4}
              />{" "}
              <Highlight className="text-black dark:text-white">
                Beloved Routes
              </Highlight>
            </div>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-lg mx-auto lg:mx-0">
              Experience the magic of Vietnam through our carefully curated
              routes that connect the most beautiful destinations across the
              country.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
            {popularRoutes.map((route) => (
              <div
                key={route.id}
                className="bg-card p-4 sm:p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <div className="flex items-center justify-between mb-4 text-sm sm:text-base">
                  <span className="font-semibold truncate max-w-[80px] sm:max-w-none">
                    {route.originName}
                  </span>
                  <span className="text-xl sm:text-2xl mx-2 text-primary">
                    →
                  </span>
                  <span className="font-semibold truncate max-w-[80px] sm:max-w-none">
                    {route.destinationName}
                  </span>
                </div>
                <div className="space-y-2 text-sm sm:text-base">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Price from:</span>
                    <span className="font-bold text-primary">
                      {route.price}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="font-medium">{route.duration}</span>
                  </div>
                </div>
                <button className="w-full mt-4 bg-primary text-primary-foreground py-2 px-4 rounded-lg hover:bg-primary/90 transition-colors text-sm sm:text-base font-medium">
                  View Schedule
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
