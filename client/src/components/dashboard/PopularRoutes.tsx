import { BlurText } from '@/components/ui/blur-text'
import { Highlight } from '@/components/ui/hero-highlight'

interface Route {
  from: string
  to: string
  price: string
  duration: string
}

export default function PopularRoutes() {
  const popularRoutes: Route[] = [
    { from: 'Ho Chi Minh City', to: 'Da Lat', price: '$10', duration: '6h' },
    { from: 'Ho Chi Minh City', to: 'Nha Trang', price: '$15', duration: '8h' },
    { from: 'Hanoi', to: 'Sapa', price: '$8', duration: '5h' },
    { from: 'Ho Chi Minh City', to: 'Can Tho', price: '$5', duration: '3h' },
  ]

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Title */}
          <div className="lg:pr-8">
            <div className="text-4xl lg:text-5xl font-bold text-gray-800 dark:text-white mb-6">
              <BlurText 
                text="Discover Vietnam's Most"
                className="inline"
                animateBy="words"
                direction="top"
                delay={150}
                stepDuration={0.4}
              />
              {' '}
              <Highlight className="text-black dark:text-white">
                Beloved Routes
              </Highlight>
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Experience the magic of Vietnam through our carefully curated routes that connect the most beautiful destinations across the country.
            </p>
          </div>

          {/* Right Column - Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {popularRoutes.map((route, index) => (
              <div key={index} className="bg-card p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-semibold">{route.from}</span>
                  <span className="text-2xl">→</span>
                  <span className="text-lg font-semibold">{route.to}</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Price from:</span>
                    <span className="font-bold text-primary">{route.price}</span>
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
  )
}
