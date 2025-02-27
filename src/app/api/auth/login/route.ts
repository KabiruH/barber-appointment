import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcrypt";
import { z } from "zod";

// Define validation schema for login
const loginSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters",
  }),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validatedData = loginSchema.safeParse(body);
    
    if (!validatedData.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Invalid input", 
          errors: validatedData.error.errors 
        },
        { status: 400 }
      );
    }
    
    const { email, password } = validatedData.data;
    
    // Find admin by email
    const admin = await prisma.admin.findUnique({
      where: { email },
    });
    
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      );
    }
    
    // Compare password
    const passwordMatch = await bcrypt.compare(password, admin.password);
    
    if (!passwordMatch) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      );
    }
    
    // Generate a simple session token (in a production app, use a proper JWT or Next-Auth)
    // This is a simplified example - in production, use a proper authentication library
    const sessionToken = Buffer.from(`${admin.id}:${Date.now()}`).toString('base64');
    
    return NextResponse.json(
      { 
        success: true, 
        message: "Login successful",
        user: {
          id: admin.id,
          name: admin.name,
          email: admin.email
        },
        token: sessionToken
      },
      { 
        status: 200,
        headers: {
          'Set-Cookie': `auth-token=${sessionToken}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${60 * 60 * 24}` // 1 day
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