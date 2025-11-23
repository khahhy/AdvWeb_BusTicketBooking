import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buildApiUrl, API_ENDPOINTS } from "@/lib/api";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/dashboard/Footer";
import backgroundImage from "@/assets/images/background.png";
import {
  Mail,
  Calendar,
  Shield,
  Edit2,
  Save,
  X,
  Settings,
  Bell,
  History,
  CreditCard,
} from "lucide-react";

interface UserProfile {
  id: string;
  email: string;
  fullName: string | null;
  phoneNumber: string | null;
  role: "passenger" | "admin";
  status: "unverified" | "active" | "banned";
  emailVerified: boolean;
  authProvider: "local" | "google" | "firebase";
  createdAt: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await fetch(buildApiUrl(API_ENDPOINTS.auth.profile), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("Profile response status:", response.status);

        if (!response.ok) {
          const errorData = await response.text();
          console.error("Profile fetch error:", {
            status: response.status,
            statusText: response.statusText,
            body: errorData,
          });
          if (response.status === 401) {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("user");
            navigate("/login");
            return;
          }
          throw new Error(
            `Failed to fetch profile: ${response.status} ${response.statusText}`,
          );
        }

        const userData = await response.json();
        setUser(userData);
        setFormData({
          fullName: userData.fullName || "",
          phoneNumber: userData.phoneNumber || "",
        });
      } catch (error) {
        console.error("Error loading profile:", error);
        alert("Error: Failed to load profile information.");
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
      const token = localStorage.getItem("accessToken");
      const response = await fetch(buildApiUrl(API_ENDPOINTS.auth.profile), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      const updatedUser = await response.json();
      setUser(updatedUser);
      setIsEditing(false);

      // Update localStorage with new user data
      localStorage.setItem("user", JSON.stringify(updatedUser));

      alert("Success: Profile updated successfully.");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Error: Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        phoneNumber: user.phoneNumber || "",
      });
    }
    setIsEditing(false);
  };

  const getStatusBadge = (status: string, emailVerified: boolean) => {
    if (status === "banned") {
      return <Badge variant="destructive">Banned</Badge>;
    }
    if (!emailVerified) {
      return <Badge variant="secondary">Email Not Verified</Badge>;
    }
    if (status === "active") {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800">
          Active
        </Badge>
      );
    }
    return <Badge variant="secondary">{status}</Badge>;
  };

  const getRoleBadge = (role: string) => {
    return (
      <Badge variant={role === "admin" ? "default" : "outline"}>
        {role === "admin" ? "Administrator" : "Passenger"}
      </Badge>
    );
  };

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name
        .split(" ")
        .map((word) => word[0])
        .join("")
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
  }
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Profile Not Found
            </h2>
            <p className="text-gray-600 mb-6">
              Unable to load your profile information.
            </p>
            <Button onClick={() => navigate("/dashboard")}>
              Go to Dashboard
            </Button>
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
          {/* Profile Overview Card */}
          <Card className="mb-8 bg-white/95 backdrop-blur-sm shadow-xl border-0">
            <CardContent className="p-8">
              <div className="flex flex-col lg:flex-row items-center gap-8">
                {/* Avatar Section */}
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full blur opacity-75"></div>
                  <Avatar className="relative h-32 w-32 border-4 border-white shadow-2xl">
                    <AvatarImage src="" alt={user.fullName || "User"} />
                    <AvatarFallback className="text-3xl bg-gradient-to-br from-pink-500 to-rose-600 text-white font-bold">
                      {getInitials(user.fullName, user.email)}
                    </AvatarFallback>
                  </Avatar>
                </div>

                {/* Profile Info */}
                <div className="flex-1 text-center lg:text-left">
                  <div className="mb-4">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                      {user.fullName || "Welcome!"}
                    </h1>
                    <p className="text-lg text-gray-600 mb-3">{user.email}</p>
                    <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                      {getStatusBadge(user.status, user.emailVerified)}
                      {getRoleBadge(user.role)}
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="text-center p-3 bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl">
                      <div className="text-2xl font-bold text-pink-600">0</div>
                      <div className="text-sm text-gray-600">Bookings</div>
                    </div>
                    <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                      <div className="text-2xl font-bold text-blue-600">
                        4.9
                      </div>
                      <div className="text-sm text-gray-600">Rating</div>
                    </div>
                    <div className="text-center p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                      <div className="text-2xl font-bold text-green-600">
                        {new Date(user.createdAt).getFullYear()}
                      </div>
                      <div className="text-sm text-gray-600">Since</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Quick Actions */}
            <div className="lg:col-span-1 space-y-6">
              {/* Quick Actions Card */}
              <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-0">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Settings className="w-6 h-6 text-pink-500" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="ghost"
                    onClick={() => navigate("/booking-history")}
                    className="w-full justify-start h-12 hover:bg-pink-50 hover:text-pink-700 rounded-xl"
                  >
                    <History className="w-5 h-5 mr-3 text-pink-500" />
                    Booking History
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => navigate("/notifications")}
                    className="w-full justify-start h-12 hover:bg-blue-50 hover:text-blue-700 rounded-xl"
                  >
                    <Bell className="w-5 h-5 mr-3 text-blue-500" />
                    Notifications
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start h-12 hover:bg-green-50 hover:text-green-700 rounded-xl"
                  >
                    <CreditCard className="w-5 h-5 mr-3 text-green-500" />
                    Payment Methods
                  </Button>
                  {!user.emailVerified && (
                    <Button
                      variant="ghost"
                      className="w-full justify-start h-12 hover:bg-orange-50 hover:text-orange-700 rounded-xl"
                    >
                      <Mail className="w-5 h-5 mr-3 text-orange-500" />
                      Verify Email
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Account Info Card */}
              <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-0">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Shield className="w-6 h-6 text-rose-500" />
                    Account Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-rose-500" />
                      <span className="text-sm font-medium text-gray-700">
                        Joined
                      </span>
                    </div>
                    <span className="text-sm text-gray-600">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-blue-500" />
                      <span className="text-sm font-medium text-gray-700">
                        Provider
                      </span>
                    </div>
                    <span className="text-sm text-gray-600 capitalize">
                      {user.authProvider === "local"
                        ? "Email"
                        : user.authProvider}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Profile Information */}
            <div className="lg:col-span-2">
              <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-0">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-gray-800">
                    Personal Information
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Manage your personal details and contact information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6">
                    {/* Email Field */}
                    <div className="space-y-2">
                      <label className="flex items-center text-sm font-semibold text-gray-700">
                        <Mail className="w-5 h-5 mr-3 text-pink-500" />
                        Email Address
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          value={user.email}
                          disabled
                          className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 focus:outline-none"
                        />
                        <Mail className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                      </div>
                      <p className="text-xs text-gray-500 ml-2 flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        Email cannot be changed for security reasons
                      </p>
                    </div>

                    {/* Full Name Field */}
                    <div className="space-y-2">
                      <label className="flex items-center text-sm font-semibold text-gray-700">
                        <Edit2 className="w-5 h-5 mr-3 text-rose-500" />
                        Full Name
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.fullName}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              fullName: e.target.value,
                            })
                          }
                          disabled={!isEditing}
                          placeholder="Enter your full name"
                          className={`w-full pl-12 pr-4 py-4 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                            isEditing
                              ? "border-gray-300 focus:ring-pink-200 focus:border-pink-400 bg-white"
                              : "border-gray-200 bg-gray-50 text-gray-700"
                          }`}
                        />
                        <Edit2
                          className={`absolute left-4 top-4 w-5 h-5 ${isEditing ? "text-rose-500" : "text-gray-400"}`}
                        />
                      </div>
                    </div>

                    {/* Phone Number Field */}
                    <div className="space-y-2">
                      <label className="flex items-center text-sm font-semibold text-gray-700">
                        <History className="w-5 h-5 mr-3 text-blue-500" />
                        Phone Number
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          value={formData.phoneNumber}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              phoneNumber: e.target.value,
                            })
                          }
                          disabled={!isEditing}
                          placeholder="Enter your phone number"
                          className={`w-full pl-12 pr-4 py-4 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                            isEditing
                              ? "border-gray-300 focus:ring-blue-200 focus:border-blue-400 bg-white"
                              : "border-gray-200 bg-gray-50 text-gray-700"
                          }`}
                        />
                        <History
                          className={`absolute left-4 top-4 w-5 h-5 ${isEditing ? "text-blue-500" : "text-gray-400"}`}
                        />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                      {!isEditing ? (
                        <Button
                          onClick={() => setIsEditing(true)}
                          className="bg-black hover:bg-gray-800 text-white px-8 py-3 rounded-xl"
                        >
                          <Edit2 className="w-5 h-5 mr-2" />
                          Edit Profile
                        </Button>
                      ) : (
                        <>
                          <Button
                            onClick={handleCancel}
                            variant="outline"
                            className="border-gray-300 hover:bg-gray-50 px-6 py-3 rounded-xl"
                          >
                            <X className="w-5 h-5 mr-2" />
                            Cancel
                          </Button>
                          <Button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl disabled:opacity-50"
                          >
                            <Save className="w-5 h-5 mr-2" />
                            {isSaving ? "Saving..." : "Save Changes"}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
