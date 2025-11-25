import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "admin" | "passenger";
}

export default function ProtectedRoute({
  children,
  requiredRole,
}: ProtectedRouteProps) {
  const token = localStorage.getItem("accessToken");
  const userStr = localStorage.getItem("user");

  // Not logged in
  if (!token || !userStr) {
    return <Navigate to="/login" replace />;
  }

  // Check role if required
  if (requiredRole) {
    try {
      const user = JSON.parse(userStr);

      if (user.role !== requiredRole) {
        // If admin tries to access passenger routes or vice versa
        if (requiredRole === "admin") {
          return <Navigate to="/dashboard" replace />;
        } else {
          return <Navigate to="/admin" replace />;
        }
      }
    } catch (error) {
      console.error("Error parsing user data:", error);
      return <Navigate to="/login" replace />;
    }
  }

  return <>{children}</>;
}
