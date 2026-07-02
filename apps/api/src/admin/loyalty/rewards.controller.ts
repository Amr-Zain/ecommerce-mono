import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiContext } from '@/common/decorators/api-context.decorator';
import { ParsedQuery } from '@/common/decorators/parsed-query.decorator';
import { UseLanguageTransform } from '@/common/decorators/transform-language-keys.decorator';
import { RequirePermissions } from '@/auth/decorators/permissions.decorator';
import { AdvancedQueryDto } from '@/common/dto/advanced-query.dto';
import { ApiAdvancedQuery } from '@/common/swagger/api-advanced-query.decorator';
import { LoyaltyService } from '@/shared/loyalty/loyalty.service';
import { CreateRewardDto, UpdateRewardDto } from '@/shared/loyalty/dto/loyalty.dto';

@ApiContext('admin')
@ApiTags('Admin - Rewards')
@ApiBearerAuth('access-token')
@Controller('rewards')
export class AdminRewardsController {
  constructor(private readonly loyalty: LoyaltyService) {}

  @Get()
  @RequirePermissions({ resource: 'rewards', action: 'list' })
  @ApiAdvancedQuery()
  findAll(@ParsedQuery(AdvancedQueryDto) query: AdvancedQueryDto) {
    return this.loyalty.listRewards(query);
  }

  @Get(':id')
  @RequirePermissions({ resource: 'rewards', action: 'read' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.loyalty.getReward(BigInt(id));
  }

  @Post()
  @RequirePermissions({ resource: 'rewards', action: 'create' })
  @UseLanguageTransform()
  create(@Body() dto: CreateRewardDto) {
    return this.loyalty.createReward(dto);
  }

  @Patch(':id')
  @RequirePermissions({ resource: 'rewards', action: 'update' })
  @UseLanguageTransform()
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRewardDto) {
    return this.loyalty.updateReward(BigInt(id), dto);
  }

  @Delete(':id')
  @RequirePermissions({ resource: 'rewards', action: 'delete' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.loyalty.deleteReward(BigInt(id));
  }
}
