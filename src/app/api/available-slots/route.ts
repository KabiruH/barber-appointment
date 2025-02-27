import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { format, addMinutes, areIntervalsOverlapping } from "date-fns";

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const barberId = searchParams.get('barberId');
    const serviceId = searchParams.get('serviceId');
    
    // Validate required parameters
    if (!date || !barberId) {
      return NextResponse.json(
        { success: false, message: "Missing required parameters: date and barberId" },
        { status: 400 }
      );
    }
    
    // Parse date
    const selectedDate = new Date(date);
    const dayOfWeek = selectedDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Get barber's availability for the day
    const availability = await prisma.availability.findUnique({
      where: {
        barberId_dayOfWeek: {
          barberId,
          dayOfWeek,
        },
      },
    });
    
    // If barber doesn't work on this day, return empty array
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
    
    // Parse availability times
    const [startHour, startMinute] = availability.startTime.split(':').map(Number);
    const [endHour, endMinute] = availability.endTime.split(':').map(Number);
    
    // Set start and end times for the day
    const dayStart = new Date(selectedDate);
    dayStart.setHours(startHour, startMinute, 0, 0);
    
    const dayEnd = new Date(selectedDate);
    dayEnd.setHours(endHour, endMinute, 0, 0);
    
    // Get shop settings
    const settings = await prisma.settings.findFirst();
    const timeSlotInterval = settings?.timeSlotInterval || 30; // Default to 30 min slots
    
    // Get service duration if service ID is provided
    let serviceDuration = timeSlotInterval;
    if (serviceId) {
      const service = await prisma.service.findUnique({
        where: { id: serviceId },
      });
      
      if (service) {
        serviceDuration = service.duration;
      }
    }
    
    // Get existing appointments for the barber on the selected date
    const existingAppointments = await prisma.appointment.findMany({
      where: {
        barberId,
        status: { notIn: ["CANCELLED", "NO_SHOW"] },
        startTime: {
          gte: new Date(selectedDate.setHours(0, 0, 0, 0)),
          lt: new Date(selectedDate.setHours(23, 59, 59, 999)),
        },
      },
      select: {
        startTime: true,
        endTime: true,
      },
    });
    
    // Get time blockouts for the barber on the selected date
    const timeBlockouts = await prisma.timeBlockout.findMany({
      where: {
        barberId,
        OR: [
          {
            // Blockout starts on the selected date
            startTime: {
              gte: new Date(selectedDate.setHours(0, 0, 0, 0)),
              lt: new Date(selectedDate.setHours(23, 59, 59, 999)),
            },
          },
          {
            // Blockout ends on the selected date
            endTime: {
              gte: new Date(selectedDate.setHours(0, 0, 0, 0)),
              lt: new Date(selectedDate.setHours(23, 59, 59, 999)),
            },
          },
          {
            // Blockout spans across the selected date
            AND: [
              { startTime: { lt: new Date(selectedDate.setHours(0, 0, 0, 0)) } },
              { endTime: { gt: new Date(selectedDate.setHours(23, 59, 59, 999)) } },
            ],
          },
        ],
      },
      select: {
        startTime: true,
        endTime: true,
      },
    });
    
    // Generate all possible time slots
    const allTimeSlots = [];
    let currentSlot = new Date(dayStart);
    
    while (currentSlot <= new Date(dayEnd.getTime() - serviceDuration * 60000)) {
      const slotEnd = new Date(currentSlot.getTime() + serviceDuration * 60000);
      
      // Check if the slot is available (not overlapping with any appointment or blockout)
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
      
      // Move to the next slot
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