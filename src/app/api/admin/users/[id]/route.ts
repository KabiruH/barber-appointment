// app/api/admin/users/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { z } from "zod";

const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  role: z.enum(['ADMIN', 'BARBER', 'BEAUTICIAN']).optional(),
  bio: z.string().optional(),
  imageUrl: z.string().optional(),
});

// PATCH - Update user
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params;
    const body = await request.json();
    
    const validatedData = updateUserSchema.safeParse(body);
    
    if (!validatedData.success) {
      return NextResponse.json(
        { success: false, message: "Invalid input", errors: validatedData.error.errors },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // If email is being updated, check if it's already in use
    if (validatedData.data.email && validatedData.data.email !== user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: validatedData.data.email },
      });

      if (existingUser) {
        return NextResponse.json(
          { success: false, message: "Email already exists" },
          { status: 409 }
        );
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: validatedData.data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        bio: true,
        imageUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(
      { success: true, message: "User updated successfully", data: updatedUser },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred" },
      { status: 500 }
    );
  }
}

// DELETE user (keep existing DELETE function)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } 
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

   const { id } = await params; 

    // Prevent admin from deleting themselves
    if (id === decoded.userId) {
      return NextResponse.json(
        { success: false, message: "You cannot delete your own account" },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Delete user (cascade will handle related records)
    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json(
      { success: true, message: "User deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred" },
      { status: 500 }
    );
  }
}