import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftRight, Search, Calendar as CalendarIcon } from 'lucide-react';
import dayjs, { Dayjs } from 'dayjs';
import ResizableNavbar, { NavItem } from '@/components/ui/resizable-navbar';
import { Bus, Map, Ticket, User, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import logoImage from '@/assets/images/logo.png';
import backgroundImage from '@/assets/images/background.png';
import TripCard from '@/components/search/TripCard';
import FilterPanel from '@/components/search/FilterPanel';
import Footer from '@/components/dashboard/Footer';
import { mockTrips } from '@/data/mockTrips';

export default function SearchPage() {
  const navigate = useNavigate();
  const [fromLocation, setFromLocation] = useState('Ho Chi Minh City');
  const [toLocation, setToLocation] = useState('Mui Ne');
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());
  const [openTripId, setOpenTripId] = useState<string | null>(null);

  const navItems: NavItem[] = [
    {
      name: 'Routes',
      link: '/routes',
      icon: <Map className="h-4 w-4" />,
      children: [
        {
          name: 'Ho Chi Minh City - Da Lat',
          link: '/routes/hcm-dalat',
          icon: <Bus className="h-4 w-4 text-blue-500" />,
        },
        {
          name: 'Ho Chi Minh City - Nha Trang',
          link: '/routes/hcm-nhatrang',
          icon: <MapPin className="h-4 w-4 text-green-500" />,
        },
      ],
    },
    {
      name: 'Schedule',
      link: '/schedule',
      icon: <CalendarIcon className="h-4 w-4" />,
    },
    {
      name: 'Services',
      link: '/services',
      icon: <Ticket className="h-4 w-4" />,
    },
    {
      name: 'About Us',
      link: '/about',
      icon: <User className="h-4 w-4" />,
    },
  ];

  const handleSwap = () => {
    const temp = fromLocation;
    setFromLocation(toLocation);
    setToLocation(temp);
  };

  const handleSearch = () => {
    console.log('Searching...', { fromLocation, toLocation, selectedDate });
  };

  const formatDate = () => {
    if (!selectedDate) return 'Select date';
    return selectedDate.format('MMM DD, YYYY');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-50">
      {/* Navbar */}
      <ResizableNavbar
        items={navItems}
        logo={
          <img
            src={logoImage}
            alt="Bus logo"
            className="w-20 h-20 object-contain cursor-pointer"
            onClick={() => navigate('/dashboard')}
          />
        }
        button={
          <Button className="bg-white hover:bg-gray-50 text-black px-6 py-2 rounded-full border border-gray-200 shadow-sm text-base font-medium">
            Login
          </Button>
        }
      />

      {/* Search Section */}
      <div 
        className="pt-56 pb-48 bg-cover bg-center bg-no-repeat relative"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        {/* Gradient fade overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-pink-50 via-pink-50/60 via-pink-50/30 to-transparent pointer-events-none"></div>
        
        {/* Optional overlay for better text readability */}
        {/* <div className="absolute inset-0 bg-black/20"></div> */}
        
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <h1 className="text-4xl font-bold text-foreground/80 mb-2 text-center opacity-0 animate-[fadeInDown_0.7s_ease-out_0.2s_forwards]">
            Find Your Bus Journey
          </h1>
          <p className="text-blue-100 text-center mb-8 text-foreground/60 opacity-0 animate-[fadeInDown_0.7s_ease-out_0.4s_forwards]">
            Safe, Comfortable, and Affordable Bus Travel
          </p>

          {/* Search Bar */}
          <div className="max-w-4xl mx-auto opacity-0 animate-[fadeInUp_0.8s_ease-out_0.6s_forwards]">
            <div className="flex items-center gap-4 bg-white rounded-full shadow-2xl p-2 border border-gray-200">
              {/* From Field */}
              <div className="flex-1 px-6 py-4">
                <div className="text-xs font-medium text-gray-500 mb-1">From</div>
                <Select value={fromLocation} onValueChange={setFromLocation}>
                  <SelectTrigger className="w-full text-lg font-medium border-0 focus:ring-0 bg-transparent h-auto p-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ho Chi Minh City">Ho Chi Minh City</SelectItem>
                    <SelectItem value="Mui Ne">Mui Ne</SelectItem>
                    <SelectItem value="Da Lat">Da Lat</SelectItem>
                    <SelectItem value="Nha Trang">Nha Trang</SelectItem>
                    <SelectItem value="Ba Ria - Vung Tau">Ba Ria - Vung Tau</SelectItem>
                  </SelectContent>
                </Select>
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
                <Select value={toLocation} onValueChange={setToLocation}>
                  <SelectTrigger className="w-full text-lg font-medium border-0 focus:ring-0 bg-transparent h-auto p-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mui Ne">Mui Ne</SelectItem>
                    <SelectItem value="Da Lat">Da Lat</SelectItem>
                    <SelectItem value="Nha Trang">Nha Trang</SelectItem>
                    <SelectItem value="Ho Chi Minh City">Ho Chi Minh City</SelectItem>
                    <SelectItem value="Ba Ria - Vung Tau">Ba Ria - Vung Tau</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date Picker */}
              <Popover>
                <PopoverTrigger asChild>
                  <div className="flex-1 px-6 py-4 cursor-pointer">
                    <div className="text-xs font-medium text-gray-500 mb-1">Date</div>
                    <div className="text-lg font-medium text-gray-900">{formatDate()}</div>
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="center">
                  <Calendar
                    value={selectedDate}
                    onChange={setSelectedDate}
                    disablePast
                  />
                </PopoverContent>
              </Popover>

              {/* Search Button */}
              <button
                onClick={handleSearch}
                className="flex-shrink-0 bg-black text-white p-4 rounded-full hover:bg-gray-800 transition-all duration-200 transform hover:scale-105"
              >
                <Search className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-7xl mx-auto px-6 py-12 pb-20">
        {/* Header Section */}
        <div className="mb-8 flex gap-6">
          <div className="w-80 flex-shrink-0"></div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Available Trips
                </h2>
                <p className="text-gray-600">
                  {fromLocation} → {toLocation} • {formatDate()}
                </p>
              </div>
              <div className="text-sm text-gray-500">
                {mockTrips.length} trips found
              </div>
            </div>
          </div>
        </div>

        {/* Filter and Trip Cards Layout */}
        <div className="flex gap-6">
          {/* Filter Panel - Left Side */}
          <div className="w-80 flex-shrink-0">
            <FilterPanel />
          </div>

          {/* Trip Cards - Right Side */}
          <div className="flex-1 space-y-6">
            {mockTrips.map((trip) => (
              <TripCard 
                key={trip.id} 
                trip={trip} 
                isOpen={openTripId === trip.id}
                onToggle={(tripId) => setOpenTripId(openTripId === tripId ? null : tripId)}
              />
            ))}

            {/* No Results */}
            {mockTrips.length === 0 && (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🚌</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No trips found
                </h3>
                <p className="text-gray-600">
                  Try adjusting your search criteria
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
