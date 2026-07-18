import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { ProfileQueryRepository } from './profile-query.repository';
import { UsersModule as CoreUsersModule } from '@/core/users/users.module';
import { RefreshTokensRepository } from '@/auth/repositories/refresh-tokens.repository';

@Module({
  imports: [CoreUsersModule],
  controllers: [ProfileController],
  providers: [ProfileService, ProfileQueryRepository, RefreshTokensRepository],
})
export class ProfileModule {}
