// app/api/available-slots/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { format, addMinutes, areIntervalsOverlapping } from "date-fns";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const barberId = searchParams.get('barberId');
    const duration = searchParams.get('duration'); // Changed from serviceId to duration
    
    if (!date || !barberId) {
      return NextResponse.json(
        { success: false, message: "Missing required parameters: date and barberId" },
        { status: 400 }
      );
    }
    
    const selectedDate = new Date(date);
    const dayOfWeek = selectedDate.getDay();
    
    // Changed: barberId_dayOfWeek to userId_dayOfWeek
    const availability = await prisma.availability.findUnique({
      where: {
        userId_dayOfWeek: {
          userId: barberId,
          dayOfWeek,
        },
      },
    });
    
    if (!availability || !availability.isWorking) {
      return NextResponse.json(
        { 
          success: true, 
          message: "Barber does not work on this day", 
          data: {
            availableSlots: [],
            isWorkingDay: false
          }
        },
        { status: 200 }
      );
    }
    
    const [startHour, startMinute] = availability.startTime.split(':').map(Number);
    const [endHour, endMinute] = availability.endTime.split(':').map(Number);
    
    const dayStart = new Date(selectedDate);
    dayStart.setHours(startHour, startMinute, 0, 0);
    
    const dayEnd = new Date(selectedDate);
    dayEnd.setHours(endHour, endMinute, 0, 0);
    
    const settings = await prisma.settings.findFirst();
    const timeSlotInterval = settings?.timeSlotInterval || 30;
    
    // Use duration from query params (passed from hardcoded services)
    const serviceDuration = duration ? parseInt(duration) : timeSlotInterval;
    
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    const existingAppointments = await prisma.appointment.findMany({
      where: {
        barberId,
        status: { notIn: ["CANCELLED", "NO_SHOW"] },
        startTime: {
          gte: startOfDay,
          lt: endOfDay,
        },
      },
      select: {
        startTime: true,
        endTime: true,
      },
    });
    
    // Changed: barberId to userId
    const timeBlockouts = await prisma.timeBlockout.findMany({
      where: {
        userId: barberId,
        OR: [
          {
            startTime: {
              gte: startOfDay,
              lt: endOfDay,
            },
          },
          {
            endTime: {
              gte: startOfDay,
              lt: endOfDay,
            },
          },
          {
            AND: [
              { startTime: { lt: startOfDay } },
              { endTime: { gt: endOfDay } },
            ],
          },
        ],
      },
      select: {
        startTime: true,
        endTime: true,
      },
    });
    
    const allTimeSlots = [];
    let currentSlot = new Date(dayStart);
    
    while (currentSlot <= new Date(dayEnd.getTime() - serviceDuration * 60000)) {
      const slotEnd = new Date(currentSlot.getTime() + serviceDuration * 60000);
      
      const isOverlapping = [...existingAppointments, ...timeBlockouts].some(
        (booking) => areIntervalsOverlapping(
          { start: currentSlot, end: slotEnd },
          { start: booking.startTime, end: booking.endTime }
        )
      );
      
      if (!isOverlapping) {
        allTimeSlots.push({
          time: format(currentSlot, "h:mm a"),
          value: format(currentSlot, "h:mm a"),
          disabled: false,
        });
      }
      
      currentSlot = addMinutes(currentSlot, timeSlotInterval);
    }
    
    return NextResponse.json(
      { 
        success: true, 
        data: {
          availableSlots: allTimeSlots,
          isWorkingDay: true,
          workingHours: {
            start: availability.startTime,
            end: availability.endTime,
          }
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