import { Controller, Get, Put, Body } from '@nestjs/common';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

interface ProfileUser {
  id: bigint;
  name: string;
  email: string;
  phone?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
}

@Controller('profile')
export class ProfileController {
  @Get()
  getProfile(@CurrentUser() user: ProfileUser) {
    return {
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      isEmailVerified: user.isEmailVerified,
      isPhoneVerified: user.isPhoneVerified,
    };
  }

  @Put()
  updateProfile(@CurrentUser() _user: ProfileUser, @Body() _updateDto: Record<string, unknown>) {
    // TODO: Implement profile update logic
    return { message: 'Profile updated successfully' };
  }
}
