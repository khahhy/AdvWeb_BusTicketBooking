import { ETicketTemplate } from "./ETicketTemplate";
import { Download, Printer } from "lucide-react";
import { useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export interface ETicketViewerProps {
  bookingCode: string;
  passengerName: string;
  passengerId: string;
  email?: string;
  phone?: string;
  tripFrom: string;
  tripTo: string;
  fromTerminal?: string;
  toTerminal?: string;
  departureTime: string;
  arrivalTime: string;
  travelDate: string;
  duration: string;
  seatNumber: string;
  busType: string;
  licensePlate?: string;
  ticketPrice: number;
  totalPrice: number;
  bookingDate?: string;
  status?: "CONFIRMED" | "PENDING" | "CANCELLED";
  onDownload?: () => void;
  onPrint?: () => void;
}

export const ETicketViewer = (props: ETicketViewerProps) => {
  const ticketRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (props.onPrint) {
      props.onPrint();
    } else {
      window.print();
    }
  };

  const handleDownload = async () => {
    if (props.onDownload) {
      props.onDownload();
      return;
    }

    // Default implementation: generate PDF
    if (!ticketRef.current) return;

    try {
      // Capture the ticket as canvas
      const canvas = await html2canvas(ticketRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      // Create PDF
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`ticket-${props.bookingCode}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to download PDF. Please try printing instead.");
    }
  };

  return (
    <div>
      {/* Action Buttons - Hidden when printing */}
      <div className="flex justify-center gap-4 mb-6 print:hidden">
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 bg-rose-400 hover:bg-rose-500 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg"
        >
          <Download className="w-5 h-5" />
          Download PDF
        </button>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white border-2 border-gray-300 dark:border-gray-600 px-6 py-3 rounded-xl font-semibold transition-all duration-300"
        >
          <Printer className="w-5 h-5" />
          Print Ticket
        </button>
      </div>

      {/* E-Ticket Template */}
      <div ref={ticketRef}>
        <ETicketTemplate {...props} />
      </div>

      {/* Print-specific styles */}
      <style>{`
        @media print {
          body {
            margin: 0;
            padding: 20px;
            background: white !important;
          }

          @page {
            size: A4;
            margin: 15mm;
          }

          /* Hide everything except the ticket */
          body > *:not(.print\\:block) {
            display: none !important;
          }

          /* Ensure ticket is visible */
          .print\\:block {
            display: block !important;
          }

          /* Remove shadows and adjust colors for print */
          * {
            box-shadow: none !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* Ensure QR code is visible */
          svg {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
};
