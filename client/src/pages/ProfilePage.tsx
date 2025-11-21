import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { buildApiUrl, API_ENDPOINTS } from '@/lib/api';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/dashboard/Footer';
import backgroundImage from '@/assets/images/background.png';
import {
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  Edit2,
  Save,
  X,
} from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  fullName: string | null;
  phoneNumber: string | null;
  role: 'passenger' | 'admin';
  status: 'unverified' | 'active' | 'banned';
  emailVerified: boolean;
  authProvider: 'local' | 'google' | 'firebase';
  createdAt: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
  });

  const navigate = useNavigate();

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await fetch(buildApiUrl(API_ENDPOINTS.auth.profile), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log('Profile response status:', response.status);

        if (!response.ok) {
          const errorData = await response.text();
          console.error('Profile fetch error:', {
            status: response.status,
            statusText: response.statusText,
            body: errorData
          });
          if (response.status === 401) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
            navigate('/login');
            return;
          }
          throw new Error(`Failed to fetch profile: ${response.status} ${response.statusText}`);
        }

        const userData = await response.json();
        setUser(userData);
        setFormData({
          fullName: userData.fullName || '',
          phoneNumber: userData.phoneNumber || '',
        });
      } catch (error) {
        console.error('Error loading profile:', error);
        alert('Error: Failed to load profile information.');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserProfile();
  }, [navigate]);

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(buildApiUrl(API_ENDPOINTS.auth.profile), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const updatedUser = await response.json();
      setUser(updatedUser);
      setIsEditing(false);

      // Update localStorage with new user data
      localStorage.setItem('user', JSON.stringify(updatedUser));

      alert('Success: Profile updated successfully.');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error: Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        phoneNumber: user.phoneNumber || '',
      });
    }
    setIsEditing(false);
  };

  const getStatusBadge = (status: string, emailVerified: boolean) => {
    if (status === 'banned') {
      return <Badge variant="destructive">Banned</Badge>;
    }
    if (!emailVerified) {
      return <Badge variant="secondary">Email Not Verified</Badge>;
    }
    if (status === 'active') {
      return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>;
    }
    return <Badge variant="secondary">{status}</Badge>;
  };

  const getRoleBadge = (role: string) => {
    return (
      <Badge variant={role === 'admin' ? 'default' : 'outline'}>
        {role === 'admin' ? 'Administrator' : 'Passenger'}
      </Badge>
    );
  };

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return email.slice(0, 2).toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your profile...</p>
          </div>
        </div>
      </div>
    );
  }  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Profile Not Found</h2>
            <p className="text-gray-600 mb-6">Unable to load your profile information.</p>
            <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-50">
      <Navbar />

      {/* Header Section */}
      <div
        className="pt-40 pb-32 bg-cover bg-center bg-no-repeat relative"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        {/* Gradient fade overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-pink-50 via-pink-50/80 to-transparent pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <h1 className="text-5xl font-bold text-foreground/80 mb-3 opacity-0 animate-[fadeInDown_0.7s_ease-out_0.2s_forwards]">
            Profile
          </h1>
          <p className="text-xl text-foreground/60 opacity-0 animate-[fadeInDown_0.7s_ease-out_0.4s_forwards]">
            Manage your account information and preferences
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 pb-8 -mt-16 relative z-10">
        <div className="opacity-0 animate-[fadeInUp_0.8s_ease-out_0.3s_forwards]">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

            {/* Profile Header */}
            <div className="p-8 border-b border-gray-200">
              <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6">
                <div className="flex-shrink-0">
                  <Avatar className="h-32 w-32 border-4 border-gray-100">
                    <AvatarImage src="" alt={user.fullName || 'User'} />
                    <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                      {getInitials(user.fullName, user.email)}
                    </AvatarFallback>
                  </Avatar>
                </div>

                <div className="text-center lg:text-left flex-1">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    {user.fullName || 'No Name Set'}
                  </h2>
                  <p className="text-lg text-gray-600 mb-4">{user.email}</p>

                  <div className="flex flex-wrap gap-3 justify-center lg:justify-start mb-4">
                    {getStatusBadge(user.status, user.emailVerified)}
                    {getRoleBadge(user.role)}
                  </div>

                  <div className="text-sm text-gray-500">
                    <Calendar className="inline w-4 h-4 mr-1" />
                    Member since {new Date(user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                </div>

                <div className="flex-shrink-0">
                  {!isEditing ? (
                    <Button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 rounded-full px-6"
                    >
                      <Edit2 className="h-4 w-4" />
                      Edit Profile
                    </Button>
                  ) : (
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={handleCancel}
                        className="flex items-center gap-2 rounded-full"
                      >
                        <X className="h-4 w-4" />
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 rounded-full"
                      >
                        <Save className="h-4 w-4" />
                        {isSaving ? 'Saving...' : 'Save'}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Form */}
            <div className="p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Account Information</h3>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Email Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Mail className="inline w-4 h-4 mr-2" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-500 focus:outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>

                {/* Full Name Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <User className="inline w-4 h-4 mr-2" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    disabled={!isEditing}
                    placeholder="Enter your full name"
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                      isEditing
                        ? 'border-gray-300 focus:ring-blue-200 bg-white'
                        : 'border-gray-300 bg-gray-50 text-gray-700'
                    }`}
                  />
                </div>

                {/* Phone Number Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Phone className="inline w-4 h-4 mr-2" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    disabled={!isEditing}
                    placeholder="Enter your phone number"
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                      isEditing
                        ? 'border-gray-300 focus:ring-blue-200 bg-white'
                        : 'border-gray-300 bg-gray-50 text-gray-700'
                    }`}
                  />
                </div>

                {/* Account Type Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Shield className="inline w-4 h-4 mr-2" />
                    Account Type
                  </label>
                  <input
                    type="text"
                    value={user.authProvider === 'local' ? 'Email/Password' :
                           user.authProvider === 'google' ? 'Google Account' :
                           'Firebase Account'}
                    disabled
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-700 focus:outline-none"
                  />
                </div>
              </div>

              <Separator className="my-8" />

              {/* Quick Actions */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
                <div className="flex flex-wrap gap-4">
                  <Button
                    variant="outline"
                    onClick={() => navigate('/booking-history')}
                    className="rounded-full"
                  >
                    View Booking History
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/notifications')}
                    className="rounded-full"
                  >
                    Notification Settings
                  </Button>
                  {!user.emailVerified && (
                    <Button
                      variant="outline"
                      className="rounded-full border-orange-300 text-orange-600 hover:bg-orange-50"
                    >
                      Resend Verification Email
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
