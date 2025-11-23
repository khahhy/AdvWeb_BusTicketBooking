import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { buildApiUrl, API_ENDPOINTS } from '@/lib/api';
import backgroundImage from '@/assets/images/background.png';
import logoImage from '@/assets/images/logo.png';

// Add CSS to hide browser's default password reveal button for all browsers
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  input[type="password"]::-ms-reveal,
  input[type="password"]::-ms-clear,
  input[type="password"]::-webkit-credentials-auto-fill-button,
  input[type="password"]::-webkit-contacts-auto-fill-button,
  input[type="password"]::-webkit-textfield-decoration-container {
    display: none !important;
    visibility: hidden !important;
    pointer-events: none !important;
    position: absolute !important;
  }
  /* Firefox */
  input[type="password"] {
    -moz-appearance: textfield;
  }
  /* Safari specific */
  input[type="password"]::-webkit-inner-spin-button,
  input[type="password"]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`;
if (!document.head.querySelector("style[data-password-style]")) {
  styleSheet.setAttribute("data-password-style", "true");
  document.head.appendChild(styleSheet);
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
    // Clear server error
    if (serverError) {
      setServerError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = {
      email: "",
      password: "",
    };

    // Validation
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    setErrors(newErrors);

    // If no errors, proceed with login
    if (!Object.values(newErrors).some((error) => error)) {
      setLoading(true);

      try {
        const response = await fetch(buildApiUrl(API_ENDPOINTS.auth.signin), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          // Save token and user info to localStorage
          localStorage.setItem("accessToken", data.accessToken);
          localStorage.setItem("user", JSON.stringify(data.user));

          console.log("Login successful:", data);

          // Navigate based on user role
          if (data.user.role === "admin") {
            navigate("/admin/bus-operations/locations");
          } else {
            navigate("/dashboard");
          }
        } else {
          // Show error message from backend
          setServerError(
            data.message || "Login failed. Please check your credentials.",
          );
        }
      } catch (error) {
        console.error("Login error:", error);
        setServerError(
          "Network error. Please check your connection and try again.",
        );
      } finally {
        setLoading(false);
      }
    }
  };

  const handleGoogleLogin = () => {
    // Redirect to backend Google OAuth endpoint
    window.location.href = buildApiUrl("/auth/google");
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat relative flex items-center justify-center"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundPosition: "center bottom",
      }}
    >
      {/* Logo in top-left corner */}
      <div className="absolute top-6 left-6 z-20">
        <button
          onClick={() => navigate('/dashboard')}
          className="hover:opacity-80 transition-opacity"
        >
          <img src={logoImage} alt="Bus Booking Logo" className="w-32" />
        </button>
      </div>

      <div className="max-w-xl w-full mx-auto px-6 py-6 relative z-10">
        {/* Login Form Card */}
        <div className="opacity-0 animate-[fadeInUp_0.8s_ease-out_0.3s_forwards]">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="flex flex-col items-center text-center">
              <h1 className="text-2xl font-bold text-foreground/80 mb-6">
                Welcome Back
              </h1>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="Enter your email"
                    className={`w-full pl-12 pr-4 py-2.5 border rounded-2xl focus:outline-none focus:ring-2 transition-all ${
                      errors.email
                        ? "border-red-300 focus:ring-red-200"
                        : "border-gray-300 focus:ring-blue-200"
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    placeholder="Enter your password"
                    className={`w-full pl-12 pr-12 py-2.5 border rounded-2xl focus:outline-none focus:ring-2 transition-all ${
                      errors.password
                        ? "border-red-300 focus:ring-red-200"
                        : "border-gray-300 focus:ring-blue-200"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              {/* Server Error Message */}
              {serverError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-600 text-center">
                    {serverError}
                  </p>
                </div>
              )}

              {/* Forgot Password Link */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="text-sm text-primary font-semibold hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-2xl transition-all duration-300 font-semibold shadow-md hover:shadow-lg text-base ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-primary hover:bg-primary/90 text-primary-foreground"
                }`}
              >
                {loading ? "Logging in..." : "Log In"}
              </button>

              {/* Divider */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">
                    Or continue with
                  </span>
                </div>
              </div>

              {/* Google Login Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-300 py-3 rounded-2xl transition-all duration-300 font-semibold flex items-center justify-center gap-3 text-base"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Log in with Google
              </button>

              {/* Sign Up Link */}
              <div className="text-center text-sm text-gray-600 mt-4">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/signup")}
                  className="text-primary font-semibold hover:underline"
                >
                  Sign up
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
