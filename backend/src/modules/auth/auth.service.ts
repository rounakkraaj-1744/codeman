import { Injectable } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"

@Injectable()
export class AuthService {
  constructor(private readonly jwt: JwtService) {}

  // Map provider profile to an application user id.
  // In a real app you'd lookup/create a user in DB and return that id.
  private resolveUserIdFromProvider(provider: "github" | "google", providerId: string) {
    // For demo parity with NextAuth token.sub, we use provider:providerId
    return `${provider}:${providerId}`
  }

  async issueJwtForOAuthUser(user: {
    provider: "github" | "google"
    providerId: string
    name?: string
    email?: string
    avatarUrl?: string
  }) {
    const sub = this.resolveUserIdFromProvider(user.provider, user.providerId)
    const accessToken = await this.jwt.signAsync(
      { sub, name: user.name, email: user.email, avatarUrl: user.avatarUrl },
      { expiresIn: "7d" },
    )

    return {
      success: true,
      accessToken,
      user: {
        id: sub,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        provider: user.provider,
      },
    }
  }
}
