import { useState, useEffect } from "react";
import {
  Search,
  CheckCircle,
  AlertCircle,
  RefreshCcw,
  Wallet,
} from "lucide-react";
import { StatCard, PaymentDetailModal, PaymentTable } from "@/components/admin";
import { formatCurrency } from "@/utils/formatCurrency";
import { useGetPaymentsQuery } from "@/store/api/paymentApi";
import { PaymentTransaction } from "@/store/api/paymentApi";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const PaymentManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [gatewayFilter, setGatewayFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("");

  const [selectedPayment, setSelectedPayment] =
    useState<PaymentTransaction | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const { data: apiResponse, isLoading } = useGetPaymentsQuery({
    search: debouncedSearch || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    gateway: gatewayFilter !== "all" ? gatewayFilter : undefined,
    dateFrom: dateFilter || undefined,
    dateTo: dateFilter || undefined,
    limit: 20,
  });

  const payments = apiResponse?.data || [];
  const stats = apiResponse?.stats || {
    totalRevenue: 0,
    totalTransactions: 0,
    successfulTxn: 0,
    failedTxn: 0,
    pendingTxn: 0,
  };

  const handleOpenDetail = (payment: PaymentTransaction) => {
    setSelectedPayment(payment);
    setIsDetailOpen(true);
  };

  return (
    <div className="p-6 space-y-6 min-h-screen font-sans text-gray-900 dark:text-white">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Payment Transactions
        </h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          icon={Wallet}
        />
        <StatCard
          title="Total Transactions"
          value={stats.totalTransactions}
          icon={RefreshCcw}
        />
        <StatCard
          title="Successful"
          value={stats.successfulTxn}
          icon={CheckCircle}
        />
        <StatCard
          title="Pending / Failed"
          value={`${stats.pendingTxn} / ${stats.failedTxn}`}
          icon={AlertCircle}
        />
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700 shadow-sm flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="relative w-full lg:w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search Ticket, Name..."
            className="w-full pl-10 pr-4 py-2 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          <input
            type="date"
            className="border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 dark:text-white"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
          <select
            className="border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 dark:text-white"
            value={gatewayFilter}
            onChange={(e) => setGatewayFilter(e.target.value)}
          >
            <option value="all">All Gateways</option>
            <option value="payos">PayOS</option>
          </select>
          <select
            className="border dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 dark:text-white"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="successful">Successful</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-gray-500">
          Loading transactions...
        </div>
      ) : payments.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          No transactions found.
        </div>
      ) : (
        <PaymentTable payments={payments} onViewDetail={handleOpenDetail} />
      )}

      <PaymentDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        payment={selectedPayment}
      />
    </div>
  );
};

export default PaymentManagement;
