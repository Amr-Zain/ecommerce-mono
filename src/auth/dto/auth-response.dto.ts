export class AuthResponseDto {
    accessToken!: string;
    refreshToken!: string;
    user!: {
        id: string;
        name: string;
        email: string;
        role?: {
            id: string;
            nameEn: string;
            nameAr: string;
        };
        isEmailVerified: boolean;
        isPhoneVerified: boolean;
    };
}
