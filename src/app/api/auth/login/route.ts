// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateToken } from "@/lib/auth";
import bcrypt from "bcrypt";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = loginSchema.safeParse(body);
    
    if (!validatedData.success) {
      return NextResponse.json(
        { success: false, message: "Invalid input", errors: validatedData.error.errors },
        { status: 400 }
      );
    }
    
    const { email, password } = validatedData.data;
    
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        { success: false, message: "Your account has been deactivated. Please contact support." },
        { status: 403 }
      );
    }
    
    // Compare password
    const passwordMatch = await bcrypt.compare(password, user.password);
    
    if (!passwordMatch) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      );
    }
    
    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });
    
    const isProduction = process.env.NODE_ENV === 'production';
    
    return NextResponse.json(
      { 
        success: true, 
        message: "Login successful",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      },
      { 
        status: 200,
        headers: {
          'Set-Cookie': `auth-token=${token}; Path=/; HttpOnly; ${isProduction ? 'Secure;' : ''} SameSite=Strict; Max-Age=${60 * 60 * 24 * 7}`
        }
      }
    );
    
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred during login" },
      { status: 500 }
    );
  }
}