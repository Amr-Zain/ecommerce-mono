import { ApiProperty } from '@nestjs/swagger';
export class AuthResponseDto {
  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
    description: 'accessToken',
  })
  accessToken!: string;
  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
    description: 'refreshToken',
  })
  refreshToken!: string;
  @ApiProperty({ example: '42', description: 'Active refresh-token session id' })
  sessionId!: string;
  user!: {
    id: string;
    name?: string;
    email?: string;
    phone?: string;
    userType: string;
    role?: {
      id: string;
      name: string;
      permissions: Record<string, string[]>;
    };
    isEmailVerified: boolean;
    isPhoneVerified: boolean;
  };
}
