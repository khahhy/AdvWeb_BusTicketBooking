import { Info } from 'lucide-react';

interface PriceDetailsSidebarProps {
  selectedSeat: string;
  ticketPrice: number;
  insuranceFee: number;
  serviceFee: number;
  totalPrice: number;
  formatCurrency: (amount: number) => string;
  onNext: () => void;
}

export default function PriceDetailsSidebar({
  selectedSeat,
  ticketPrice,
  insuranceFee,
  serviceFee,
  totalPrice,
  formatCurrency,
  onNext,
}: PriceDetailsSidebarProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-24">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Price Details</h2>
        <button className="text-blue-600 text-sm font-medium hover:underline">
          Collapse
        </button>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-3 mb-6 flex items-start gap-2">
        <span className="text-yellow-600">💡</span>
        <p className="text-sm text-yellow-800">
          Automatically applied the best deal for you.
        </p>
      </div>

      <div className="space-y-4 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <div className="font-semibold text-gray-900">Adult 1</div>
            <div className="text-sm text-gray-500">Coach 1 - Seat {selectedSeat} (Soft seat)</div>
          </div>
          <div className="text-right">
            <div className="font-semibold text-gray-900">{formatCurrency(ticketPrice)}</div>
            <div className="text-sm text-gray-500">{formatCurrency(ticketPrice)}</div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Insurance fees</span>
            <span className="text-gray-900">{formatCurrency(insuranceFee)}</span>
          </div>
          <div className="flex justify-between text-sm items-center">
            <div className="flex items-center gap-1">
              <span className="text-gray-600">Service fees</span>
              <Info className="w-4 h-4 text-gray-400" />
            </div>
            <span className="text-gray-900">{formatCurrency(serviceFee)}</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">*This fee is non-refundable</p>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4 mb-6">
        <div className="flex justify-between items-center">
          <span className="font-semibold text-gray-900">Total amount for 1 passenger:</span>
          <span className="text-2xl font-bold text-gray-900">{formatCurrency(totalPrice)}</span>
        </div>
      </div>

      <button
        onClick={onNext}
        className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold py-4 rounded-2xl transition-colors duration-200"
      >
        Next
      </button>

      <div className="mt-4 text-xs text-gray-500 text-center">
        By tapping I have transferred, you agree to our{' '}
        <a href="#" className="text-blue-600 hover:underline">
          Payment Security Policy
        </a>{' '}
        of Vexere
      </div>
    </div>
  );
}
