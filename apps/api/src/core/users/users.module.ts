import { Module } from '@nestjs/common';
import { USERS_REPOSITORY } from '@/common/interfaces';
import { UsersRepository } from './users.repository';
import { GuestMigrationRepository } from './guest-migration.repository';
import { MediaModule } from '@/media/media.module';

@Module({
  imports: [MediaModule],
  providers: [
    GuestMigrationRepository,
    {
      provide: USERS_REPOSITORY,
      useClass: UsersRepository,
    },
  ],
  exports: [USERS_REPOSITORY, GuestMigrationRepository],
})
export class UsersModule {}
