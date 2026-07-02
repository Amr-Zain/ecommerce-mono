import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiContext } from '@/common/decorators/api-context.decorator';
import { ParsedQuery } from '@/common/decorators/parsed-query.decorator';
import { UseLanguageTransform } from '@/common/decorators/transform-language-keys.decorator';
import { RequirePermissions } from '@/auth/decorators/permissions.decorator';
import { AdvancedQueryDto } from '@/common/dto/advanced-query.dto';
import { ApiAdvancedQuery } from '@/common/swagger/api-advanced-query.decorator';
import { LoyaltyService } from '@/shared/loyalty/loyalty.service';
import { CreateEarningRuleDto, UpdateEarningRuleDto } from '@/shared/loyalty/dto/loyalty.dto';

@ApiContext('admin')
@ApiTags('Admin - Earning Rules')
@ApiBearerAuth('access-token')
@Controller('earning-rules')
export class AdminEarningRulesController {
  constructor(private readonly loyalty: LoyaltyService) {}

  @Get()
  @RequirePermissions({ resource: 'earning-rules', action: 'list' })
  @ApiAdvancedQuery()
  findAll(@ParsedQuery(AdvancedQueryDto) query: AdvancedQueryDto) {
    return this.loyalty.listEarningRules(query);
  }

  @Get(':id')
  @RequirePermissions({ resource: 'earning-rules', action: 'read' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.loyalty.getEarningRule(BigInt(id));
  }

  @Post()
  @RequirePermissions({ resource: 'earning-rules', action: 'create' })
  @UseLanguageTransform()
  create(@Body() dto: CreateEarningRuleDto) {
    return this.loyalty.createEarningRule(dto);
  }

  @Patch(':id')
  @RequirePermissions({ resource: 'earning-rules', action: 'update' })
  @UseLanguageTransform()
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateEarningRuleDto) {
    return this.loyalty.updateEarningRule(BigInt(id), dto);
  }

  @Delete(':id')
  @RequirePermissions({ resource: 'earning-rules', action: 'delete' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.loyalty.deleteEarningRule(BigInt(id));
  }
}
