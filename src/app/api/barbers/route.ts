// app/api/barbers/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    // Fetch all active users with BARBER or ADMIN role
    const barbers = await prisma.user.findMany({
      where: {
        role: {
          in: ['BARBER', 'ADMIN', 'BEAUTICIAN'], // Include both barbers and admins
        },
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        imageUrl: true,
        role: true, // Include role so you can show "Admin" badge if needed
        createdAt: true,
        updatedAt: true,
      },
      orderBy: [
        { role: 'desc' }, // Admins first
        { name: 'asc' },  // Then alphabetically
      ],
    });
    
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