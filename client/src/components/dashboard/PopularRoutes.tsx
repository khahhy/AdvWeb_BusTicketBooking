import { useGetRoutesQuery } from "@/store/api/routesApi";
import { BlurText } from "@/components/ui/blur-text";
import { Highlight } from "@/components/ui/hero-highlight";
import dayjs from "dayjs";

export default function PopularRoutes() {
  const { data: routes, isLoading, error } = useGetRoutesQuery();

  if (isLoading) return <div>Loading popular routes...</div>;
  if (error || !routes) return <div>Failed to load routes.</div>;

  const popularRoutes = routes.slice(0, 4).map((route) => {
    const price = `$${Number(route.price).toFixed(2)}`;

    let duration = "N/A";
    const firstTrip = route.tripRoutes?.[0]?.trip;

    if (firstTrip) {
      const start = dayjs(firstTrip.startTime);
      const end = dayjs(firstTrip.endTime);
      const totalMinutes = end.diff(start, "minute");

      if (totalMinutes > 0) {
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        duration = `${hours}h${minutes > 0 ? ` ${minutes}m` : ""}`;
      }
    }

    return {
      id: route.id,
      originName: route.origin.name,
      destinationName: route.destination.name,
      price,
      duration,
    };
  });

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="lg:pr-8">
            <div className="text-4xl lg:text-5xl font-bold text-gray-800 dark:text-white mb-6">
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
            <p className="text-lg text-muted-foreground leading-relaxed">
              Experience the magic of Vietnam through our carefully curated
              routes that connect the most beautiful destinations across the
              country.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {popularRoutes.map((route) => (
              <div
                key={route.id}
                className="bg-card p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-semibold">
                    {route.originName}
                  </span>
                  <span className="text-2xl">→</span>
                  <span className="text-lg font-semibold">
                    {route.destinationName}
                  </span>
                </div>
                <div className="space-y-2">
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
                <button className="w-full mt-4 bg-primary text-primary-foreground py-2 px-4 rounded-lg hover:bg-primary/90 transition-colors">
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
