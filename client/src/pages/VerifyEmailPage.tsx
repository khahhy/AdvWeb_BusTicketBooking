import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Mail, ArrowRight } from "lucide-react";
import backgroundImage from "@/assets/images/background.png";
import { buildApiUrl } from "@/lib/api";
import logoImage from "@/assets/images/logo.png";
import logoWhiteImage from "@/assets/images/logo-white.svg";

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "your email";
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setResendDisabled(false);
    }
  }, [countdown]);

  const handleResendEmail = async () => {
    try {
      const response = await fetch(buildApiUrl("/auth/resend-verification"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Resend success:", data);
        setResendDisabled(true);
        setCountdown(60);
      } else {
        alert(data.message || "Failed to resend email");
      }
    } catch (error) {
      console.error("Resend error:", error);
      alert("Network error. Please try again.");
    }
  };

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
          <img
            src={logoImage}
            alt="Bus Booking Logo"
            className="w-32 dark:hidden"
          />
          <img
            src={logoWhiteImage}
            alt="Bus Booking Logo White"
            className="w-32 hidden dark:block"
          />
        </button>
      </div>

      <div className="max-w-xl w-full mx-auto px-6 py-6 relative z-10">
        {/* Verify Email Card */}
        <div className="opacity-0 animate-[fadeInUp_0.8s_ease-out_0.3s_forwards]">
          <div className="bg-white dark:bg-black rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800/95 p-8">
            <div className="flex flex-col items-center text-center">
              {/* Mail Icon */}
              <div className="w-20 h-20 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center mb-6">
                <Mail className="w-10 h-10 text-primary" />
              </div>

              <h1 className="text-2xl font-bold text-foreground/80 dark:text-white mb-3">
                Verify Your Email
              </h1>

              <p className="text-gray-600 dark:text-gray-400 mb-6">
                We've sent a verification link to
              </p>

              <p className="text-lg font-semibold text-primary dark:text-blue-400 mb-6">
                {email}
              </p>

              <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
                Please check your inbox and click the verification link to
                complete your registration. The link will expire in 24 hours.
              </p>

              {/* Resend Email Button */}
              <button
                onClick={handleResendEmail}
                disabled={resendDisabled}
                className={`w-full py-3 rounded-2xl transition-all duration-300 font-semibold text-base mb-4 ${
                  resendDisabled
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg"
                }`}
              >
                {resendDisabled
                  ? `Resend in ${countdown}s`
                  : "Resend Verification Email"}
              </button>

              {/* Back to Login */}
              <button
                onClick={() => navigate("/login")}
                className="w-full bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white border-2 border-gray-300 dark:border-gray-600 py-3 rounded-2xl transition-all duration-300 font-semibold flex items-center justify-center gap-2 text-base"
              >
                Back to Login
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Help Text */}
              <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
                <p>Didn't receive the email? Check your spam folder or</p>
                <button
                  onClick={() => navigate("/signup")}
                  className="text-primary dark:text-blue-400 font-semibold hover:underline"
                >
                  try signing up again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
