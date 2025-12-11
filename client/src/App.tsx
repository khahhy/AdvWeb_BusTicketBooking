import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

function HomeRedirect() {
  return <Navigate to="/dashboard" replace />;
}
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
  PaymentManagement,
  ReviewManagement,
  NotificationManagement,
  SystemSettings,
  SystemHealth,
} from "@/admin";
import UserDashboard from "./user/UserDashboard";
import SearchPage from "./pages/SearchPage";
import BookingHistoryPage from "./pages/BookingHistoryPage";
import BookingDetailsPage from "./pages/BookingDetailsPage";
import FeedbackRatingPage from "./pages/FeedbackRatingPage";
import ModifyBookingPage from "./pages/ModifyBookingPage";
import NotificationsPage from "./pages/NotificationsPage";
import TrackTicketPage from "./pages/TrackTicketPage";
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
import ProtectedRoute from "./components/ProtectedRoute";
import ProfilePage from "./pages/ProfilePage";
import AboutPage from "./pages/AboutPage";
import SupportPage from "./pages/SupportPage";
import NotFoundPage from "./pages/NotFoundPage";
import TripDetailPage from "./pages/TripDetailPage";
import ETicketDemoPage from "./pages/ETicketDemoPage";
import ETicketPage from "./pages/ETicketPage";
import { ThemeProvider } from "./contexts/ThemeContext";

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
    "/404",
  ].includes(location.pathname);

  const routeContent = (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      {/* admin pages */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
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
          <Route path="transactions" element={<PaymentManagement />} />
        </Route>
        <Route path="customer-care">
          <Route path="reviews" element={<ReviewManagement />} />
          <Route path="notifications" element={<NotificationManagement />} />
        </Route>
        <Route path="system">
          <Route path="settings" element={<SystemSettings />} />
          <Route path="health" element={<SystemHealth />} />
        </Route>
      </Route>
      {/* Dashboard/Landing page - accessible to everyone */}
      <Route path="/dashboard" element={<UserDashboard />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/support" element={<SupportPage />} />
      <Route path="/eticket-demo" element={<ETicketDemoPage />} />
      <Route path="/eticket/:ticketCode" element={<ETicketPage />} />
      <Route
        path="/profile"
        element={
          <ProtectedRoute requiredRole="passenger">
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      {/* Public routes - accessible by guests */}
      <Route path="/search" element={<SearchPage />} />
      <Route path="/trip-detail" element={<TripDetailPage />} />
      <Route path="/track-ticket" element={<TrackTicketPage />} />
      <Route
        path="/booking-history"
        element={
          <ProtectedRoute requiredRole="passenger">
            <BookingHistoryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/booking-details/:id"
        element={
          <ProtectedRoute requiredRole="passenger">
            <BookingDetailsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/feedback/:id"
        element={
          <ProtectedRoute requiredRole="passenger">
            <FeedbackRatingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/modify-booking/:id"
        element={
          <ProtectedRoute requiredRole="passenger">
            <ModifyBookingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute requiredRole="passenger">
            <NotificationsPage />
          </ProtectedRoute>
        }
      />
      {/* Guest checkout flow - accessible without login */}
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
      <Route path="*" element={<Navigate to="/404" replace />} />
      <Route path="/404" element={<NotFoundPage />} />
    </Routes>
  );

  return (
    <>
      <ThemeProvider>
        {routeContent}
        {!hideChatbot && <Chatbot />}
      </ThemeProvider>
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
