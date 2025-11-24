interface PaymentPriceSidebarProps {
  selectedSeat: string;
  ticketPrice: number;
  insuranceFee: number;
  serviceFee: number;
  totalPrice: number;
  formatCurrency: (amount: number) => string;
}

export default function PaymentPriceSidebar({
  selectedSeat,
  ticketPrice,
  insuranceFee,
  serviceFee,
  totalPrice,
  formatCurrency,
}: PaymentPriceSidebarProps) {
  return (
    <div className="bg-white dark:bg-black rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 sticky top-24">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Price Details</h2>
        <button className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline">
          Collapse
        </button>
      </div>

      <div className="space-y-4 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <div className="font-semibold text-gray-900 dark:text-white">Adult 1</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Coach 1 - Seat {selectedSeat} (Soft seat)
            </div>
          </div>
          <div className="text-right">
            <div className="font-semibold text-gray-900 dark:text-white">
              {formatCurrency(ticketPrice)}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {formatCurrency(ticketPrice)}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600 dark:text-gray-300">Insurance fees</span>
            <span className="text-gray-900 dark:text-white">
              {formatCurrency(insuranceFee)}
            </span>
          </div>
          <div className="flex justify-between text-sm items-center">
            <div className="flex items-center gap-1">
              <span className="text-gray-600 dark:text-gray-300">Service fees</span>
              <span className="text-gray-400 dark:text-gray-500 text-xs">ⓘ</span>
            </div>
            <span className="text-gray-900 dark:text-white">{formatCurrency(serviceFee)}</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            *This fee is non-refundable
          </p>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <div className="flex justify-between items-center">
          <span className="font-semibold text-gray-900 dark:text-white">
            Total amount for 1 passenger:
          </span>
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(totalPrice)}
          </span>
        </div>
      </div>
    </div>
  );
}
