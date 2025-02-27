import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Barber, Service, BarbersOnServices } from "@prisma/client";

// Define extended types for barber with services
type BarberWithServices = Barber & {
  services: (BarbersOnServices & {
    service: Service;
  })[];
};

// Define transformed barber type
type TransformedBarber = Omit<Barber, "services"> & {
  services: {
    id: string;
    name: string;
    price: any; // Using any for the decimal type
    duration: number;
  }[];
};

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const withServices = searchParams.get('withServices') === 'true';
    const serviceId = searchParams.get('serviceId');
    
    // Build query options
    const queryOptions: any = {
      orderBy: {
        name: 'asc',
      },
    };
    
    // Include services if requested
    if (withServices) {
      queryOptions.include = {
        services: {
          include: {
            service: true,
          },
        },
      };
    }
    
    // If a service ID is provided, filter barbers who offer that service
    if (serviceId) {
      queryOptions.where = {
        services: {
          some: {
            serviceId,
          },
        },
      };
    }
    
    // Fetch all barbers
    const barbers = await prisma.barber.findMany(queryOptions);
    
    // Transform response if needed
    if (withServices) {
      const transformedBarbers = (barbers as BarberWithServices[]).map(barber => {
        const { services, ...barberData } = barber;
        return {
          ...barberData,
          services: services.map(bs => ({
            id: bs.service.id,
            name: bs.service.name,
            price: bs.price || bs.service.price,
            duration: bs.service.duration,
          })),
        } as TransformedBarber;
      });
      
      return NextResponse.json(
        { success: true, data: transformedBarbers },
        { status: 200 }
      );
    }
    
    // If not including services, return barbers as is
    return NextResponse.json(
      { success: true, data: barbers },
      { status: 200 }
    );
    
  } catch (error) {
    console.error("Fetch barbers error:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred while fetching barbers" },
      { status: 500 }
    );
  }
}