import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { UsersModule as CoreUsersModule } from '@/core/users/users.module';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  imports: [CoreUsersModule, PrismaModule],
  controllers: [ProfileController],
  providers: [ProfileService],
})
export class ProfileModule {}