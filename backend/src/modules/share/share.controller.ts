import { Controller, Get, Post } from "@nestjs/common"
import { ShareService } from "./share.service"

@Controller("share")
export class ShareController {
  constructor(private readonly sharedservice: ShareService) {}

  @Post()
  async create(req: any) {
    const origin =
      req?.headers?.["x-forwarded-proto"] && req?.headers?.host
        ? `${req.headers["x-forwarded-proto"]}://${req.headers.host}`
        : req?.protocol && req?.get?.("host")
          ? `${req.protocol}://${req.get("host")}`
          : undefined

    const dto = req.body as { templateId: string }
    return this.sharedservice.createShareLink(dto.templateId, origin)
  }

  @Get()
  async verify(req: any) {
    const token = (req.query?.token as string) || ""
    return this.sharedservice.verifyToken(token)
  }
}
