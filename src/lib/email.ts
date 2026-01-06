// lib/email.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface BookingEmailData {
  customerName: string;
  customerEmail: string;
  serviceName: string;
  servicePrice: number;
  barberName: string;
  date: Date;
  time: string;
  referenceNumber: string;
  duration: number;
  notes?: string;
  phone?: string;
}

// Customer Booking Confirmation Email
export async function sendCustomerBookingEmail(data: BookingEmailData) {
  const {
    customerName,
    customerEmail,
    serviceName,
    servicePrice,
    barberName,
    date,
    time,
    referenceNumber,
    duration,
  } = data;

  const formattedDate = new Intl.DateTimeFormat('en-KE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);

  try {
    const { data: emailData, error } = await resend.emails.send({
      from: `Havan Cutz <${process.env.EMAIL_FROM}>`,
      to: customerEmail,
      subject: `Booking Confirmation - ${referenceNumber}`,
      html: generateCustomerEmailHTML({
        customerName,
        serviceName,
        servicePrice,
        barberName,
        formattedDate,
        time,
        referenceNumber,
        duration,
      }),
    });

    if (error) {
      console.error('Error sending customer email:', error);
      return { success: false, error };
    }

    console.log('Customer email sent successfully:', emailData);
    return { success: true, data: emailData };
  } catch (error) {
    console.error('Error sending customer email:', error);
    return { success: false, error };
  }
}

// Admin/Barber Notification Email
export async function sendAdminNotificationEmail(data: BookingEmailData) {
  const {
    customerName,
    customerEmail,
    serviceName,
    servicePrice,
    barberName,
    date,
    time,
    referenceNumber,
    duration,
    phone,
    notes,
  } = data;

  const formattedDate = new Intl.DateTimeFormat('en-KE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);

  try {
    const { data: emailData, error } = await resend.emails.send({
      from: `Havan Cutz Bookings <${process.env.EMAIL_FROM}>`,
      to: process.env.EMAIL_ADMIN!,
      subject: `New Booking - ${serviceName} - ${referenceNumber}`,
      html: generateAdminEmailHTML({
        customerName,
        customerEmail,
        serviceName,
        servicePrice,
        barberName,
        formattedDate,
        time,
        referenceNumber,
        duration,
        phone,
        notes,
      }),
    });

    if (error) {
      console.error('Error sending admin email:', error);
      return { success: false, error };
    }

    console.log('Admin email sent successfully:', emailData);
    return { success: true, data: emailData };
  } catch (error) {
    console.error('Error sending admin email:', error);
    return { success: false, error };
  }
}

// Payment Confirmation Email (when admin confirms payment)
export async function sendPaymentConfirmationEmail(data: BookingEmailData) {
  const {
    customerName,
    customerEmail,
    serviceName,
    barberName,
    date,
    time,
    referenceNumber,
  } = data;

  const formattedDate = new Intl.DateTimeFormat('en-KE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);

  try {
    const { data: emailData, error } = await resend.emails.send({
      from: `Havan Cutz <${process.env.EMAIL_FROM}>`,
      to: customerEmail,
      subject: `Payment Confirmed - Your Appointment is Secured! ${referenceNumber}`,
      html: generatePaymentConfirmationHTML({
        customerName,
        serviceName,
        barberName,
        formattedDate,
        time,
        referenceNumber,
      }),
    });

    if (error) {
      console.error('Error sending payment confirmation email:', error);
      return { success: false, error };
    }

    console.log('Payment confirmation email sent successfully:', emailData);
    return { success: true, data: emailData };
  } catch (error) {
    console.error('Error sending payment confirmation email:', error);
    return { success: false, error };
  }
}

// Customer Email HTML Template
function generateCustomerEmailHTML(data: {
  customerName: string;
  serviceName: string;
  servicePrice: number;
  barberName: string;
  formattedDate: string;
  time: string;
  referenceNumber: string;
  duration: number;
}) {
  const isHaircut = data.serviceName.toLowerCase().includes('haircut');
  const paymentAmount = isHaircut ? 1500 : data.servicePrice;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmation</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #000000; font-size: 28px; font-weight: bold;">Havan Cutz</h1>
              <p style="margin: 10px 0 0 0; color: #1f2937; font-size: 16px;">Booking Confirmation</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 24px;">Hi ${data.customerName}! 👋</h2>
              <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Thank you for booking with us! Your appointment has been reserved and is awaiting payment confirmation.
              </p>

              <!-- Booking Details -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 30px 0; background-color: #fef3c7; border-radius: 8px; padding: 20px;">
                <tr>
                  <td>
                    <h3 style="margin: 0 0 15px 0; color: #92400e; font-size: 18px;">Booking Details</h3>
                    <table role="presentation" cellspacing="0" cellpadding="8" border="0" width="100%">
                      <tr>
                        <td style="color: #78350f; font-weight: bold; width: 40%;">Reference Number:</td>
                        <td style="color: #92400e; font-weight: bold; font-size: 18px;">${data.referenceNumber}</td>
                      </tr>
                      <tr>
                        <td style="color: #78350f; font-weight: bold;">Service:</td>
                        <td style="color: #1f2937;">${data.serviceName}</td>
                      </tr>
                      <tr>
                        <td style="color: #78350f; font-weight: bold;">Barber/Stylist:</td>
                        <td style="color: #1f2937;">${data.barberName}</td>
                      </tr>
                      <tr>
                        <td style="color: #78350f; font-weight: bold;">Date & Time:</td>
                        <td style="color: #1f2937;">${data.formattedDate}<br>${data.time}</td>
                      </tr>
                      <tr>
                        <td style="color: #78350f; font-weight: bold;">Duration:</td>
                        <td style="color: #1f2937;">${data.duration} minutes</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Payment Instructions -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 30px 0; background-color: #fecaca; border-radius: 8px; padding: 20px; border-left: 4px solid #dc2626;">
                <tr>
                  <td>
                    <h3 style="margin: 0 0 15px 0; color: #991b1b; font-size: 18px;">⚠️ Payment Required</h3>
                    <p style="margin: 0 0 15px 0; color: #7f1d1d; font-size: 14px; line-height: 1.6;">
                      <strong>Amount to Pay: Kes ${paymentAmount.toLocaleString()}</strong>
                      ${isHaircut ? '<br><small>(Booking fee - Full amount due after service)</small>' : '<br><small>(Full service amount)</small>'}
                    </p>
                    <p style="margin: 0 0 10px 0; color: #7f1d1d; font-size: 14px; line-height: 1.6;">
                      <strong>M-Pesa Payment Steps:</strong>
                    </p>
                    <ol style="margin: 0; padding-left: 20px; color: #7f1d1d; font-size: 14px; line-height: 1.8;">
                      <li>Go to M-Pesa menu</li>
                      <li>Select Lipa na M-Pesa → Pay Bill</li>
                      <li>Business Number: <strong>400200</strong></li>
                      <li>Account Number: <strong>${data.referenceNumber}</strong></li>
                      <li>Amount: <strong>${paymentAmount}</strong></li>
                      <li>Enter PIN and confirm</li>
                    </ol>
                    <p style="margin: 15px 0 0 0; color: #7f1d1d; font-size: 13px;">
                      ⏰ Complete payment within 30 minutes to secure your booking.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Important Notes -->
              <div style="margin: 30px 0; padding: 20px; background-color: #dbeafe; border-radius: 8px; border-left: 4px solid #2563eb;">
                <h3 style="margin: 0 0 10px 0; color: #1e40af; font-size: 16px;">📋 Important Notes:</h3>
                <ul style="margin: 0; padding-left: 20px; color: #1e3a8a; font-size: 14px; line-height: 1.8;">
                  <li>Save your reference number: <strong>${data.referenceNumber}</strong></li>
                  <li>You'll receive confirmation once payment is verified</li>
                  <li>Arrive 5 minutes before your appointment</li>
                  <li>For changes, contact us at least 24 hours in advance</li>
                </ul>
              </div>

              <p style="margin: 30px 0 0 0; color: #4b5563; font-size: 14px; line-height: 1.6;">
                We look forward to serving you!<br>
                <strong>Havan Cutz Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px; background-color: #1f2937; text-align: center; border-radius: 0 0 8px 8px;">
              <p style="margin: 0 0 10px 0; color: #9ca3af; font-size: 14px;">
                <strong>Havan Cutz</strong>
              </p>
              <p style="margin: 0 0 10px 0; color: #9ca3af; font-size: 13px;">
                📞 +254 700 000 000 | 📧 info@havancutz.co.ke
              </p>
              <p style="margin: 0; color: #6b7280; font-size: 12px;">
                © 2025 Havan Cutz. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

// Admin Email HTML Template
function generateAdminEmailHTML(data: {
  customerName: string;
  customerEmail: string;
  serviceName: string;
  servicePrice: number;
  barberName: string;
  formattedDate: string;
  time: string;
  referenceNumber: string;
  duration: number;
  phone?: string;
  notes?: string;
}) {
  const isHaircut = data.serviceName.toLowerCase().includes('haircut');
  const paymentAmount = isHaircut ? 1500 : data.servicePrice;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Booking Alert</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">🔔 New Booking Alert</h1>
              <p style="margin: 10px 0 0 0; color: #dbeafe; font-size: 16px;">Payment Pending</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 22px;">New appointment booked - awaiting payment confirmation</h2>

              <!-- Customer Details -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 20px 0; background-color: #f3f4f6; border-radius: 8px; padding: 20px;">
                <tr>
                  <td>
                    <h3 style="margin: 0 0 15px 0; color: #374151; font-size: 18px;">Customer Information</h3>
                    <table role="presentation" cellspacing="0" cellpadding="8" border="0" width="100%">
                      <tr>
                        <td style="color: #6b7280; font-weight: bold; width: 35%;">Name:</td>
                        <td style="color: #1f2937; font-weight: bold;">${data.customerName}</td>
                      </tr>
                      <tr>
                        <td style="color: #6b7280; font-weight: bold;">Email:</td>
                        <td style="color: #1f2937;"><a href="mailto:${data.customerEmail}" style="color: #2563eb; text-decoration: none;">${data.customerEmail}</a></td>
                      </tr>
                      ${data.phone ? `
                      <tr>
                        <td style="color: #6b7280; font-weight: bold;">Phone:</td>
                        <td style="color: #1f2937;"><a href="tel:${data.phone}" style="color: #2563eb; text-decoration: none;">${data.phone}</a></td>
                      </tr>
                      ` : ''}
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Booking Details -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 20px 0; background-color: #fef3c7; border-radius: 8px; padding: 20px;">
                <tr>
                  <td>
                    <h3 style="margin: 0 0 15px 0; color: #92400e; font-size: 18px;">Booking Details</h3>
                    <table role="presentation" cellspacing="0" cellpadding="8" border="0" width="100%">
                      <tr>
                        <td style="color: #78350f; font-weight: bold; width: 35%;">Reference:</td>
                        <td style="color: #92400e; font-weight: bold; font-size: 18px;">${data.referenceNumber}</td>
                      </tr>
                      <tr>
                        <td style="color: #78350f; font-weight: bold;">Service:</td>
                        <td style="color: #1f2937;">${data.serviceName}</td>
                      </tr>
                      <tr>
                        <td style="color: #78350f; font-weight: bold;">Service Price:</td>
                        <td style="color: #1f2937;">Kes ${data.servicePrice.toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td style="color: #78350f; font-weight: bold;">Payment Amount:</td>
                        <td style="color: #dc2626; font-weight: bold;">Kes ${paymentAmount.toLocaleString()} ${isHaircut ? '(Booking Fee)' : '(Full Amount)'}</td>
                      </tr>
                      <tr>
                        <td style="color: #78350f; font-weight: bold;">Assigned To:</td>
                        <td style="color: #1f2937;">${data.barberName}</td>
                      </tr>
                      <tr>
                        <td style="color: #78350f; font-weight: bold;">Date & Time:</td>
                        <td style="color: #1f2937; font-weight: bold;">${data.formattedDate}<br>${data.time}</td>
                      </tr>
                      <tr>
                        <td style="color: #78350f; font-weight: bold;">Duration:</td>
                        <td style="color: #1f2937;">${data.duration} minutes</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              ${data.notes ? `
              <!-- Notes -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 20px 0; background-color: #e0e7ff; border-radius: 8px; padding: 20px;">
                <tr>
                  <td>
                    <h3 style="margin: 0 0 10px 0; color: #3730a3; font-size: 16px;">📝 Customer Notes:</h3>
                    <p style="margin: 0; color: #312e81; font-size: 14px; line-height: 1.6;">${data.notes}</p>
                  </td>
                </tr>
              </table>
              ` : ''}

              <!-- Action Required -->
              <div style="margin: 30px 0; padding: 20px; background-color: #fecaca; border-radius: 8px; border-left: 4px solid #dc2626;">
                <h3 style="margin: 0 0 10px 0; color: #991b1b; font-size: 16px;">⚠️ Action Required</h3>
                <p style="margin: 0; color: #7f1d1d; font-size: 14px; line-height: 1.6;">
                  <strong>Monitor M-Pesa payments for reference: ${data.referenceNumber}</strong><br>
                  Once payment is received, confirm the booking in the admin dashboard.
                </p>
              </div>

              <p style="margin: 30px 0 0 0; color: #6b7280; font-size: 13px; line-height: 1.6;">
                This is an automated notification from your booking system.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px; background-color: #1f2937; text-align: center; border-radius: 0 0 8px 8px;">
              <p style="margin: 0; color: #9ca3af; font-size: 13px;">
                Havan Cutz - Admin Notification
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

// Payment Confirmation Email HTML Template
function generatePaymentConfirmationHTML(data: {
  customerName: string;
  serviceName: string;
  barberName: string;
  formattedDate: string;
  time: string;
  referenceNumber: string;
}) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Confirmed</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">✅ Payment Confirmed!</h1>
              <p style="margin: 10px 0 0 0; color: #d1fae5; font-size: 16px;">Your appointment is now secured</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 24px;">Great news, ${data.customerName}! 🎉</h2>
              <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Your payment has been confirmed and your appointment is now <strong>secured</strong>. We're looking forward to serving you!
              </p>

              <!-- Confirmed Booking Details -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 30px 0; background-color: #d1fae5; border-radius: 8px; padding: 20px; border-left: 4px solid #10b981;">
                <tr>
                  <td>
                    <h3 style="margin: 0 0 15px 0; color: #065f46; font-size: 18px;">Your Confirmed Appointment</h3>
                    <table role="presentation" cellspacing="0" cellpadding="8" border="0" width="100%">
                      <tr>
                        <td style="color: #047857; font-weight: bold; width: 40%;">Reference Number:</td>
                        <td style="color: #065f46; font-weight: bold; font-size: 18px;">${data.referenceNumber}</td>
                      </tr>
                      <tr>
                        <td style="color: #047857; font-weight: bold;">Service:</td>
                        <td style="color: #1f2937;">${data.serviceName}</td>
                      </tr>
                      <tr>
                        <td style="color: #047857; font-weight: bold;">Barber/Stylist:</td>
                        <td style="color: #1f2937;">${data.barberName}</td>
                      </tr>
                      <tr>
                        <td style="color: #047857; font-weight: bold;">Date & Time:</td>
                        <td style="color: #1f2937; font-weight: bold; font-size: 16px;">${data.formattedDate}<br>${data.time}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- What to Bring -->
              <div style="margin: 30px 0; padding: 20px; background-color: #dbeafe; border-radius: 8px; border-left: 4px solid #2563eb;">
                <h3 style="margin: 0 0 10px 0; color: #1e40af; font-size: 16px;">📋 Before Your Appointment:</h3>
                <ul style="margin: 0; padding-left: 20px; color: #1e3a8a; font-size: 14px; line-height: 1.8;">
                  <li>Arrive 5 minutes early</li>
                  <li>Bring your reference number: <strong>${data.referenceNumber}</strong></li>
                  <li>If you need to reschedule, contact us at least 24 hours in advance</li>
                </ul>
              </div>

              <!-- Location & Contact -->
              <div style="margin: 30px 0; padding: 20px; background-color: #fef3c7; border-radius: 8px;">
                <h3 style="margin: 0 0 15px 0; color: #92400e; font-size: 16px;">📍 Find Us</h3>
                <p style="margin: 0 0 10px 0; color: #78350f; font-size: 14px;">
                  <strong>Havan Cutz</strong><br>
                  [Your Address Here]
                </p>
                <p style="margin: 0; color: #78350f; font-size: 14px;">
                  📞 0716107113<br>
                  📧 info@havancutz.co.ke
                </p>
              </div>

              <p style="margin: 30px 0 0 0; color: #4b5563; font-size: 14px; line-height: 1.6;">
                Thank you for choosing us!<br>
                <strong>Havan Cutz Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px; background-color: #1f2937; text-align: center; border-radius: 0 0 8px 8px;">
              <p style="margin: 0 0 10px 0; color: #9ca3af; font-size: 14px;">
                <strong>Havan Cutz</strong>
              </p>
              <p style="margin: 0 0 10px 0; color: #9ca3af; font-size: 13px;">
                📞 0716 107 113 | 📧 info@havancutz.co.ke
              </p>
              <p style="margin: 0; color: #6b7280; font-size: 12px;">
                © 2025 Havan Cutz. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}