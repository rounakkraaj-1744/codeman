import { Controller, Get, Post, Put, Delete, UseInterceptors } from "@nestjs/common"
import { FileInterceptor } from "@nestjs/platform-express"
import { TemplatesService } from "./templates.service"
import { CreateTemplateDto } from "./dto/create-template.dto"
import { UpdateTemplateDto } from "./dto/update-template.dto"
import type { Express, Request } from "express"

@Controller("templates")
export class TemplatesController {
  constructor(private readonly svc: TemplatesService) {}

  @Get()
  async list() {
    return this.svc.listAll()
  }

  @Get(":id")
  async getOne(req: Request) {
    const id = req.params?.id as string
    return this.svc.getOne(id)
  }

  @Post()
  @UseInterceptors(FileInterceptor("file"))
  async create(req: Request) {
    const dto = req.body as CreateTemplateDto
    const file = req.file as Express.Multer.File | undefined
    return this.svc.create(dto, file)
  }

  @Put(":id")
  @UseInterceptors(FileInterceptor("file"))
  async update(req: Request) {
    const id = req.params?.id as string
    const dto = req.body as UpdateTemplateDto
    const file = req.file as Express.Multer.File | undefined
    return this.svc.update(id, dto, file)
  }

  @Delete(":id")
  async remove(req: Request) {
    const id = req.params?.id as string
    return this.svc.delete(id)
  }
}
