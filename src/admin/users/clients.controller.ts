import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { UserQueryDto } from './dto/user-query.dto';
import { ParsedQuery } from '../../common/decorators/parsed-query.decorator';
import { RequirePermissions } from '../../auth/decorators/permissions.decorator';
import type { PaginatedResult } from '../../common/dto/pagination.dto';
import type { User } from './users.repository';

@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get()
  @RequirePermissions({ resource: 'clients', action: 'list' })
  async findAll(@ParsedQuery(UserQueryDto) query: UserQueryDto): Promise<PaginatedResult<User> | User[]> {
    return this.clientsService.findAll(query);
  }

  @Get(':id')
  @RequirePermissions({ resource: 'clients', action: 'read' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return this.clientsService.findOne(BigInt(id));
  }
}
