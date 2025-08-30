import { Module } from "@nestjs/common"
import { PassportModule } from "@nestjs/passport"
import { JwtModule } from "@nestjs/jwt"

import { AuthController } from "./auth.controller"
import { AuthService } from "./auth.service"
import { GitHubStrategy } from "./strategies/github.strategy"
import { GoogleStrategy } from "./strategies/google.strategy"
import { JwtStrategy } from "./strategies/jwt.strategy"

@Module({
  imports: [
    PassportModule.register({ session: false }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || "your-secret-key",
      signOptions: { algorithm: "HS256" as any },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, GitHubStrategy, GoogleStrategy, JwtStrategy],
})
export class AuthModule {}
