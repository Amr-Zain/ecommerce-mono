import { Module } from '@nestjs/common';
import { ROLES_REPOSITORY } from '@/common/interfaces';
import { RolesRepository } from './roles.repository';

@Module({
  providers: [
    {
      provide: ROLES_REPOSITORY,
      useClass: RolesRepository,
    },
  ],
  exports: [ROLES_REPOSITORY],
})
export class RolesModule {}
