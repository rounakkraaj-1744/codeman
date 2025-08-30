export class AuthResponseDto {
  success: boolean;
  accessToken: string;
  user: {
    id: string;
    name?: string;
    email?: string;
    avatarUrl?: string;
    provider: "github" | "google";
  };
}
