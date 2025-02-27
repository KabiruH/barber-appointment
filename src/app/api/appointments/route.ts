import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { generateReferenceNumber } from "@/lib/utils";

// Define validation schema for appointment creation
const appointmentSchema = z.object({
  serviceId: z.string(),
  barberId: z.string(),
  date: z.string(), // ISO date string
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
    
    const { serviceId, barberId, date, time, name, email, phone, notes } = validatedData.data;
    
    // Parse the date and time
    const dateParts = new Date(date);
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
    
    const startTime = new Date(dateParts);
    startTime.setHours(hours, minutes, 0, 0);
    
    // Get the service to determine duration
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });
    
    if (!service) {
      return NextResponse.json(
        { success: false, message: "Service not found" },
        { status: 404 }
      );
    }
    
    // Calculate end time based on service duration
    const endTime = new Date(startTime.getTime() + service.duration * 60000);
    
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
        { success: false, message: "This time slot is already booked" },
        { status: 409 }
      );
    }
    
    // Check for time blockouts
    const conflictingBlockouts = await prisma.timeBlockout.findMany({
      where: {
        barberId,
        OR: [
          // Blockout starts during appointment
          {
            AND: [
              { startTime: { gte: startTime } },
              { startTime: { lt: endTime } },
            ],
          },
          // Blockout ends during appointment
          {
            AND: [
              { endTime: { gt: startTime } },
              { endTime: { lte: endTime } },
            ],
          },
          // Blockout covers entire appointment
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
        { success: false, message: "The barber is not available during this time" },
        { status: 409 }
      );
    }
    
    // Generate a unique reference number
    const referenceNumber = generateReferenceNumber();
    
    // Create the appointment
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
        serviceId,
        status: "CONFIRMED", // Auto-confirm for now
      },
    });
    
    // In a real application, you would send a confirmation email here
    
    return NextResponse.json(
      { 
        success: true, 
        message: "Appointment created successfully", 
        data: {
          id: appointment.id,
          referenceNumber: appointment.referenceNumber,
          startTime: appointment.startTime,
          endTime: appointment.endTime,
          status: appointment.status,
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
    // Check if user is authenticated as admin (implement auth check)
    // This is a simplified example
    const authToken = request.cookies.get('auth-token')?.value;
    
    if (!authToken) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const barberId = searchParams.get('barberId');
    
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
    
    // Fetch appointments with related data
    const appointments = await prisma.appointment.findMany({
      ...filters,
      include: {
        barber: {
          select: {
            id: true,
            name: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
            duration: true,
            price: true,
          },
        },
      },
      orderBy: {
        startTime: 'asc',
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