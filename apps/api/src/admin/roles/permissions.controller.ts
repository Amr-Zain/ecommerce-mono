import { Controller, Get } from '@nestjs/common';
import { RequirePermissions } from '../../auth/decorators/permissions.decorator';
import { ApiContext } from '@/common/decorators/api-context.decorator';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

import { RolesService } from './roles.service';

@ApiContext('admin')
@ApiTags('Admin - Permissions')
@ApiBearerAuth('access-token')
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly roles: RolesService) {}

  @Get()
  @RequirePermissions({ resource: 'roles', action: 'read' })
  async findAll(): Promise<Record<string, unknown>> {
    return this.roles.findAllPermissions();
  }
}
