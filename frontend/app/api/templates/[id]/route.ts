import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Template } from "@/models/template.model";
import { uploadToS3 } from "@/lib/s3";

// Helper function to infer language from content
function inferLangFromContent(content: string): string {
  if (content.includes("import React") || content.includes("JSX"))
    return "tsx";
  if (content.includes("public static void main"))
    return "java";
  if (content.includes("fn main()"))
    return "rs";
  if (content.includes("def "))
    return "py";
  if (content.includes("#include"))
    return "cpp";
  if (content.includes("package main"))
    return "go";
  return "txt";
}

// GET single template
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const { id } = params;
    
    const template = await Template.findById(id);
    
    if (!template) {
      return NextResponse.json(
        { success: false, message: "Template not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      template
    });

  } catch (error) {
    console.error("Error fetching template:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : "Failed to fetch template" 
      },
      { status: 500 }
    );
  }
}

// UPDATE template
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const { id } = params;
    
    // Check if template exists
    const existingTemplate = await Template.findById(id);
    if (!existingTemplate) {
      return NextResponse.json(
        { success: false, message: "Template not found" },
        { status: 404 }
      );
    }

    const data = await request.formData();
    const title = (data.get("title") as string)?.trim();
    const description = (data.get("description") as string)?.trim();
    const tagsRaw = (data.get("tags") as string)?.trim();
    const code = data.get("code") as string;
    const file = data.get("file") as File | null;

    if (!title || !description || !tagsRaw) {
      return NextResponse.json({ 
        success: false, 
        message: "Missing required fields" 
      }, { status: 400 });
    }

    const tags = tagsRaw.split(".").map(tag => tag.trim()).filter(Boolean);

    let updateData: any = { title, description, tags };

    // Handle code/file update if provided
    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const codeurl = await uploadToS3({
        file: buffer,
        fileName: file.name,
        contentType: file.type
      });
      updateData.codeurl = codeurl;
    } else if (code) {
      const language = inferLangFromContent(code);
      const codeurl = await uploadToS3({
        content: code,
        fileName: `${title}.${language}`,
        contentType: "text/plain"
      });
      updateData.codeurl = codeurl;
    }

    const updatedTemplate = await Template.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      success: true,
      template: updatedTemplate,
      message: "Template updated successfully"
    });

  } catch (error) {
    console.error("Error updating template:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : "Failed to update template" 
      },
      { status: 500 }
    );
  }
}

// DELETE template
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: "Template ID is required" },
        { status: 400 }
      );
    }

    // Find the template first to get the S3 URL
    const template = await Template.findById(id);
    
    if (!template) {
      return NextResponse.json(
        { success: false, message: "Template not found" },
        { status: 404 }
      );
    }

    // Delete from S3 first (optional - you might want to keep files)
    if (template.codeurl) {
      try {
        // Extract the S3 key from the URL
        const url = new URL(template.codeurl);
        const s3Key = url.pathname.substring(1); // Remove leading slash
        
        // Delete from S3 (implement this function in your s3 lib)
        // await deleteFromS3(s3Key);
        console.log('Would delete S3 file:', s3Key);
      } catch (s3Error) {
        console.error('Error deleting S3 file:', s3Error);
        // Continue with database deletion even if S3 deletion fails
      }
    }

    // Delete from database
    await Template.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Template deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting template:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : "Failed to delete template" 
      },
      { status: 500 }
    );
  }
}