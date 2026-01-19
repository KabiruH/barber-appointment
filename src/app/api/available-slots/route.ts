// app/api/available-slots/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { format, addMinutes } from "date-fns";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');
    const barberId = searchParams.get('barberId');
    const excludeAppointmentId = searchParams.get('excludeAppointmentId'); // For rescheduling
    
    if (!dateParam || !barberId) {
      return NextResponse.json(
        { success: false, message: "Missing required parameters: date and barberId" },
        { status: 400 }
      );
    }
    
    const selectedDate = new Date(dateParam);
    
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
    
    // Check if selected date is today
    const now = new Date();
    const isToday = selectedDate.toDateString() === now.toDateString();
    
    // Check if it's Sunday (day 0)
    const isSunday = selectedDate.getDay() === 0;
    
    // Fetch existing appointments for this barber on this day
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
    
    // Fetch time blockouts for this barber on this day
    const blockouts = await prisma.timeBlockout.findMany({
      where: {
        userId: barberId,
        startTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      select: {
        startTime: true,
        endTime: true,
      },
    });
    
    // Define working hours based on day of week
    // Sunday: 10am - 8pm
    // Other days: 8am - 8pm
    const workStart = new Date(selectedDate);
    workStart.setHours(isSunday ? 10 : 8, 0, 0, 0);
    
    const workEnd = new Date(selectedDate);
    workEnd.setHours(20, 0, 0, 0); // 8pm for all days
    
    // Generate time slots (1 hour intervals)
    const timeSlots = [];
    let currentSlot = new Date(workStart);
    
    // Default slot duration: 1 hour
    const slotDuration = 60; // minutes
    
    while (currentSlot < workEnd) {
      const slotEnd = new Date(currentSlot.getTime() + slotDuration * 60000);
      
      // Don't include slots that extend beyond 8pm
      if (slotEnd > workEnd) {
        break;
      }
      
      // Check if this slot is in the past (only for today)
      const isPast = isToday && currentSlot < now;
      
      // Check if this slot conflicts with any appointment
      const hasAppointmentConflict = existingAppointments.some(apt => {
        const aptStart = new Date(apt.startTime);
        const aptEnd = new Date(apt.endTime);
        
        // Check if there's any overlap
        return (
          (currentSlot >= aptStart && currentSlot < aptEnd) || // Slot starts during appointment
          (slotEnd > aptStart && slotEnd <= aptEnd) || // Slot ends during appointment
          (currentSlot <= aptStart && slotEnd >= aptEnd) // Slot completely covers appointment
        );
      });
      
      // Check if this slot conflicts with any blockout
      const hasBlockoutConflict = blockouts.some(blockout => {
        const blockStart = new Date(blockout.startTime);
        const blockEnd = new Date(blockout.endTime);
        
        // Check if there's any overlap
        return (
          (currentSlot >= blockStart && currentSlot < blockEnd) ||
          (slotEnd > blockStart && slotEnd <= blockEnd) ||
          (currentSlot <= blockStart && slotEnd >= blockEnd)
        );
      });
      
      const timeString = format(currentSlot, "h:mm a");
      
      timeSlots.push({
        time: timeString,
        value: timeString,
        disabled: isPast || hasAppointmentConflict || hasBlockoutConflict,
        available: !isPast && !hasAppointmentConflict && !hasBlockoutConflict,
      });
      
      // Move to next hour
      currentSlot = addMinutes(currentSlot, 60);
    }
  
    return NextResponse.json(
      { 
        success: true, 
        data: {
          availableSlots: timeSlots,
          date: dateParam,
          barberId: barberId,
          dayOfWeek: isSunday ? 'Sunday' : 'Weekday',
          hours: isSunday ? '10:00 AM - 8:00 PM' : '7:00 AM - 8:00 PM',
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