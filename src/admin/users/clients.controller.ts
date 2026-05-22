import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { UserQueryDto } from './dto/user-query.dto';
import { ParsedQuery } from '../../common/decorators/parsed-query.decorator';
import { RequirePermissions } from '../../auth/decorators/permissions.decorator';
import { I18nLang } from 'nestjs-i18n';
import type { PaginatedResult } from '../../common/dto/pagination.dto';
import type { User as UserInterface } from '@/common/interfaces';
import { ApiContext } from '@/common/decorators/api-context.decorator';

@ApiContext('admin')
@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get()
  @RequirePermissions({ resource: 'clients', action: 'list' })
  async findAll(
    @ParsedQuery(UserQueryDto) query: UserQueryDto,
    @I18nLang() lang: string,
  ): Promise<PaginatedResult<UserInterface> | UserInterface[]> {
    return this.clientsService.findAll(query, lang);
  }

  @Get(':id')
  @RequirePermissions({ resource: 'clients', action: 'read' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<UserInterface> {
    return this.clientsService.findOne(BigInt(id));
  }
}
