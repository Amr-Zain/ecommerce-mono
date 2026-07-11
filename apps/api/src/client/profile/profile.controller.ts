import { Body, Controller, Delete, Get, Param, Put, Query } from '@nestjs/common';
import { ApiContext } from '@/common/decorators/api-context.decorator';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { ProfileService } from './profile.service';
import { UpdateProfileDto, UpdateProfileImageDto } from './dto/profile.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiContext('client')
@ApiTags('Client - Profile')
@ApiBearerAuth('access-token')
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  getProfile(@CurrentUser() user: { id: bigint }) {
    return this.profileService.getProfile(user.id);
  }

  @Get('payment-sessions')
  getPaymentSessions(
    @CurrentUser() user: { id: bigint },
    @Query() query: { page?: string; limit?: string; type?: string; status?: string; product_id?: string },
  ) {
    return this.profileService.listPaymentSessions(user.id, query);
  }

  @Get('payment-sessions/:id')
  getPaymentSession(@CurrentUser() user: { id: bigint }, @Param('id') id: string) {
    return this.profileService.getPaymentSession(user.id, id);
  }

  @Get('sessions')
  getSessions(@CurrentUser() user: { id: bigint }) {
    return this.profileService.listSessions(user.id);
  }

  @Delete('sessions/:sessionId')
  revokeSession(@CurrentUser() user: { id: bigint }, @Param('sessionId') sessionId: string) {
    return this.profileService.revokeSession(user.id, BigInt(sessionId));
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
