import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    // Get the reference number from the query parameters
    const { searchParams } = new URL(request.url);
    const referenceNumber = searchParams.get('reference');
    
    if (!referenceNumber) {
      return NextResponse.json(
        { success: false, message: "Reference number is required" },
        { status: 400 }
      );
    }
    
    // Find the appointment by reference number
    const appointment = await prisma.appointment.findUnique({
      where: {
        referenceNumber: referenceNumber,
      },
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
    
    if (!appointment) {
      return NextResponse.json(
        { success: false, message: "Appointment not found" },
        { status: 404 }
      );
    }
    
    // Check if the appointment is in the past
    if (new Date(appointment.startTime) < new Date()) {
      return NextResponse.json(
        { success: false, message: "Cannot reschedule past appointments" },
        { status: 400 }
      );
    }
    
    // Check if the appointment is already cancelled
    if (appointment.status === "CANCELLED") {
      return NextResponse.json(
        { success: false, message: "This appointment has been cancelled" },
        { status: 400 }
      );
    }
    
    // Format the data for the client
    const appointmentData = {
      id: appointment.id,
      referenceNumber: appointment.referenceNumber,
      startTime: appointment.startTime.toISOString(),
      endTime: appointment.endTime.toISOString(),
      customerName: appointment.customerName,
      customerEmail: appointment.customerEmail,
      customerPhone: appointment.customerPhone,
      notes: appointment.notes,
      barberId: appointment.barberId,
      barberName: appointment.barber.name,
      serviceId: appointment.serviceId,
      serviceName: appointment.service.name,
      servicePrice: appointment.service.price,
      serviceDuration: appointment.service.duration,
      status: appointment.status,
    };
    
    return NextResponse.json(
      { success: true, data: appointmentData },
      { status: 200 }
    );
    
  } catch (error) {
    console.error("Lookup appointment error:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred while looking up the appointment" },
      { status: 500 }
    );
  }
}