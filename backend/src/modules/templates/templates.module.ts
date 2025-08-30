import { Module } from "@nestjs/common"
import { MongooseModule } from "@nestjs/mongoose"
import { TemplatesController } from "./templates.controller"
import { TemplatesService } from "./templates.service"
import { Template, TemplateSchema } from "./schemas/template.schema"
import { S3Module } from "../s3/s3.module"

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Template.name, schema: TemplateSchema }]),
    S3Module
  ],
  controllers: [TemplatesController],
  providers: [TemplatesService],
  exports: [TemplatesService], // export the service, not MongooseModule
})
export class TemplatesModule {}
