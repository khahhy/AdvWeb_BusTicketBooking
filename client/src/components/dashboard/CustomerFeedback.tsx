import { BlurText } from "@/components/ui/blur-text";
import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards";

interface Testimonial {
  quote: string;
  name: string;
  title: string;
  rating: number;
}

export default function CustomerFeedback() {
  const testimonials: Testimonial[] = [
    {
      quote:
        "Amazing service! The bus was comfortable and arrived exactly on time. The booking process was so easy and the staff was incredibly helpful.",
      name: "Nguyen Minh",
      title: "Business Traveler",
      rating: 5,
    },
    {
      quote:
        "I've used this service multiple times for my family trips. Always reliable, clean buses, and great customer service. Highly recommended!",
      name: "Sarah Johnson",
      title: "Family Traveler",
      rating: 5,
    },
    {
      quote:
        "Perfect for my daily commute. The routes are convenient and the prices are very reasonable. The mobile app makes booking super easy.",
      name: "Tran Van Duc",
      title: "Daily Commuter",
      rating: 5,
    },
    {
      quote:
        "Excellent experience from Ho Chi Minh to Da Lat. Beautiful scenic route and the bus had all modern amenities. Will definitely book again!",
      name: "Emily Chen",
      title: "Tourist",
      rating: 5,
    },
    {
      quote:
        "Professional service and punctual timing. The driver was friendly and the bus was very clean. Great value for money!",
      name: "Le Hoang Nam",
      title: "Frequent Traveler",
      rating: 4,
    },
    {
      quote:
        "Safe and comfortable journey. The customer support team was very responsive when I had questions about my booking. Excellent service!",
      name: "Maria Rodriguez",
      title: "International Visitor",
      rating: 5,
    },
  ];

  return (
    <section className="py-20 relative">
      {/* Background Image - only in light mode */}
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat dark:hidden" />

      {/* Dark mode background */}
      <div className="absolute inset-0 bg-black hidden dark:block" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <BlurText
            text="What Our Customers Say"
            className="text-4xl font-bold text-black dark:text-white mb-4"
            animateBy="words"
            direction="top"
            delay={120}
            stepDuration={0.3}
          />
          <p className="text-lg text-gray-800 dark:text-gray-200 max-w-2xl mx-auto">
            Real experiences from thousands of satisfied travelers who trust our
            service
          </p>
        </div>

        <InfiniteMovingCards
          items={testimonials}
          direction="left"
          speed="slow"
          pauseOnHover={true}
          className="mb-8"
        />
      </div>
    </section>
  );
}
