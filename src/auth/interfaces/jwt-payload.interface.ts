export interface JwtPayload {
    sub: string; // User ID
    email: string;
    role?: string;
    type: 'access' | 'refresh';
    jti?: string; // Token ID for refresh tokens
}
