import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiContext } from '@/common/decorators/api-context.decorator';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { AdvancedQueryDto } from '@/common/dto/advanced-query.dto';
import { WalletService } from '@/shared/wallet/wallet.service';
import { CreateWalletDepositDto, CreateWalletWithdrawalDto } from '@/shared/wallet/dto/wallet.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiContext('client')
@ApiTags('Client - Wallet')
@ApiBearerAuth('access-token')
@Controller('wallet')
export class ClientWalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  getWallet(@CurrentUser() user: { id: bigint }) {
    return this.walletService.getClientWallet(user.id);
  }

  @Get('transactions')
  getTransactions(@CurrentUser() user: { id: bigint }, @Query() query: AdvancedQueryDto) {
    return this.walletService.listClientTransactions(user.id, query);
  }

  @Post('deposits')
  createDeposit(@CurrentUser() user: { id: bigint }, @Body() dto: CreateWalletDepositDto) {
    return this.walletService.createDeposit(user.id, dto);
  }

  @Get('deposits/:id')
  getDeposit(@CurrentUser() user: { id: bigint }, @Param('id') id: string) {
    return this.walletService.getClientDeposit(user.id, BigInt(id));
  }

  @Post('deposits/:id/verify')
  verifyDeposit(@CurrentUser() user: { id: bigint }, @Param('id') id: string) {
    return this.walletService.verifyClientDeposit(user.id, BigInt(id));
  }

  @Get('withdrawals')
  getWithdrawals(@CurrentUser() user: { id: bigint }, @Query() query: AdvancedQueryDto) {
    return this.walletService.listClientWithdrawals(user.id, query);
  }

  @Post('withdrawals')
  createWithdrawal(@CurrentUser() user: { id: bigint }, @Body() dto: CreateWalletWithdrawalDto) {
    return this.walletService.createWithdrawal(user.id, dto);
  }

  @Get('withdrawals/:id')
  getWithdrawal(@CurrentUser() user: { id: bigint }, @Param('id') id: string) {
    return this.walletService.getClientWithdrawal(user.id, BigInt(id));
  }

  @Post('withdrawals/:id/cancel')
  cancelWithdrawal(@CurrentUser() user: { id: bigint }, @Param('id') id: string) {
    return this.walletService.cancelClientWithdrawal(user.id, BigInt(id));
  }
}
