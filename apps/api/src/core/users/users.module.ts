import { Module } from '@nestjs/common';
import { USERS_REPOSITORY } from '@/common/interfaces';
import { UsersRepository } from './users.repository';
import { MediaModule } from '@/media/media.module';

@Module({
  imports: [MediaModule],
  providers: [
    {
      provide: USERS_REPOSITORY,
      useClass: UsersRepository,
    },
  ],
  exports: [USERS_REPOSITORY],
})
export class UsersModule {}
