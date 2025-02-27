import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('activeOnly') === 'true';
    
    // Build query filters
    const filters: any = {};
    
    if (activeOnly) {
      filters.where = {
        active: true,
      };
    }
    
    // Fetch all services
    const services = await prisma.service.findMany({
      ...filters,
      orderBy: {
        name: 'asc',
      },
    });
    
    return NextResponse.json(
      { success: true, data: services },
      { status: 200 }
    );
    
  } catch (error) {
    console.error("Fetch services error:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred while fetching services" },
      { status: 500 }
    );
  }
}