import { Controller, Get, Post, Patch, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { ApiContext } from '@/common/decorators/api-context.decorator';
import { AdminCouponsService } from './admin-coupons.service';
import { CreateCouponDto, UpdateCouponDto } from './dto/coupon.dto';
import { AdvancedQueryDto } from '@/common/dto/advanced-query.dto';
import { ParsedQuery } from '@/common/decorators/parsed-query.decorator';
import { UseLanguageTransform } from '@/common/decorators/transform-language-keys.decorator';
import { RequirePermissions } from '@/auth/decorators/permissions.decorator';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ApiAdvancedQuery } from '@/common/swagger/api-advanced-query.decorator';

@ApiContext('admin')
@ApiTags('Admin - Coupons')
@ApiBearerAuth('access-token')
@Controller('coupons')
export class AdminCouponsController {
  constructor(private readonly couponsService: AdminCouponsService) {}

  @Get()
  @RequirePermissions({ resource: 'coupons', action: 'list' })
  @ApiAdvancedQuery()
  findAll(@ParsedQuery(AdvancedQueryDto) query: AdvancedQueryDto) {
    return this.couponsService.findAll(query);
  }

  @Get(':id')
  @RequirePermissions({ resource: 'coupons', action: 'read' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.couponsService.findOne(BigInt(id));
  }

  @Post()
  @RequirePermissions({ resource: 'coupons', action: 'create' })
  @UseLanguageTransform()
  create(@Body() dto: CreateCouponDto) {
    return this.couponsService.create(dto);
  }

  @Patch(':id')
  @RequirePermissions({ resource: 'coupons', action: 'update' })
  @UseLanguageTransform()
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCouponDto) {
    return this.couponsService.update(BigInt(id), dto);
  }

  @Delete(':id')
  @RequirePermissions({ resource: 'coupons', action: 'delete' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.couponsService.remove(BigInt(id));
  }
}
