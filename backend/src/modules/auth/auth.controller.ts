import { Controller, Get, Req, UseGuards } from "@nestjs/common"
import { AuthGuard } from "@nestjs/passport"
import { AuthService } from "./auth.service"

// OAuth endpoints simulating NextAuth providers
@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  // GitHub
  @Get('github')
  @UseGuards(AuthGuard('github'))
  async githubLogin(@Req() req: any) {
    // Passport redirects to GitHub
  }

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  async githubCallback(@Req() req: any) {
    // req.user from GitHubStrategy.validate
    return this.auth.issueJwtForOAuthUser({
      provider: 'github',
      providerId: req.user.providerId,
      name: req.user.name,
      email: req.user.email,
      avatarUrl: req.user.avatarUrl,
    })
  }

  // Google
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleLogin(@Req() req: any) {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req: any) {
    return this.auth.issueJwtForOAuthUser({
      provider: 'google',
      providerId: req.user.providerId,
      name: req.user.name,
      email: req.user.email,
      avatarUrl: req.user.avatarUrl,
    })
  }
}
