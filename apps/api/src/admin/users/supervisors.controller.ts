import { Controller, Get, Post, Patch, Param, Delete, ParseIntPipe, Body } from '@nestjs/common';
import { SupervisorsService } from './supervisors.service';
import { CreateSupervisorDto } from './dto/create-supervisor.dto';
import { UpdateSupervisorDto } from './dto/update-supervisor.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { ParsedQuery } from '@/common/decorators/parsed-query.decorator';
import { BodyOmitUndefined } from '@/common/decorators/omit-undefined.decorator';
import { RequirePermissions } from '@/auth/decorators/permissions.decorator';
import type { PaginatedResult } from '@/common/dto/pagination.dto';
import type { User as UserInterface } from '@/common/interfaces';
import { I18nLang, I18nService } from 'nestjs-i18n';
import { I18nTranslations } from '@/generated/i18n.generated';
import { ApiContext } from '@/common/decorators/api-context.decorator';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ApiAdvancedQuery } from '@/common/swagger/api-advanced-query.decorator';

@ApiContext('admin')
@ApiTags('Admin - Supervisors')
@ApiBearerAuth('access-token')
@Controller('supervisors')
export class SupervisorsController {
  constructor(
    private readonly supervisorsService: SupervisorsService,
    private readonly i18n: I18nService<I18nTranslations>,
  ) {}

  @Post()
  @RequirePermissions({ resource: 'supervisors', action: 'create' })
  async create(@Body() createDto: CreateSupervisorDto): Promise<UserInterface> {
    return this.supervisorsService.create(createDto);
  }

  @Get()
  @RequirePermissions({ resource: 'supervisors', action: 'list' })
  @ApiAdvancedQuery()
  async findAll(
    @ParsedQuery(UserQueryDto) query: UserQueryDto,
    @I18nLang() lang: string,
  ): Promise<PaginatedResult<UserInterface> | UserInterface[]> {
    return this.supervisorsService.findAll(query, lang);
  }

  @Get(':id')
  @RequirePermissions({ resource: 'supervisors', action: 'read' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<UserInterface> {
    return this.supervisorsService.findOne(BigInt(id));
  }

  @Patch(':id')
  @RequirePermissions({ resource: 'supervisors', action: 'update' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @BodyOmitUndefined() updateDto: UpdateSupervisorDto,
  ): Promise<UserInterface> {
    return this.supervisorsService.update(BigInt(id), updateDto);
  }

  @Delete(':id')
  @RequirePermissions({ resource: 'supervisors', action: 'delete' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<{ data: UserInterface; message: string }> {
    const user = await this.supervisorsService.remove(BigInt(id));
    return {
      data: user,
      message: this.i18n.t('common.deleted_successfully'),
    };
  }
}
