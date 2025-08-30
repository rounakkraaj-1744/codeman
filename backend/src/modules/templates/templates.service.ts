import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common"
import type { Model } from "mongoose"
import { Template } from "./schemas/template.schema"
import type { CreateTemplateDto } from "./dto/create-template.dto"
import type { UpdateTemplateDto } from "./dto/update-template.dto"
import { S3Service } from "../s3/s3.service"
import { InjectModel } from "@nestjs/mongoose"

function inferLangFromContent(content: string): string {
  if (content.includes("import React") || content.includes("JSX")) return "tsx"
  if (content.includes("public static void main")) return "java"
  if (content.includes("fn main()")) return "rs"
  if (content.includes("def ")) return "py"
  if (content.includes("#include")) return "cpp"
  if (content.includes("package main")) return "go"
  return "txt"
}

@Injectable()
export class TemplatesService {
  constructor(
    @InjectModel(Template.name) private readonly templateModel: Model<Template>,
    private readonly s3: S3Service,
  ) { }

  async listAll() {
    const templates = await this.templateModel.find().sort({ createdAt: -1 }).exec()
    return { success: true, templates }
  }

  async getOne(id: string) {
    const template = await this.templateModel.findById(id).exec()
    if (!template) throw new NotFoundException({ success: false, message: "Template not found" })
    return { success: true, template }
  }

  private parseTags(raw: string) {
    return raw
      .split(".")
      .map((t) => t.trim())
      .filter(Boolean)
  }

  async create(dto: CreateTemplateDto, file?: Express.Multer.File) {
    const { title, description, tags: tagsRaw, code } = dto

    if (!title || !description || !tagsRaw) {
      throw new BadRequestException({ success: false, error: "Missing required fields" })
    }

    let codeurl = ""
    try {
      if (file && file.buffer && file.size > 0) {
        // Validate file size (e.g., max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          throw new BadRequestException({ success: false, error: "File too large (max 10MB)" })
        }
        
        console.log("Uploading file:", { 
          originalname: file.originalname, 
          mimetype: file.mimetype, 
          size: file.size 
        });
        
        codeurl = await this.s3.uploadToS3({
          file: file.buffer,
          fileName: file.originalname,
          contentType: file.mimetype || "application/octet-stream",
        })
      } else if (code && code.trim()) {
        // Validate code content
        if (code.length > 100000) { // 100KB limit for text
          throw new BadRequestException({ success: false, error: "Code content too large (max 100KB)" })
        }
        
        console.log("Uploading code content:", { 
          length: code.length, 
          title 
        });
        
        const language = inferLangFromContent(code)
        const fileName = `${title.replace(/[^a-zA-Z0-9]/g, '_')}.${language}`
        
        codeurl = await this.s3.uploadToS3({
          content: code,
          fileName: fileName,
          contentType: "text/plain",
        })
      } else {
        throw new BadRequestException({ success: false, error: "No code or file provided" })
      }
      
      console.log("S3 upload successful:", codeurl);
      
    } catch (err) {
      console.error("S3 upload failed:", err)
      
      // Provide more specific error messages
      if (err instanceof BadRequestException) {
        throw err;
      }
      
      // Handle AWS/S3 specific errors
      if (err.code === 'NoSuchBucket') {
        throw new BadRequestException({ success: false, error: "Storage bucket not found" })
      }
      if (err.code === 'AccessDenied') {
        throw new BadRequestException({ success: false, error: "Storage access denied" })
      }
      if (err.code === 'NetworkingError') {
        throw new BadRequestException({ success: false, error: "Network error during upload" })
      }
      
      // Generic error
      throw new BadRequestException({ 
        success: false, 
        error: `Failed to upload to storage: ${err.message || 'Unknown error'}` 
      })
    }

    try {
      const created = await this.templateModel.create({
        title,
        description,
        tags: this.parseTags(tagsRaw),
        codeurl,
      })

      return { success: true, template: created }
    } catch (err) {
      // If database save fails, try to clean up the uploaded file
      try {
        await this.s3.deleteFromS3(codeurl);
      } catch (deleteErr) {
        console.error("Failed to cleanup uploaded file:", deleteErr);
      }
      
      console.error("Database save failed:", err);
      throw new BadRequestException({ 
        success: false, 
        error: "Failed to save template to database" 
      });
    }
  }

  async update(id: string, dto: UpdateTemplateDto, file?: Express.Multer.File) {
    const existing = await this.templateModel.findById(id).exec()
    if (!existing) throw new NotFoundException({ success: false, message: "Template not found" })

    const { title, description, tags: tagsRaw, code } = dto
    if (!title || !description || !tagsRaw) {
      throw new BadRequestException({ success: false, message: "Missing required fields" })
    }

    const update: Partial<Template> = {
      title,
      description,
      tags: this.parseTags(tagsRaw),
    } as any

    let oldCodeUrl = "";
    
    try {
      if (file && file.buffer && file.size > 0) {
        // Validate file size
        if (file.size > 10 * 1024 * 1024) {
          throw new BadRequestException({ success: false, error: "File too large (max 10MB)" })
        }
        
        console.log("Updating with file:", { 
          originalname: file.originalname, 
          mimetype: file.mimetype, 
          size: file.size 
        });
        
        oldCodeUrl = existing.codeurl; // Store for cleanup
        const codeurl = await this.s3.uploadToS3({
          file: file.buffer,
          fileName: file.originalname,
          contentType: file.mimetype || "application/octet-stream",
        });
        (update as any).codeurl = codeurl
      } else if (code && code.trim()) {
        // Validate code content
        if (code.length > 100000) {
          throw new BadRequestException({ success: false, error: "Code content too large (max 100KB)" })
        }
        
        console.log("Updating with code content:", { 
          length: code.length, 
          title 
        });
        
        oldCodeUrl = existing.codeurl; // Store for cleanup
        const language = inferLangFromContent(code)
        const fileName = `${title.replace(/[^a-zA-Z0-9]/g, '_')}.${language}`
        const codeurl = await this.s3.uploadToS3({
          content: code,
          fileName: fileName,
          contentType: "text/plain",
        });
        (update as any).codeurl = codeurl
      }
      // If neither file nor code is provided, keep the existing codeurl
      
    } catch (err) {
      console.error("S3 upload failed during update:", err)
      
      // Handle specific errors
      if (err instanceof BadRequestException) {
        throw err;
      }
      
      if (err.code === 'NoSuchBucket') {
        throw new BadRequestException({ success: false, error: "Storage bucket not found" })
      }
      if (err.code === 'AccessDenied') {
        throw new BadRequestException({ success: false, error: "Storage access denied" })
      }
      if (err.code === 'NetworkingError') {
        throw new BadRequestException({ success: false, error: "Network error during upload" })
      }
      
      throw new BadRequestException({ 
        success: false, 
        error: `Failed to upload to storage: ${err.message || 'Unknown error'}` 
      })
    }

    try {
      const updated = await this.templateModel.findByIdAndUpdate(id, update, { 
        new: true, 
        runValidators: true 
      }).exec()

      // Only delete old file after successful update and if we uploaded a new one
      if (oldCodeUrl && (update as any).codeurl && oldCodeUrl !== (update as any).codeurl) {
        try {
          await this.s3.deleteFromS3(oldCodeUrl);
        } catch (deleteErr) {
          console.error("Failed to delete old file:", deleteErr);
          // Don't fail the entire operation for cleanup failures
        }
      }

      return { success: true, template: updated, message: "Template updated successfully" }
    } catch (err) {
      // If database update fails and we uploaded a new file, clean it up
      if ((update as any).codeurl && oldCodeUrl !== (update as any).codeurl) {
        try {
          await this.s3.deleteFromS3((update as any).codeurl);
        } catch (deleteErr) {
          console.error("Failed to cleanup new uploaded file:", deleteErr);
        }
      }
      
      console.error("Database update failed:", err);
      throw new BadRequestException({ 
        success: false, 
        error: "Failed to update template in database" 
      });
    }
  }

  async delete(id: string) {
    if (!id) throw new BadRequestException({ success: false, message: "Template ID is required" })

    const template = await this.templateModel.findById(id).exec()
    if (!template) throw new NotFoundException({ success: false, message: "Template not found" })

    // Delete from database first
    await this.templateModel.findByIdAndDelete(id).exec()
    
    // Then try to delete from S3 (non-fatal on error)
    if (template.codeurl) {
      try {
        await this.s3.deleteFromS3(template.codeurl)
      } catch (err) {
        console.error("Failed to delete file from S3:", err);
        // Don't fail the entire operation for S3 cleanup failures
      }
    }

    return { success: true, message: "Template deleted successfully" }
  }
}