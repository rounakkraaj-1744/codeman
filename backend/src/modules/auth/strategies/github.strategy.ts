// GitHub OAuth strategy (equivalent to NextAuth GitHub provider)
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-github2";
import { Injectable } from "@nestjs/common";

@Injectable()
export class GitHubStrategy extends PassportStrategy(Strategy, "github") {
  constructor() {
    super({
      clientID: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
      callbackURL:
        process.env.GITHUB_CALLBACK_URL ||
        "http://localhost:3001/auth/github/callback",
      scope: ["user:email"],
    });
  }

  validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: (err: any, user?: any) => void,
  ) {
    const emails: string | undefined = profile.emails?.[0]?.value;
    const user = {
      provider: "github" as const,
      providerId: profile.id,
      name: profile.displayName || profile.username,
      email: emails,
      avatarUrl: profile.photos?.[0]?.value,
    };
    done(null, user);
  }
}
