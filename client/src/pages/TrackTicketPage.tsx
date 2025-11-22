import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { buildApiUrl, API_ENDPOINTS } from '@/lib/api';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/dashboard/Footer';
import backgroundImage from '@/assets/images/background.png';
import {
  Mail,
  Phone,
  Search,
  MapPin,
  Calendar,
  Clock,
  Ticket,
  User,
  AlertCircle,
} from 'lucide-react';

interface BookingResult {
  id: string;
  bookingCode: string;
  from: string;
  to: string;
  date: string;
  departureTime: string;
  arrivalTime: string;
  seat: string;
  price: number;
  status: 'completed' | 'upcoming' | 'cancelled';
  passengerName: string;
  duration: string;
}

export default function TrackTicketPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    phoneNumber: '',
  });
  const [bookingResults, setBookingResults] = useState<BookingResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchAttempted, setSearchAttempted] = useState(false);
  const [errors, setErrors] = useState({
    email: '',
    phoneNumber: '',
  });

  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('accessToken');
    if (token) {
      setIsLoggedIn(true);
      // Redirect to booking history if already logged in
      navigate('/booking-history');
    }
  }, [navigate]);

  const validateForm = () => {
    const newErrors = {
      email: '',
      phoneNumber: '',
    };

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.phoneNumber) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^[0-9]{10,11}$/.test(formData.phoneNumber.replace(/\s/g, ''))) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error);
  };

  const handleTrackTicket = async () => {
    if (!validateForm()) return;

    setIsSearching(true);
    setSearchAttempted(true);

    try {
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock results based on form data
      const mockResults: BookingResult[] = [
        {
          id: '1',
          bookingCode: 'BUS123456',
          from: 'Ho Chi Minh City',
          to: 'Da Lat',
          date: '2024-12-01',
          departureTime: '08:00',
          arrivalTime: '14:30',
          seat: 'A12',
          price: 280000,
          status: 'upcoming',
          passengerName: 'Guest User',
          duration: '6h 30m'
        }
      ];

      setBookingResults(mockResults);
    } catch (error) {
      console.error('Error tracking ticket:', error);
      setBookingResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-700">Completed</Badge>;
      case 'upcoming':
        return <Badge className="bg-blue-100 text-blue-700">Upcoming</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-700">Cancelled</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-700">Unknown</Badge>;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  if (isLoggedIn) {
    return null; // Will be redirected
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-50">
      <Navbar />

      {/* Header Section */}
      <div
        className="pt-40 pb-32 bg-cover bg-center bg-no-repeat relative"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        {/* Gradient fade overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-pink-50 via-pink-50/80 to-transparent pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <h1 className="text-5xl font-bold text-foreground/80 mb-3 opacity-0 animate-[fadeInDown_0.7s_ease-out_0.2s_forwards]">
            Track Your Ticket
          </h1>
          <p className="text-xl text-foreground/60 opacity-0 animate-[fadeInDown_0.7s_ease-out_0.4s_forwards]">
            Enter your contact information to find your booking
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8 pb-8 -mt-16 relative z-10">
        <div className="opacity-0 animate-[fadeInUp_0.8s_ease-out_0.3s_forwards]">

          {/* Track Form */}
          <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-0 mb-8">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-3">
                Find Your Booking
              </CardTitle>
              <CardDescription className="text-gray-600">
                Enter the email and phone number used when booking your ticket
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="grid md:grid-cols-2 gap-6 mb-6">

                {/* Email Field */}
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-semibold text-gray-700">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Enter your email"
                      className={`w-full pl-12 pr-4 py-4 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                        errors.email
                          ? 'border-red-300 focus:ring-red-200 focus:border-red-400'
                          : 'border-gray-300 focus:ring-pink-200 focus:border-pink-400'
                      } bg-white`}
                    />
                    <Mail className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Phone Number Field */}
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-semibold text-gray-700">
                    Phone Number
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      placeholder="Enter your phone number"
                      className={`w-full pl-12 pr-4 py-4 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                        errors.phoneNumber
                          ? 'border-red-300 focus:ring-red-200 focus:border-red-400'
                          : 'border-gray-300 focus:ring-blue-200 focus:border-blue-400'
                      } bg-white`}
                    />
                    <Phone className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                  </div>
                  {errors.phoneNumber && (
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.phoneNumber}
                    </p>
                  )}
                </div>
              </div>

              {/* Search Button */}
              <div className="text-center">
                <Button
                  onClick={handleTrackTicket}
                  disabled={isSearching}
                  className="bg-black hover:bg-gray-800 text-white px-8 py-3 rounded-xl disabled:opacity-50"
                >
                  {isSearching ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5 mr-2" />
                      Track Ticket
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results Section */}
          {searchAttempted && (
            <div className="space-y-6">
              {bookingResults.length > 0 ? (
                <>
                  <h2 className="text-2xl font-bold text-gray-800">Your Bookings</h2>
                  {bookingResults.map((booking) => (
                    <Card key={booking.id} className="bg-white shadow-lg border-0">
                      <CardContent className="p-6">
                        <div className="grid md:grid-cols-3 gap-6 items-center">

                          {/* Trip Info */}
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <Ticket className="w-5 h-5 text-pink-500" />
                              <span className="font-bold text-lg">{booking.bookingCode}</span>
                              {getStatusBadge(booking.status)}
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <MapPin className="w-4 h-4" />
                              <span>{booking.from} → {booking.to}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <User className="w-4 h-4" />
                              <span>{booking.passengerName}</span>
                            </div>
                          </div>

                          {/* Date & Time Info */}
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 text-gray-600">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(booking.date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <Clock className="w-4 h-4" />
                              <span>{booking.departureTime} - {booking.arrivalTime}</span>
                            </div>
                            <div className="text-sm text-gray-500">
                              Duration: {booking.duration}
                            </div>
                          </div>

                          {/* Price & Seat */}
                          <div className="text-right space-y-3">
                            <div className="text-2xl font-bold text-gray-800">
                              {formatPrice(booking.price)}
                            </div>
                            <div className="text-gray-600">
                              Seat: <span className="font-semibold">{booking.seat}</span>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/booking-details/${booking.id}`)}
                              className="border-blue-300 text-blue-600 hover:bg-blue-50"
                            >
                              View Details
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </>
              ) : (
                <Card className="bg-white shadow-lg border-0">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">No Bookings Found</h3>
                    <p className="text-gray-600 mb-6">
                      We couldn't find any bookings with the provided email and phone number.
                    </p>
                    <div className="space-y-2 text-sm text-gray-500">
                      <p>• Make sure you entered the correct email and phone number</p>
                      <p>• Check if the booking was made with a different contact information</p>
                      <p>• Contact our customer support if you need assistance</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Login Suggestion */}
          <Card className="bg-blue-50 border-blue-200 border mt-8">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-800 mb-2">Have an account?</h3>
                  <p className="text-blue-700 mb-4">
                    Log in to view all your bookings, manage your trips, and enjoy a personalized experience.
                  </p>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => navigate('/login')}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Sign In
                    </Button>
                    <Button
                      onClick={() => navigate('/signup')}
                      variant="outline"
                      className="border-blue-300 text-blue-600 hover:bg-blue-50"
                    >
                      Create Account
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
