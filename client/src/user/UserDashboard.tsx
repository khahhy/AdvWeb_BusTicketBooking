import { useState } from 'react'
import ResizableNavbar, { NavItem } from '@/components/ui/resizable-navbar'
import { Bus, Map, Ticket, User, Phone, MapPin, Calendar, ArrowLeftRight, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import LogoLoop from '@/components/ui/logo-loop'
import { BlurText } from '@/components/ui/blur-text'
import { InfiniteMovingCards } from '@/components/ui/infinite-moving-cards'
import { Highlight } from '@/components/ui/hero-highlight'
import backgroundImage from '@/assets/images/background.png'
import backgroundImage1 from '@/assets/images/background1.png'
import busLogoImage from '@/assets/images/bus.png'
import logoImage from '@/assets/images/logo.png'
import { DateRangeCalendar } from '@mui/x-date-pickers-pro/DateRangeCalendar'
import { Box, Popover } from '@mui/material'
import dayjs, { Dayjs } from 'dayjs'

export default function UserDashboard() {
  const [fromLocation, setFromLocation] = useState('')
  const [toLocation, setToLocation] = useState('')
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([null, null])
  const [datePickerAnchor, setDatePickerAnchor] = useState<HTMLElement | null>(null)

  const handleSwap = () => {
    const tempLocation = fromLocation
    setFromLocation(toLocation)
    setToLocation(tempLocation)
  }

  const handleDateClick = (event: React.MouseEvent<HTMLElement>) => {
    setDatePickerAnchor(event.currentTarget)
  }

  const handleDateClose = () => {
    setDatePickerAnchor(null)
  }

  const formatDateRange = () => {
    if (!dateRange[0] && !dateRange[1]) return 'Select dates'
    if (dateRange[0] && !dateRange[1]) return dayjs(dateRange[0]).format('MMM DD')
    if (dateRange[0] && dateRange[1]) {
      return `${dayjs(dateRange[0]).format('MMM DD')} - ${dayjs(dateRange[1]).format('MMM DD')}`
    }
    return 'Select dates'
  }

  const navItems: NavItem[] = [
    {
      name: 'Routes',
      link: '/routes',
      icon: <Map className="h-4 w-4" />,
      children: [
        {
          name: 'Ho Chi Minh City - Da Lat',
          link: '/routes/hcm-dalat',
          icon: <Bus className="h-4 w-4 text-blue-500" />
        },
        {
          name: 'Ho Chi Minh City - Nha Trang',
          link: '/routes/hcm-nhatrang',
          icon: <MapPin className="h-4 w-4 text-green-500" />
        },
        {
          name: 'Hanoi - Sapa',
          link: '/routes/hn-sapa',
          icon: <MapPin className="h-4 w-4 text-purple-500" />
        },
        {
          name: 'Ho Chi Minh City - Can Tho',
          link: '/routes/hcm-cantho',
          icon: <Bus className="h-4 w-4 text-orange-500" />
        }
      ]
    },
    {
      name: 'Schedule',
      link: '/schedule',
      icon: <Calendar className="h-4 w-4" />
    },
    {
      name: 'Services',
      link: '/services',
      icon: <Ticket className="h-4 w-4" />,
      children: [
        {
          name: 'Book Online',
          link: '/booking',
          icon: <Ticket className="h-4 w-4 text-blue-500" />
        },
        {
          name: 'Track Ticket',
          link: '/ticket-lookup',
          icon: <User className="h-4 w-4 text-green-500" />
        },
        {
          name: 'Customer Support',
          link: '/support',
          icon: <Phone className="h-4 w-4 text-orange-500" />
        }
      ]
    },
    {
      name: 'About Us',
      link: '/about',
      icon: <User className="h-4 w-4" />
    }
  ]

  const popularRoutes = [
    { from: 'Ho Chi Minh City', to: 'Da Lat', price: '$10', duration: '6h' },
    { from: 'Ho Chi Minh City', to: 'Nha Trang', price: '$15', duration: '8h' },
    { from: 'Hanoi', to: 'Sapa', price: '$8', duration: '5h' },
    { from: 'Ho Chi Minh City', to: 'Can Tho', price: '$5', duration: '3h' },
  ]

  const testimonials = [
    {
      quote: "Amazing service! The bus was comfortable and arrived exactly on time. The booking process was so easy and the staff was incredibly helpful.",
      name: "Nguyen Minh",
      title: "Business Traveler",
      rating: 5
    },
    {
      quote: "I've used this service multiple times for my family trips. Always reliable, clean buses, and great customer service. Highly recommended!",
      name: "Sarah Johnson",
      title: "Family Traveler",
      rating: 5
    },
    {
      quote: "Perfect for my daily commute. The routes are convenient and the prices are very reasonable. The mobile app makes booking super easy.",
      name: "Tran Van Duc",
      title: "Daily Commuter",
      rating: 5
    },
    {
      quote: "Excellent experience from Ho Chi Minh to Da Lat. Beautiful scenic route and the bus had all modern amenities. Will definitely book again!",
      name: "Emily Chen",
      title: "Tourist",
      rating: 5
    },
    {
      quote: "Professional service and punctual timing. The driver was friendly and the bus was very clean. Great value for money!",
      name: "Le Hoang Nam",
      title: "Frequent Traveler",
      rating: 4
    },
    {
      quote: "Safe and comfortable journey. The customer support team was very responsive when I had questions about my booking. Excellent service!",
      name: "Maria Rodriguez",
      title: "International Visitor",
      rating: 5
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Resizable Navbar */}
      <ResizableNavbar 
        items={navItems}
        logo={
            <img src={logoImage} alt="Bus logo" className="w-12 h-12 object-contain" />
        }
        button={
          <Button className="bg-white hover:bg-gray-50 text-black px-6 py-2 rounded-full border border-gray-200 shadow-sm">
            Login
          </Button>
        }
      />

      {/* Hero Section with Search */}
      <section 
        className="relative text-black min-h-screen flex items-center bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${backgroundImage})`
        }}
      >
        <div className="container mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <h2 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="inline-flex items-center gap-3">
                Effortless <img src={busLogoImage} alt="Bus logo" className="w-20 h-20 object-contain" />
                <span className="italic font-light"> Booking</span>
            </span>,<br/>
              <span className="font-black">Smarter Journeys</span>
            </h2>
            <p className="text-xl md:text-2xl opacity-90 max-w-2xl mx-auto">
              Discover seamless travel experiences with our booking platform
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 bg-white rounded-full shadow-2xl p-2 border border-gray-200">
              {/* From Field */}
              <div className="flex-1 px-6 py-4">
                <div className="text-xs font-medium text-gray-500 mb-1">From</div>
                <select 
                  className="w-full text-lg font-medium text-gray-900 border-0 focus:ring-0 focus:outline-none bg-transparent"
                  value={fromLocation}
                  onChange={(e) => setFromLocation(e.target.value)}
                >
                  <option value="">Select departure</option>
                  <option value="New York, USA">New York, USA</option>
                  <option value="Ho Chi Minh City">Ho Chi Minh City</option>
                  <option value="Hanoi">Hanoi</option>
                  <option value="Da Nang">Da Nang</option>
                </select>
              </div>

              {/* Swap Button */}
              <button 
                onClick={handleSwap}
                className="flex-shrink-0 p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors duration-200"
                type="button"
              >
                <ArrowLeftRight className="w-4 h-4 text-gray-600" />
              </button>

              {/* To Field */}
              <div className="flex-1 px-6 py-4">
                <div className="text-xs font-medium text-gray-500 mb-1">To</div>
                <select 
                  className="w-full text-lg font-medium text-gray-900 border-0 focus:ring-0 focus:outline-none bg-transparent"
                  value={toLocation}
                  onChange={(e) => setToLocation(e.target.value)}
                >
                  <option value="">Select destination</option>
                  <option value="Phu Quoc, Vietnam">Phu Quoc, Vietnam</option>
                  <option value="Da Lat">Da Lat</option>
                  <option value="Nha Trang">Nha Trang</option>
                  <option value="Can Tho">Can Tho</option>
                </select>
              </div>

              {/* Date Range Picker */}
              <div className="flex-1 px-6 py-4 cursor-pointer" onClick={handleDateClick}>
                <div className="text-xs font-medium text-gray-500 mb-1">Dates</div>
                <div className="text-lg font-medium text-gray-900">
                  {formatDateRange()}
                </div>
              </div>

              {/* Search Button */}
              <button className="flex-shrink-0 bg-black text-white p-4 rounded-full hover:bg-gray-800 transition-all duration-200 transform hover:scale-105">
                <Search className="w-6 h-6" />
              </button>
            </div>

            {/* Date Range Picker Popover */}
            <Popover
              open={Boolean(datePickerAnchor)}
              anchorEl={datePickerAnchor}
              onClose={handleDateClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'center',
              }}
              PaperProps={{
                sx: {
                  mt: 2,
                  borderRadius: 2,
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                }
              }}
            >
              <Box sx={{ p: 2 }}>
                <DateRangeCalendar
                  value={dateRange}
                  onChange={(newValue: [Dayjs | null, Dayjs | null]) => setDateRange(newValue)}
                  calendars={2}
                  sx={{
                    '& .MuiPickersCalendarHeader-root': {
                      paddingLeft: 2,
                      paddingRight: 2,
                    },
                    '& .MuiDayCalendar-weekDayLabel': {
                      color: '#6B7280',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                    },
                    '& .MuiPickersDay-root': {
                      fontSize: '0.875rem',
                      '&:hover': {
                        backgroundColor: '#F3F4F6',
                      },
                    },
                    '& .MuiPickersDay-today': {
                      backgroundColor: '#EFF6FF',
                      '&:hover': {
                        backgroundColor: '#DBEAFE',
                      },
                    },
                  }}
                />
              </Box>
            </Popover>
          </div>
          
          {/* Partner Logos */}
          <div className="mt-20 text-center">
            <p className="text-black/80 text-sm mb-8 font-medium">Trusted by leading transport companies</p>
            <LogoLoop className="opacity-60" speed="slow">
              <div className="text-black/60 font-bold text-lg px-8">Emirates</div>
              <div className="text-black/60 font-bold text-lg px-8">KLM</div>
              <div className="text-black/60 font-bold text-lg italic px-8">AirAsia</div>
              <div className="text-black/60 font-bold text-lg px-8">AIR INDIA</div>
              <div className="text-black/60 font-bold text-lg px-8">ETIHAD</div>
              <div className="text-black/60 font-bold text-lg px-8">Singapore Airlines</div>
              <div className="text-black/60 font-bold text-lg px-8">Qatar Airways</div>
              <div className="text-black/60 font-bold text-lg px-8">Turkish Airlines</div>
            </LogoLoop>
          </div>
        </div>
      </section>

      {/* Popular Routes */}
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

      {/* Customer Feedback */}
      <section 
        className="py-20 relative bg-cover bg-center bg-no-repeat "
        style={{
          backgroundImage: `url(${backgroundImage1})`
        }}
      >
        {/* Light overlay for better text readability */}
        <div className="absolute inset-0"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <BlurText 
              text="What Our Customers Say"
              className="text-4xl font-bold text-black mb-4"
              animateBy="words"
              direction="top"
              delay={120}
              stepDuration={0.3}
            />
            <p className="text-lg text-gray-800 max-w-2xl mx-auto">
              Real experiences from thousands of satisfied travelers who trust our service
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

      {/* Features */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12">Why Choose Us?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-6xl mb-4">🎫</div>
              <h4 className="text-xl font-semibold mb-2">Easy Booking</h4>
              <p className="text-muted-foreground">Book your tickets quickly with just a few clicks</p>
            </div>
            <div className="text-center">
              <div className="text-6xl mb-4">🛡️</div>
              <h4 className="text-xl font-semibold mb-2">Safe & Secure</h4>
              <p className="text-muted-foreground">Your information is completely secure with us</p>
            </div>
            <div className="text-center">
              <div className="text-6xl mb-4">💰</div>
              <h4 className="text-xl font-semibold mb-2">Best Prices</h4>
              <p className="text-muted-foreground">Guaranteed best ticket prices in the market</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-black py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h5 className="text-lg font-semibold mb-4">BusBooking</h5>
              <p className="text-gray-400">Vietnam's leading online bus ticket booking service</p>
            </div>
            <div>
              <h5 className="text-lg font-semibold mb-4">Quick Links</h5>
              <ul className="space-y-2 text-gray-400">
                <li>About Us</li>
                <li>Terms & Conditions</li>
                <li>Privacy Policy</li>
              </ul>
            </div>
            <div>
              <h5 className="text-lg font-semibold mb-4">Support</h5>
              <ul className="space-y-2 text-gray-400">
                <li>FAQ</li>
                <li>Contact</li>
                <li>Help Guide</li>
              </ul>
            </div>
            <div>
              <h5 className="text-lg font-semibold mb-4">Contact</h5>
              <div className="space-y-2 text-gray-400">
                <p>📞 1900-1234</p>
                <p>✉️ support@busbooking.com</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 BusBooking. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}