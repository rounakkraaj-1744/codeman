import { Module } from "@nestjs/common"
import { MongooseModule } from "@nestjs/mongoose"
import { ConfigModule } from "@nestjs/config"

import { TemplatesModule } from "./modules/templates/templates.module"
import { ShareModule } from "./modules/share/share.module"
import { CodeProxyModule } from "./modules/code-proxy/code-proxy.module"
import { AuthModule } from "./modules/auth/auth.module"

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGODB_URI || "mongodb://localhost:27017/codeman"),
    TemplatesModule,
    ShareModule,
    CodeProxyModule,
    AuthModule, // OAuth GitHub/Google equivalents for NextAuth
  ],
})
export class AppModule {}
