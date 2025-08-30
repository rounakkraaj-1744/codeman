import { BadRequestException, Injectable, NotFoundException, GoneException } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { Model } from "mongoose"
import { Template } from "../templates/schemas/template.schema"
import { InjectModel } from "@nestjs/mongoose"

@Injectable()
export class ShareService {
  private readonly expiresIn = "10m"

  constructor(
    private readonly jwt: JwtService,
    @InjectModel(Template.name) private readonly templateModel: Model<Template>,
  ) {}

  async createShareLink(templateId: string, origin?: string) {
    const template = await this.templateModel.findById(templateId).exec()
    if (!template) throw new NotFoundException({ success: false, message: "Template not found" })

    const token = await this.jwt.signAsync({ templateId }, { expiresIn: this.expiresIn })
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || origin || process.env.PUBLIC_BASE_URL || ""
    const shareLink = `${baseUrl}/share/${token}`
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

    return {
      success: true,
      shareLink,
      expiresAt,
      message: "Share link created successfully",
    }
  }

  async verifyToken(token: string) {
    if (!token) throw new BadRequestException({ success: false, message: "Token is required" })

    try {
      const payload = await this.jwt.verifyAsync<{ templateId: string }>(token)
      const template = await this.templateModel.findById(payload.templateId).exec()
      if (!template) {
        throw new NotFoundException({
          success: false,
          message: "Template not found or may have been deleted",
        })
      }
      return { success: true, template, message: "Template retrieved successfully" }
    } catch (e: any) {
      if (e?.name === "TokenExpiredError") {
        throw new GoneException({ success: false, message: "Share link has expired" })
      }
      throw new BadRequestException({ success: false, message: "Invalid or expired share link" })
    }
  }
}
