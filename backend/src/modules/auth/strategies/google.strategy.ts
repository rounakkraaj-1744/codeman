// Google OAuth strategy (equivalent to NextAuth Google provider)
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, type VerifyCallback } from "passport-google-oauth20";
import { Injectable } from "@nestjs/common";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:
        process.env.GOOGLE_CALLBACK_URL ||
        "http://localhost:3001/auth/google/callback",
      scope: ["profile", "email"],
    });
  }

  validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ) {
    const emails: string | undefined = profile.emails?.[0]?.value;
    const user = {
      provider: "google" as const,
      providerId: profile.id,
      name: profile.displayName,
      email: emails,
      avatarUrl: profile.photos?.[0]?.value,
    };
    done(null, user);
  }
}
