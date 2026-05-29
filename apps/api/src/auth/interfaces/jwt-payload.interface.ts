export interface JwtPayload {
  sub: string; // User ID
  email?: string;
  phone?: string;
  role?: string;
  userType?: string;
  type: 'access' | 'refresh';
  jti?: string; // Token ID for refresh tokens
}
