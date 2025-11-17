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
} from "@/admin";
import UserDashboard from "./user/UserDashboard";
import SearchPage from "./pages/SearchPage";
import "./index.css";
import CheckoutPage from "./pages/CheckoutPage";
import PaymentPage from "./pages/PaymentPage";

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
          </Route>
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/payment" element={<PaymentPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
