import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Calendar as CalendarIcon } from 'lucide-react';
import ResizableNavbar, { NavItem } from '@/components/ui/resizable-navbar';
import { Bus, Map, Ticket, User, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import logoImage from '@/assets/images/logo.png';
import { mockTrips, generateSeats } from '@/data/mockTrips';
import dayjs from 'dayjs';
import TripSummaryCard from '@/components/checkout/TripSummaryCard';
import PassengerDetailsCard from '@/components/checkout/PassengerDetailsCard';
import ContactInformationCard from '@/components/checkout/ContactInformationCard';
import PriceDetailsSidebar from '@/components/checkout/PriceDetailsSidebar';
import SeatMapModal from '@/components/checkout/SeatMapModal';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Get trip data from URL params or use default
  const tripId = searchParams.get('tripId') || '1';
  const selectedSeat = searchParams.get('seat') || '25';
  const travelDate = searchParams.get('date') || dayjs().format('YYYY-MM-DD');
  
  const trip = mockTrips.find(t => t.id === tripId) || mockTrips[0];
  
  // Calculate prices
  const ticketPrice = trip.price;
  const insuranceFee = 1000;
  const serviceFee = 14000;
  const totalPrice = ticketPrice + insuranceFee + serviceFee;
  
  const [fullName, setFullName] = useState('');
  const [contactName, setContactName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [personalId, setPersonalId] = useState('');
  const [contactPersonalId, setContactPersonalId] = useState('');
  const [countryCode, setCountryCode] = useState('+84');
  const [showPassengerDetails, setShowPassengerDetails] = useState(true);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [showSeatMap, setShowSeatMap] = useState(false);
  const seats = generateSeats(trip.totalSeats, trip.totalSeats - trip.availableSeats, trip.price);
  
  const formatDate = () => {
    return dayjs(travelDate).format('ddd, MMM DD, YYYY');
  };
  
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('vi-VN') + 'VND';
  };

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

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    // Validate passenger details
    if (!fullName.trim()) {
      newErrors.fullName = 'Please enter passenger full name';
    }
    if (!personalId.trim()) {
      newErrors.personalId = 'Please enter Personal ID/Citizen ID/Passport ID';
    }

    // Validate contact information
    if (!contactName.trim()) {
      newErrors.contactName = 'Please enter contact name';
    }
    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = 'Please enter phone number';
    } else if (!/^\d{9,11}$/.test(phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }
    if (!email.trim()) {
      newErrors.email = 'Please enter email address';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!contactPersonalId.trim()) {
      newErrors.contactPersonalId = 'Please enter Personal ID/Citizen ID/Passport ID';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      console.log('Proceeding to payment...');
      // Navigate to payment page with trip details
      navigate(`/payment?tripId=${tripId}&seat=${selectedSeat}&date=${travelDate}&passengerName=${encodeURIComponent(fullName)}&passengerId=${encodeURIComponent(personalId)}&email=${encodeURIComponent(email)}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
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

      <div className="max-w-7xl mx-auto px-6 py-8 mt-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Booking Details */}
          <div className="lg:col-span-2 space-y-6">
            <TripSummaryCard 
              trip={trip}
              formatDate={formatDate}
              onDetailsClick={() => setShowSeatMap(true)}
            />

            <PassengerDetailsCard
              fullName={fullName}
              setFullName={setFullName}
              personalId={personalId}
              setPersonalId={setPersonalId}
              selectedSeat={selectedSeat}
              showPassengerDetails={showPassengerDetails}
              setShowPassengerDetails={setShowPassengerDetails}
              errors={errors}
              setErrors={setErrors}
            />

            <ContactInformationCard
              contactName={contactName}
              setContactName={setContactName}
              phoneNumber={phoneNumber}
              setPhoneNumber={setPhoneNumber}
              email={email}
              setEmail={setEmail}
              contactPersonalId={contactPersonalId}
              setContactPersonalId={setContactPersonalId}
              countryCode={countryCode}
              setCountryCode={setCountryCode}
              errors={errors}
              setErrors={setErrors}
            />
          </div>

          {/* Right Column - Price Details */}
          <div className="lg:col-span-1">
            <PriceDetailsSidebar
              selectedSeat={selectedSeat}
              ticketPrice={ticketPrice}
              insuranceFee={insuranceFee}
              serviceFee={serviceFee}
              totalPrice={totalPrice}
              formatCurrency={formatCurrency}
              onNext={handleNext}
            />
          </div>
        </div>
      </div>

      <SeatMapModal
        show={showSeatMap}
        onClose={() => setShowSeatMap(false)}
        trip={trip}
        formatDate={formatDate}
        formatCurrency={formatCurrency}
        selectedSeat={selectedSeat}
        ticketPrice={ticketPrice}
        seats={seats}
      />
    </div>
  );
}
