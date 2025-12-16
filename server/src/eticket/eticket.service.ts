import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import PDFDocument from 'pdfkit';
import * as QRCode from 'qrcode';

export interface ETicketData {
  ticketCode: string;
  passengerName: string;
  email: string;
  phoneNumber: string;
  tripName: string;
  busPlate: string;
  busType: string;
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  seatNumber: string;
  price: string;
  bookingDate: string;
}

export interface FullETicketData {
  bookingCode: string;
  passengerName: string;
  passengerId: string;
  email: string;
  phone: string;
  tripFrom: string;
  tripTo: string;
  fromTerminal: string;
  toTerminal: string;
  departureTime: string;
  arrivalTime: string;
  travelDate: string;
  duration: string;
  seatNumber: string;
  busType: string;
  licensePlate: string;
  ticketPrice: number;
  totalPrice: number;
  bookingDate: string;
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED';
}

@Injectable()
export class ETicketService {
  constructor(private readonly prisma: PrismaService) {}

  async getFullBookingData(
    ticketCode: string,
  ): Promise<{ message: string; data: FullETicketData }> {
    const booking = await this.prisma.bookings.findUnique({
      where: { ticketCode },
      include: {
        trip: {
          include: {
            bus: true,
          },
        },
        route: {
          include: {
            origin: true,
            destination: true,
          },
        },
        seat: true,
        pickupStop: { include: { location: true } },
        dropoffStop: { include: { location: true } },
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    const customerInfo = booking.customerInfo as {
      fullName: string;
      email: string;
      phoneNumber: string;
      identificationCard?: string;
    };

    const startTime = new Date(booking.trip.startTime);
    const endTime = new Date(booking.trip.endTime);
    const durationMs = endTime.getTime() - startTime.getTime();
    const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
    const durationMinutes = Math.floor(
      (durationMs % (1000 * 60 * 60)) / (1000 * 60),
    );
    const duration =
      durationHours > 0
        ? `${durationHours}h ${durationMinutes}m`
        : `${durationMinutes}m`;

    const formatTime = (date: Date) => {
      const hours = date.getHours();
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      return `${displayHours.toString().padStart(2, '0')}:${minutes} ${ampm}`;
    };

    const formatDate = (date: Date) => {
      return date.toISOString().split('T')[0];
    };

    const mapStatus = (
      status: string,
    ): 'CONFIRMED' | 'PENDING' | 'CANCELLED' => {
      switch (status) {
        case 'confirmed':
          return 'CONFIRMED';
        case 'cancelled':
          return 'CANCELLED';
        case 'pendingPayment':
        default:
          return 'PENDING';
      }
    };

    const ticketPrice = Number(booking.price);
    const insuranceFee = 1000;
    const serviceFee = 14000;
    const totalPrice = ticketPrice + insuranceFee + serviceFee;

    return {
      message: 'Fetched e-ticket data successfully',
      data: {
        bookingCode: booking.ticketCode || '',
        passengerName: customerInfo.fullName,
        passengerId: customerInfo.identificationCard || 'N/A',
        email: customerInfo.email,
        phone: customerInfo.phoneNumber,
        tripFrom: booking.route.origin.city,
        tripTo: booking.route.destination.city,
        fromTerminal:
          booking.pickupStop?.location?.name || booking.route.origin.name,
        toTerminal:
          booking.dropoffStop?.location?.name || booking.route.destination.name,
        departureTime: formatTime(startTime),
        arrivalTime: formatTime(endTime),
        travelDate: formatDate(startTime),
        duration,
        seatNumber: booking.seat?.seatNumber || 'N/A',
        busType: booking.trip.bus?.busType || 'Standard',
        licensePlate: booking.trip.bus?.plate || 'N/A',
        ticketPrice,
        totalPrice,
        bookingDate: formatDate(booking.createdAt),
        status: mapStatus(booking.status),
      },
    };
  }

  async getBookingData(ticketCode: string): Promise<ETicketData> {
    const booking = await this.prisma.bookings.findUnique({
      where: { ticketCode },
      include: {
        trip: {
          include: {
            bus: true,
          },
        },
        route: {
          include: {
            origin: true,
            destination: true,
          },
        },
        seat: true,
        pickupStop: { include: { location: true } },
        dropoffStop: { include: { location: true } },
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    const customerInfo = booking.customerInfo as {
      fullName: string;
      email: string;
      phoneNumber: string;
    };

    const formatDateTime = (date: Date) => {
      const d = new Date(date);
      const hours = d.getHours().toString().padStart(2, '0');
      const minutes = d.getMinutes().toString().padStart(2, '0');
      const day = d.getDate().toString().padStart(2, '0');
      const month = (d.getMonth() + 1).toString().padStart(2, '0');
      const year = d.getFullYear();
      return `${hours}:${minutes} - ${day}/${month}/${year}`;
    };

    const formatBookingDate = (date: Date) => {
      const d = new Date(date);
      const hours = d.getHours().toString().padStart(2, '0');
      const minutes = d.getMinutes().toString().padStart(2, '0');
      const day = d.getDate().toString().padStart(2, '0');
      const month = (d.getMonth() + 1).toString().padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    };

    return {
      ticketCode: booking.ticketCode || '',
      passengerName: customerInfo.fullName,
      email: customerInfo.email,
      phoneNumber: customerInfo.phoneNumber,
      tripName: booking.trip.tripName || 'Bus Trip',
      busPlate: booking.trip.bus?.plate || 'N/A',
      busType: booking.trip.bus?.busType || 'Standard',
      from: booking.pickupStop?.location?.name || booking.route.origin.name,
      to: booking.dropoffStop?.location?.name || booking.route.destination.name,
      departureTime: formatDateTime(booking.trip.startTime),
      arrivalTime: formatDateTime(booking.trip.endTime),
      seatNumber: booking.seat?.seatNumber || 'N/A',
      price: new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
      }).format(Number(booking.price)),
      bookingDate: formatBookingDate(booking.createdAt),
    };
  }

  async generateQRCode(data: string): Promise<string> {
    return QRCode.toDataURL(data, {
      width: 150,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    });
  }

  async generatePDF(ticketCode: string): Promise<Buffer> {
    const data = await this.getBookingData(ticketCode);
    const qrCodeDataUrl = await this.generateQRCode(
      JSON.stringify({
        ticketCode: data.ticketCode,
        passenger: data.passengerName,
        seat: data.seatNumber,
        departure: data.departureTime,
      }),
    );

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
      });

      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header background
      doc.rect(0, 0, doc.page.width, 120).fill('#134074');

      // Header text
      doc.fillColor('#ffffff').fontSize(28).font('Helvetica-Bold');
      doc.text('E-TICKET', 50, 40, { align: 'center' });
      doc.fontSize(12).font('Helvetica');
      doc.text('Bus Ticket Booking', 50, 75, { align: 'center' });

      // Ticket code banner
      doc.rect(50, 140, doc.page.width - 100, 50).fill('#f0f9ff');
      doc.fillColor('#134074').fontSize(14).font('Helvetica-Bold');
      doc.text('Booking Code:', 70, 155);
      doc.fontSize(20).text(data.ticketCode, 180, 152);

      // Main content area
      const contentY = 210;

      // Left column - Trip details
      doc.fillColor('#333333').fontSize(11).font('Helvetica-Bold');
      doc.text('TRIP DETAILS', 50, contentY);

      doc
        .moveTo(50, contentY + 18)
        .lineTo(280, contentY + 18)
        .stroke('#e5e7eb');

      doc.font('Helvetica').fontSize(10).fillColor('#666666');
      const leftColX = 50;
      let y = contentY + 30;

      const addField = (label: string, value: string) => {
        doc.fillColor('#666666').text(label, leftColX, y);
        doc
          .fillColor('#333333')
          .font('Helvetica-Bold')
          .text(value, leftColX, y + 14);
        doc.font('Helvetica');
        y += 38;
      };

      addField('From', data.from);
      addField('To', data.to);
      addField('Departure', data.departureTime);
      addField('Arrival', data.arrivalTime);
      addField('Bus', `${data.busType} - ${data.busPlate}`);
      addField('Seat Number', data.seatNumber);

      // Right column - Passenger & QR
      const rightColX = 320;
      y = contentY;

      doc.fillColor('#333333').fontSize(11).font('Helvetica-Bold');
      doc.text('PASSENGER DETAILS', rightColX, y);

      doc
        .moveTo(rightColX, y + 18)
        .lineTo(550, y + 18)
        .stroke('#e5e7eb');

      y += 30;
      doc.font('Helvetica').fontSize(10);

      doc.fillColor('#666666').text('Passenger Name', rightColX, y);
      doc
        .fillColor('#333333')
        .font('Helvetica-Bold')
        .text(data.passengerName, rightColX, y + 14);
      y += 38;

      doc.font('Helvetica').fillColor('#666666').text('Email', rightColX, y);
      doc
        .fillColor('#333333')
        .font('Helvetica-Bold')
        .text(data.email, rightColX, y + 14);
      y += 38;

      doc.font('Helvetica').fillColor('#666666').text('Phone', rightColX, y);
      doc
        .fillColor('#333333')
        .font('Helvetica-Bold')
        .text(data.phoneNumber, rightColX, y + 14);
      y += 38;

      doc
        .font('Helvetica')
        .fillColor('#666666')
        .text('Total Price', rightColX, y);
      doc
        .fillColor('#134074')
        .fontSize(14)
        .font('Helvetica-Bold')
        .text(data.price, rightColX, y + 14);
      y += 50;

      // QR Code
      doc.fillColor('#333333').fontSize(11).font('Helvetica-Bold');
      doc.text('SCAN QR CODE', rightColX, y);

      // Add QR code image
      const qrImageData = qrCodeDataUrl.split(',')[1];
      const qrBuffer = Buffer.from(qrImageData, 'base64');
      doc.image(qrBuffer, rightColX, y + 20, { width: 120, height: 120 });

      // Footer
      const footerY = 700;
      doc.rect(0, footerY, doc.page.width, 100).fill('#f9fafb');

      doc.fillColor('#666666').fontSize(9).font('Helvetica');
      doc.text('Important Information:', 50, footerY + 15);
      doc.fontSize(8);
      doc.text(
        '• Please arrive at the boarding point at least 15 minutes before departure.',
        50,
        footerY + 30,
      );
      doc.text(
        '• Present this e-ticket (printed or digital) along with a valid ID at boarding.',
        50,
        footerY + 42,
      );
      doc.text(
        '• This ticket is non-transferable and valid only for the specified trip.',
        50,
        footerY + 54,
      );

      doc.fillColor('#999999').fontSize(8);
      doc.text(`Booking Date: ${data.bookingDate}`, 50, footerY + 75);
      doc.text(
        '© 2025 Bus Ticket Booking. All rights reserved.',
        350,
        footerY + 75,
      );

      doc.end();
    });
  }
}
