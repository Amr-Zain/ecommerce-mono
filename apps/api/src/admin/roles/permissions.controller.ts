import { Controller, Get } from '@nestjs/common';
import { RequirePermissions } from '../../auth/decorators/permissions.decorator';
import { ApiContext } from '@/common/decorators/api-context.decorator';

import { PrismaService } from '../../prisma';
import { RawPermission } from '../../common/utils/permission.util';

@ApiContext('admin')
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @RequirePermissions({ resource: 'roles', action: 'read' })
  async findAll(): Promise<Record<string, unknown>> {
    const permissions = (await this.prisma.permission.findMany({
      distinct: ['resource', 'action'],
      select: {
        id: true,
        resource: true,
        action: true,
      },
    })) as RawPermission[];

    const categorized: Record<string, { id: string; title: string }[]> = {};

    permissions.forEach((p: RawPermission) => {
      if (!categorized[p.resource]) {
        categorized[p.resource] = [];
      }

      const action = p.action;
      const resource = p.resource;

      const title =
        action.charAt(0).toUpperCase() + action.slice(1) + ' ' + resource.charAt(0).toUpperCase() + resource.slice(1);

      categorized[p.resource].push({
        id: p.id.toString(),
        title,
      });
    });

    return {
      status: 'success',
      message: 'Permissions retrieved successfully.',
      data: categorized,
    };
  }
}
