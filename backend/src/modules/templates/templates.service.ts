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
  ) {}

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
    if (file && file.buffer && file.size > 0) {
      codeurl = await this.s3.uploadToS3({
        file: file.buffer,
        fileName: file.originalname,
        contentType: file.mimetype || "application/octet-stream",
      })
    } else if (code) {
      const language = inferLangFromContent(code)
      codeurl = await this.s3.uploadToS3({
        content: code,
        fileName: `${title}.${language}`,
        contentType: "text/plain",
      })
    } else {
      throw new BadRequestException({ success: false, error: "No code or file provided" })
    }

    const created = await this.templateModel.create({
      title,
      description,
      tags: this.parseTags(tagsRaw),
      codeurl,
    })

    return { success: true, template: created }
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

    if (file && file.buffer && file.size > 0) {
      const codeurl = await this.s3.uploadToS3({
        file: file.buffer,
        fileName: file.originalname,
        contentType: file.mimetype || "application/octet-stream",
      })
      ;(update as any).codeurl = codeurl
    } else if (code) {
      const language = inferLangFromContent(code)
      const codeurl = await this.s3.uploadToS3({
        content: code,
        fileName: `${title}.${language}`,
        contentType: "text/plain",
      })
      ;(update as any).codeurl = codeurl
    }

    const updated = await this.templateModel.findByIdAndUpdate(id, update, { new: true, runValidators: true }).exec()

    return { success: true, template: updated, message: "Template updated successfully" }
  }

  async delete(id: string) {
    if (!id) throw new BadRequestException({ success: false, message: "Template ID is required" })

    const template = await this.templateModel.findById(id).exec()
    if (!template) throw new NotFoundException({ success: false, message: "Template not found" })

    // Optional delete S3 object (non-fatal on error), mirroring original
    if (template.codeurl) {
      await this.s3.deleteFromS3(template.codeurl)
    }

    await this.templateModel.findByIdAndDelete(id).exec()
    return { success: true, message: "Template deleted successfully" }
  }
}
