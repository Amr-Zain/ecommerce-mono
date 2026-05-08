import { Controller, Get, Put, Body } from '@nestjs/common';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@Controller('profile')
export class ProfileController {
    @Get()
    getProfile(@CurrentUser() user: any) {
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
    updateProfile(@CurrentUser() user: any, @Body() updateDto: any) {
        // TODO: Implement profile update logic
        return { message: 'Profile updated successfully' };
    }
}
