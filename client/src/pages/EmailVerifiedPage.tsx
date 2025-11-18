import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import backgroundImage from '@/assets/images/background.png';

export default function EmailVerifiedPage() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
              {/* Success Icon */}
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
