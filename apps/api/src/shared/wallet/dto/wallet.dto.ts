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

export class CreateWalletDepositDto {
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  amount!: number;

  @IsIn([PAYMENT_METHODS.stripeCheckout, PAYMENT_METHODS.stripeIntent])
  paymentMethod!: string;
}

export class CreateWalletWithdrawalDto {
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  amount!: number;

  @IsIn(Object.values(WALLET_WITHDRAWAL_METHODS))
  method!: string;

  @IsObject()
  details!: Record<string, unknown>;

  @IsOptional()
  @IsString()
  note?: string;
}

export class WalletTransactionQueryDto extends PaginationDto {
  @IsOptional()
  @IsIn(Object.values(WALLET_TRANSACTION_TYPES))
  type?: string;

  @IsOptional()
  @IsIn(Object.values(WALLET_TRANSACTION_DIRECTIONS))
  direction?: string;

  @IsOptional()
  @IsIn(Object.values(WALLET_TRANSACTION_STATUSES))
  status?: string;

  @IsOptional()
  @IsString()
  referenceType?: string;

  @IsOptional()
  @IsString()
  referenceId?: string;

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @IsString()
  transactionRef?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minAmount?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxAmount?: number;

  @IsOptional()
  @IsString()
  dateFrom?: string;

  @IsOptional()
  @IsString()
  dateTo?: string;

  @IsOptional()
  @IsString()
  sort?: string;
}

export class AdminWalletTransactionQueryDto extends WalletTransactionQueryDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  walletId?: string;

  @IsOptional()
  @IsString()
  userEmail?: string;
}

export class WalletWithdrawalQueryDto extends PaginationDto {
  @IsOptional()
  @IsIn(Object.values(WALLET_WITHDRAWAL_STATUSES))
  status?: string;

  @IsOptional()
  @IsIn(Object.values(WALLET_WITHDRAWAL_METHODS))
  method?: string;

  @IsOptional()
  @IsString()
  dateFrom?: string;

  @IsOptional()
  @IsString()
  dateTo?: string;
}

export class AdminWalletWithdrawalQueryDto extends WalletWithdrawalQueryDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  walletId?: string;

  @IsOptional()
  @IsString()
  userEmail?: string;
}

export class AdminWalletListQueryDto extends PaginationDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  userEmail?: string;

  @IsOptional()
  @IsString()
  status?: string;
}

export class AdminWithdrawalActionDto {
  @IsOptional()
  @IsString()
  note?: string;
}

export class AdminMarkWithdrawalPaidDto extends AdminWithdrawalActionDto {
  @IsString()
  transferReference!: string;
}
