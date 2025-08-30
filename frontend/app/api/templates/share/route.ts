import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Template } from "@/models/template.model";
import { SignJWT, jwtVerify } from "jose";

// Secret for JWT signing (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const secret = new TextEncoder().encode(JWT_SECRET);

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { templateId } = await request.json();
    
    if (!templateId) {
      return NextResponse.json(
        { success: false, message: "Template ID is required" },
        { status: 400 }
      );
    }

    // Verify template exists
    const template = await Template.findById(templateId);
    
    if (!template) {
      return NextResponse.json(
        { success: false, message: "Template not found" },
        { status: 404 }
      );
    }

    // Create a JWT token that expires in 10 minutes
    const token = await new SignJWT({ templateId })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("10m")
      .setIssuedAt()
      .sign(secret);

    // Create the share URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin;
    const shareLink = `${baseUrl}/share/${token}`;

    return NextResponse.json({
      success: true,
      shareLink,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes from now
      message: "Share link created successfully"
    });

  } catch (error) {
    console.error("Error creating share link:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : "Failed to create share link" 
      },
      { status: 500 }
    );
  }
}

// Optional: GET method to verify/decode share tokens
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Token is required" },
        { status: 400 }
      );
    }

    // Verify and decode the JWT
    const { payload } = await jwtVerify(token, secret);

    const templateId = payload.templateId as string;
    
    // Fetch the template
    await connectDB();
    const template = await Template.findById(templateId);
    
    if (!template) {
      return NextResponse.json(
        { success: false, message: "Template not found or may have been deleted" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      template,
      message: "Template retrieved successfully"
    });

  } catch (error) {
    console.error("Error verifying share link:", error);
    
    // Handle JWT errors specifically
    if (error instanceof Error && error.message.includes('expired')) {
      return NextResponse.json(
        { success: false, message: "Share link has expired" },
        { status: 410 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message: "Invalid or expired share link" 
      },
      { status: 400 }
    );
  }
}