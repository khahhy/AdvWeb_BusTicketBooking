import { useEffect, useState } from "react";
import {
  Save,
  Globe,
  CreditCard,
  Clock,
  RotateCcw,
  DollarSign,
  List,
  Plus,
  X,
} from "lucide-react";
import {
  useGetGeneralSettingsQuery,
  useUpdateGeneralSettingsMutation,
  useGetBookingRulesQuery,
  useUpdateBookingRulesMutation,
  useGetBusAmenitiesQuery,
  useUpdateBusAmenitiesMutation,
  useGetBusTypePricingQuery,
  useUpdateBusTypePricingMutation,
  useGetPricingPoliciesQuery,
  useUpdatePricingPoliciesMutation,
  useGetPaymentGatewaysQuery,
  useUpdatePaymentGatewaysMutation,
} from "@/store/api/settingApi";
import { GatewayType, GatewayConfigDto } from "@/store/type/settingType";

const SystemSettings = () => {
  const [activeTab, setActiveTab] = useState<
    "general" | "booking" | "pricing" | "amenities" | "payment"
  >("general");

  const { data: generalData } = useGetGeneralSettingsQuery();
  const { data: bookingData } = useGetBookingRulesQuery();
  const { data: amenitiesData } = useGetBusAmenitiesQuery();
  const { data: pricingTypeData } = useGetBusTypePricingQuery();
  const { data: pricingPolicyData } = useGetPricingPoliciesQuery();
  const { data: paymentData } = useGetPaymentGatewaysQuery();

  // Mutation hooks
  const [updateGeneral, { isLoading: s1 }] = useUpdateGeneralSettingsMutation();
  const [updateBooking, { isLoading: s2 }] = useUpdateBookingRulesMutation();
  const [updateAmenities, { isLoading: s3 }] = useUpdateBusAmenitiesMutation();
  const [updateBusPricing, { isLoading: s4 }] =
    useUpdateBusTypePricingMutation();
  const [updatePolicy, { isLoading: s5 }] = useUpdatePricingPoliciesMutation();
  const [updatePayment, { isLoading: s6 }] = useUpdatePaymentGatewaysMutation();

  const isSaving = s1 || s2 || s3 || s4 || s5 || s6;

  // Local States
  const [formData, setFormData] = useState({
    general: { hotline: "", email: "", maintenanceMode: false },
    booking: {
      paymentHoldTimeMinutes: 0,
      minCancellationHours: 0,
      refundPercentage: 0,
    },
    amenities: [] as string[],
    busPricing: { standard: 1, vip: 1, sleeper: 1, limousine: 1 },
    pricingPolicy: { pricePerKm: 0, weekendSurcharge: 0, holidaySurcharge: 0 },
    payment: [] as GatewayConfigDto[],
  });

  const [newAmenity, setNewAmenity] = useState("");

  useEffect(() => {
    if (generalData) setFormData((p) => ({ ...p, general: generalData }));
  }, [generalData]);

  useEffect(() => {
    if (bookingData) setFormData((p) => ({ ...p, booking: bookingData }));
  }, [bookingData]);

  useEffect(() => {
    if (amenitiesData)
      setFormData((p) => ({ ...p, amenities: amenitiesData.amenities }));
  }, [amenitiesData]);

  useEffect(() => {
    if (pricingTypeData)
      setFormData((p) => ({
        ...p,
        busPricing: { ...p.busPricing, ...pricingTypeData },
      }));
  }, [pricingTypeData]);

  useEffect(() => {
    if (pricingPolicyData)
      setFormData((p) => ({ ...p, pricingPolicy: pricingPolicyData }));
  }, [pricingPolicyData]);

  useEffect(() => {
    if (paymentData)
      setFormData((p) => ({ ...p, payment: paymentData.gateways ?? [] }));
  }, [paymentData]);

  const handleSave = async () => {
    try {
      switch (activeTab) {
        case "general":
          await updateGeneral(formData.general).unwrap();
          break;
        case "booking":
          await updateBooking(formData.booking).unwrap();
          break;
        case "amenities":
          await updateAmenities({ amenities: formData.amenities }).unwrap();
          break;
        case "pricing":
          await Promise.all([
            updateBusPricing(formData.busPricing).unwrap(),
            updatePolicy(formData.pricingPolicy).unwrap(),
          ]);
          break;
        case "payment":
          await updatePayment({ gateways: formData.payment }).unwrap();
          break;
      }
      alert("Settings saved successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to save settings.");
    }
  };

  // Amenities Helper
  const addAmenity = () => {
    if (newAmenity && !formData.amenities.includes(newAmenity)) {
      setFormData((p) => ({ ...p, amenities: [...p.amenities, newAmenity] }));
      setNewAmenity("");
    }
  };
  const removeAmenity = (item: string) => {
    setFormData((p) => ({
      ...p,
      amenities: p.amenities.filter((a) => a !== item),
    }));
  };

  // Payment Helper
  const toggleGateway = (provider: GatewayType, enabled: boolean) => {
    setFormData((prev) => {
      const exists = prev.payment.find((g) => g.provider === provider);
      let newPayment = [...prev.payment];
      if (exists) {
        newPayment = newPayment.map((g) =>
          g.provider === provider ? { ...g, enabled } : g,
        );
      } else {
        newPayment.push({ provider, enabled, isSandbox: true });
      }
      return { ...prev, payment: newPayment };
    });
  };
  const isGatewayEnabled = (provider: GatewayType) =>
    formData.payment?.find((g) => g.provider === provider)?.enabled ?? false;

  return (
    <div className="p-6 max-w-6xl mx-auto min-h-screen font-sans text-gray-900 dark:text-white space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">System Configuration</h1>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 disabled:opacity-70"
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
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1 space-y-1">
          {[
            { id: "general", icon: Globe, label: "General Info" },
            { id: "booking", icon: Clock, label: "Booking Rules" },
            { id: "pricing", icon: DollarSign, label: "Pricing & Policies" },
            { id: "amenities", icon: List, label: "Bus Amenities" },
            { id: "payment", icon: CreditCard, label: "Payment Gateways" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                activeTab === tab.id
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                  : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700"
              }`}
            >
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 shadow-sm p-6">
          {/* TAB: GENERAL */}
          {activeTab === "general" && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold">General Information</h2>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Hotline
                    </label>
                    <input
                      className="w-full border rounded px-3 py-2"
                      value={formData.general.hotline || ""}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          general: { ...p.general, hotline: e.target.value },
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Support Email
                    </label>
                    <input
                      className="w-full border rounded px-3 py-2"
                      value={formData.general.email || ""}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          general: { ...p.general, email: e.target.value },
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-orange-50 border border-orange-200 rounded">
                  <span className="text-orange-800 font-medium">
                    Maintenance Mode
                  </span>
                  <input
                    type="checkbox"
                    className="w-5 h-5"
                    checked={formData.general.maintenanceMode || false}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        general: {
                          ...p.general,
                          maintenanceMode: e.target.checked,
                        },
                      }))
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB: BOOKING */}
          {activeTab === "booking" && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold">Booking Rules</h2>
              <div className="grid gap-6">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Payment Hold Time (Minutes)
                  </label>
                  <input
                    type="number"
                    className="w-full border rounded px-3 py-2"
                    value={formData.booking.paymentHoldTimeMinutes ?? 0}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        booking: {
                          ...p.booking,
                          paymentHoldTimeMinutes: +e.target.value,
                        },
                      }))
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Min Cancellation (Hours)
                    </label>
                    <input
                      type="number"
                      className="w-full border rounded px-3 py-2"
                      value={formData.booking.minCancellationHours ?? 0}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          booking: {
                            ...p.booking,
                            minCancellationHours: +e.target.value,
                          },
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Refund Percentage (%)
                    </label>
                    <input
                      type="number"
                      className="w-full border rounded px-3 py-2"
                      value={formData.booking.refundPercentage ?? 0}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          booking: {
                            ...p.booking,
                            refundPercentage: +e.target.value,
                          },
                        }))
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: PRICING & POLICIES */}
          {activeTab === "pricing" && (
            <div className="space-y-8">
              {/* Section 1: Policies */}
              <div>
                <h2 className="text-lg font-bold mb-4">
                  Base Pricing Policies
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Price Per Km (VND)
                    </label>
                    <input
                      type="number"
                      className="w-full border rounded px-3 py-2"
                      value={formData.pricingPolicy.pricePerKm ?? 1}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          pricingPolicy: {
                            ...p.pricingPolicy,
                            pricePerKm: +e.target.value,
                          },
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Weekend Surcharge (0-1)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      className="w-full border rounded px-3 py-2"
                      value={formData.pricingPolicy.weekendSurcharge ?? 1}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          pricingPolicy: {
                            ...p.pricingPolicy,
                            weekendSurcharge: +e.target.value,
                          },
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Holiday Surcharge (0-1)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      className="w-full border rounded px-3 py-2"
                      value={formData.pricingPolicy.holidaySurcharge ?? 0}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          pricingPolicy: {
                            ...p.pricingPolicy,
                            holidaySurcharge: +e.target.value,
                          },
                        }))
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Bus Type Multipliers */}
              <div className="border-t pt-6">
                <h2 className="text-lg font-bold mb-4">Bus Type Multipliers</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(formData.busPricing).map(([key, val]) => (
                    <div key={key}>
                      <label className="block text-sm font-medium mb-1 capitalize">
                        {key}
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        className="w-full border rounded px-3 py-2"
                        value={(val as number) ?? 1}
                        onChange={(e) =>
                          setFormData((p) => ({
                            ...p,
                            busPricing: {
                              ...p.busPricing,
                              [key]: +e.target.value,
                            },
                          }))
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: AMENITIES */}
          {activeTab === "amenities" && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold">Bus Amenities Configuration</h2>
              <div className="flex gap-2">
                <input
                  className="flex-1 border rounded px-3 py-2"
                  placeholder="Add new amenity (e.g. Wifi, Blanket)..."
                  value={newAmenity}
                  onChange={(e) => setNewAmenity(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addAmenity()}
                />
                <button
                  onClick={addAmenity}
                  className="bg-green-600 text-white px-4 rounded hover:bg-green-700"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.amenities &&
                  formData.amenities.map((item) => (
                    <span
                      key={item}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center gap-2 text-sm"
                    >
                      {item}
                      <button
                        onClick={() => removeAmenity(item)}
                        className="hover:text-blue-900"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </span>
                  ))}
              </div>
            </div>
          )}

          {/* TAB: PAYMENT */}
          {activeTab === "payment" && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold">Payment Gateways</h2>
              <div className="space-y-3">
                {Object.values(GatewayType) &&
                  Object.values(GatewayType).map((provider) => (
                    <div
                      key={provider}
                      className="flex items-center justify-between p-4 border rounded hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex flex-col">
                        <span className="capitalize font-medium text-gray-900 dark:text-gray-100">
                          {provider.replace(/_/g, " ")}{" "}
                        </span>
                        <span className="text-xs text-gray-500">
                          Provider: {provider}
                        </span>
                      </div>

                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={isGatewayEnabled(provider)}
                          onChange={(e) =>
                            toggleGateway(provider, e.target.checked)
                          }
                        />
                        {/* Toggle Switch UI */}
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;
