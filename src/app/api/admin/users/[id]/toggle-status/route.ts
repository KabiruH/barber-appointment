// app/api/admin/users/[id]/toggle-status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // Changed to Promise
) {
  try {
    const token = request.cookies.get('auth-token');
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token.value);
    
    if (!decoded || decoded.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const { id } = await params; // Await params
    const body = await request.json();
    const { isActive } = body;

    if (typeof isActive !== 'boolean') {
      return NextResponse.json(
        { success: false, message: "Invalid status value" },
        { status: 400 }
      );
    }

    // Prevent admin from deactivating themselves
    if (id === decoded.userId && !isActive) {
      return NextResponse.json(
        { success: false, message: "You cannot deactivate your own account" },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id },
      data: { isActive },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    return NextResponse.json(
      { 
        success: true, 
        message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
        data: user 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Toggle user status error:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred" },
      { status: 500 }
    );
  }
}