import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Minimize2,
  Sparkles,
  Globe,
  Search,
  CheckCircle,
  Clock,
  MapPin,
  Users,
} from "lucide-react";
import { Button } from "./button";

interface Message {
  id: string;
  content: string;
  isBot: boolean;
  timestamp: Date;
  suggestions?: string[];
  data?: Record<string, unknown>; // Store context data from backend
  type?: string; // Message type: 'text', 'trip_results', etc.
}

const initialMessages: Message[] = [
  {
    id: "1",
    content:
      "Hello! I'm your Bus Booking AI Assistant.\n\nI can help you with:",
    isBot: true,
    timestamp: new Date(),
    suggestions: [
      "Find bus from Hanoi to Da Nang",
      "Show today's buses",
      "Cancellation policy",
      "Contact support",
    ],
  },
];

interface User {
  id: string;
  email: string;
  fullName: string;
}

export default function Chatbot() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  // Load user info when chatbot opens
  useEffect(() => {
    if (isOpen) {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          setCurrentUser(user);
        } catch (error) {
          console.error("Error parsing user:", error);
        }
      }
    }
  }, [isOpen]);

  // Initialize WebSocket connection
  useEffect(() => {
    if (isOpen && !socket) {
      const newSocket = io("http://localhost:3000/payment", {
        transports: ["websocket"],
      });

      newSocket.on("connect", () => {
        console.log("Connected to payment WebSocket");
      });

      newSocket.on("disconnect", () => {
        console.log("Disconnected from payment WebSocket");
      });

      newSocket.on("payment-success", (data) => {
        console.log("Payment success received:", data);

        // Add success message to chat
        const successMessage: Message = {
          id: Date.now().toString(),
          content: `✅ Thanh toán thành công!\n\nMã vé: ${data.ticketCode}\nSố tiền: ${data.amount.toLocaleString("vi-VN")} VND\n\nVé điện tử đã được gửi đến email của bạn.`,
          isBot: true,
          timestamp: new Date(),
          type: "payment_success",
          data: data,
          suggestions: ["Xem vé của tôi", "Đặt vé mới"],
        };

        setMessages((prev) => [...prev, successMessage]);
      });

      newSocket.on("payment-failure", (data) => {
        console.log("Payment failure received:", data);

        // Add failure message to chat
        const failureMessage: Message = {
          id: Date.now().toString(),
          content: `❌ Thanh toán thất bại!\n\nLý do: ${data.reason}\n\nVui lòng thử lại hoặc liên hệ hỗ trợ.`,
          isBot: true,
          timestamp: new Date(),
          type: "payment_failure",
          data: data,
          suggestions: ["Thử lại", "Liên hệ hỗ trợ"],
        };

        setMessages((prev) => [...prev, failureMessage]);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [isOpen, socket]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (socket) {
        socket.close();
        setSocket(null);
      }
    };
  }, []);

  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, isMinimized]);

  const handleSendMessage = async (
    messageText?: string,
    contextData?: Record<string, unknown>,
  ) => {
    const textToSend = messageText || inputValue;
    if (!textToSend.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: textToSend,
      isBot: false,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    try {
      // Get context from last bot message or use provided context
      const lastBotMessage = messages
        .slice()
        .reverse()
        .find(
          (m) => m.isBot && (m.data?.pendingSearch || m.data?.bookingState),
        );

      // Call backend API with context (search or booking)
      const response = await fetch("http://localhost:3000/chatbot/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: textToSend,
          context: {
            ...(contextData || lastBotMessage?.data || {}),
            user: currentUser, // Pass user info to backend
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();

      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: data.message,
        isBot: true,
        timestamp: new Date(),
        suggestions: data.suggestions,
        data: data.data, // Store context for next message
        type: data.type, // Store message type
      };

      setMessages((prev) => [...prev, botResponse]);
    } catch (error) {
      console.error("Error sending message:", error);

      // Fallback to local response
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: getBotResponse(textToSend),
        isBot: true,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const getBotResponse = (input: string): string => {
    const lowerInput = input.toLowerCase();

    if (lowerInput.includes("book") || lowerInput.includes("ticket")) {
      return "I can help you book tickets! You can search for routes, select seats, and complete your booking. Would you like me to guide you through the booking process?";
    } else if (lowerInput.includes("cancel") || lowerInput.includes("refund")) {
      return "For cancellations and refunds, you can go to your Booking History and select the booking you want to cancel. Refund policies vary by route and timing.";
    } else if (lowerInput.includes("schedule") || lowerInput.includes("time")) {
      return "You can check bus schedules and departure times on our Search page. Just enter your departure and destination cities to see all available trips.";
    } else if (lowerInput.includes("seat") || lowerInput.includes("choose")) {
      return "During booking, you'll see a seat map where you can choose your preferred seat. Different seat types may have different prices.";
    } else if (lowerInput.includes("price") || lowerInput.includes("cost")) {
      return "Ticket prices vary by route, seat type, and booking time. You'll see exact prices when you search for your desired trip.";
    } else if (lowerInput.includes("payment") || lowerInput.includes("pay")) {
      return "We accept various payment methods including credit cards, bank transfers, and digital wallets. All payments are processed securely.";
    } else {
      return "I'm here to help with your bus booking needs! You can ask me about booking tickets, schedules, payments, cancellations, or any other questions about our service.";
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    // Check if this is a "view all trips" suggestion
    const lastMessage = messages[messages.length - 1];
    if (
      lastMessage?.type === "trip_results" &&
      (suggestion.includes("Xem tất cả") || suggestion.includes("View all"))
    ) {
      // Navigate to search results page with trip data
      const { searchParams } = lastMessage.data;
      navigate("/search-results", {
        state: {
          trips: lastMessage.data.trips,
          searchParams,
          fromChatbot: true,
        },
      });
      setIsOpen(false);
      return;
    }

    // Otherwise send as message
    handleSendMessage(suggestion);
  };

  const handleBookTrip = (
    trip: Record<string, unknown>,
    bookInChat: boolean = false,
  ) => {
    // Extract necessary trip info
    const routeId = (trip.tripRoutes as Array<{ routeId: string }>)?.[0]
      ?.routeId;

    if (!trip.id || !routeId) {
      console.error("Missing trip or route ID", { trip, routeId });
      return;
    }

    if (bookInChat) {
      // Start booking flow in chatbot
      const price =
        (trip.tripRoutes as Array<{ price: number }>)?.[0]?.price || 0;
      handleSendMessage(`Xem sơ đồ ghế chuyến ${trip.id}`, {
        bookingState: {
          stage: "seat_selection",
          tripId: trip.id,
          routeId: routeId,
          tripData: trip,
          basePrice: price,
        },
      });
      return;
    }

    // Navigate to checkout page (existing flow)
    const params = new URLSearchParams({
      tripId: trip.id,
      routeId: routeId,
      date: new Date(trip.startTime).toISOString().split("T")[0],
    });

    navigate(`/checkout?${params.toString()}`);
    setIsOpen(false); // Close chatbot
  };

  const handleSeatSelection = (seatNumbers: string[]) => {
    const lastMessage = messages[messages.length - 1];
    const bookingState = lastMessage.data?.bookingState;

    if (!bookingState) return;

    const totalPrice = seatNumbers.length * (bookingState.basePrice || 0);

    // Convert seat numbers to seat IDs using the mapping from backend
    const seatNumberToId = bookingState.seatNumberToId || {};
    const seatIds = seatNumbers
      .map((num) => seatNumberToId[num])
      .filter(Boolean);

    handleSendMessage(`Chọn ghế ${seatNumbers.join(", ")}`, {
      bookingState: {
        ...bookingState,
        stage: "passenger_details",
        selectedSeats: seatNumbers,
        selectedSeatIds: seatIds,
        totalPrice,
      },
    });
  };

  const handlePassengerInfo = (info: {
    name: string;
    email: string;
    phone: string;
  }) => {
    const lastMessage = messages[messages.length - 1];
    const bookingState = lastMessage.data?.bookingState;

    if (!bookingState) return;

    handleSendMessage(`Thông tin: ${info.name}, ${info.email}, ${info.phone}`, {
      bookingState: {
        ...bookingState,
        stage: "payment",
        passengerInfo: info,
      },
    });
  };

  const handlePayment = (method: "online" | "offline") => {
    console.log("handlePayment called with method:", method);
    const lastMessage = messages[messages.length - 1];
    const bookingState = lastMessage.data?.bookingState;

    console.log("Booking state:", bookingState);

    if (!bookingState) {
      console.error("No booking state found");
      return;
    }

    if (method === "online") {
      // Subscribe to payment updates via WebSocket before creating payment
      const bookingId = bookingState.bookingId;
      if (socket && bookingId) {
        socket.emit("subscribe-payment", { bookingId });
        console.log("Subscribed to payment updates for booking:", bookingId);
      }

      // Send message to trigger backend payment creation
      handleSendMessage("Thanh toán online", {
        bookingState: {
          ...bookingState,
          stage: "payment",
        },
      });
    } else {
      // Show message that offline payment is not available
      const botMessage: Message = {
        id: Date.now().toString(),
        content:
          'Xin lỗi, hiện tại hệ thống chỉ hỗ trợ thanh toán online. Vui lòng chọn "Thanh toán online" để tiếp tục đặt vé.',
        isBot: true,
        timestamp: new Date(),
        suggestions: ["Thanh toán online"],
      };
      setMessages((prev) => [...prev, botMessage]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-50 group"
          aria-label="Open chat"
        >
          <MessageCircle className="w-6 h-6" />
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-rose-400 rounded-full flex items-center justify-center">
            <Bot className="w-3 h-3 text-white" />
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`fixed bottom-6 right-6 w-96 bg-gradient-to-b from-rose-50 to-pink-50 dark:bg-black dark:bg-none border border-rose-200 dark:border-gray-800/95 rounded-2xl shadow-2xl z-50 transition-all duration-300 ${
            isMinimized ? "h-16" : "h-[600px]"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-rose-200 dark:border-gray-700 bg-white/80 dark:bg-black/95 backdrop-blur rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-gray-800 dark:text-white font-medium text-sm">
                  Bus Booking AI
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-xs">
                  Ask, search, or make anything...
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Button
                onClick={() => setIsMinimized(!isMinimized)}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-rose-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
              >
                <Minimize2 className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => setIsOpen(false)}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-rose-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 h-[440px]">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.isBot ? "justify-start" : "justify-end"
                    }`}
                  >
                    {message.isBot && (
                      <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                    )}

                    <div
                      className={`max-w-[280px] rounded-2xl p-3 ${
                        message.isBot
                          ? "bg-white/90 dark:bg-gray-800/95 backdrop-blur text-gray-800 dark:text-gray-200 shadow-sm border border-rose-100 dark:border-gray-700"
                          : "bg-gradient-to-r from-pink-500 to-rose-500 text-white ml-8 shadow-sm"
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-line">
                        {message.content}
                      </p>

                      {/* Seat Selection UI */}
                      {message.type === "seat_selection" && (
                        <div className="mt-3 p-3 bg-white dark:bg-gray-700 rounded-lg border border-rose-200 dark:border-gray-600">
                          <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">
                            Nhập số ghế (vd: A1 hoặc A1,A2):
                          </p>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="A1"
                              className="flex-1 text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                              onKeyPress={(e) => {
                                if (e.key === "Enter") {
                                  const seats = (
                                    e.target as HTMLInputElement
                                  ).value
                                    .split(",")
                                    .map((s) => s.trim());
                                  handleSeatSelection(seats);
                                  (e.target as HTMLInputElement).value = "";
                                }
                              }}
                            />
                            <Button
                              size="sm"
                              onClick={() => {
                                const input =
                                  document.querySelector<HTMLInputElement>(
                                    'input[placeholder="A1"]',
                                  );
                                if (input?.value) {
                                  const seats = input.value
                                    .split(",")
                                    .map((s) => s.trim());
                                  handleSeatSelection(seats);
                                  input.value = "";
                                }
                              }}
                              className="text-xs"
                            >
                              Xác nhận
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Passenger Form UI */}
                      {message.type === "passenger_form" && (
                        <div className="mt-3 p-3 bg-white dark:bg-gray-700 rounded-lg border border-rose-200 dark:border-gray-600 space-y-2">
                          <input
                            type="text"
                            placeholder="Họ tên"
                            id="passenger-name"
                            className="w-full text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                          />
                          <input
                            type="email"
                            placeholder="Email"
                            id="passenger-email"
                            className="w-full text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                          />
                          <input
                            type="tel"
                            placeholder="Số điện thoại"
                            id="passenger-phone"
                            className="w-full text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                          />
                          <Button
                            size="sm"
                            onClick={() => {
                              const name = (
                                document.getElementById(
                                  "passenger-name",
                                ) as HTMLInputElement
                              )?.value;
                              const email = (
                                document.getElementById(
                                  "passenger-email",
                                ) as HTMLInputElement
                              )?.value;
                              const phone = (
                                document.getElementById(
                                  "passenger-phone",
                                ) as HTMLInputElement
                              )?.value;
                              if (name && email && phone) {
                                handlePassengerInfo({ name, email, phone });
                              }
                            }}
                            className="w-full text-xs"
                          >
                            Tiếp tục
                          </Button>
                        </div>
                      )}

                      {/* Payment Selection UI */}
                      {message.type === "payment_selection" && (
                        <div className="mt-3 flex flex-col gap-2">
                          <Button
                            size="sm"
                            onClick={() => handlePayment("online")}
                            className="w-full text-xs bg-green-600 hover:bg-green-700"
                          >
                            💳 Thanh toán online
                          </Button>
                          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                            Hiện tại chỉ hỗ trợ thanh toán online
                          </p>
                        </div>
                      )}

                      {/* Payment Link UI */}
                      {message.type === "payment_link" && message.data && (
                        <div className="mt-3 p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border-2 border-green-500 space-y-3">
                          {message.data.qrCode && (
                            <div className="flex flex-col items-center gap-2">
                              <div className="bg-white p-3 rounded-lg shadow-lg">
                                <img
                                  src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(message.data.qrCode)}&size=200x200`}
                                  alt="Payment QR Code"
                                  className="w-48 h-48"
                                  onError={(e) => {
                                    console.error("QR Code failed to load");
                                    (
                                      e.target as HTMLImageElement
                                    ).style.display = "none";
                                  }}
                                />
                              </div>
                              <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
                                Quét mã QR để thanh toán
                              </p>
                            </div>
                          )}
                          {!message.data.qrCode && (
                            <div className="flex justify-center p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                QR code không khả dụng
                              </p>
                            </div>
                          )}
                          <div className="text-center space-y-2">
                            <p className="text-sm font-bold text-green-700 dark:text-green-300">
                              Mã đơn hàng: #{message.data.orderCode}
                            </p>
                            <p className="text-lg font-bold text-gray-800 dark:text-gray-200">
                              {message.data.amount?.toLocaleString("vi-VN")} VND
                            </p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() =>
                              window.open(message.data.checkoutUrl, "_blank")
                            }
                            className="w-full text-sm bg-green-600 hover:bg-green-700 font-semibold"
                          >
                            🔗 Mở trang thanh toán
                          </Button>
                          <p className="text-xs text-center text-gray-600 dark:text-gray-400">
                            {message.data.qrCode
                              ? "Quét mã QR hoặc nhấn nút để thanh toán"
                              : "Nhấn nút để mở trang thanh toán"}
                          </p>
                        </div>
                      )}

                      {/* Trip Results Cards */}
                      {message.type === "trip_results" &&
                        message.data?.trips && (
                          <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
                            {(
                              message.data.trips as Array<
                                Record<string, unknown>
                              >
                            )
                              .slice(0, 5)
                              .map((trip) => {
                                const tripRoutes = trip.tripRoutes as Array<{
                                  route?: {
                                    origin?: { name?: string };
                                    destination?: { name?: string };
                                  };
                                  price?: number;
                                }>;
                                const startTime = new Date(
                                  trip.startTime as string,
                                );
                                const price = tripRoutes?.[0]?.price || 0;
                                const route = tripRoutes?.[0]?.route;

                                return (
                                  <div
                                    key={trip.id}
                                    className="p-3 bg-gradient-to-br from-rose-50 to-pink-50 dark:from-gray-700/50 dark:to-gray-600/50 rounded-lg border border-rose-200 dark:border-gray-600 hover:shadow-md transition-all cursor-pointer"
                                    onClick={() => handleBookTrip(trip)}
                                  >
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center gap-2">
                                        <Clock className="w-3 h-3 text-rose-500" />
                                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                                          {startTime.toLocaleTimeString(
                                            "vi-VN",
                                            {
                                              hour: "2-digit",
                                              minute: "2-digit",
                                            },
                                          )}
                                        </span>
                                      </div>
                                      <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                                        {(Number(price) / 1000).toFixed(0)}k VND
                                      </span>
                                    </div>

                                    <div className="flex items-center gap-2 mb-2">
                                      <MapPin className="w-3 h-3 text-blue-500" />
                                      <span className="text-xs text-gray-600 dark:text-gray-300">
                                        {route?.origin?.name || "N/A"} →{" "}
                                        {route?.destination?.name || "N/A"}
                                      </span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-1">
                                        <Users className="w-3 h-3 text-green-500" />
                                        <span className="text-xs text-gray-600 dark:text-gray-300">
                                          {trip.availableSeats} chỗ trống
                                        </span>
                                      </div>
                                      <span className="text-xs text-gray-500 dark:text-gray-400">
                                        {trip.bus?.busType || "standard"}
                                      </span>
                                    </div>

                                    <div className="mt-2 pt-2 border-t border-rose-200 dark:border-gray-600 flex gap-2">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleBookTrip(trip, true);
                                        }}
                                        className="flex-1 text-xs font-medium text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300"
                                      >
                                        💬 Đặt trong chat
                                      </button>
                                      <button className="flex-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                                        ➜ Đặt vé ngay
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        )}

                      {/* Suggestions */}
                      {message.suggestions && (
                        <div className="mt-3 space-y-2">
                          {message.suggestions.map((suggestion, index) => (
                            <button
                              key={index}
                              onClick={() => handleSuggestionClick(suggestion)}
                              className="flex items-center gap-2 w-full p-2 text-xs text-left bg-rose-50 dark:bg-gray-700/80 hover:bg-rose-100 dark:hover:bg-gray-600/80 rounded-lg transition-colors border border-rose-100 dark:border-gray-600"
                            >
                              {index === 0 && (
                                <Sparkles className="w-3 h-3 text-yellow-500" />
                              )}
                              {index === 1 && (
                                <Globe className="w-3 h-3 text-blue-500" />
                              )}
                              {index === 2 && (
                                <Search className="w-3 h-3 text-green-500" />
                              )}
                              {index === 3 && (
                                <CheckCircle className="w-3 h-3 text-purple-500" />
                              )}
                              <span className="text-gray-700 dark:text-gray-300">
                                {suggestion}
                              </span>
                              {index === 0 && (
                                <span className="ml-auto text-pink-500 text-xs">
                                  New
                                </span>
                              )}
                              {index === 2 && (
                                <span className="ml-auto text-green-500 text-xs">
                                  New
                                </span>
                              )}
                              {index === 3 && (
                                <span className="ml-auto text-purple-500 text-xs">
                                  New
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {!message.isBot && (
                      <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex gap-3 justify-start">
                    <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div className="bg-white/90 dark:bg-gray-800/95 backdrop-blur rounded-2xl p-3 shadow-sm border border-rose-100 dark:border-gray-700">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-rose-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-rose-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-rose-200 dark:border-gray-700 bg-white/80 dark:bg-black/95 backdrop-blur rounded-b-2xl">
                <div className="flex items-center gap-2">
                  <div className="flex-1 relative">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      className="w-full bg-white/90 dark:bg-gray-800/95 text-gray-800 dark:text-gray-200 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 placeholder-gray-500 dark:placeholder-gray-400 border border-rose-200 dark:border-gray-700"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      <Globe className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                    </div>
                  </div>

                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim()}
                    className="h-12 w-12 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span>All sources</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
