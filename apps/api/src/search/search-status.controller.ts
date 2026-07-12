import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '@/auth/decorators/permissions.decorator';
import { PrismaService } from '@/prisma/prisma.service';
import { SearchIndexService } from './search-index.service';

@ApiTags('Admin - Search')
@ApiBearerAuth('access-token')
@Controller('search')
export class SearchStatusController {
  constructor(
    private readonly index: SearchIndexService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('status')
  @RequirePermissions({ resource: 'products', action: 'list' })
  async status() {
    const [search, pending, failed] = await Promise.all([
      this.index.status(),
      this.prisma.outboxEvent.count({ where: { eventName: 'catalog.entity_changed', status: 'pending' } }),
      this.prisma.outboxEvent.count({ where: { eventName: 'catalog.entity_changed', status: 'failed' } }),
    ]);
    return { ...search, events: { pending, failed } };
  }
}
