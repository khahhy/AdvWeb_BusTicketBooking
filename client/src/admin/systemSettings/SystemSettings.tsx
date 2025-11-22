import { useState } from "react";
import {
  Save,
  Globe,
  CreditCard,
  Clock,
  Bot,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";

interface SystemConfig {
  general: {
    siteName: string;
    hotline: string;
    supportEmail: string;
    maintenanceMode: boolean;
  };
  booking: {
    paymentHoldTimeMinutes: number;
    minCancellationHours: number;
    refundPercentage: number;
    allowSeatSelection: boolean;
  };
  payment: {
    enableMomo: boolean;
    enableZalopay: boolean;
    enablePayOS: boolean;
    enableCashOnBoard: boolean;
  };
  aiBot: {
    enabled: boolean;
    modelName: string;
    systemPrompt: string;
    temperature: number;
  };
}

const INITIAL_CONFIG: SystemConfig = {
  general: {
    siteName: "Vexere Clone",
    hotline: "1900 8888",
    supportEmail: "support@vexereclone.com",
    maintenanceMode: false,
  },
  booking: {
    paymentHoldTimeMinutes: 15,
    minCancellationHours: 24,
    refundPercentage: 85,
    allowSeatSelection: true,
  },
  payment: {
    enableMomo: true,
    enableZalopay: true,
    enablePayOS: true,
    enableCashOnBoard: false,
  },
  aiBot: {
    enabled: true,
    modelName: "gpt-4o-mini",
    systemPrompt: `Bạn là trợ lý ảo bán vé xe buýt. 
Nhiệm vụ của bạn là giúp khách hàng tìm chuyến xe, kiểm tra ghế trống và hỗ trợ đặt vé.
- Luôn trả lời lịch sự, ngắn gọn.
- Nếu khách hỏi về hoàn tiền, hãy trích dẫn chính sách: "Hoàn 85% nếu hủy trước 24h".
- Không được bịa đặt thông tin chuyến xe không có trong dữ liệu.`,
    temperature: 0.7,
  },
};

const SystemSettings = () => {
  const [activeTab, setActiveTab] = useState<
    "general" | "booking" | "payment" | "ai"
  >("general");
  const [config, setConfig] = useState<SystemConfig>(INITIAL_CONFIG);
  const [isSaving, setIsSaving] = useState(false);

  const updateConfig = (
    section: keyof SystemConfig,
    field: string,
    value: any,
  ) => {
    setConfig((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleSave = () => {
    setIsSaving(true);

    setTimeout(() => {
      setIsSaving(false);
      alert("Configuration saved successfully!");
    }, 1000);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto min-h-screen font-sans text-gray-900 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition-all disabled:opacity-70"
        >
          {isSaving ? (
            <RotateCcw className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-1">
          <button
            onClick={() => setActiveTab("general")}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
              activeTab === "general"
                ? "bg-blue-50 text-blue-700"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Globe className="w-4 h-4" /> General Info
          </button>
          <button
            onClick={() => setActiveTab("booking")}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
              activeTab === "booking"
                ? "bg-blue-50 text-blue-700"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Clock className="w-4 h-4" /> Booking Rules
          </button>
          <button
            onClick={() => setActiveTab("payment")}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
              activeTab === "payment"
                ? "bg-blue-50 text-blue-700"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <CreditCard className="w-4 h-4" /> Payment Gateways
          </button>
          <button
            onClick={() => setActiveTab("ai")}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
              activeTab === "ai"
                ? "bg-purple-50 text-purple-700"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Bot className="w-4 h-4" /> Chatbot & AI
          </button>
        </div>

        <div className="lg:col-span-3 bg-white rounded-xl border shadow-sm p-6">
          {activeTab === "general" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h2 className="text-lg font-bold text-gray-800 mb-4">
                  General Information
                </h2>
                <div className="grid gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Website Name
                    </label>
                    <input
                      type="text"
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      value={config.general.siteName}
                      onChange={(e) =>
                        updateConfig("general", "siteName", e.target.value)
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hotline
                      </label>
                      <input
                        type="text"
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        value={config.general.hotline}
                        onChange={(e) =>
                          updateConfig("general", "hotline", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Support Email
                      </label>
                      <input
                        type="email"
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        value={config.general.supportEmail}
                        onChange={(e) =>
                          updateConfig(
                            "general",
                            "supportEmail",
                            e.target.value,
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h2 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                  Danger Zone
                </h2>
                <div className="flex items-center justify-between bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <div>
                    <p className="font-medium text-orange-800">
                      Maintenance Mode
                    </p>
                    <p className="text-xs text-orange-600">
                      When active, only admins can access the system. Customers
                      will see a maintenance page.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={config.general.maintenanceMode}
                      onChange={(e) =>
                        updateConfig(
                          "general",
                          "maintenanceMode",
                          e.target.checked,
                        )
                      }
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === "booking" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <h2 className="text-lg font-bold text-gray-800 mb-4">
                Booking Logic & Policies
              </h2>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Changing these values directly affects
                  the business logic of how the backend processes bookings and
                  cancellations.
                </p>
              </div>

              <div className="grid gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Hold Time (Minutes)
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    How long a seat is locked while waiting for payment (Pending
                    Payment).
                  </p>
                  <input
                    type="number"
                    className="w-full md:w-1/3 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    value={config.booking.paymentHoldTimeMinutes}
                    onChange={(e) =>
                      updateConfig(
                        "booking",
                        "paymentHoldTimeMinutes",
                        Number(e.target.value),
                      )
                    }
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Min Cancellation Notice (Hours)
                    </label>
                    <p className="text-xs text-gray-500 mb-2">
                      Customers cannot cancel if departure is within this time.
                    </p>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        value={config.booking.minCancellationHours}
                        onChange={(e) =>
                          updateConfig(
                            "booking",
                            "minCancellationHours",
                            Number(e.target.value),
                          )
                        }
                      />
                      <span className="text-sm text-gray-500">Hours</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Refund Percentage (%)
                    </label>
                    <p className="text-xs text-gray-500 mb-2">
                      Amount refunded to customer wallet/card upon cancellation.
                    </p>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        value={config.booking.refundPercentage}
                        max={100}
                        onChange={(e) =>
                          updateConfig(
                            "booking",
                            "refundPercentage",
                            Number(e.target.value),
                          )
                        }
                      />
                      <span className="text-sm text-gray-500">%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "payment" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <h2 className="text-lg font-bold text-gray-800 mb-4">
                Payment Gateways
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                Toggle available payment methods for customers. Useful during
                gateway maintenance.
              </p>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-pink-100 rounded-lg flex items-center justify-center text-pink-600 font-bold text-xs">
                      MoMo
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Momo E-Wallet</p>
                      <p className="text-xs text-gray-500">
                        Integration active
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={config.payment.enableMomo}
                      onChange={(e) =>
                        updateConfig("payment", "enableMomo", e.target.checked)
                      }
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 font-bold text-xs">
                      PayOS
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        PayOS (QR Code)
                      </p>
                      <p className="text-xs text-gray-500">
                        Bank transfer via QR
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={config.payment.enablePayOS}
                      onChange={(e) =>
                        updateConfig("payment", "enablePayOS", e.target.checked)
                      }
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600 font-bold text-xs">
                      Cash
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Cash Payment</p>
                      <p className="text-xs text-gray-500">
                        Pay at office or on board
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={config.payment.enableCashOnBoard}
                      onChange={(e) =>
                        updateConfig(
                          "payment",
                          "enableCashOnBoard",
                          e.target.checked,
                        )
                      }
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === "ai" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-800">
                  AI Assistant Configuration
                </h2>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={config.aiBot.enabled}
                    onChange={(e) =>
                      updateConfig("aiBot", "enabled", e.target.checked)
                    }
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              <div className="grid gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Model Selection
                  </label>
                  <select
                    className="w-full md:w-1/2 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none bg-white"
                    value={config.aiBot.modelName}
                    onChange={(e) =>
                      updateConfig("aiBot", "modelName", e.target.value)
                    }
                  >
                    <option value="gpt-4o-mini">
                      GPT-4o Mini (Recommended)
                    </option>
                    <option value="gpt-4">GPT-4 (Expensive)</option>
                    <option value="claude-3-haiku">Claude 3 Haiku</option>
                  </select>
                </div>

                <div>
                  <div className="flex justify-between items-end mb-1">
                    <label className="block text-sm font-medium text-gray-700">
                      System Prompt (Instruction)
                    </label>
                    <span className="text-xs text-gray-400">
                      Define the bot's persona & rules
                    </span>
                  </div>
                  <textarea
                    rows={8}
                    className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-purple-500 outline-none font-mono bg-gray-50"
                    value={config.aiBot.systemPrompt}
                    onChange={(e) =>
                      updateConfig("aiBot", "systemPrompt", e.target.value)
                    }
                    placeholder="You are a helpful assistant..."
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Creativity (Temperature): {config.aiBot.temperature}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                    value={config.aiBot.temperature}
                    onChange={(e) =>
                      updateConfig(
                        "aiBot",
                        "temperature",
                        parseFloat(e.target.value),
                      )
                    }
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Precise (0.0)</span>
                    <span>Balanced (0.5)</span>
                    <span>Creative (1.0)</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;
