//api/appointments/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { generateReferenceNumber } from "@/lib/utils";
import { sendCustomerBookingEmail, sendAdminNotificationEmail, sendPaymentConfirmationEmail } from "@/lib/email";

// Updated validation schema with fixed price
const appointmentSchema = z.object({
  serviceName: z.string(),
  servicePrice: z.number(),
  serviceDuration: z.number(),
  barberId: z.string(),
  date: z.string(), // Date string in YYYY-MM-DD format
  time: z.string(), // Time in format "1:00 PM"
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().optional(),
  notes: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validatedData = appointmentSchema.safeParse(body);
    
    if (!validatedData.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Invalid input", 
          errors: validatedData.error.errors 
        },
        { status: 400 }
      );
    }
    
    const { serviceName, servicePrice, serviceDuration, barberId, date, time, name, email, phone, notes } = validatedData.data;
    
    // Parse the time
    const timeParts = time.match(/(\d+):(\d+) ([AP]M)/);
    
    if (!timeParts) {
      return NextResponse.json(
        { success: false, message: "Invalid time format" },
        { status: 400 }
      );
    }
    
    let hours = parseInt(timeParts[1]);
    const minutes = parseInt(timeParts[2]);
    const ampm = timeParts[3];
    
    // Convert hours to 24-hour format
    if (ampm === "PM" && hours !== 12) {
      hours += 12;
    } else if (ampm === "AM" && hours === 12) {
      hours = 0;
    }
    
    // FIXED: Parse date correctly to avoid timezone issues
    // Split YYYY-MM-DD and create date in local timezone
    const [year, month, day] = date.split('-').map(Number);
    const startTime = new Date(year, month - 1, day, hours, minutes, 0, 0);
    
    // Calculate end time based on service duration
    const endTime = new Date(startTime.getTime() + serviceDuration * 60000);
    
    // Verify barber exists and is active
    const barber = await prisma.user.findUnique({
      where: { id: barberId },
    });
    
    if (!barber || !barber.isActive) {
      return NextResponse.json(
        { success: false, message: "Barber not found or inactive" },
        { status: 404 }
      );
    }

    // Allow both BARBER and ADMIN roles to take appointments
    if (barber.role !== 'BARBER' && barber.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: "Selected user cannot take appointments" },
        { status: 400 }
      );
    }
    
    // Check for scheduling conflicts
    const conflictingAppointments = await prisma.appointment.findMany({
      where: {
        barberId,
        status: { notIn: ["CANCELLED", "NO_SHOW"] },
        OR: [
          // New appointment starts during existing appointment
          {
            AND: [
              { startTime: { lte: startTime } },
              { endTime: { gt: startTime } },
            ],
          },
          // New appointment ends during existing appointment
          {
            AND: [
              { startTime: { lt: endTime } },
              { endTime: { gte: endTime } },
            ],
          },
          // New appointment completely overlaps existing appointment
          {
            AND: [
              { startTime: { gte: startTime } },
              { endTime: { lte: endTime } },
            ],
          },
        ],
      },
    });
    
    if (conflictingAppointments.length > 0) {
      return NextResponse.json(
        { success: false, message: "This time slot is already booked. Please select a different time." },
        { status: 409 }
      );
    }
    
    // Check for time blockouts
    const conflictingBlockouts = await prisma.timeBlockout.findMany({
      where: {
        userId: barberId,
        OR: [
          {
            AND: [
              { startTime: { gte: startTime } },
              { startTime: { lt: endTime } },
            ],
          },
          {
            AND: [
              { endTime: { gt: startTime } },
              { endTime: { lte: endTime } },
            ],
          },
          {
            AND: [
              { startTime: { lte: startTime } },
              { endTime: { gte: endTime } },
            ],
          },
        ],
      },
    });
    
    if (conflictingBlockouts.length > 0) {
      return NextResponse.json(
        { success: false, message: "The barber is not available during this time. Please select a different time." },
        { status: 409 }
      );
    }
    
    // Generate a unique reference number
    const referenceNumber = generateReferenceNumber();
    
    // Create the appointment with PENDING status (waiting for payment)
    const appointment = await prisma.appointment.create({
      data: {
        referenceNumber,
        startTime,
        endTime,
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        notes,
        barberId,
        serviceName,
        servicePrice: servicePrice.toString(), // Dynamic price as string for Decimal
        serviceDuration,
        status: "PENDING", // Changed from CONFIRMED to PENDING
        paymentStatus: "PENDING", // Payment pending
      },
      include: {
        barber: {
          select: {
            name: true,
            email: true,
          }
        }
      }
    });
    
    // Send emails asynchronously (don't block the response)
    const emailData = {
      customerName: name,
      customerEmail: email,
      serviceName,
      servicePrice,
      barberName: barber.name,
      date: startTime,
      time,
      referenceNumber: appointment.referenceNumber,
      duration: serviceDuration,
      notes: notes || undefined,
      phone: phone || undefined,
    };

    // Send customer booking confirmation email
    sendCustomerBookingEmail(emailData).catch((error) => {
      console.error("Failed to send customer email:", error);
    });
    
    // Send admin notification email
    sendAdminNotificationEmail(emailData).catch((error) => {
      console.error("Failed to send admin email:", error);
    });
    
    return NextResponse.json(
      { 
        success: true, 
        message: "Appointment created successfully. Please check your email for payment instructions.", 
        data: {
          id: appointment.id,
          referenceNumber: appointment.referenceNumber,
          startTime: appointment.startTime,
          endTime: appointment.endTime,
          status: appointment.status,
          paymentStatus: appointment.paymentStatus,
          amount: servicePrice,
        }
      },
      { status: 201 }
    );
    
  } catch (error) {
    console.error("Create appointment error:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred while creating the appointment" },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch appointments
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const barberId = searchParams.get('barberId');
    const email = searchParams.get('email');
    const paymentStatus = searchParams.get('paymentStatus');
    
    // Build query filters
    const filters: any = {
      where: {}
    };
    
    // Filter by date if provided
    if (date) {
      const selectedDate = new Date(date);
      const nextDay = new Date(selectedDate);
      nextDay.setDate(nextDay.getDate() + 1);
      
      filters.where.startTime = {
        gte: selectedDate,
        lt: nextDay,
      };
    }
    
    // Filter by barber if provided
    if (barberId) {
      filters.where.barberId = barberId;
    }

    // Filter by email if provided
    if (email) {
      filters.where.customerEmail = email;
    }

    // Filter by payment status if provided
    if (paymentStatus) {
      filters.where.paymentStatus = paymentStatus;
    }
    
    // Fetch appointments with related barber data
    const appointments = await prisma.appointment.findMany({
      ...filters,
      include: {
        barber: {
          select: {
            id: true,
            name: true,
            email: true,
            bio: true,
            imageUrl: true,
          },
        },
      },
      orderBy: {
        startTime: 'desc',
      },
    });
    
    return NextResponse.json(
      { success: true, data: appointments },
      { status: 200 }
    );
    
  } catch (error) {
    console.error("Fetch appointments error:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred while fetching appointments" },
      { status: 500 }
    );
  }
}

// PATCH endpoint to confirm payment (for admin use)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { referenceNumber, mpesaCode, mpesaPhone, confirmedBy } = body;

    if (!referenceNumber || !mpesaCode) {
      return NextResponse.json(
        { success: false, message: "Reference number and M-Pesa code are required" },
        { status: 400 }
      );
    }

    // Find the appointment
    const appointment = await prisma.appointment.findUnique({
      where: { referenceNumber },
    });

    if (!appointment) {
      return NextResponse.json(
        { success: false, message: "Appointment not found" },
        { status: 404 }
      );
    }

    if (appointment.paymentStatus === "PAID") {
      return NextResponse.json(
        { success: false, message: "Payment already confirmed" },
        { status: 400 }
      );
    }

    // Update appointment with payment confirmation
    const updatedAppointment = await prisma.appointment.update({
      where: { referenceNumber },
      data: {
        paymentStatus: "PAID",
        status: "CONFIRMED",
        mpesaCode,
        mpesaPhone: mpesaPhone || appointment.customerPhone,
        mpesaName: appointment.customerName,
        paymentMethod: "mpesa",
        paidAt: new Date(),
        confirmedBy: confirmedBy || "Admin",
        confirmedAt: new Date(),
      },
      include: {
        barber: {
          select: {
            name: true,
            email: true,
          }
        }
      }
    });

    // Format time from startTime
    const formattedTime = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(updatedAppointment.startTime);

    // Send payment confirmation email to customer
    const emailData = {
      customerName: updatedAppointment.customerName,
      customerEmail: updatedAppointment.customerEmail,
      serviceName: updatedAppointment.serviceName,
      servicePrice: parseFloat(updatedAppointment.servicePrice.toString()),
      barberName: updatedAppointment.barber.name,
      date: updatedAppointment.startTime,
      time: formattedTime,
      referenceNumber: updatedAppointment.referenceNumber,
      duration: updatedAppointment.serviceDuration,
    };

    // Send payment confirmation email asynchronously
    sendPaymentConfirmationEmail(emailData).catch((error) => {
      console.error("Failed to send payment confirmation email:", error);
    });

    return NextResponse.json(
      { 
        success: true, 
        message: "Payment confirmed successfully. Confirmation email sent to customer.",
        data: updatedAppointment
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Confirm payment error:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred while confirming payment" },
      { status: 500 }
    );
  }
}