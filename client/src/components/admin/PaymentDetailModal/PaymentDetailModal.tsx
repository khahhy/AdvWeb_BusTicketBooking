import {
  XCircle,
  CreditCard,
  CheckCircle,
  AlertCircle,
  ArrowUpRight,
  ArrowDownLeft,
  FileText,
  Activity,
} from "lucide-react";
import { Payment } from "@/admin/saleAndBooking/PaymentManagement";
import { formatDate } from "@/utils/formatDate";
import { formatCurrency } from "@/utils/formatCurrency";

interface PaymentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: Payment | null;
}

const PaymentDetailModal = ({
  isOpen,
  onClose,
  payment,
}: PaymentDetailModalProps) => {
  if (!isOpen || !payment) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700 flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Transaction Details
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-mono">
              {payment.gatewayTransactionId}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <div
            className={`flex items-center gap-3 p-4 rounded-lg mb-6 border ${
              payment.status === "successful"
                ? "bg-green-50 dark:bg-green-900/30 border-green-100 dark:border-green-700 text-green-800 dark:text-green-300"
                : payment.status === "failed"
                  ? "bg-red-50 dark:bg-red-900/30 border-red-100 dark:border-red-700 text-red-800 dark:text-red-300"
                  : "bg-yellow-50 dark:bg-yellow-900/30 border-yellow-100 dark:border-yellow-700 text-yellow-800 dark:text-yellow-300"
            }`}
          >
            {payment.status === "successful" ? (
              <CheckCircle className="w-5 h-5" />
            ) : payment.status === "failed" ? (
              <AlertCircle className="w-5 h-5" />
            ) : (
              <Activity className="w-5 h-5" />
            )}
            <div>
              <div className="font-bold capitalize">{payment.status}</div>
              <div className="text-xs opacity-80">
                Processed on {formatDate(payment.createdAt)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                Financial Info
              </h3>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">
                    Amount
                  </span>
                  <span className="font-bold text-lg text-gray-900 dark:text-white">
                    {formatCurrency(payment.amount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">
                    Gateway
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {payment.gateway}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Type</span>
                  <span className="flex items-center gap-1 text-gray-900 dark:text-white">
                    {payment.status === "refunded" ? (
                      <>
                        <ArrowUpRight className="w-3 h-3 text-red-500 dark:text-red-400" />{" "}
                        Refund
                      </>
                    ) : (
                      <>
                        <ArrowDownLeft className="w-3 h-3 text-green-500 dark:text-green-400" />{" "}
                        Payment
                      </>
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                Booking Context
              </h3>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-3 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400 block text-xs">
                    Customer Name
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {payment.customerName}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400 block text-xs">
                    Ticket Reference
                  </span>
                  <span className="font-medium text-blue-600 dark:text-blue-400 cursor-pointer hover:underline">
                    {payment.bookingTicketCode}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400 block text-xs">
                    Booking System ID
                  </span>
                  <span className="font-mono text-xs text-gray-600 dark:text-gray-400">
                    {payment.bookingId}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4" /> Gateway Raw Response (Log)
            </h3>
            <div className="bg-slate-900 dark:bg-gray-900 rounded-lg p-4 overflow-x-auto">
              <pre className="text-xs text-green-400 dark:text-green-300 font-mono">
                {`{
  "transaction_id": "${payment.gatewayTransactionId}",
  "amount": ${payment.amount},
  "currency": "VND",
  "status": "${payment.status.toUpperCase()}",
  "gateway": "${payment.gateway.toUpperCase()}",
  "timestamp": "${payment.createdAt}",
  "message": "${
    payment.status === "successful"
      ? "Transaction approved"
      : "Transaction rejected by issuer"
  }",
  "signature": "e8f9d...2a1b"
}`}
              </pre>
            </div>
          </div>
        </div>

        <div className="p-6 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 flex justify-end gap-2 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 border dark:border-gray-600 rounded-lg text-sm hover:bg-white dark:hover:bg-gray-600 font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 transition-colors"
          >
            Close
          </button>
          {payment.status === "successful" && (
            <button className="px-4 py-2 bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors">
              Refund Transaction
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentDetailModal;
