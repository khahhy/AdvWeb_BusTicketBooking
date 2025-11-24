import { useState, useMemo } from "react";
import {
  Search,
  CheckCircle,
  AlertCircle,
  RefreshCcw,
  Wallet,
} from "lucide-react";
import { StatCard, PaymentDetailModal, PaymentTable } from "@/components/admin";
import { formatCurrency } from "@/utils/formatCurrency";

export interface Payment {
  id: string;
  bookingId: string;
  bookingTicketCode: string;
  customerName: string;
  amount: number;
  gateway: "Momo" | "Zalopay" | "PayOS" | "Paypal_Sandbox";
  gatewayTransactionId: string;
  status: "pending" | "successful" | "failed" | "refunded";
  createdAt: string;
}

const MOCK_PAYMENTS: Payment[] = [
  {
    id: "p1",
    bookingId: "b1",
    bookingTicketCode: "VEX-8823",
    customerName: "Nguyen Van An",
    amount: 350000,
    gateway: "Momo",
    gatewayTransactionId: "MOMO_123456789",
    status: "successful",
    createdAt: "2025-11-20T08:05:00Z",
  },
  {
    id: "p2",
    bookingId: "b2",
    bookingTicketCode: "VEX-9912",
    customerName: "Tran Thi Bich",
    amount: 600000,
    gateway: "PayOS",
    gatewayTransactionId: "PAYOS_987654321",
    status: "pending",
    createdAt: "2025-11-20T10:30:00Z",
  },
  {
    id: "p3",
    bookingId: "b3",
    bookingTicketCode: "VEX-7721",
    customerName: "Le Hoang Nam",
    amount: 450000,
    gateway: "Zalopay",
    gatewayTransactionId: "ZALO_456123789",
    status: "failed",
    createdAt: "2025-11-19T15:45:00Z",
  },
];

const PaymentManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [gatewayFilter, setGatewayFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("");

  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const stats = useMemo(() => {
    return MOCK_PAYMENTS.reduce(
      (acc, curr) => {
        acc.totalTransactions++;
        if (curr.status === "successful") {
          acc.totalRevenue += curr.amount;
          acc.successfulTxn++;
        } else if (curr.status === "failed") {
          acc.failedTxn++;
        }
        return acc;
      },
      { totalRevenue: 0, totalTransactions: 0, successfulTxn: 0, failedTxn: 0 },
    );
  }, []);

  const filteredPayments = useMemo(() => {
    return MOCK_PAYMENTS.filter((payment) => {
      const matchesSearch =
        payment.gatewayTransactionId
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        payment.bookingTicketCode
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || payment.status === statusFilter;
      const matchesGateway =
        gatewayFilter === "all" || payment.gateway === gatewayFilter;
      let matchesDate = true;
      if (dateFilter) {
        matchesDate =
          new Date(payment.createdAt).toISOString().split("T")[0] ===
          dateFilter;
      }
      return matchesSearch && matchesStatus && matchesGateway && matchesDate;
    });
  }, [searchTerm, statusFilter, gatewayFilter, dateFilter]);

  const handleOpenDetail = (payment: Payment) => {
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
          title="Failed / Pending"
          value={
            stats.failedTxn +
            (stats.totalTransactions - stats.successfulTxn - stats.failedTxn)
          }
          icon={AlertCircle}
        />
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700 shadow-sm flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="relative w-full lg:w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search Txn ID..."
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
            <option value="Momo">Momo</option>
            <option value="PayOS">PayOS</option>
            <option value="Zalopay">Zalopay</option>
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
          </select>
        </div>
      </div>

      <PaymentTable
        payments={filteredPayments}
        onViewDetail={handleOpenDetail}
      />

      <PaymentDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        payment={selectedPayment}
      />
    </div>
  );
};

export default PaymentManagement;
