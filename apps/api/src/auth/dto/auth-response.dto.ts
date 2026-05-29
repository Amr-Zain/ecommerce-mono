export class AuthResponseDto {
  accessToken!: string;
  refreshToken!: string;
  user!: {
    id: string;
    name?: string;
    email?: string;
    phone?: string;
    guestToken?: string;
    role?: {
      id: string;
      name: string;
      permissions: Record<string, string[]>;
    };
    isEmailVerified: boolean;
    isPhoneVerified: boolean;
  };
}
