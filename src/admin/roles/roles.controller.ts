import { Controller, Get, Post, Patch, Param, Delete, ParseIntPipe, Body } from '@nestjs/common';
import { RolesService, TransformedRole } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AdvancedQueryDto } from '../../common/dto/advanced-query.dto';
import { ParsedQuery } from '../../common/decorators/parsed-query.decorator';
import { BodyOmitUndefined } from '../../common/decorators/omit-undefined.decorator';
import { RequirePermissions } from '../../auth/decorators/permissions.decorator';
import { I18nService } from 'nestjs-i18n';
import { I18nTranslations } from '../../generated/i18n.generated';
import type { PaginatedResult } from '../../common/dto/pagination.dto';

@Controller('roles')
export class RolesController {
  constructor(
    private readonly rolesService: RolesService,
    private readonly i18n: I18nService<I18nTranslations>,
  ) {}

  @Post()
  @RequirePermissions({ resource: 'roles', action: 'create' })
  async create(@Body() createRoleDto: CreateRoleDto): Promise<TransformedRole> {
    return this.rolesService.create(createRoleDto);
  }

  @Get()
  @RequirePermissions({ resource: 'roles', action: 'list' })
  async findAll(
    @ParsedQuery(AdvancedQueryDto) query: AdvancedQueryDto,
  ): Promise<PaginatedResult<TransformedRole> | TransformedRole[]> {
    return this.rolesService.findAll(query);
  }

  @Get(':id')
  @RequirePermissions({ resource: 'roles', action: 'read' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<TransformedRole> {
    return this.rolesService.findOne(BigInt(id));
  }

  @Patch(':id')
  @RequirePermissions({ resource: 'roles', action: 'update' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @BodyOmitUndefined() updateRoleDto: UpdateRoleDto,
  ): Promise<TransformedRole> {
    return this.rolesService.update(BigInt(id), updateRoleDto);
  }

  @Delete(':id')
  @RequirePermissions({ resource: 'roles', action: 'delete' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<{ data: TransformedRole; message: string }> {
    const role = await this.rolesService.remove(BigInt(id));
    return {
      data: role,
      message: this.i18n.t('common.deleted_successfully'),
    };
  }
}
