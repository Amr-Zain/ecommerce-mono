import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiContext } from '@/common/decorators/api-context.decorator';
import { RequirePermissions } from '@/auth/decorators/permissions.decorator';
import { PaymentGatewayService } from '@/shared/payment/payment-gateway.service';
import { ParsedQuery } from '@/common/decorators/parsed-query.decorator';
import { AdvancedQueryDto } from '@/common/dto/advanced-query.dto';
import { ApiAdvancedQuery } from '@/common/swagger/api-advanced-query.decorator';

@ApiContext('admin')
@ApiTags('Admin - Payment Sessions')
@ApiBearerAuth('access-token')
@Controller('payment-sessions')
export class PaymentSessionsController {
  constructor(private readonly paymentGateways: PaymentGatewayService) {}

  @Get()
  @RequirePermissions({ resource: 'payment-sessions', action: 'list' })
  @ApiAdvancedQuery()
  findAll(@ParsedQuery(AdvancedQueryDto) query: AdvancedQueryDto) {
    return this.paymentGateways.listSessionsAdmin(query);
  }

  @Get(':id')
  @RequirePermissions({ resource: 'payment-sessions', action: 'read' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.paymentGateways.getSessionAdmin(BigInt(id));
  }
}
