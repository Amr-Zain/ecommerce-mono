import { Controller, Get, Put, Body } from '@nestjs/common';
import { ApiContext } from '@/common/decorators/api-context.decorator';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { ProfileService } from './profile.service';
import { UpdateProfileDto, UpdateProfileImageDto } from './dto/profile.dto';

@ApiContext('client')
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  getProfile(@CurrentUser() user: { id: bigint }) {
    return this.profileService.getProfile(user.id);
  }

  @Put()
  updateProfile(@CurrentUser() user: { id: bigint }, @Body() dto: UpdateProfileDto) {
    return this.profileService.updateProfile(user.id, dto);
  }

  @Put('image')
  updateImage(@CurrentUser() user: { id: bigint }, @Body() dto: UpdateProfileImageDto) {
    return this.profileService.updateImage(user.id, dto);
  }
}