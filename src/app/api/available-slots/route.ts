// app/api/available-slots/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { format, addMinutes } from "date-fns";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');
    const barberId = searchParams.get('barberId');
    const durationParam = searchParams.get('duration');
    const excludeAppointmentId = searchParams.get('excludeAppointmentId'); // NEW: for rescheduling
    
    if (!dateParam || !barberId) {
      return NextResponse.json(
        { success: false, message: "Missing required parameters: date and barberId" },
        { status: 400 }
      );
    }
    
    const selectedDate = new Date(dateParam);
    const serviceDuration = durationParam ? parseInt(durationParam) : 60;
    
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
    
    // Get start and end of the selected day
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    // Fetch existing appointments for this barber on this day
    // UPDATED: Exclude current appointment if rescheduling
    const whereClause: any = {
      barberId,
      status: { notIn: ["CANCELLED", "NO_SHOW"] },
      startTime: {
        gte: startOfDay,
        lte: endOfDay,
      },
    };

    // If rescheduling, exclude the current appointment
    if (excludeAppointmentId) {
      whereClause.id = { not: excludeAppointmentId };
    }

    const existingAppointments = await prisma.appointment.findMany({
      where: whereClause,
      select: {
        startTime: true,
        endTime: true,
      },
    });

    // Define working hours (7am to 8pm)
    const workStart = new Date(selectedDate);
    workStart.setHours(7, 0, 0, 0);
    
    const workEnd = new Date(selectedDate);
    workEnd.setHours(20, 0, 0, 0);
    
    // Generate time slots (1 hour intervals from 7am to 8pm)
    const timeSlots = [];
    let currentSlot = new Date(workStart);
    
    while (currentSlot < workEnd) {
      const slotEnd = new Date(currentSlot.getTime() + serviceDuration * 60000);
      
      // Don't include slots that extend beyond 8pm
      if (slotEnd > workEnd) {
        break;
      }
      
      // Check if this slot conflicts with any appointment
      const hasConflict = existingAppointments.some(apt => {
        const aptStart = new Date(apt.startTime);
        const aptEnd = new Date(apt.endTime);
        
        // Check if there's any overlap
        return (
          (currentSlot >= aptStart && currentSlot < aptEnd) || // Slot starts during appointment
          (slotEnd > aptStart && slotEnd <= aptEnd) || // Slot ends during appointment
          (currentSlot <= aptStart && slotEnd >= aptEnd) // Slot completely covers appointment
        );
      });
      
      const timeString = format(currentSlot, "h:mm a");
      
      timeSlots.push({
        time: timeString,
        value: timeString,
        disabled: hasConflict,
      });

      // Move to next hour
      currentSlot = addMinutes(currentSlot, 60);
    }
  
    return NextResponse.json(
      { 
        success: true, 
        data: {
          availableSlots: timeSlots,
        }
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error("Available slots error:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred while fetching available slots" },
      { status: 500 }
    );
  }
}