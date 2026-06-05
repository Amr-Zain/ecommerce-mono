import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsIn, IsInt, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { ITEM_DISPOSITIONS } from '@/common/constants/return-exchange.constants';
import { PAYMENT_METHODS } from '@/shared/payment/payment.constants';
import { AdvancedQueryDto } from '@/common/dto/advanced-query.dto';

export class AdminReturnExchangeQueryDto extends AdvancedQueryDto {
  @IsOptional()
  @IsString()
  status?: string;
}

export class AdminRejectRequestDto {
  @IsOptional()
  @IsString()
  note?: string;
}

export class AdminReceiveRequestItemDto {
  @IsString()
  id!: string;

  @IsInt()
  @Min(0)
  acceptedQuantity!: number;

  @IsIn(Object.values(ITEM_DISPOSITIONS))
  disposition!: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  adjustedRefundAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  adjustedVatRefundAmount?: number;

  @IsOptional()
  @IsString()
  refundAdjustmentReason?: string;

  @IsOptional()
  @IsString()
  note?: string;
}

export class AdminReceiveReturnDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => AdminReceiveRequestItemDto)
  items!: AdminReceiveRequestItemDto[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  shippingRefundAmount?: number;

  @IsOptional()
  @IsString()
  shippingRefundReason?: string;

  @IsOptional()
  @IsString()
  note?: string;
}

export class AdminReceiveExchangeDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => AdminReceiveRequestItemDto)
  items!: AdminReceiveRequestItemDto[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  replacementShippingFee?: number;

  @IsOptional()
  @IsString()
  shippingFeeReason?: string;

  @IsOptional()
  @IsString()
  note?: string;
}

export class AdminReturnRefundDto {
  @IsOptional()
  @IsString()
  note?: string;
}

export class AdminExchangePaymentDto {
  @IsString()
  @IsIn([PAYMENT_METHODS.stripeCheckout, PAYMENT_METHODS.stripeIntent])
  paymentMethod!: string;
}

export class AdminVerifyExchangePaymentDto {
  @IsString()
  transactionRef!: string;
}
