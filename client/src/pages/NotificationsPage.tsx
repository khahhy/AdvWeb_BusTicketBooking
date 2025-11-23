import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  Info,
  Trash2,
  Filter,
} from "lucide-react";
import Navbar from "@/components/common/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Footer from "@/components/dashboard/Footer";
import backgroundImage from "@/assets/images/background.png";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

interface Notification {
  id: string;
  type: "booking" | "payment" | "promotion" | "system" | "reminder";
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  priority: "low" | "medium" | "high";
  actionUrl?: string;
  bookingCode?: string;
}

// Mock notifications data - sorted by newest first
const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "booking",
    title: "Booking Confirmed",
    message:
      "Your booking BUS123456 for Ho Chi Minh City to Da Lat has been confirmed. Trip date: 20/11/2025.",
    timestamp: "2025-11-18T10:30:00",
    isRead: false,
    priority: "high",
    actionUrl: "/booking-details/1",
    bookingCode: "BUS123456",
  },
  {
    id: "2",
    type: "reminder",
    title: "Trip Reminder",
    message:
      "Don't forget! Your trip to Nha Trang departs tomorrow at 22:00. Please arrive 30 minutes early.",
    timestamp: "2025-11-17T18:00:00",
    isRead: false,
    priority: "high",
    actionUrl: "/booking-details/2",
    bookingCode: "BUS789012",
  },
  {
    id: "3",
    type: "system",
    title: "Maintenance Notice",
    message:
      "Our booking system will be under maintenance on 25/11/2025 from 2:00 AM to 4:00 AM. We apologize for any inconvenience.",
    timestamp: "2025-11-16T16:00:00",
    isRead: false,
    priority: "low",
  },
  {
    id: "4",
    type: "payment",
    title: "Payment Successful",
    message:
      "Payment of 320,000 VND for booking BUS789012 has been processed successfully.",
    timestamp: "2025-11-15T14:15:00",
    isRead: true,
    priority: "medium",
    bookingCode: "BUS789012",
  },
  {
    id: "5",
    type: "promotion",
    title: "Special Discount Available!",
    message:
      "Get 20% off on your next booking to Da Lat. Use code DALAT20. Valid until 31/12/2025.",
    timestamp: "2025-11-14T09:00:00",
    isRead: true,
    priority: "medium",
    actionUrl: "/search?to=dalat",
  },
  {
    id: "6",
    type: "booking",
    title: "Booking Modification Confirmed",
    message:
      "Your seat change request for booking BUS789012 has been confirmed. New seat: A05.",
    timestamp: "2025-11-13T11:20:00",
    isRead: true,
    priority: "medium",
    actionUrl: "/booking-details/2",
    bookingCode: "BUS789012",
  },
  {
    id: "7",
    type: "promotion",
    title: "Weekend Flash Sale!",
    message:
      "Flash sale this weekend only! Up to 30% off on all routes. Book now before seats run out!",
    timestamp: "2025-11-12T12:00:00",
    isRead: true,
    priority: "medium",
    actionUrl: "/search",
  },
  {
    id: "8",
    type: "booking",
    title: "Seat Selection Updated",
    message:
      "Your preferred seat for booking BUS456789 has been updated to seat B12.",
    timestamp: "2025-11-11T15:45:00",
    isRead: false,
    priority: "medium",
    actionUrl: "/booking-details/3",
    bookingCode: "BUS456789",
  },
  {
    id: "9",
    type: "reminder",
    title: "Check-in Available",
    message:
      "Online check-in is now available for your trip to Can Tho. Complete check-in to save time.",
    timestamp: "2025-11-10T08:00:00",
    isRead: false,
    priority: "medium",
    actionUrl: "/booking-details/4",
    bookingCode: "BUS321654",
  },
  {
    id: "10",
    type: "promotion",
    title: "Black Friday Deals!",
    message:
      "Don't miss our Black Friday sale! Up to 50% off on selected routes. Limited time offer.",
    timestamp: "2025-11-09T10:30:00",
    isRead: true,
    priority: "high",
    actionUrl: "/search",
  },
];

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<
    | "all"
    | "unread"
    | "booking"
    | "payment"
    | "promotion"
    | "system"
    | "reminder"
  >("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);

    // Simulate API call
    setTimeout(() => {
      setNotifications(mockNotifications);
      setLoading(false);
    }, 500);
  }, []);

  const getNotificationIcon = (type: string, priority: string) => {
    const iconClass = `w-5 h-5 ${
      priority === "high"
        ? "text-red-500"
        : priority === "medium"
          ? "text-blue-500"
          : "text-gray-500"
    }`;

    switch (type) {
      case "booking":
        return <CheckCircle className={iconClass} />;
      case "payment":
        return <CheckCircle className={iconClass} />;
      case "reminder":
        return <Bell className={iconClass} />;
      case "system":
        return <AlertTriangle className={iconClass} />;
      case "promotion":
        return <Info className={iconClass} />;
      default:
        return <Bell className={iconClass} />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "booking":
        return "bg-green-100 text-green-700";
      case "payment":
        return "bg-blue-100 text-blue-700";
      case "reminder":
        return "bg-orange-100 text-orange-700";
      case "system":
        return "bg-gray-100 text-gray-700";
      case "promotion":
        return "bg-secondary-100 text-secondary";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    setNotifications((prev) =>
      prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n)),
    );

    // Navigate if has action URL
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  const handleMarkAsRead = (
    notificationId: string,
    event: React.MouseEvent,
  ) => {
    event.stopPropagation();
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n)),
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleDelete = (notificationId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
  };

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "all") return true;
    if (filter === "unread") return !notification.isRead;
    return notification.type === filter;
  });

  console.log("Total notifications:", notifications.length);
  console.log("Filtered notifications:", filteredNotifications.length);
  console.log("Current filter:", filter);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const formatRelativeTime = (timestamp: string) => {
    return dayjs(timestamp).fromNow();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading notifications...</p>
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
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-pink-50 via-pink-50/40 to-transparent pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex items-center gap-3 mb-6 opacity-0 animate-[fadeInDown_0.7s_ease-out_0.1s_forwards]">
            <Bell className="w-8 h-8 text-foreground/80" />
            {unreadCount > 0 && (
              <Badge className="bg-red-500 text-white">{unreadCount} new</Badge>
            )}
          </div>

          <h1 className="text-5xl font-bold text-foreground/80 mb-3 opacity-0 animate-[fadeInDown_0.7s_ease-out_0.2s_forwards]">
            Notifications
          </h1>
          <p className="text-xl text-foreground/60 opacity-0 animate-[fadeInDown_0.7s_ease-out_0.4s_forwards]">
            Stay updated with your bookings and latest offers
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 pb-8 -mt-16 relative z-10">
        {/* Filter and Actions */}
        <div className="opacity-0 animate-[fadeInUp_0.8s_ease-out_0.3s_forwards]">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">
                    Filter:
                  </span>
                </div>

                <Select
                  value={filter}
                  onValueChange={(value) => setFilter(value as typeof filter)}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="unread">Unread</SelectItem>
                    <SelectItem value="booking">Bookings</SelectItem>
                    <SelectItem value="payment">Payments</SelectItem>
                    <SelectItem value="reminder">Reminders</SelectItem>
                    <SelectItem value="promotion">Promotions</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {unreadCount > 0 && (
                <Button
                  onClick={handleMarkAllAsRead}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Mark all as read
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.map((notification) => (
            <div key={notification.id}>
              <div
                className={`bg-white rounded-2xl shadow-sm border border-gray-200 p-6 cursor-pointer transition-all duration-200 hover:shadow-md ${
                  !notification.isRead
                    ? "ring-2 ring-blue-100 bg-blue-50/50"
                    : ""
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(
                      notification.type,
                      notification.priority,
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3
                            className={`text-lg font-semibold ${
                              !notification.isRead
                                ? "text-gray-900"
                                : "text-gray-700"
                            }`}
                          >
                            {notification.title}
                          </h3>

                          <Badge
                            className={`text-xs ${getTypeColor(notification.type)}`}
                          >
                            {notification.type}
                          </Badge>

                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>

                        {notification.bookingCode && (
                          <p className="text-sm text-gray-500 mb-2">
                            Booking: {notification.bookingCode}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {formatRelativeTime(notification.timestamp)}
                        </span>

                        <div className="flex items-center gap-1">
                          {!notification.isRead && (
                            <Button
                              onClick={(e) =>
                                handleMarkAsRead(notification.id, e)
                              }
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 hover:bg-blue-100"
                              title="Mark as read"
                            >
                              <CheckCircle className="w-4 h-4 text-blue-500" />
                            </Button>
                          )}

                          <Button
                            onClick={(e) => handleDelete(notification.id, e)}
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 hover:bg-red-100"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <p
                      className={`text-sm leading-relaxed ${
                        !notification.isRead ? "text-gray-800" : "text-gray-600"
                      }`}
                    >
                      {notification.message}
                    </p>

                    {notification.actionUrl && (
                      <div className="mt-3">
                        <span className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700">
                          Click to view details →
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredNotifications.length === 0 && (
          <div className="opacity-0 animate-[fadeInUp_0.8s_ease-out_0.5s_forwards]">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
              <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No notifications found
              </h3>
              <p className="text-gray-600 mb-6">
                {filter === "all"
                  ? "You don't have any notifications yet."
                  : `No ${filter} notifications found.`}
              </p>
              <Button onClick={() => setFilter("all")} className="rounded-full">
                View All Notifications
              </Button>
            </div>
          </div>
        )}

        {/* Stats Summary */}
        {notifications.length > 0 && (
          <div className="opacity-0 animate-[fadeInUp_0.8s_ease-out_0.6s_forwards]">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Summary
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {notifications.length}
                  </div>
                  <div className="text-sm text-gray-600">Total</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">
                    {unreadCount}
                  </div>
                  <div className="text-sm text-gray-600">Unread</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {notifications.filter((n) => n.type === "booking").length}
                  </div>
                  <div className="text-sm text-gray-600">Bookings</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-secondary">
                    {notifications.filter((n) => n.type === "promotion").length}
                  </div>
                  <div className="text-sm text-gray-600">Promotions</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
