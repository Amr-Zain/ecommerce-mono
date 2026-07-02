import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiContext } from '@/common/decorators/api-context.decorator';
import { ParsedQuery } from '@/common/decorators/parsed-query.decorator';
import { UseLanguageTransform } from '@/common/decorators/transform-language-keys.decorator';
import { RequirePermissions } from '@/auth/decorators/permissions.decorator';
import { AdvancedQueryDto } from '@/common/dto/advanced-query.dto';
import { ApiAdvancedQuery } from '@/common/swagger/api-advanced-query.decorator';
import { LoyaltyService } from '@/shared/loyalty/loyalty.service';
import { CreateTierDto, UpdateTierDto } from '@/shared/loyalty/dto/loyalty.dto';

@ApiContext('admin')
@ApiTags('Admin - Tiers')
@ApiBearerAuth('access-token')
@Controller('tiers')
export class AdminTiersController {
  constructor(private readonly loyalty: LoyaltyService) {}

  @Get()
  @RequirePermissions({ resource: 'tiers', action: 'list' })
  @ApiAdvancedQuery()
  findAll(@ParsedQuery(AdvancedQueryDto) query: AdvancedQueryDto) {
    return this.loyalty.listTiers(query);
  }

  @Get(':id')
  @RequirePermissions({ resource: 'tiers', action: 'read' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.loyalty.getTier(BigInt(id));
  }

  @Post()
  @RequirePermissions({ resource: 'tiers', action: 'create' })
  @UseLanguageTransform()
  create(@Body() dto: CreateTierDto) {
    return this.loyalty.createTier(dto);
  }

  @Patch(':id')
  @RequirePermissions({ resource: 'tiers', action: 'update' })
  @UseLanguageTransform()
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTierDto) {
    return this.loyalty.updateTier(BigInt(id), dto);
  }

  @Delete(':id')
  @RequirePermissions({ resource: 'tiers', action: 'delete' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.loyalty.deleteTier(BigInt(id));
  }
}
