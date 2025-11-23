import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { buildApiUrl, API_ENDPOINTS } from '@/lib/api';
import backgroundImage from '@/assets/images/background.png';
import logoImage from '@/assets/images/logo.png';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError("Email is required");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email");
      return;
    }

    setError("");

    try {
      const response = await fetch(
        buildApiUrl(API_ENDPOINTS.auth.forgotPassword),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to send reset email");
        return;
      }

      console.log("Password reset email sent to:", email);
      setIsSubmitted(true);
    } catch (error) {
      console.error("Error sending reset email:", error);
      setError("Failed to send reset email. Please try again.");
    }
  };

  if (isSubmitted) {
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
        </div>      <div className="max-w-xl w-full mx-auto px-6 py-6 relative z-10">
          {/* Email Sent Card */}
          <div className="opacity-0 animate-[fadeInUp_0.8s_ease-out_0.3s_forwards]">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <div className="flex flex-col items-center text-center">
                {/* Mail Icon */}
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                  <Mail className="w-10 h-10 text-primary" />
                </div>

                <h1 className="text-2xl font-bold text-foreground/80 mb-3">
                  Check Your Email
                </h1>

                <p className="text-gray-600 mb-6">
                  We've sent a password reset link to
                </p>

                <p className="text-lg font-semibold text-primary mb-6">
                  {email}
                </p>

                <p className="text-sm text-gray-500 mb-8">
                  Please check your inbox and click the link to reset your
                  password. The link will expire in 1 hour.
                </p>

                {/* Back to Login Button */}
                <button
                  onClick={() => navigate("/login")}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-2xl transition-all duration-300 font-semibold shadow-md hover:shadow-lg text-base flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back to Login
                </button>

                {/* Resend Link */}
                <div className="mt-6 text-sm text-gray-500">
                  <p>Didn't receive the email? Check your spam folder or</p>
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="text-primary font-semibold hover:underline"
                  >
                    try again
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
          <img src={logoImage} alt="Bus Booking Logo" className="h-12 w-12" />
        </button>
      </div>

      <div className="max-w-xl w-full mx-auto px-6 py-6 relative z-10">
        {/* Forgot Password Form Card */}
        <div className="opacity-0 animate-[fadeInUp_0.8s_ease-out_0.3s_forwards]">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="flex flex-col items-center text-center mb-6">
              <h1 className="text-2xl font-bold text-foreground/80 mb-3">
                Forgot Password?
              </h1>
              <p className="text-sm text-gray-600">
                Enter your email address and we'll send you a link to reset your
                password.
              </p>
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
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    placeholder="Enter your email"
                    className={`w-full pl-12 pr-4 py-2.5 border rounded-2xl focus:outline-none focus:ring-2 transition-all ${
                      error
                        ? "border-red-300 focus:ring-red-200"
                        : "border-gray-300 focus:ring-blue-200"
                    }`}
                  />
                </div>
                {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-2xl transition-all duration-300 font-semibold shadow-md hover:shadow-lg text-base"
              >
                Send Reset Link
              </button>

              {/* Back to Login Link */}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="w-full bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-300 py-3 rounded-2xl transition-all duration-300 font-semibold text-base flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Login
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
