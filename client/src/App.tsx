import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import {
  AdminLayout,
  AdminDashboard,
  PassengerManagement,
  AdminManagement,
  LocationManagement,
  BusManagement,
  RouteManagement,
  TripManagement,
  TripForm,
  BookingManagement,
} from "@/admin";
import UserDashboard from "./user/UserDashboard";
import SearchPage from "./pages/SearchPage";
import BookingHistoryPage from "./pages/BookingHistoryPage";
import BookingDetailsPage from "./pages/BookingDetailsPage";
import FeedbackRatingPage from "./pages/FeedbackRatingPage";
import ModifyBookingPage from "./pages/ModifyBookingPage";
import NotificationsPage from "./pages/NotificationsPage";
import Chatbot from "./components/ui/chatbot";
import "./index.css";
import CheckoutPage from "./pages/CheckoutPage";
import PaymentPage from "./pages/PaymentPage";
import ConfirmationPage from "./pages/ConfirmationPage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import EmailVerifiedPage from "./pages/EmailVerifiedPage";
import AuthSuccessPage from "./pages/AuthSuccessPage";
import ProfilePage from "./pages/ProfilePage";

function AppContent() {
  const location = useLocation();
  const hideChatbot = [
    "/signup",
    "/login",
    "/forgot-password",
    "/reset-password",
    "/verify-email",
    "/email-verified",
    "/auth-success",
  ].includes(location.pathname);

  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        // admin pages
        <Route path="/admin" element={<AdminLayout />}>
          {/* <Route index element={<AdminDashboard />} /> */}
          <Route path="users-management">
            <Route path="passengers" element={<PassengerManagement />} />
            <Route path="admins" element={<AdminManagement />} />
          </Route>
          <Route path="bus-operations">
            <Route path="locations" element={<LocationManagement />} />
            <Route path="buses" element={<BusManagement />} />
            <Route path="routes" element={<RouteManagement />} />
            <Route path="trips">
              <Route index element={<TripManagement />} />
              <Route path="new" element={<TripForm />} />
              <Route path="edit/:tripId" element={<TripForm />} />
            </Route>
          </Route>
          <Route path="sales">
            <Route path="bookings" element={<BookingManagement />} />
          </Route>
        </Route>
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/booking-history" element={<BookingHistoryPage />} />
        <Route path="/booking-details/:id" element={<BookingDetailsPage />} />
        <Route path="/feedback/:id" element={<FeedbackRatingPage />} />
        <Route path="/modify-booking/:id" element={<ModifyBookingPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/confirmation" element={<ConfirmationPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/email-verified" element={<EmailVerifiedPage />} />
        <Route path="/auth-success" element={<AuthSuccessPage />} />
      </Routes>

      {/* Global Chatbot - hidden on signup page */}
      {!hideChatbot && <Chatbot />}
    </>
  );
}

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="min-h-screen bg-background">
        <AppContent />
      </div>
    </Router>
  );
}

export default App;
