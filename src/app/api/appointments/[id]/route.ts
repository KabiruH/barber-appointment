import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

// Validation schema for appointment updates
const updateAppointmentSchema = z.object({
  serviceId: z.string().optional(),
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
  { params }: { params: { id: string } }
) {
  try {
    const appointmentId = params.id;
    
    // Find the existing appointment
    const existingAppointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        service: true,
      },
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
      serviceId, 
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
      
      // Get the service to calculate end time
      let service = existingAppointment.service;
      
      // If service is changing, get the new service
      if (serviceId && serviceId !== existingAppointment.serviceId) {
        const newService = await prisma.service.findUnique({
          where: { id: serviceId },
        });
        
        if (!newService) {
          return NextResponse.json(
            { success: false, message: "Service not found" },
            { status: 404 }
          );
        }
        service = newService; // Ensured to be non-null at this point
      }
      
      // Calculate end time based on service duration
      const endTime = new Date(startTime.getTime() + service.duration * 60000);
      
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
          barberId: barberId || existingAppointment.barberId,
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
    }
    
    // Update barber and service IDs if provided
    if (barberId) updateData.barberId = barberId;
    if (serviceId) updateData.serviceId = serviceId;
    
    // Update the appointment
    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: updateData,
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
      serviceId: updatedAppointment.serviceId,
      serviceName: updatedAppointment.service.name,
      servicePrice: updatedAppointment.service.price,
      serviceDuration: updatedAppointment.service.duration,
      status: updatedAppointment.status,
    };
    
    // In a real application, you would send a confirmation email here
    
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