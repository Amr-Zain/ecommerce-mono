import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiContext } from '@/common/decorators/api-context.decorator';
import { RequirePermissions } from '@/auth/decorators/permissions.decorator';
import { AdvancedQueryDto } from '@/common/dto/advanced-query.dto';
import { WalletService } from '@/shared/wallet/wallet.service';
import { AdminMarkWithdrawalPaidDto, AdminWithdrawalActionDto } from '@/shared/wallet/dto/wallet.dto';

@ApiContext('admin')
@Controller()
export class AdminWalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get('wallets')
  @RequirePermissions({ resource: 'wallets', action: 'list' })
  listWallets(@Query() query: AdvancedQueryDto) {
    return this.walletService.listAdminWallets(query);
  }

  @Get('wallets/:id')
  @RequirePermissions({ resource: 'wallets', action: 'read' })
  getWallet(@Param('id') id: string) {
    return this.walletService.getAdminWallet(BigInt(id));
  }

  @Get('wallet-transactions')
  @RequirePermissions({ resource: 'wallet-transactions', action: 'list' })
  listTransactions(@Query() query: AdvancedQueryDto) {
    return this.walletService.listAdminTransactions(query);
  }

  @Get('wallet-withdrawals')
  @RequirePermissions({ resource: 'wallet-withdrawals', action: 'list' })
  listWithdrawals(@Query() query: AdvancedQueryDto) {
    return this.walletService.listAdminWithdrawals(query);
  }

  @Get('wallet-withdrawals/:id')
  @RequirePermissions({ resource: 'wallet-withdrawals', action: 'read' })
  getWithdrawal(@Param('id') id: string) {
    return this.walletService.getAdminWithdrawal(BigInt(id));
  }

  @Post('wallet-withdrawals/:id/approve')
  @RequirePermissions({ resource: 'wallet-withdrawals', action: 'update' })
  approveWithdrawal(@Param('id') id: string, @Body() dto: AdminWithdrawalActionDto) {
    return this.walletService.approveWithdrawal(BigInt(id), dto);
  }

  @Post('wallet-withdrawals/:id/paid')
  @RequirePermissions({ resource: 'wallet-withdrawals', action: 'update' })
  markWithdrawalPaid(@Param('id') id: string, @Body() dto: AdminMarkWithdrawalPaidDto) {
    return this.walletService.markWithdrawalPaid(BigInt(id), dto);
  }

  @Post('wallet-withdrawals/:id/reject')
  @RequirePermissions({ resource: 'wallet-withdrawals', action: 'update' })
  rejectWithdrawal(@Param('id') id: string, @Body() dto: AdminWithdrawalActionDto) {
    return this.walletService.rejectWithdrawal(BigInt(id), dto);
  }

  @Post('wallet-withdrawals/:id/fail')
  @RequirePermissions({ resource: 'wallet-withdrawals', action: 'update' })
  failWithdrawal(@Param('id') id: string, @Body() dto: AdminWithdrawalActionDto) {
    return this.walletService.failWithdrawal(BigInt(id), dto);
  }
}
