// app/api/appointments/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { getServiceById } from "@/lib/services";

// Validation schema for appointment updates
const updateAppointmentSchema = z.object({
  serviceName: z.string().optional(),
  servicePrice: z.number().optional(),
  serviceDuration: z.number().optional(),
  barberId: z.string().optional(),
  date: z.string().optional(), // ISO date string
  time: z.string().optional(), // Time in format "1:00 PM"
  name: z.string().min(2, { message: "Name must be at least 2 characters" }).optional(),
  email: z.string().email({ message: "Please enter a valid email address" }).optional(),
  phone: z.string().optional(),
  notes: z.string().optional(),
});

export async function PATCH(
  request: NextRequest,
{ params }: { params: Promise<{ id: string }> } 
) {
  try {
     const { id: appointmentId } = await params; 
    
    // Find the existing appointment
    const existingAppointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    });
    
    if (!existingAppointment) {
      return NextResponse.json(
        { success: false, message: "Appointment not found" },
        { status: 404 }
      );
    }
    
    // Check if appointment is in the past
    if (new Date(existingAppointment.startTime) < new Date()) {
      return NextResponse.json(
        { success: false, message: "Cannot update past appointments" },
        { status: 400 }
      );
    }
    
    // Parse the request body
    const body = await request.json();
    
    // Validate the request body
    const validatedData = updateAppointmentSchema.safeParse(body);
    
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
    
    const { 
      serviceName,
      servicePrice,
      serviceDuration,
      barberId, 
      date, 
      time, 
      name, 
      email, 
      phone, 
      notes 
    } = validatedData.data;
    
    // Prepare update data
    const updateData: any = {};
    
    // Customer info updates
    if (name) updateData.customerName = name;
    if (email) updateData.customerEmail = email;
    if (phone !== undefined) updateData.customerPhone = phone;
    if (notes !== undefined) updateData.notes = notes;
    
    // Service updates
    if (serviceName) updateData.serviceName = serviceName;
    if (servicePrice !== undefined) updateData.servicePrice = servicePrice;
    if (serviceDuration !== undefined) updateData.serviceDuration = serviceDuration;
    
    // Handle date/time updates
    if (date && time) {
      // Parse date and time
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
      
      // Get service duration (use updated duration if provided, otherwise use existing)
      const duration = serviceDuration || existingAppointment.serviceDuration;
      
      // Calculate end time based on service duration
      const endTime = new Date(startTime.getTime() + duration * 60000);
      
      // Set the new start and end times
      updateData.startTime = startTime;
      updateData.endTime = endTime;
      
      // Check for scheduling conflicts
      const conflictingAppointments = await prisma.appointment.findMany({
        where: {
          id: { not: appointmentId }, // Exclude current appointment
          barberId: barberId || existingAppointment.barberId,
          status: { notIn: ["CANCELLED", "NO_SHOW"] },
          OR: [
            {
              AND: [
                { startTime: { lte: startTime } },
                { endTime: { gt: startTime } },
              ],
            },
            {
              AND: [
                { startTime: { lt: endTime } },
                { endTime: { gte: endTime } },
              ],
            },
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
      
      // Check for time blockouts - Changed barberId to userId
      const conflictingBlockouts = await prisma.timeBlockout.findMany({
        where: {
          userId: barberId || existingAppointment.barberId,
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
          { success: false, message: "The barber is not available during this time" },
          { status: 409 }
        );
      }
    }
    
    // Update barber if provided
    if (barberId) {
      // Verify barber exists and is active
      const barber = await prisma.user.findUnique({
        where: { id: barberId },
      });
      
      if (!barber || barber.role !== 'BARBER' || !barber.isActive) {
        return NextResponse.json(
          { success: false, message: "Barber not found or inactive" },
          { status: 404 }
        );
      }
      
      updateData.barberId = barberId;
    }
    
    // Update the appointment
    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: updateData,
      include: {
        barber: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    
    // Format the data for the client
    const appointmentData = {
      id: updatedAppointment.id,
      referenceNumber: updatedAppointment.referenceNumber,
      startTime: updatedAppointment.startTime.toISOString(),
      endTime: updatedAppointment.endTime.toISOString(),
      customerName: updatedAppointment.customerName,
      customerEmail: updatedAppointment.customerEmail,
      customerPhone: updatedAppointment.customerPhone,
      notes: updatedAppointment.notes,
      barberId: updatedAppointment.barberId,
      barberName: updatedAppointment.barber.name,
      serviceName: updatedAppointment.serviceName,
      servicePrice: updatedAppointment.servicePrice,
      serviceDuration: updatedAppointment.serviceDuration,
      status: updatedAppointment.status,
    };
    
    // TODO: Send update confirmation email here
    
    return NextResponse.json(
      { 
        success: true, 
        message: "Appointment updated successfully", 
        data: appointmentData
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error("Update appointment error:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred while updating the appointment" },
      { status: 500 }
    );
  }
}