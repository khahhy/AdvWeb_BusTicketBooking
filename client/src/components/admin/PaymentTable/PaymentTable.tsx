import { ArrowUpRight, ArrowDownLeft, Eye } from "lucide-react";
import {
  Payment,
  formatCurrency,
  formatDate,
} from "@/admin/saleAndBooking/PaymentManagement";

interface PaymentTableProps {
  payments: Payment[];
  onViewDetail: (payment: Payment) => void;
}

const getStatusStyles = (status: string) => {
  switch (status) {
    case "successful":
      return "bg-green-100 text-green-800 border-green-200";
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "failed":
      return "bg-red-100 text-red-800 border-red-200";
    case "refunded":
      return "bg-gray-100 text-gray-800 border-gray-200";
    default:
      return "bg-gray-50 text-gray-600";
  }
};

const getGatewayColor = (gateway: string) => {
  switch (gateway) {
    case "Momo":
      return "text-pink-600 bg-pink-50 border-pink-100";
    case "Zalopay":
      return "text-blue-600 bg-blue-50 border-blue-100";
    case "PayOS":
      return "text-indigo-600 bg-indigo-50 border-indigo-100";
    default:
      return "text-gray-600 bg-gray-50 border-gray-200";
  }
};

const PaymentTable = ({ payments, onViewDetail }: PaymentTableProps) => {
  return (
    <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-600 font-medium border-b">
            <tr>
              <th className="px-6 py-3 whitespace-nowrap">Transaction ID</th>
              <th className="px-6 py-3">Booking Ref</th>
              <th className="px-6 py-3">Gateway</th>
              <th className="px-6 py-3">Amount</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {payments.map((payment) => (
              <tr
                key={payment.id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="font-mono text-xs font-medium text-gray-700">
                    {payment.gatewayTransactionId}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium text-blue-600">
                    {payment.bookingTicketCode}
                  </div>
                  <div className="text-xs text-gray-500">
                    {payment.customerName}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded border text-xs font-medium ${getGatewayColor(
                      payment.gateway,
                    )}`}
                  >
                    {payment.gateway}
                  </span>
                </td>
                <td className="px-6 py-4 font-semibold text-gray-900">
                  {formatCurrency(payment.amount)}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusStyles(
                      payment.status,
                    )}`}
                  >
                    {payment.status === "successful" && (
                      <ArrowDownLeft className="w-3 h-3 mr-1" />
                    )}
                    {payment.status === "refunded" && (
                      <ArrowUpRight className="w-3 h-3 mr-1" />
                    )}
                    {payment.status.charAt(0).toUpperCase() +
                      payment.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500 text-xs whitespace-nowrap">
                  {formatDate(payment.createdAt)}
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => onViewDetail(payment)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-gray-500 bg-gray-100 hover:bg-blue-50 hover:text-blue-600 rounded-md transition-colors text-xs font-medium"
                  >
                    <Eye className="w-3 h-3" /> View Log
                  </button>
                </td>
              </tr>
            ))}

            {payments.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-12 text-center text-gray-500"
                >
                  No transactions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentTable;
