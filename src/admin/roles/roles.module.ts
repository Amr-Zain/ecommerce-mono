import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { PermissionsController } from './permissions.controller';
import { RolesModule as CoreRolesModule } from '@/core/roles/roles.module';

@Module({
  imports: [CoreRolesModule],
  controllers: [RolesController, PermissionsController],
  providers: [RolesService],
  exports: [RolesService],
})
export class RolesModule {}
