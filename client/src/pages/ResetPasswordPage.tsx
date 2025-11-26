import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Lock, Eye, EyeOff, CheckCircle } from "lucide-react";
import { buildApiUrl, API_ENDPOINTS } from "@/lib/api";
import backgroundImage from "@/assets/images/background.png";
import logoImage from "@/assets/images/logo.png";
import logoWhiteImage from "@/assets/images/logo-white.svg";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);

    if (!token) {
      setError("Invalid reset link");
    }
  }, [token]);

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return "Password must be at least 8 characters long";
    }
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setError("Invalid reset link");
      return;
    }

    if (!newPassword) {
      setError("Password is required");
      return;
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(
        buildApiUrl(API_ENDPOINTS.auth.resetPassword),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
            newPassword,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to reset password");
        setIsLoading(false);
        return;
      }

      setIsSuccess(true);

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error) {
      console.error("Error resetting password:", error);
      setError("Failed to reset password. Please try again.");
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div
        className="min-h-screen bg-cover bg-center bg-no-repeat dark:bg-black dark:bg-none relative flex items-center justify-center"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundPosition: "center bottom",
        }}
      >
        <div className="max-w-xl w-full mx-auto px-6 py-6 relative z-10">
          <div className="opacity-0 animate-[fadeInUp_0.8s_ease-out_0.3s_forwards]">
            <div className="bg-white dark:bg-black rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800/95 p-8">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle className="w-10 h-10 text-green-500" />
                </div>

                <h1 className="text-2xl font-bold text-foreground/80 dark:text-white mb-3">
                  Password Reset Successfully!
                </h1>

                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Your password has been changed successfully. You can now sign
                  in with your new password.
                </p>

                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Redirecting to login page in 3 seconds...
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen relative flex items-center justify-center dark:bg-black"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundPosition: "center bottom",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Dark theme overlay to hide background */}
      <div className="hidden dark:block absolute inset-0 bg-black z-0"></div>
      {/* Logo in top-left corner */}
      <div className="absolute top-6 left-6 z-20">
        <button
          onClick={() => navigate("/dashboard")}
          className="hover:opacity-80 transition-opacity"
        >
          <img src={logoImage} alt="Bus Booking Logo" className="w-32 dark:hidden" />
          <img src={logoWhiteImage} alt="Bus Booking Logo White" className="w-32 hidden dark:block" />
        </button>
      </div>

      <div className="max-w-xl w-full mx-auto px-6 py-6 relative z-10">
        <div className="opacity-0 animate-[fadeInUp_0.8s_ease-out_0.3s_forwards]">
          <div className="bg-white dark:bg-black rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800/95 p-8">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center mb-4">
                <Lock className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground/80 dark:text-white mb-3">
                Reset Your Password
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Enter your new password below
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* New Password Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  New Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setError("");
                    }}
                    placeholder="Enter new password"
                    className={`w-full pl-12 pr-12 py-2.5 border rounded-2xl focus:outline-none focus:ring-2 transition-all dark:bg-gray-800/50 dark:text-white dark:placeholder-gray-400 ${
                      error
                        ? "border-red-300 focus:ring-red-200 dark:border-red-600 dark:focus:ring-red-500/50"
                        : "border-gray-300 focus:ring-blue-200 dark:border-gray-600 dark:focus:ring-blue-500/50"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Password must be at least 8 characters long
                </p>
              </div>

              {/* Confirm Password Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setError("");
                    }}
                    placeholder="Confirm new password"
                    className={`w-full pl-12 pr-12 py-2.5 border rounded-2xl focus:outline-none focus:ring-2 transition-all dark:bg-gray-800/50 dark:text-white dark:placeholder-gray-400 ${
                      error
                        ? "border-red-300 focus:ring-red-200 dark:border-red-600 dark:focus:ring-red-500/50"
                        : "border-gray-300 focus:ring-blue-200 dark:border-gray-600 dark:focus:ring-blue-500/50"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-2xl transition-all duration-300 font-semibold shadow-md hover:shadow-lg text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Resetting Password..." : "Reset Password"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
