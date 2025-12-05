// app/api/appointments/lookup/route.ts
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
            email: true,
            bio: true,
            imageUrl: true,
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
      barber: appointment.barber, // Include full barber object
      serviceName: appointment.serviceName,
      servicePrice: appointment.servicePrice.toString(), // Convert Decimal to string
      serviceDuration: appointment.serviceDuration,
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