# E-Ticket Template Documentation

## Overview

The E-Ticket Template is a professional, branded ticket design system for the Bus Ticket Booking application. It provides a print-ready, scannable electronic ticket with comprehensive trip and passenger information.

## Components

### 1. ETicketTemplate

The core template component that renders the complete e-ticket layout.

**Location:** `client/src/components/ticket/ETicketTemplate.tsx`

**Features:**
- Professional header with company branding (logo + gradient)
- Large, prominent booking code display
- QR code for quick scanning/verification
- Detailed trip information with visual route display
- Passenger information section
- Payment details breakdown
- Status indication (Confirmed/Pending/Cancelled)
- Important boarding instructions
- Dark mode support

**Props:**

```typescript
interface ETicketTemplateProps {
  // Booking Information
  bookingCode: string;              // Unique booking identifier
  bookingDate?: string;             // When the booking was made
  status?: "CONFIRMED" | "PENDING" | "CANCELLED";

  // Passenger Information
  passengerName: string;            // Full name of passenger
  passengerId: string;              // ID/Passport number
  email?: string;                   // Contact email
  phone?: string;                   // Contact phone number

  // Trip Information
  tripFrom: string;                 // Origin city
  tripTo: string;                   // Destination city
  fromTerminal?: string;            // Departure terminal name
  toTerminal?: string;              // Arrival terminal name
  departureTime: string;            // Format: "HH:MM AM/PM"
  arrivalTime: string;              // Format: "HH:MM AM/PM"
  travelDate: string;               // Format: "YYYY-MM-DD"
  duration: string;                 // Format: "Xh Ym"

  // Bus Information
  seatNumber: string;               // Assigned seat
  busType: string;                  // Bus type description
  licensePlate?: string;            // Vehicle license plate

  // Payment Information
  ticketPrice: number;              // Base ticket price
  totalPrice: number;               // Total amount paid
}
```

**Usage Example:**

```tsx
import { ETicketTemplate } from "@/components/ticket";

<ETicketTemplate
  bookingCode="BUS7X2K9M4P"
  passengerName="NGUYEN VAN MINH"
  passengerId="079234567890"
  email="nguyenvanminh@example.com"
  phone="+84 912 345 678"
  tripFrom="Ho Chi Minh City"
  tripTo="Da Lat"
  fromTerminal="Ho Chi Minh City Central Bus Station"
  toTerminal="Da Lat Bus Terminal"
  departureTime="08:00 AM"
  arrivalTime="02:30 PM"
  travelDate="2025-12-15"
  duration="6h 30m"
  seatNumber="A12"
  busType="VIP Sleeper 40 Seats"
  licensePlate="51B-12345"
  ticketPrice={280000}
  totalPrice={295000}
  bookingDate="2025-12-04"
  status="CONFIRMED"
/>
```

### 2. ETicketViewer

A wrapper component that adds download and print functionality to the e-ticket.

**Location:** `client/src/components/ticket/ETicketViewer.tsx`

**Features:**
- Download PDF button
- Print ticket button
- Print-optimized styling
- Same props as ETicketTemplate plus optional callbacks

**Additional Props:**

```typescript
interface ETicketViewerProps extends ETicketTemplateProps {
  onDownload?: () => void;  // Custom download handler
  onPrint?: () => void;     // Custom print handler
}
```

**Usage Example:**

```tsx
import { ETicketViewer } from "@/components/ticket";

<ETicketViewer
  {...ticketData}
  onDownload={() => {
    // Custom PDF generation logic
    console.log("Generating PDF...");
  }}
  onPrint={() => {
    // Custom print logic
    window.print();
  }}
/>
```

## Design System

### Color Scheme

**Light Mode:**
- Primary gradient: Pink 500 → Rose 500 → Pink 600
- Background: White with pink-tinted backgrounds
- Text: Gray 900 (primary), Gray 600 (secondary)
- Accent: Pink 600

**Dark Mode:**
- Primary gradient: Blue 600 → Blue 700 → Blue 800
- Background: Gray 900 with subtle gradients
- Text: White (primary), Gray 400 (secondary)
- Accent: Blue 400

### Typography

- **Booking Code:** 3xl, bold, monospace, brand color
- **Headings:** xl-3xl, bold, primary text color
- **Body Text:** sm-base, regular/semibold, secondary text color
- **Labels:** xs-sm, regular, muted text color

### Layout Sections

1. **Header (Branding)**
   - Company logo in white container
   - Company name and ticket type
   - Status badge

2. **Booking Code Section**
   - Large booking code display
   - QR code for scanning
   - Booking date

3. **Trip Details**
   - Route visualization (From → Duration → To)
   - Terminal information
   - Departure/arrival times
   - Date, seat, and bus type in grid

4. **Passenger Information**
   - Name and ID number
   - Contact details (email, phone)

5. **Payment Details**
   - Itemized costs
   - Total amount paid

6. **Important Information**
   - Boarding instructions
   - Required documents

7. **Footer**
   - Thank you message
   - Support contact information

## Print Optimization

The template includes print-specific CSS that:
- Sets A4 page size with appropriate margins
- Removes shadows and adjusts colors for print
- Ensures QR code visibility
- Hides action buttons
- Optimizes layout for paper

## Integration Points

### With ConfirmationPage

```tsx
import { ETicketViewer } from "@/components/ticket";

// In your confirmation page
<ETicketViewer
  bookingCode={bookingCode}
  passengerName={passengerName}
  passengerId={passengerId}
  email={email}
  tripFrom={trip.from}
  tripTo={trip.to}
  fromTerminal={trip.fromTerminal}
  toTerminal={trip.toTerminal}
  departureTime={trip.departureTime}
  arrivalTime={trip.arrivalTime}
  travelDate={travelDate}
  duration={trip.duration}
  seatNumber={selectedSeat}
  busType={trip.busType}
  ticketPrice={ticketPrice}
  totalPrice={totalPrice}
  status="CONFIRMED"
/>
```

### Email Integration

The template can be rendered server-side and embedded in confirmation emails:

```tsx
// Server-side rendering for email
import { renderToString } from 'react-dom/server';
import { ETicketTemplate } from './ETicketTemplate';

const emailHtml = renderToString(
  <ETicketTemplate {...ticketData} />
);

// Send via email service
await emailService.send({
  to: passenger.email,
  subject: 'Your Bus Ticket Confirmation',
  html: emailHtml,
});
```

### PDF Generation

For PDF generation, use a library like `react-pdf` or `puppeteer`:

```typescript
// Example with puppeteer
import puppeteer from 'puppeteer';

async function generateTicketPDF(ticketData) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Render the ticket component to HTML
  const html = renderToStaticMarkup(
    <ETicketTemplate {...ticketData} />
  );
  
  await page.setContent(html);
  const pdf = await page.pdf({ format: 'A4' });
  
  await browser.close();
  return pdf;
}
```

## Customization

### Changing Brand Colors

Update the gradient colors in `ETicketTemplate.tsx`:

```tsx
// Header gradient
<div className="bg-gradient-to-r from-[your-color-1] via-[your-color-2] to-[your-color-3]">

// Booking code color
<p className="text-[your-brand-color]">
```

### Adding Custom Sections

Add new sections between existing ones:

```tsx
{/* Custom Section */}
<div className="px-8 py-6 border-b border-gray-200 dark:border-gray-700">
  <h2 className="text-xl font-bold">Your Custom Section</h2>
  {/* Your content */}
</div>
```

### Modifying QR Code

Customize the QR code appearance:

```tsx
<QRCode
  value={bookingCode}
  size={100}
  level="H"  // Error correction level
  fgColor="#000000"  // Foreground color
  bgColor="#ffffff"  // Background color
/>
```

## Accessibility

- Semantic HTML structure
- Proper heading hierarchy (h1, h2, h3)
- ARIA labels where needed
- High contrast colors
- Print-friendly layout

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Dependencies

```json
{
  "react-qr-code": "^2.0.0",
  "lucide-react": "^0.x.x",
  "dayjs": "^1.x.x"
}
```

## File Structure

```
client/src/components/ticket/
├── ETicketTemplate.tsx      # Core template component
├── ETicketViewer.tsx        # Viewer with download/print
├── index.ts                 # Exports
└── README.md               # This documentation

client/src/pages/
└── ETicketDemoPage.tsx     # Demo/preview page
```

## Testing

Test the e-ticket template with:

1. **Visual Testing:** Check `ETicketDemoPage` in browser
2. **Print Testing:** Use browser print preview
3. **QR Code Testing:** Scan with mobile device
4. **Dark Mode Testing:** Toggle theme and verify appearance
5. **Responsive Testing:** Test on different screen sizes

## Future Enhancements

- [ ] Multiple language support
- [ ] Barcode alternatives to QR code
- [ ] Email template variants
- [ ] SMS-optimized minimal version
- [ ] Wallet integration (Apple Wallet, Google Pay)
- [ ] Dynamic branding per bus operator
- [ ] Ticket transfer/modification features

## Support

For issues or questions about the e-ticket template:
- Check the demo page: `/eticket-demo`
- Review this documentation
- Contact the development team

---

**Last Updated:** December 4, 2025
**Version:** 1.0.0
