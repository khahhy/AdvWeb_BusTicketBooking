import { ReactNode } from 'react';

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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Payment methods</h2>
      
      <div className="space-y-4">
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            className={`border rounded-2xl p-4 cursor-pointer transition-all ${
              selectedPaymentMethod === method.id
                ? 'border-blue-500 bg-blue-50'
                : error
                ? 'border-red-300 hover:border-red-400'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => onSelectPaymentMethod(method.id)}
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  selectedPaymentMethod === method.id
                    ? 'border-blue-500'
                    : error
                    ? 'border-red-400'
                    : 'border-gray-300'
                }`}
              >
                {selectedPaymentMethod === method.id && (
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                )}
              </div>
              <div className="flex items-center gap-3 flex-1">
                <div className="text-blue-600">{method.icon}</div>
                <div>
                  <div className="font-semibold text-gray-900">{method.name}</div>
                  <div className="text-sm text-gray-500">{method.description}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {error && (
        <p className="text-red-500 text-xs mt-4">{error}</p>
      )}
    </div>
  );
}
