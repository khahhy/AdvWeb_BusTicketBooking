import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Calendar as CalendarIcon, CreditCard, Building, Smartphone } from 'lucide-react';
import ResizableNavbar, { NavItem } from '@/components/ui/resizable-navbar';
import { Bus, Map, Ticket, User, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import logoImage from '@/assets/images/logo.png';
import backgroundImage from '@/assets/images/background.png';
import { mockTrips } from '@/data/mockTrips';
import dayjs from 'dayjs';
import PaymentTripSummaryCard from '@/components/payment/PaymentTripSummaryCard';
import PaymentMethodsCard from '@/components/payment/PaymentMethodsCard';
import PaymentButton from '@/components/payment/PaymentButton';
import PaymentPriceSidebar from '@/components/payment/PaymentPriceSidebar';
import Footer from '@/components/dashboard/Footer';
import { useEffect } from 'react';

export default function PaymentPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  // Get data from URL params
  const tripId = searchParams.get('tripId') || '1';
  const selectedSeat = searchParams.get('seat') || '25';
  const travelDate = searchParams.get('date') || dayjs().format('YYYY-MM-DD');
  const passengerName = searchParams.get('passengerName') || 'VO LE VIET TU';
  const passengerIdRaw = searchParams.get('passengerId') || '123456789012';
  const passengerId = passengerIdRaw.slice(0, 4) + '*'.repeat(Math.max(0, passengerIdRaw.length - 4));
  const email = searchParams.get('email') || 'volevie***@gmail.com';
  
  const trip = mockTrips.find(t => t.id === tripId) || mockTrips[0];
  
  // Calculate prices
  const ticketPrice = trip.price;
  const insuranceFee = 1000;
  const serviceFee = 14000;
  const totalPrice = ticketPrice + insuranceFee + serviceFee;
  
  // Payment method state
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [paymentError, setPaymentError] = useState<string>('');

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

  const handlePayment = () => {
    if (!selectedPaymentMethod) {
      setPaymentError('Please select a payment method before proceeding');
      return;
    }
    setPaymentError('');
    console.log('Processing payment...', { selectedPaymentMethod });
    
    // Navigate to confirmation page with all booking data
    const confirmationUrl = `/confirmation?tripId=${tripId}&seat=${selectedSeat}&date=${travelDate}&passengerName=${encodeURIComponent(passengerName)}&passengerId=${encodeURIComponent(searchParams.get('passengerId') || '123456789012')}&email=${encodeURIComponent(searchParams.get('email') || 'example@gmail.com')}`;
    navigate(confirmationUrl);
  };

  const paymentMethods = [
    {
      id: 'credit-card',
      name: 'Credit/Debit card',
      description: 'Visa, MasterCard, JCB',
      icon: <CreditCard className="w-5 h-5" />,
    },
    {
      id: 'internet-banking',
      name: 'Internet Banking',
      description: 'ATM Card with online payment',
      icon: <Building className="w-5 h-5" />,
    },
    {
      id: 'zalopay',
      name: 'ZaloPay E-wallet',
      description: 'You must have Zalopay application on your phone',
      icon: <Smartphone className="w-5 h-5" />,
    },
  ];

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
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-base font-semibold">
            Login
          </Button>
        }
      />

      {/* Header Section with Background */}
      <div 
        className="pt-40 pb-32 bg-cover bg-center bg-no-repeat relative"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        {/* Gradient fade overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-pink-50 via-pink-50/60 via-pink-50/30 to-transparent pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <h1 className="text-5xl font-bold text-foreground/80 mb-3 opacity-0 animate-[fadeInDown_0.7s_ease-out_0.2s_forwards]">
            Complete Payment
          </h1>
          <p className="text-xl text-foreground/60 opacity-0 animate-[fadeInDown_0.7s_ease-out_0.4s_forwards]">
            Choose your preferred payment method
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 pb-20 -mt-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Trip and Payment Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="opacity-0 animate-[fadeInUp_0.8s_ease-out_0.3s_forwards]">
              <PaymentTripSummaryCard
                trip={trip}
                formatDate={formatDate}
                passengerName={passengerName}
                passengerId={passengerId}
                email={email}
              />
            </div>

            <div className="opacity-0 animate-[fadeInUp_0.8s_ease-out_0.5s_forwards]">
              <PaymentMethodsCard
                paymentMethods={paymentMethods}
                selectedPaymentMethod={selectedPaymentMethod}
                onSelectPaymentMethod={(methodId) => {
                  setSelectedPaymentMethod(methodId);
                  setPaymentError('');
                }}
                error={paymentError}
              />
            </div>

            <div className="opacity-0 animate-[fadeInUp_0.8s_ease-out_0.7s_forwards]">
              <PaymentButton onPayment={handlePayment} />
            </div>
          </div>

          {/* Right Column - Price Details */}
          <div className="lg:col-span-1">
            <div className="opacity-0 animate-[fadeInUp_0.8s_ease-out_0.4s_forwards]">
              <PaymentPriceSidebar
                selectedSeat={selectedSeat}
                ticketPrice={ticketPrice}
                insuranceFee={insuranceFee}
                serviceFee={serviceFee}
                totalPrice={totalPrice}
                formatCurrency={formatCurrency}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
