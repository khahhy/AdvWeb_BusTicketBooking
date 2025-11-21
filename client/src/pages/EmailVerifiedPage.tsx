import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, ArrowRight, XCircle, Loader2 } from 'lucide-react';
import backgroundImage from '@/assets/images/background.png';

export default function EmailVerifiedPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);

    // Verify email with token from URL
    const verifyEmail = async () => {
      if (!token) {
        setError('Verification token is missing');
        setVerifying(false);
        return;
      }

      try {
        const response = await fetch(buildApiUrl(`/auth/verify-email?token=${token}`));
        const data = await response.json();

        if (response.ok) {
          setSuccess(true);
          setError('');
        } else {
          setError(data.message || 'Verification failed');
          setSuccess(false);
        }
      } catch (err) {
        console.error('Verification error:', err);
        setError('Network error. Please try again.');
        setSuccess(false);
      } finally {
        setVerifying(false);
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat relative flex items-center justify-center"
      style={{ backgroundImage: `url(${backgroundImage})`, backgroundPosition: 'center bottom' }}
    >
      <div className="max-w-xl w-full mx-auto px-6 py-6 relative z-10">
        {/* Email Verified Card */}
        <div className="opacity-0 animate-[fadeInUp_0.8s_ease-out_0.3s_forwards]">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="flex flex-col items-center text-center">

              {/* Loading State */}
              {verifying && (
                <>
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                    <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                  </div>
                  <h1 className="text-2xl font-bold text-foreground/80 mb-3">
                    Verifying Your Email...
                  </h1>
                  <p className="text-gray-600">
                    Please wait while we verify your email address.
                  </p>
                </>
              )}

              {/* Success State */}
              {!verifying && success && (
                <>
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-10 h-10 text-green-600" />
                  </div>

                  <h1 className="text-2xl font-bold text-foreground/80 mb-3">
                    Email Verified!
                  </h1>

                  <p className="text-gray-600 mb-8">
                    Your email has been successfully verified. You can now access all features of your account.
                  </p>

                  {/* Continue Button */}
                  <button
                    onClick={() => navigate('/login')}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-2xl transition-all duration-300 font-semibold shadow-md hover:shadow-lg text-base flex items-center justify-center gap-2 mb-4"
                  >
                    Continue to Login
                    <ArrowRight className="w-5 h-5" />
                  </button>

                  {/* Back to Home */}
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="w-full bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-300 py-3 rounded-2xl transition-all duration-300 font-semibold text-base"
                  >
                    Go to Home
                  </button>
                </>
              )}

              {/* Error State */}
              {!verifying && error && (
                <>
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
                    <XCircle className="w-10 h-10 text-red-600" />
                  </div>

                  <h1 className="text-2xl font-bold text-foreground/80 mb-3">
                    Verification Failed
                  </h1>

                  <p className="text-red-600 mb-2 font-medium">
                    {error}
                  </p>

                  <p className="text-gray-600 mb-8 text-sm">
                    Your verification link may have expired or is invalid. Please request a new verification email.
                  </p>

                  {/* Try Again Button */}
                  <button
                    onClick={() => navigate('/signup')}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-2xl transition-all duration-300 font-semibold shadow-md hover:shadow-lg text-base flex items-center justify-center gap-2 mb-4"
                  >
                    Sign Up Again
                    <ArrowRight className="w-5 h-5" />
                  </button>

                  {/* Back to Login */}
                  <button
                    onClick={() => navigate('/login')}
                    className="w-full bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-300 py-3 rounded-2xl transition-all duration-300 font-semibold text-base"
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
