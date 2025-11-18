import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
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
} from "@/admin";
import UserDashboard from "./user/UserDashboard";
import SearchPage from "./pages/SearchPage";
import BookingHistoryPage from "./pages/BookingHistoryPage";
import BookingDetailsPage from "./pages/BookingDetailsPage";
import FeedbackRatingPage from "./pages/FeedbackRatingPage";
import "./index.css";
import CheckoutPage from "./pages/CheckoutPage";
import PaymentPage from "./pages/PaymentPage";
import ConfirmationPage from "./pages/ConfirmationPage";

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="min-h-screen bg-background">
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
          </Route>
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/booking-history" element={<BookingHistoryPage />} />
          <Route path="/booking-details/:id" element={<BookingDetailsPage />} />
          <Route path="/feedback/:id" element={<FeedbackRatingPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/confirmation" element={<ConfirmationPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
