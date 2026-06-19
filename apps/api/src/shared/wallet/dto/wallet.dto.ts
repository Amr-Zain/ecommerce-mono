import { Type } from 'class-transformer';
import { IsIn, IsNumber, IsObject, IsOptional, IsString, Min } from 'class-validator';
import { PaginationDto } from '@/common/dto/pagination.dto';
import {
  WALLET_TRANSACTION_DIRECTIONS,
  WALLET_TRANSACTION_STATUSES,
  WALLET_TRANSACTION_TYPES,
  WALLET_WITHDRAWAL_METHODS,
  WALLET_WITHDRAWAL_STATUSES,
} from '@/common/constants/wallet.constants';
import { PAYMENT_METHODS } from '@/shared/payment/payment.constants';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateWalletDepositDto {
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @ApiProperty({ example: 5, description: 'amount' })
  amount!: number;

  @IsIn([PAYMENT_METHODS.stripeCheckout, PAYMENT_METHODS.stripeIntent])
  @ApiProperty({ example: "stripe_checkout", description: 'paymentMethod' })
  paymentMethod!: string;
}

export class CreateWalletWithdrawalDto {
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @ApiProperty({ example: 5, description: 'amount' })
  amount!: number;

  @IsIn(Object.values(WALLET_WITHDRAWAL_METHODS))
  @ApiProperty({ example: "bank_transfer", description: 'method' })
  method!: string;

  @IsObject()
  @ApiProperty({ example: {}, description: 'details' })
  details!: Record<string, unknown>;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: "Approved for manual bank transfer", description: 'note' })
  note?: string;
}

export class WalletTransactionQueryDto extends PaginationDto {
  @IsOptional()
  @IsIn(Object.values(WALLET_TRANSACTION_TYPES))
  @ApiPropertyOptional({ example: "deposit", description: 'type' })
  type?: string;

  @IsOptional()
  @IsIn(Object.values(WALLET_TRANSACTION_DIRECTIONS))
  @ApiPropertyOptional({ example: "credit", description: 'direction' })
  direction?: string;

  @IsOptional()
  @IsIn(Object.values(WALLET_TRANSACTION_STATUSES))
  @ApiPropertyOptional({ example: "completed", description: 'status' })
  status?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: "order", description: 'referenceType' })
  referenceType?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: "1", description: 'referenceId' })
  referenceId?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: "stripe_checkout", description: 'paymentMethod' })
  paymentMethod?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: "pi_1234567890", description: 'transactionRef' })
  transactionRef?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @ApiPropertyOptional({ example: 1, description: 'minAmount' })
  minAmount?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @ApiPropertyOptional({ example: 1, description: 'maxAmount' })
  maxAmount?: number;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: "2026-06-01", description: 'dateFrom' })
  dateFrom?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: "2026-06-30", description: 'dateTo' })
  dateTo?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: "createdAt:desc", description: 'sort' })
  sort?: string;
}

export class AdminWalletTransactionQueryDto extends WalletTransactionQueryDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: "1", description: 'userId' })
  userId?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: "1", description: 'walletId' })
  walletId?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: "customer@example.com", description: 'userEmail' })
  userEmail?: string;
}

export class WalletWithdrawalQueryDto extends PaginationDto {
  @IsOptional()
  @IsIn(Object.values(WALLET_WITHDRAWAL_STATUSES))
  @ApiPropertyOptional({ example: "requested", description: 'status' })
  status?: string;

  @IsOptional()
  @IsIn(Object.values(WALLET_WITHDRAWAL_METHODS))
  @ApiPropertyOptional({ example: "bank_transfer", description: 'method' })
  method?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: "2026-06-01", description: 'dateFrom' })
  dateFrom?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: "2026-06-30", description: 'dateTo' })
  dateTo?: string;
}

export class AdminWalletWithdrawalQueryDto extends WalletWithdrawalQueryDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: "1", description: 'userId' })
  userId?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: "1", description: 'walletId' })
  walletId?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: "customer@example.com", description: 'userEmail' })
  userEmail?: string;
}

export class AdminWalletListQueryDto extends PaginationDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: "1", description: 'userId' })
  userId?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: "customer@example.com", description: 'userEmail' })
  userEmail?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: "active", description: 'status' })
  status?: string;
}

export class AdminWithdrawalActionDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: "Approved for manual bank transfer", description: 'note' })
  note?: string;
}

export class AdminMarkWithdrawalPaidDto extends AdminWithdrawalActionDto {
  @IsString()
  @ApiProperty({ example: "REF123456", description: 'transferReference' })
  transferReference!: string;
}
