import { Module } from "@nestjs/common"
import { JwtModule } from "@nestjs/jwt"
import { MongooseModule } from "@nestjs/mongoose"
import { ShareController } from "./share.controller"
import { ShareService } from "./share.service"
import { Template, TemplateSchema } from "../templates/schemas/template.schema"

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || "your-secret-key",
      signOptions: { algorithm: "HS256" as any },
    }),
    MongooseModule.forFeature([{ name: Template.name, schema: TemplateSchema }]),
  ],
  controllers: [ShareController],
  providers: [ShareService],
})
export class ShareModule {}
