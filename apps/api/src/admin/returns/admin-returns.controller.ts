import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiContext } from '@/common/decorators/api-context.decorator';
import { RequirePermissions } from '@/auth/decorators/permissions.decorator';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { AuthUserPayload } from '@/auth/auth.service';
import { ParsedQuery } from '@/common/decorators/parsed-query.decorator';
import { AdminReturnsService } from './admin-returns.service';
import {
  AdminExchangePaymentDto,
  AdminReceiveExchangeDto,
  AdminReceiveReturnDto,
  AdminRejectRequestDto,
  AdminReturnRefundDto,
  AdminVerifyExchangePaymentDto,
  AdminReturnExchangeQueryDto,
} from './dto/admin-return-exchange.dto';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ApiAdvancedQuery } from '@/common/swagger/api-advanced-query.decorator';

@ApiContext('admin')
@ApiTags('Admin - Returns')
@ApiBearerAuth('access-token')
@Controller()
export class AdminReturnsController {
  constructor(private readonly returnsService: AdminReturnsService) {}

  @Get('returns')
  @RequirePermissions({ resource: 'returns', action: 'list' })
  @ApiAdvancedQuery()
  @ApiQuery({ name: 'status', required: false, example: 'requested', description: 'Filter by return status' })
  findReturns(@ParsedQuery(AdminReturnExchangeQueryDto) query: AdminReturnExchangeQueryDto) {
    return this.returnsService.findReturns(query);
  }

  @Get('returns/:id')
  @RequirePermissions({ resource: 'returns', action: 'read' })
  findReturn(@Param('id') id: string) {
    return this.returnsService.findReturn(BigInt(id));
  }

  @Post('returns/:id/approve')
  @RequirePermissions({ resource: 'returns', action: 'update' })
  approveReturn(@Param('id') id: string, @CurrentUser() user: AuthUserPayload) {
    return this.returnsService.approveReturn(BigInt(id), user.id);
  }

  @Post('returns/:id/reject')
  @RequirePermissions({ resource: 'returns', action: 'update' })
  rejectReturn(@Param('id') id: string, @Body() dto: AdminRejectRequestDto, @CurrentUser() user: AuthUserPayload) {
    return this.returnsService.rejectReturn(BigInt(id), dto, user.id);
  }

  @Post('returns/:id/receive')
  @RequirePermissions({ resource: 'returns', action: 'update' })
  receiveReturn(@Param('id') id: string, @Body() dto: AdminReceiveReturnDto, @CurrentUser() user: AuthUserPayload) {
    return this.returnsService.receiveReturn(BigInt(id), dto, user.id);
  }

  @Post('returns/:id/refund')
  @RequirePermissions({ resource: 'returns', action: 'update' })
  refundReturn(@Param('id') id: string, @Body() dto: AdminReturnRefundDto, @CurrentUser() user: AuthUserPayload) {
    return this.returnsService.refundReturn(BigInt(id), dto, user.id);
  }

  @Post('returns/:id/complete')
  @RequirePermissions({ resource: 'returns', action: 'update' })
  completeReturn(@Param('id') id: string, @CurrentUser() user: AuthUserPayload) {
    return this.returnsService.completeReturn(BigInt(id), user.id);
  }

  @Get('exchanges')
  @RequirePermissions({ resource: 'exchanges', action: 'list' })
  @ApiAdvancedQuery()
  @ApiQuery({ name: 'status', required: false, example: 'requested', description: 'Filter by exchange status' })
  findExchanges(@ParsedQuery(AdminReturnExchangeQueryDto) query: AdminReturnExchangeQueryDto) {
    return this.returnsService.findExchanges(query);
  }

  @Get('exchanges/:id')
  @RequirePermissions({ resource: 'exchanges', action: 'read' })
  findExchange(@Param('id') id: string) {
    return this.returnsService.findExchange(BigInt(id));
  }

  @Post('exchanges/:id/approve')
  @RequirePermissions({ resource: 'exchanges', action: 'update' })
  approveExchange(@Param('id') id: string, @CurrentUser() user: AuthUserPayload) {
    return this.returnsService.approveExchange(BigInt(id), user.id);
  }

  @Post('exchanges/:id/retry-reservation')
  @RequirePermissions({ resource: 'exchanges', action: 'update' })
  retryExchangeReservation(@Param('id') id: string, @CurrentUser() user: AuthUserPayload) {
    return this.returnsService.retryExchangeReservation(BigInt(id), user.id);
  }

  @Post('exchanges/release-expired')
  @RequirePermissions({ resource: 'exchanges', action: 'update' })
  releaseExpiredExchangeReservations(@CurrentUser() user: AuthUserPayload) {
    return this.returnsService.releaseExpiredExchangeReservations(user.id);
  }

  @Post('exchanges/:id/reject')
  @RequirePermissions({ resource: 'exchanges', action: 'update' })
  rejectExchange(@Param('id') id: string, @Body() dto: AdminRejectRequestDto, @CurrentUser() user: AuthUserPayload) {
    return this.returnsService.rejectExchange(BigInt(id), dto, user.id);
  }

  @Post('exchanges/:id/receive')
  @RequirePermissions({ resource: 'exchanges', action: 'update' })
  receiveExchange(@Param('id') id: string, @Body() dto: AdminReceiveExchangeDto, @CurrentUser() user: AuthUserPayload) {
    return this.returnsService.receiveExchange(BigInt(id), dto, user.id);
  }

  @Post('exchanges/:id/payment')
  @RequirePermissions({ resource: 'exchanges', action: 'update' })
  createExchangePayment(
    @Param('id') id: string,
    @Body() dto: AdminExchangePaymentDto,
    @CurrentUser() user: AuthUserPayload,
  ) {
    return this.returnsService.createExchangePayment(BigInt(id), dto, user.id);
  }

  @Post('exchanges/:id/verify-payment')
  @RequirePermissions({ resource: 'exchanges', action: 'update' })
  verifyExchangePayment(
    @Param('id') id: string,
    @Body() dto: AdminVerifyExchangePaymentDto,
    @CurrentUser() user: AuthUserPayload,
  ) {
    return this.returnsService.verifyExchangePayment(BigInt(id), dto, user.id);
  }

  @Post('exchanges/:id/refund-difference')
  @RequirePermissions({ resource: 'exchanges', action: 'update' })
  refundExchangeDifference(
    @Param('id') id: string,
    @Body() dto: AdminReturnRefundDto,
    @CurrentUser() user: AuthUserPayload,
  ) {
    return this.returnsService.refundExchangeDifference(BigInt(id), dto, user.id);
  }

  @Post('exchanges/:id/waive-adjustment')
  @RequirePermissions({ resource: 'exchanges', action: 'update' })
  waiveExchangeAdjustment(
    @Param('id') id: string,
    @Body() dto: AdminRejectRequestDto,
    @CurrentUser() user: AuthUserPayload,
  ) {
    return this.returnsService.waiveExchangeAdjustment(BigInt(id), dto, user.id);
  }

  @Post('exchanges/:id/ship')
  @RequirePermissions({ resource: 'exchanges', action: 'update' })
  shipExchange(@Param('id') id: string, @CurrentUser() user: AuthUserPayload) {
    return this.returnsService.shipExchange(BigInt(id), user.id);
  }

  @Post('exchanges/:id/complete')
  @RequirePermissions({ resource: 'exchanges', action: 'update' })
  completeExchange(@Param('id') id: string, @CurrentUser() user: AuthUserPayload) {
    return this.returnsService.completeExchange(BigInt(id), user.id);
  }
}
