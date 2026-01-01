import { useState, useEffect, useRef } from "react";
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
  Lock,
  Eye,
  EyeOff,
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
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
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

  const handleAvatarSelect = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      event.target.value = "";
      return;
    }

    setAvatarPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  };

  useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const handlePasswordFieldChange = (
    field: "currentPassword" | "newPassword" | "confirmPassword",
    value: string,
  ) => {
    setPasswordData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (passwordError) {
      setPasswordError("");
    }
    if (passwordSuccess) {
      setPasswordSuccess("");
    }
  };

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return "Password must be at least 8 characters long";
    }
    return "";
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    if (user.authProvider !== "local") {
      setPasswordError(
        `Password change is not available for ${user.authProvider} accounts.`,
      );
      return;
    }

    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      setPasswordError("Please fill in all password fields.");
      return;
    }

    const passwordValidation = validatePassword(passwordData.newPassword);
    if (passwordValidation) {
      setPasswordError(passwordValidation);
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      setPasswordError(
        "New password must be different from the current password.",
      );
      return;
    }

    setIsChangingPassword(true);
    setPasswordError("");
    setPasswordSuccess("");

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(
        buildApiUrl(API_ENDPOINTS.auth.changePassword),
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            oldPassword: passwordData.currentPassword,
            newPassword: passwordData.newPassword,
          }),
        },
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("user");
          navigate("/login");
          return;
        }
        setPasswordError(data.message || "Failed to change password.");
        return;
      }

      setPasswordSuccess(data.message || "Password updated successfully.");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Error changing password:", error);
      setPasswordError("Failed to change password. Please try again.");
    } finally {
      setIsChangingPassword(false);
    }
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
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-50 dark:bg-black dark:bg-none">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">
              Loading your profile...
            </p>
          </div>
        </div>
      </div>
    );
  }
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-50 dark:bg-black">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Profile Not Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-50 dark:bg-black dark:bg-none">
      <Navbar />

      {/* Header Section */}
      <div className="pt-40 pb-32 relative">
        {/* Background Image - only in light mode */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat dark:hidden"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />

        {/* Dark mode background */}
        <div className="absolute inset-0 bg-black hidden dark:block" />

        {/* Gradient fade overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-pink-50 to-transparent dark:from-black dark:to-transparent pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <h1 className="text-5xl font-bold text-black dark:text-white mb-3 opacity-0 animate-[fadeInDown_0.7s_ease-out_0.2s_forwards]">
            Profile
          </h1>
          <p className="text-xl text-black/80 dark:text-white/80 opacity-0 animate-[fadeInDown_0.7s_ease-out_0.4s_forwards]">
            Manage your account information and preferences
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 pb-8 -mt-16 relative z-10 dark:bg-black">
        <div className="opacity-0 animate-[fadeInUp_0.8s_ease-out_0.3s_forwards]">
          {/* Profile Overview Card */}
          <Card className="mb-8 bg-white/95 dark:bg-black dark:border-gray-800/95 backdrop-blur-sm shadow-xl border-0">
            <CardContent className="p-8">
              <div className="flex flex-col lg:flex-row items-center gap-8">
                {/* Avatar Section */}
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full blur opacity-75"></div>
                  <Avatar className="relative h-32 w-32 border-4 border-white dark:border-gray-600 shadow-2xl">
                    <AvatarImage
                      src={avatarPreview || ""}
                      alt={user.fullName || "User"}
                    />
                    <AvatarFallback className="text-3xl bg-gradient-to-br from-pink-500 to-rose-600 text-white font-bold">
                      {getInitials(user.fullName, user.email)}
                    </AvatarFallback>
                  </Avatar>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={handleAvatarSelect}
                    className="absolute -bottom-2 -right-2 h-9 w-9 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors"
                    aria-label="Update profile photo"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Profile Info */}
                <div className="flex-1 text-center lg:text-left">
                  <div className="mb-4">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                      {user.fullName || "Welcome!"}
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-300 mb-3">
                      {user.email}
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                      {getStatusBadge(user.status, user.emailVerified)}
                      {getRoleBadge(user.role)}
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="text-center p-3 bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/30 dark:to-rose-900/30 rounded-xl">
                      <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">
                        0
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Bookings
                      </div>
                    </div>
                    <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        4.9
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Rating
                      </div>
                    </div>
                    <div className="text-center p-3 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-xl">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {new Date(user.createdAt).getFullYear()}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Since
                      </div>
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
              <Card className="bg-white/95 dark:bg-black dark:border-gray-800/95 backdrop-blur-sm shadow-xl border-0">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <Settings className="w-6 h-6 text-pink-500 dark:text-pink-400" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="ghost"
                    onClick={() => navigate("/booking-history")}
                    className="w-full justify-start h-12 hover:bg-pink-50 dark:hover:bg-pink-900/30 hover:text-pink-700 dark:hover:text-pink-300 rounded-xl text-gray-700 dark:text-gray-300"
                  >
                    <History className="w-5 h-5 mr-3 text-pink-500 dark:text-pink-400" />
                    Booking History
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => navigate("/notifications")}
                    className="w-full justify-start h-12 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-700 dark:hover:text-blue-300 rounded-xl text-gray-700 dark:text-gray-300"
                  >
                    <Bell className="w-5 h-5 mr-3 text-blue-500 dark:text-blue-400" />
                    Notifications
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start h-12 hover:bg-green-50 dark:hover:bg-green-900/30 hover:text-green-700 dark:hover:text-green-300 rounded-xl text-gray-700 dark:text-gray-300"
                  >
                    <CreditCard className="w-5 h-5 mr-3 text-green-500 dark:text-green-400" />
                    Payment Methods
                  </Button>
                  {!user.emailVerified && (
                    <Button
                      variant="ghost"
                      className="w-full justify-start h-12 hover:bg-orange-50 dark:hover:bg-orange-900/30 hover:text-orange-700 dark:hover:text-orange-300 rounded-xl text-gray-700 dark:text-gray-300"
                    >
                      <Mail className="w-5 h-5 mr-3 text-orange-500 dark:text-orange-400" />
                      Verify Email
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Account Info Card */}
              <Card className="bg-white/95 dark:bg-black dark:border-gray-800/95 backdrop-blur-sm shadow-xl border-0">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <Shield className="w-6 h-6 text-rose-500 dark:text-rose-400" />
                    Account Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-900/30 dark:to-pink-900/30 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-rose-500 dark:text-rose-400" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Joined
                      </span>
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Provider
                      </span>
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                      {user.authProvider === "local"
                        ? "Email"
                        : user.authProvider}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Profile Information */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-white/95 dark:bg-black dark:border-gray-800/95 backdrop-blur-sm shadow-xl border-0">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-gray-800 dark:text-white">
                    Personal Information
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Manage your personal details and contact information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6">
                    {/* Email Field */}
                    <div className="space-y-2">
                      <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                        <Mail className="w-5 h-5 mr-3 text-pink-500 dark:text-pink-400" />
                        Email Address
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          value={user.email}
                          disabled
                          className="w-full pl-12 pr-4 py-4 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 focus:outline-none"
                        />
                        <Mail className="absolute left-4 top-4 w-5 h-5 text-gray-400 dark:text-gray-500" />
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 ml-2 flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        Email cannot be changed for security reasons
                      </p>
                    </div>

                    {/* Full Name Field */}
                    <div className="space-y-2">
                      <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                        <Edit2 className="w-5 h-5 mr-3 text-rose-500 dark:text-rose-400" />
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
                              ? "border-gray-300 dark:border-gray-600 focus:ring-pink-200 dark:focus:ring-pink-900/50 focus:border-pink-400 dark:focus:border-pink-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              : "border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                          }`}
                        />
                        <Edit2
                          className={`absolute left-4 top-4 w-5 h-5 ${
                            isEditing
                              ? "text-rose-500 dark:text-rose-400"
                              : "text-gray-400 dark:text-gray-500"
                          }`}
                        />
                      </div>
                    </div>

                    {/* Phone Number Field */}
                    <div className="space-y-2">
                      <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                        <History className="w-5 h-5 mr-3 text-blue-500 dark:text-blue-400" />
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
                              ? "border-gray-300 dark:border-gray-600 focus:ring-blue-200 dark:focus:ring-blue-900/50 focus:border-blue-400 dark:focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              : "border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                          }`}
                        />
                        <History
                          className={`absolute left-4 top-4 w-5 h-5 ${
                            isEditing
                              ? "text-blue-500 dark:text-blue-400"
                              : "text-gray-400 dark:text-gray-500"
                          }`}
                        />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                      {!isEditing ? (
                        <Button
                          onClick={() => setIsEditing(true)}
                          className="bg-black hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 text-white px-8 py-3 rounded-xl"
                        >
                          <Edit2 className="w-5 h-5 mr-2" />
                          Edit Profile
                        </Button>
                      ) : (
                        <>
                          <Button
                            onClick={handleCancel}
                            variant="outline"
                            className="border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-xl"
                          >
                            <X className="w-5 h-5 mr-2" />
                            Cancel
                          </Button>
                          <Button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-6 py-3 rounded-xl disabled:opacity-50"
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

              <Card className="bg-white/95 dark:bg-black dark:border-gray-800/95 backdrop-blur-sm shadow-xl border-0">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <Lock className="w-6 h-6 text-blue-500 dark:text-blue-400" />
                    Change Password
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Update your password to keep your account secure
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {user.authProvider !== "local" ? (
                    <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-700 p-4 text-sm text-gray-600 dark:text-gray-400">
                      Password changes are only available for email accounts.
                    </div>
                  ) : (
                    <form
                      onSubmit={handleChangePassword}
                      className="grid gap-5"
                    >
                      <div className="space-y-2">
                        <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Current Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                          <input
                            type={showCurrentPassword ? "text" : "password"}
                            value={passwordData.currentPassword}
                            onChange={(e) =>
                              handlePasswordFieldChange(
                                "currentPassword",
                                e.target.value,
                              )
                            }
                            placeholder="Enter current password"
                            className="w-full pl-12 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900/50 dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowCurrentPassword(!showCurrentPassword)
                            }
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            {showCurrentPassword ? (
                              <EyeOff className="w-5 h-5" />
                            ) : (
                              <Eye className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                          New Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                          <input
                            type={showNewPassword ? "text" : "password"}
                            value={passwordData.newPassword}
                            onChange={(e) =>
                              handlePasswordFieldChange(
                                "newPassword",
                                e.target.value,
                              )
                            }
                            placeholder="Enter new password"
                            className="w-full pl-12 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900/50 dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            {showNewPassword ? (
                              <EyeOff className="w-5 h-5" />
                            ) : (
                              <Eye className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Password must be at least 8 characters long
                        </p>
                      </div>

                      <div className="space-y-2">
                        <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Confirm New Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={passwordData.confirmPassword}
                            onChange={(e) =>
                              handlePasswordFieldChange(
                                "confirmPassword",
                                e.target.value,
                              )
                            }
                            placeholder="Confirm new password"
                            className="w-full pl-12 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900/50 dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="w-5 h-5" />
                            ) : (
                              <Eye className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {passwordError && (
                        <p className="text-sm text-red-600 dark:text-red-400">
                          {passwordError}
                        </p>
                      )}
                      {passwordSuccess && (
                        <p className="text-sm text-green-600 dark:text-green-400">
                          {passwordSuccess}
                        </p>
                      )}

                      <div className="flex justify-end pt-2 border-t border-gray-200 dark:border-gray-700">
                        <Button
                          type="submit"
                          disabled={isChangingPassword}
                          className="bg-black hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 text-white px-8 py-3 rounded-xl"
                        >
                          {isChangingPassword
                            ? "Updating..."
                            : "Update Password"}
                        </Button>
                      </div>
                    </form>
                  )}
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
