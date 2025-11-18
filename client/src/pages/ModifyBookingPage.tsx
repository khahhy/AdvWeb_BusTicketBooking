import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  X,
  AlertTriangle,
  MapPin,
  Calendar,
  Clock,
  User,
  Ticket,
  RefreshCw
} from 'lucide-react';
import Navbar from '@/components/common/Navbar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import Footer from '@/components/dashboard/Footer';
import backgroundImage from '@/assets/images/background.png';
import dayjs, { Dayjs } from 'dayjs';

interface BookingData {
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
  busNumber: string;
  busType: string;
}

// Mock booking data
const mockBookings: { [key: string]: BookingData } = {
  '2': {
    id: '2',
    bookingCode: 'BUS789012',
    from: 'Ho Chi Minh City',
    to: 'Nha Trang',
    date: '2024-12-01',
    departureTime: '22:00',
    arrivalTime: '06:30',
    seat: 'B08',
    price: 320000,
    status: 'upcoming',
    passengerName: 'Nguyen Van A',
    duration: '8h 30m',
    busNumber: 'SGN-NTR-003',
    busType: 'Sleeper Bus 34 beds'
  }
};

// Available seats for modification
const availableSeats = ['A01', 'A02', 'A03', 'B01', 'B02', 'B03', 'B05', 'B06', 'B07', 'C01', 'C02'];

export default function ModifyBookingPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [booking, setBooking] = useState<BookingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Modifiable fields
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [selectedSeat, setSelectedSeat] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  // Available times for the route
  const availableTimes = [
    { value: '06:00', label: '06:00 AM', arrival: '14:30' },
    { value: '14:00', label: '02:00 PM', arrival: '22:30' },
    { value: '22:00', label: '10:00 PM', arrival: '06:30+1' }
  ];

  useEffect(() => {
    window.scrollTo(0, 0);

    // Simulate API call
    setTimeout(() => {
      if (id && mockBookings[id]) {
        const bookingData = mockBookings[id];
        setBooking(bookingData);
        setSelectedDate(dayjs(bookingData.date));
        setSelectedSeat(bookingData.seat);
        setSelectedTime(bookingData.departureTime);
      }
      setLoading(false);
    }, 500);
  }, [id]);

  const formatDate = (dateObj: Dayjs | null) => {
    if (!dateObj) return '';
    return dateObj.format('DD/MM/YYYY');
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('vi-VN') + ' VND';
  };

  const handleSaveChanges = async () => {
    if (!booking || !selectedDate) return;

    setSaving(true);

    // Simulate API call
    setTimeout(() => {
      setSaving(false);
      alert('Booking updated successfully!');
      navigate('/booking-history');
    }, 2000);
  };

  const handleCancelBooking = async () => {
    if (!booking) return;

    setCancelling(true);

    // Simulate API call
    setTimeout(() => {
      setCancelling(false);
      setShowCancelModal(false);
      alert('Booking cancelled successfully!');
      navigate('/booking-history');
    }, 1500);
  };

  const hasChanges = () => {
    if (!booking || !selectedDate) return false;

    return (
      selectedDate.format('YYYY-MM-DD') !== booking.date ||
      selectedSeat !== booking.seat ||
      selectedTime !== booking.departureTime
    );
  };

  const getSelectedTimeDetails = () => {
    return availableTimes.find(time => time.value === selectedTime);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading booking details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Booking Not Found</h2>
            <p className="text-gray-600 mb-6">The booking you're trying to modify doesn't exist.</p>
            <Button onClick={() => navigate('/booking-history')}>Go Back to History</Button>
          </div>
        </div>
      </div>
    );
  }

  if (booking.status !== 'upcoming') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <AlertTriangle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Cannot Modify Booking</h2>
            <p className="text-gray-600 mb-6">
              Only upcoming bookings can be modified. This booking is {booking.status}.
            </p>
            <Button onClick={() => navigate('/booking-history')}>Go Back to History</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-50">
      <Navbar />

      {/* Header Section */}
      <div
        className="pt-40 pb-32 bg-cover bg-center bg-no-repeat relative"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-pink-50 via-pink-50/60 via-pink-50/30 to-transparent pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <Button
            variant="outline"
            onClick={() => navigate('/booking-history')}
            className="mb-6 bg-white/80 hover:bg-white border-white/50 opacity-0 animate-[fadeInDown_0.7s_ease-out_0.1s_forwards]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to History
          </Button>

          <h1 className="text-5xl font-bold text-foreground/80 mb-3 opacity-0 animate-[fadeInDown_0.7s_ease-out_0.2s_forwards]">
            Modify Booking
          </h1>
          <p className="text-xl text-foreground/60 opacity-0 animate-[fadeInDown_0.7s_ease-out_0.4s_forwards]">
            Booking Code: {booking.bookingCode}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 pb-8 -mt-16 relative z-10">
        {/* Current Booking Info */}
        <div className="opacity-0 animate-[fadeInUp_0.8s_ease-out_0.3s_forwards]">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Current Booking</h3>

            <div className="flex items-center justify-between mb-4">
              <div className="w-40 flex-shrink-0">
                <div className="text-xl font-bold text-gray-900">{booking.from}</div>
                <div className="text-base font-semibold text-gray-900 mt-1">{booking.departureTime}</div>
              </div>

              <div className="flex-1 px-8 text-center">
                <div className="flex items-center justify-center gap-3 mb-1">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <div className="h-0.5 w-full border-t-2 border-dashed border-gray-300"></div>
                  <MapPin className="w-4 h-4 text-gray-400" />
                </div>
                <div className="text-sm text-gray-500 flex items-center justify-center gap-1">
                  <Clock className="w-3 h-3" />
                  {booking.duration}
                </div>
              </div>

              <div className="text-right w-40 flex-shrink-0">
                <div className="text-xl font-bold text-gray-900">{booking.to}</div>
                <div className="text-base font-semibold text-gray-900 mt-1">{booking.arrivalTime}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200 text-sm">
              <div>
                <span className="text-gray-600">Travel Date:</span>
                <div className="font-semibold text-gray-900">{formatDate(dayjs(booking.date))}</div>
              </div>
              <div>
                <span className="text-gray-600">Seat:</span>
                <div className="font-semibold text-gray-900">{booking.seat}</div>
              </div>
              <div>
                <span className="text-gray-600">Passenger:</span>
                <div className="font-semibold text-gray-900">{booking.passengerName}</div>
              </div>
              <div>
                <span className="text-gray-600">Price:</span>
                <div className="font-semibold text-green-600">{formatCurrency(booking.price)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Modify Options */}
        <div className="opacity-0 animate-[fadeInUp_0.8s_ease-out_0.4s_forwards]">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Modify Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Change Date */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Travel Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {selectedDate ? formatDate(selectedDate) : 'Select date'}
                    </Button>
                  </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={selectedDate?.toDate()}
                      onSelect={(date: Date | undefined) => setSelectedDate(date ? dayjs(date) : null)}
                      disabled={(date: Date) => dayjs(date).isBefore(dayjs(), 'day')}
                      initialFocus
                    />
                    </PopoverContent>
                </Popover>
              </div>

              {/* Change Time */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Departure Time</label>
                <Select value={selectedTime} onValueChange={setSelectedTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select departure time" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTimes.map((time) => (
                      <SelectItem key={time.value} value={time.value}>
                        {time.label} → Arrives {time.arrival}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Change Seat */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Seat Number</label>
                <Select value={selectedSeat} onValueChange={setSelectedSeat}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select seat" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSeats.map((seat) => (
                      <SelectItem key={seat} value={seat}>
                        Seat {seat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Show Updated Arrival */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">New Arrival Time</label>
                <div className="flex items-center h-10 px-3 py-2 border border-input bg-gray-50 rounded-md">
                  <Clock className="mr-2 h-4 w-4 text-gray-400" />
                  <span className="text-gray-700">
                    {getSelectedTimeDetails()?.arrival || booking.arrivalTime}
                  </span>
                </div>
              </div>
            </div>

            {/* Changes Summary */}
            {hasChanges() && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Changes Summary:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  {selectedDate?.format('YYYY-MM-DD') !== booking.date && (
                    <li>• Date changed from {formatDate(dayjs(booking.date))} to {formatDate(selectedDate)}</li>
                  )}
                  {selectedTime !== booking.departureTime && (
                    <li>• Time changed from {booking.departureTime} to {selectedTime}</li>
                  )}
                  {selectedSeat !== booking.seat && (
                    <li>• Seat changed from {booking.seat} to {selectedSeat}</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="opacity-0 animate-[fadeInUp_0.8s_ease-out_0.5s_forwards]">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={handleSaveChanges}
              disabled={!hasChanges() || saving}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-2xl font-semibold flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </Button>

            <Button
              onClick={() => setShowCancelModal(true)}
              variant="destructive"
              className="flex-1 py-3 rounded-2xl font-semibold flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancel Booking
            </Button>
          </div>
        </div>

        {/* Important Notes */}
        <div className="opacity-0 animate-[fadeInUp_0.8s_ease-out_0.6s_forwards]">
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 mt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-yellow-900 mb-2">Important Notes:</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Changes can be made up to 2 hours before departure</li>
                  <li>• Seat changes are subject to availability</li>
                  <li>• Date/time changes may incur additional fees</li>
                  <li>• Cancelled bookings are eligible for 80% refund</li>
                  <li>• Refund will be processed within 3-5 business days</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              <h3 className="text-xl font-bold text-gray-900">Cancel Booking?</h3>
            </div>

            <p className="text-gray-600 mb-6">
              Are you sure you want to cancel this booking? This action cannot be undone.
              You will receive an 80% refund ({formatCurrency(booking.price * 0.8)}) within 3-5 business days.
            </p>

            <div className="flex gap-3">
              <Button
                onClick={handleCancelBooking}
                disabled={cancelling}
                variant="destructive"
                className="flex-1 flex items-center justify-center gap-2"
              >
                {cancelling ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  <>
                    <X className="w-4 h-4" />
                    Yes, Cancel
                  </>
                )}
              </Button>

              <Button
                onClick={() => setShowCancelModal(false)}
                variant="outline"
                className="flex-1"
                disabled={cancelling}
              >
                Keep Booking
              </Button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
