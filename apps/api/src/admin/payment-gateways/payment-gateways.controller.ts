import { Body, Controller, Get, Param, ParseIntPipe, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiContext } from '@/common/decorators/api-context.decorator';
import { RequirePermissions } from '@/auth/decorators/permissions.decorator';
import { PaymentGatewayService } from '@/shared/payment/payment-gateway.service';

@ApiContext('admin')
@ApiTags('Admin - Payment Gateways')
@ApiBearerAuth('access-token')
@Controller('payment-gateways')
export class PaymentGatewaysController {
  constructor(private readonly paymentGateways: PaymentGatewayService) {}

  @Get()
  @RequirePermissions({ resource: 'payment-gateways', action: 'list' })
  findAll() {
    return this.paymentGateways.listAdmin();
  }

  @Get(':id')
  @RequirePermissions({ resource: 'payment-gateways', action: 'read' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.paymentGateways.getAdmin(BigInt(id));
  }

  @Patch(':id')
  @RequirePermissions({ resource: 'payment-gateways', action: 'update' })
  update(@Param('id', ParseIntPipe) id: number, @Body() payload: Record<string, unknown>) {
    return this.paymentGateways.updateAdmin(BigInt(id), payload);
  }
}
