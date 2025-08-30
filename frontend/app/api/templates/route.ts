import { NextRequest, NextResponse } from "next/server";
import { uploadToS3 } from "@/lib/s3";
import { connectDB } from "@/lib/mongodb";
import { Template } from "@/models/template.model";

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

export async function GET() {
  try {
    await connectDB();
    const templates = await Template.find().sort({ createdAt: -1 }); // latest first
    return NextResponse.json({ success: true, templates });
  } catch (err) {
    console.error("Error fetching templates:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch templates" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const data = await req.formData();
    const title = (data.get("title") as string)?.trim();
    const description = (data.get("description") as string)?.trim();
    const tagsRaw = (data.get("tags") as string)?.trim();
    const code = data.get("code") as string;
    const file = data.get("file") as File | null;

    if (!title || !description || !tagsRaw) {
      return NextResponse.json({ 
        success: false, 
        error: "Missing required fields" 
      }, { status: 400 });
    }

    const tags = tagsRaw.split(".").map(tag => tag.trim()).filter(Boolean);

    let codeurl = "";
    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());
      codeurl = await uploadToS3({
        file: buffer,
        fileName: file.name,
        contentType: file.type
      });
    } else if (code) {
      const language = inferLangFromContent(code);
      codeurl = await uploadToS3({
        content: code,
        fileName: `${title}.${language}`,
        contentType: "text/plain"
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: "No code or file provided" 
      }, { status: 400 });
    }

    const saved = await Template.create({ title, description, tags, codeurl });

    return NextResponse.json({ success: true, template: saved });

  } catch (err) {
    console.error("Error saving template:", err);
    return NextResponse.json({ 
      success: false, 
      error: "Server Error" 
    }, { status: 500 });
  }
}