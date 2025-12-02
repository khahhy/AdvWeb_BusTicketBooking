import { ReactNode } from "react";

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: ReactNode;
}

interface PaymentMethodsCardProps {
  paymentMethods: PaymentMethod[];
  selectedPaymentMethod: string;
  onSelectPaymentMethod: (methodId: string) => void;
  error?: string;
}

export default function PaymentMethodsCard({
  paymentMethods,
  selectedPaymentMethod,
  onSelectPaymentMethod,
  error,
}: PaymentMethodsCardProps) {
  return (
    <div className="bg-white dark:bg-black rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
        Payment methods
      </h2>

      <div className="space-y-4">
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            className={`border rounded-2xl p-4 cursor-pointer transition-all ${
              selectedPaymentMethod === method.id
                ? "border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/30"
                : error
                  ? "border-red-300 dark:border-red-600 hover:border-red-400 dark:hover:border-red-500"
                  : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
            }`}
            onClick={() => onSelectPaymentMethod(method.id)}
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  selectedPaymentMethod === method.id
                    ? "border-blue-500 dark:border-blue-400"
                    : error
                      ? "border-red-400 dark:border-red-500"
                      : "border-gray-300 dark:border-gray-600"
                }`}
              >
                {selectedPaymentMethod === method.id && (
                  <div className="w-3 h-3 rounded-full bg-blue-500 dark:bg-blue-400"></div>
                )}
              </div>
              <div className="flex items-center gap-3 flex-1">
                <div className="text-blue-600 dark:text-blue-400">
                  {method.icon}
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {method.name}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {method.description}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <p className="text-red-500 dark:text-red-400 text-xs mt-4">{error}</p>
      )}
    </div>
  );
}
