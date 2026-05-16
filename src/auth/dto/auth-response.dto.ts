import { TransformedPermission } from '../../common/utils/permission.util';

export class AuthResponseDto {
  accessToken!: string;
  refreshToken!: string;
  user!: {
    id: string;
    name?: string;
    email: string;
    role?: {
      id: string;
      name: string;
      permissions: Record<string, TransformedPermission[]>;
    };
    isEmailVerified: boolean;
    isPhoneVerified: boolean;
  };
}
