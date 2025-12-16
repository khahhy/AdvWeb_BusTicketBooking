import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Configure email transporter
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async sendVerificationEmail(email: string, token: string) {
    const verificationUrl = `${process.env.FRONTEND_URL}/email-verified?token=${token}`;

    console.log('Sending verification email to:', email);
    console.log('Token:', token);
    console.log('Verification URL:', verificationUrl);

    const mailOptions = {
      from: `"Bus Ticket Booking" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verify Your Email Address',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 50%, #fdf2f8 100%);
              border-radius: 16px;
              padding: 40px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .logo {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo h1 {
              color: #134074;
              font-size: 28px;
              margin: 0;
            }
            .content {
              background: white;
              border-radius: 12px;
              padding: 30px;
              margin-bottom: 20px;
            }
            .button {
              display: inline-block;
              padding: 14px 40px;
              background-color: #134074;
              color: white !important;
              text-decoration: none;
              border-radius: 12px;
              font-weight: bold;
              margin: 20px 0;
              text-align: center;
            }
            .button:hover {
              background-color: #0B2545;
            }
            .footer {
              text-align: center;
              color: #666;
              font-size: 12px;
              margin-top: 20px;
            }
            .warning {
              background: #fef3c7;
              border-left: 4px solid #f59e0b;
              padding: 12px;
              margin: 20px 0;
              border-radius: 4px;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">
              <h1>🚌 Bus Ticket Booking</h1>
            </div>
            
            <div class="content">
              <h2 style="color: #134074; margin-top: 0;">Welcome! Verify Your Email</h2>
              
              <p>Thank you for signing up! Please verify your email address to activate your account.</p>
              
              <p>Click the button below to verify your email:</p>
              
              <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
              </div>
              
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #134074; font-size: 12px;">${verificationUrl}</p>
              
              <div class="warning">
                ⚠️ This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.
              </div>
            </div>
            
            <div class="footer">
              <p>© 2025 Bus Ticket Booking. All rights reserved.</p>
              <p>This is an automated email, please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Verification email sent to ${email}`);
      return { success: true };
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  async sendPasswordResetEmail(email: string, resetToken: string) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: `"Bus Ticket Booking" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Reset Your Password',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 50%, #fdf2f8 100%);
              border-radius: 16px;
              padding: 40px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .content {
              background: white;
              border-radius: 12px;
              padding: 30px;
            }
            .button {
              display: inline-block;
              padding: 14px 40px;
              background-color: #134074;
              color: white !important;
              text-decoration: none;
              border-radius: 12px;
              font-weight: bold;
              margin: 20px 0;
            }
            .warning {
              background: #fef3c7;
              border-left: 4px solid #f59e0b;
              padding: 12px;
              margin: 20px 0;
              border-radius: 4px;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="content">
              <h2 style="color: #134074;">Reset Your Password</h2>
              <p>We received a request to reset your password. Click the button below to create a new password:</p>
              
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </div>
              
              <div class="warning">
                ⚠️ This link will expire in 1 hour. If you didn't request this, please ignore this email.
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Password reset email sent to ${email}`);
      return { success: true };
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw error;
    }
  }

  async sendETicketEmail(
    email: string,
    ticketCode: string,
    passengerName: string,
    tripDetails: {
      from: string;
      to: string;
      departureTime: string;
      seatNumber: string;
    },
    pdfBuffer: Buffer,
  ) {
    const mailOptions = {
      from: `"Bus Ticket Booking" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Your E-Ticket - ${ticketCode}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f0f9ff 100%);
              border-radius: 16px;
              padding: 40px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .logo {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo h1 {
              color: #134074;
              font-size: 28px;
              margin: 0;
            }
            .content {
              background: white;
              border-radius: 12px;
              padding: 30px;
              margin-bottom: 20px;
            }
            .ticket-code {
              background: #134074;
              color: white;
              padding: 15px 30px;
              border-radius: 8px;
              font-size: 24px;
              font-weight: bold;
              text-align: center;
              margin: 20px 0;
            }
            .trip-details {
              background: #f8fafc;
              border-radius: 8px;
              padding: 20px;
              margin: 20px 0;
            }
            .trip-details table {
              width: 100%;
              border-collapse: collapse;
            }
            .trip-details td {
              padding: 8px 0;
            }
            .trip-details td:first-child {
              color: #666;
              width: 120px;
            }
            .trip-details td:last-child {
              font-weight: bold;
              color: #333;
            }
            .footer {
              text-align: center;
              color: #666;
              font-size: 12px;
              margin-top: 20px;
            }
            .info-box {
              background: #fef3c7;
              border-left: 4px solid #f59e0b;
              padding: 12px;
              margin: 20px 0;
              border-radius: 4px;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">
              <h1>Bus Ticket Booking</h1>
            </div>
            
            <div class="content">
              <h2 style="color: #134074; margin-top: 0;">Your E-Ticket is Ready!</h2>
              
              <p>Dear ${passengerName},</p>
              
              <p>Thank you for booking with us. Your e-ticket has been confirmed and is attached to this email.</p>
              
              <div class="ticket-code">${ticketCode}</div>
              
              <div class="trip-details">
                <table>
                  <tr>
                    <td>From:</td>
                    <td>${tripDetails.from}</td>
                  </tr>
                  <tr>
                    <td>To:</td>
                    <td>${tripDetails.to}</td>
                  </tr>
                  <tr>
                    <td>Departure:</td>
                    <td>${tripDetails.departureTime}</td>
                  </tr>
                  <tr>
                    <td>Seat:</td>
                    <td>${tripDetails.seatNumber}</td>
                  </tr>
                </table>
              </div>
              
              <div class="info-box">
                <strong>Important:</strong> Please arrive at the boarding point at least 15 minutes before departure. Present this e-ticket (printed or on your phone) along with a valid ID.
              </div>
              
              <p>You can also download your e-ticket from our website using your booking code.</p>
            </div>
            
            <div class="footer">
              <p>© 2025 Bus Ticket Booking. All rights reserved.</p>
              <p>This is an automated email, please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      attachments: [
        {
          filename: `eticket-${ticketCode}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`E-ticket email sent to ${email}`);
      return { success: true };
    } catch (error) {
      console.error('Error sending e-ticket email:', error);
      throw error;
    }
  }

  async sendTripReminderEmail(
    email: string,
    reminderDetails: {
      customerName: string;
      ticketCode: string;
      tripDate: string;
      tripTime: string;
      origin: string;
      destination: string;
      pickupLocation: string;
      pickupAddress: string;
      seatNumber: string;
      busPlate: string;
      hoursUntilTrip: number;
    },
  ) {
    const {
      customerName,
      ticketCode,
      tripDate,
      tripTime,
      origin,
      destination,
      pickupLocation,
      pickupAddress,
      seatNumber,
      busPlate,
      hoursUntilTrip,
    } = reminderDetails;

    const mailOptions = {
      from: `"Bus Ticket Booking" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `🚌 Trip Reminder: ${origin} → ${destination} - Departing Soon!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 50%, #fdf2f8 100%);
              border-radius: 16px;
              padding: 40px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #ec4899;
              margin: 0 0 10px 0;
              font-size: 28px;
            }
            .alert-box {
              background: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 15px;
              margin: 20px 0;
              border-radius: 8px;
            }
            .alert-box h3 {
              margin: 0 0 10px 0;
              color: #856404;
              font-size: 18px;
            }
            .trip-details {
              background: white;
              padding: 20px;
              border-radius: 12px;
              margin: 20px 0;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
            }
            .detail-row {
              display: flex;
              justify-content: space-between;
              padding: 12px 0;
              border-bottom: 1px solid #f0f0f0;
            }
            .detail-row:last-child {
              border-bottom: none;
            }
            .detail-label {
              font-weight: bold;
              color: #666;
            }
            .detail-value {
              color: #333;
              text-align: right;
            }
            .highlight {
              background: #fef3c7;
              padding: 2px 8px;
              border-radius: 4px;
              font-weight: bold;
            }
            .route {
              text-align: center;
              font-size: 24px;
              color: #ec4899;
              margin: 20px 0;
              font-weight: bold;
            }
            .checklist {
              background: #f0fdf4;
              padding: 20px;
              border-radius: 12px;
              margin: 20px 0;
            }
            .checklist h3 {
              color: #166534;
              margin: 0 0 15px 0;
            }
            .checklist ul {
              margin: 0;
              padding-left: 20px;
            }
            .checklist li {
              margin: 8px 0;
              color: #166534;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 2px solid #f0f0f0;
              color: #666;
              font-size: 14px;
            }
            .button {
              display: inline-block;
              padding: 12px 30px;
              background: #ec4899;
              color: white;
              text-decoration: none;
              border-radius: 25px;
              margin: 20px 0;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚌 Trip Reminder</h1>
              <p>Don't forget about your upcoming trip!</p>
            </div>

            <div class="alert-box">
              <h3>⏰ Your trip departs in ${hoursUntilTrip} hours!</h3>
              <p style="margin: 0;">Please arrive at least <strong>30 minutes early</strong> for check-in.</p>
            </div>

            <div class="route">
              ${origin} → ${destination}
            </div>

            <div class="trip-details">
              <h3 style="margin-top: 0; color: #ec4899;">Trip Information</h3>
              
              <div class="detail-row">
                <span class="detail-label">Passenger Name:</span>
                <span class="detail-value">${customerName}</span>
              </div>
              
              <div class="detail-row">
                <span class="detail-label">Ticket Code:</span>
                <span class="detail-value highlight">${ticketCode}</span>
              </div>
              
              <div class="detail-row">
                <span class="detail-label">Departure Date:</span>
                <span class="detail-value">${tripDate}</span>
              </div>
              
              <div class="detail-row">
                <span class="detail-label">Departure Time:</span>
                <span class="detail-value highlight">${tripTime}</span>
              </div>
              
              <div class="detail-row">
                <span class="detail-label">Pickup Location:</span>
                <span class="detail-value">${pickupLocation}</span>
              </div>
              
              ${
                pickupAddress
                  ? `
              <div class="detail-row">
                <span class="detail-label">Address:</span>
                <span class="detail-value">${pickupAddress}</span>
              </div>
              `
                  : ''
              }
              
              <div class="detail-row">
                <span class="detail-label">Seat Number:</span>
                <span class="detail-value highlight">${seatNumber}</span>
              </div>
              
              <div class="detail-row">
                <span class="detail-label">Bus License Plate:</span>
                <span class="detail-value">${busPlate}</span>
              </div>
            </div>

            <div class="checklist">
              <h3>✓ Pre-Departure Checklist</h3>
              <ul>
                <li>Arrive at pickup location <strong>30 minutes before departure</strong></li>
                <li>Bring your e-ticket (printed or on mobile device)</li>
                <li>Carry a valid ID (passport or national ID card)</li>
                <li>Check weather conditions and dress appropriately</li>
                <li>Bring any necessary medications or personal items</li>
                <li>Save our contact number for emergencies: <strong>1900-xxxx</strong></li>
              </ul>
            </div>

            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL}/booking-details/${ticketCode}" class="button">
                View Booking Details
              </a>
            </div>

            <div class="footer">
              <p><strong>Need to make changes?</strong> Contact us or manage your booking online.</p>
              <p>© 2025 Bus Ticket Booking. All rights reserved.</p>
              <p style="font-size: 12px; color: #999;">This is an automated reminder email.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(
        `Trip reminder email sent to ${email} for trip departing in ${hoursUntilTrip} hours`,
      );
      return { success: true };
    } catch (error) {
      console.error('Error sending trip reminder email:', error);
      throw error;
    }
  }
}
