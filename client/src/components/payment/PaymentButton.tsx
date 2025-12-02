interface PaymentButtonProps {
  onPayment: () => void;
}

export default function PaymentButton({ onPayment }: PaymentButtonProps) {
  return (
    <div className="space-y-4">
      <button
        onClick={onPayment}
        className="w-full bg-yellow-400 hover:bg-yellow-500 dark:bg-yellow-500 dark:hover:bg-yellow-600 text-gray-900 dark:text-black font-bold py-4 rounded-2xl transition-colors duration-200 flex items-center justify-center gap-2 text-lg"
      >
        Pay securely
      </button>

      <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
        By tapping I have transferred, you agree to our{" "}
        <a
          href="#"
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          Payment Security Policy
        </a>{" "}
        of Vexere
      </div>
    </div>
  );
}
