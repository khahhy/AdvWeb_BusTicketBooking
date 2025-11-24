import { useState, useRef, useEffect } from "react";
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
} from "lucide-react";
import { Button } from "./button";

interface Message {
  id: string;
  content: string;
  isBot: boolean;
  timestamp: Date;
  suggestions?: string[];
}

const initialMessages: Message[] = [
  {
    id: "1",
    content:
      "Your improved Bus Booking AI\n\nHere are a few things I can do, or ask me anything!",
    isBot: true,
    timestamp: new Date(),
    suggestions: [
      "Personalize your booking experience",
      "Translate this page",
      "Analyze travel insights",
      "Create a trip planner",
    ],
  },
];

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
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

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      isBot: false,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate bot response
    setTimeout(
      () => {
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: getBotResponse(inputValue),
          isBot: true,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botResponse]);
        setIsTyping(false);
      },
      1000 + Math.random() * 1500,
    );
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
    setInputValue(suggestion);
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

          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-800 dark:bg-gray-900 text-white dark:text-gray-200 text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Bus Booking AI ⌘J
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
                      placeholder="Ask about booking, schedules, or anything..."
                      className="w-full bg-white/90 dark:bg-gray-800/95 text-gray-800 dark:text-gray-200 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 placeholder-gray-500 dark:placeholder-gray-400 border border-rose-200 dark:border-gray-700"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      <span className="text-gray-500 dark:text-gray-400 text-xs">Auto</span>
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
