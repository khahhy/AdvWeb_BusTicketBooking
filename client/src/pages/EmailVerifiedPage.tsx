import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, ArrowRight, XCircle, Loader2 } from "lucide-react";
import backgroundImage from "@/assets/images/background.png";
import logoImage from "@/assets/images/logo.png";
import logoWhiteImage from "@/assets/images/logo-white.svg";
import { buildApiUrl } from "@/lib/api";

export default function EmailVerifiedPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);

    // Verify email with token from URL
    const verifyEmail = async () => {
      if (!token) {
        setError("Verification token is missing");
        setVerifying(false);
        return;
      }

      try {
        const response = await fetch(
          buildApiUrl(`/auth/verify-email?token=${token}`),
        );
        const data = await response.json();

        if (response.ok) {
          setSuccess(true);
          setError("");
        } else {
          setError(data.message || "Verification failed");
          setSuccess(false);
        }
      } catch (err) {
        console.error("Verification error:", err);
        setError("Network error. Please try again.");
        setSuccess(false);
      } finally {
        setVerifying(false);
      }
    };

    verifyEmail();
  }, [token]);

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
        {/* Email Verified Card */}
        <div className="opacity-0 animate-[fadeInUp_0.8s_ease-out_0.3s_forwards]">
          <div className="bg-white dark:bg-black rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800/95 p-8">
            <div className="flex flex-col items-center text-center">
              {/* Loading State */}
              {verifying && (
                <>
                  <div className="w-20 h-20 bg-primary-50 dark:bg-primary-900/30 rounded-full flex items-center justify-center mb-6">
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                  </div>
                  <h1 className="text-2xl font-bold text-foreground/80 dark:text-white mb-3">
                    Verifying Your Email...
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Please wait while we verify your email address.
                  </p>
                </>
              )}

              {/* Success State */}
              {!verifying && success && (
                <>
                  <div className="w-20 h-20 bg-success-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-10 h-10 text-success" />
                  </div>

                  <h1 className="text-2xl font-bold text-foreground/80 dark:text-white mb-3">
                    Email Verified!
                  </h1>

                  <p className="text-gray-600 dark:text-gray-400 mb-8">
                    Your email has been successfully verified. You can now
                    access all features of your account.
                  </p>

                  {/* Continue Button */}
                  <button
                    onClick={() => navigate("/login")}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-2xl transition-all duration-300 font-semibold shadow-md hover:shadow-lg text-base flex items-center justify-center gap-2 mb-4"
                  >
                    Continue to Login
                    <ArrowRight className="w-5 h-5" />
                  </button>

                  {/* Back to Home */}
                  <button
                    onClick={() => navigate("/dashboard")}
                    className="w-full bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white border-2 border-gray-300 dark:border-gray-600 py-3 rounded-2xl transition-all duration-300 font-semibold text-base"
                  >
                    Go to Home
                  </button>
                </>
              )}

              {/* Error State */}
              {!verifying && error && (
                <>
                  <div className="w-20 h-20 bg-error-50 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
                    <XCircle className="w-10 h-10 text-error" />
                  </div>

                  <h1 className="text-2xl font-bold text-foreground/80 dark:text-white mb-3">
                    Verification Failed
                  </h1>

                  <p className="text-red-600 dark:text-red-400 mb-2 font-medium">
                    {error}
                  </p>

                  <p className="text-gray-600 dark:text-gray-400 mb-8 text-sm">
                    Your verification link may have expired or is invalid.
                    Please request a new verification email.
                  </p>

                  {/* Try Again Button */}
                  <button
                    onClick={() => navigate("/signup")}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-2xl transition-all duration-300 font-semibold shadow-md hover:shadow-lg text-base flex items-center justify-center gap-2 mb-4"
                  >
                    Sign Up Again
                    <ArrowRight className="w-5 h-5" />
                  </button>

                  {/* Back to Login */}
                  <button
                    onClick={() => navigate("/login")}
                    className="w-full bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white border-2 border-gray-300 dark:border-gray-600 py-3 rounded-2xl transition-all duration-300 font-semibold text-base"
                  >
                    Back to Login
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
