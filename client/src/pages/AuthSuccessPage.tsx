import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import backgroundImage from '@/assets/images/background.png';

export default function AuthSuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      const fetchUserInfo = async () => {
        try {
          // Save token first
          localStorage.setItem('accessToken', token);
          
          // Fetch full user info from backend
          const response = await fetch('http://localhost:3000/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          
          if (response.ok) {
            const userData = await response.json();
            localStorage.setItem('user', JSON.stringify(userData));
            
            // Redirect based on user role
            setTimeout(() => {
              if (userData.role === 'admin') {
                navigate('/admin');
              } else {
                navigate('/dashboard');
              }
            }, 1000);
          } else {
            // Fallback: parse JWT to get basic user info
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const payload = JSON.parse(window.atob(base64));
            
            const user = {
              id: payload.sub,
              email: payload.email,
              role: payload.role,
            };
            
            localStorage.setItem('user', JSON.stringify(user));
            
            setTimeout(() => {
              navigate('/dashboard');
            }, 1000);
          }
        } catch (error) {
          console.error('Error fetching user info:', error);
          navigate('/login');
        }
      };
      
      fetchUserInfo();
    } else {
      // No token, redirect to login
      navigate('/login');
    }
  }, [searchParams, navigate]);

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat relative flex items-center justify-center"
      style={{ backgroundImage: `url(${backgroundImage})`, backgroundPosition: 'center bottom' }}
    >
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div className="flex flex-col items-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Signing you in...
          </h2>
          <p className="text-gray-600 text-sm">
            Please wait while we complete your authentication
          </p>
        </div>
      </div>
    </div>
  );
}
