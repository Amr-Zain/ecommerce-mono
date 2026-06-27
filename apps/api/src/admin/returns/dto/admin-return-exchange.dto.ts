import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { I18nTranslations } from '../../../generated/i18n.generated';
import { ITEM_DISPOSITIONS } from '@/common/constants/return-exchange.constants';
import { PAYMENT_METHODS } from '@/shared/payment/payment.constants';
import { AdvancedQueryDto } from '@/common/dto/advanced-query.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AdminReturnExchangeQueryDto extends AdvancedQueryDto {
  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  @ApiPropertyOptional({ example: "shipped", description: 'status' })
  status?: string;
}

export class AdminRejectRequestDto {
  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  @ApiPropertyOptional({ example: "Return request rejected after review", description: 'note' })
  note?: string;
}

export class AdminReceiveRequestItemDto {
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  @ApiProperty({ example: '1', description: 'id' })
  id!: string;

  @IsInt({ message: i18nValidationMessage<I18nTranslations>('validation.IS_INT') })
  @Min(0, { message: i18nValidationMessage<I18nTranslations>('validation.MIN') })
  @ApiProperty({ example: 1, description: 'acceptedQuantity' })
  acceptedQuantity!: number;

  @IsIn(Object.values(ITEM_DISPOSITIONS), { message: i18nValidationMessage<I18nTranslations>('validation.IS_ENUM') })
  @ApiProperty({ example: 'restock', description: 'disposition' })
  disposition!: string;

  @IsOptional()
  @IsNumber({}, { message: i18nValidationMessage<I18nTranslations>('validation.IS_NUMBER') })
  @Min(0, { message: i18nValidationMessage<I18nTranslations>('validation.MIN') })
  @ApiPropertyOptional({ example: 1, description: 'adjustedRefundAmount' })
  adjustedRefundAmount?: number;

  @IsOptional()
  @IsNumber({}, { message: i18nValidationMessage<I18nTranslations>('validation.IS_NUMBER') })
  @Min(0, { message: i18nValidationMessage<I18nTranslations>('validation.MIN') })
  @ApiPropertyOptional({ example: 1, description: 'adjustedVatRefundAmount' })
  adjustedVatRefundAmount?: number;

  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  @ApiPropertyOptional({ example: 'Accepted full refund', description: 'refundAdjustmentReason' })
  refundAdjustmentReason?: string;

  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  @ApiPropertyOptional({ example: "Return request rejected after review", description: 'note' })
  note?: string;
}

export class AdminReceiveReturnDto {
  @IsArray({ message: i18nValidationMessage<I18nTranslations>('validation.IS_ARRAY') })
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => AdminReceiveRequestItemDto)
  @ApiProperty({ example: [], description: 'items' })
  items!: AdminReceiveRequestItemDto[];

  @IsOptional()
  @IsNumber({}, { message: i18nValidationMessage<I18nTranslations>('validation.IS_NUMBER') })
  @Min(0, { message: i18nValidationMessage<I18nTranslations>('validation.MIN') })
  @ApiPropertyOptional({ example: 1, description: 'shippingRefundAmount' })
  shippingRefundAmount?: number;

  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  @ApiPropertyOptional({ example: 'Customer size change', description: 'shippingRefundReason' })
  shippingRefundReason?: string;

  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  @ApiPropertyOptional({ example: "Return request rejected after review", description: 'note' })
  note?: string;
}

export class AdminReceiveExchangeDto {
  @IsArray({ message: i18nValidationMessage<I18nTranslations>('validation.IS_ARRAY') })
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => AdminReceiveRequestItemDto)
  @ApiProperty({ example: [], description: 'items' })
  items!: AdminReceiveRequestItemDto[];

  @IsOptional()
  @IsNumber({}, { message: i18nValidationMessage<I18nTranslations>('validation.IS_NUMBER') })
  @Min(0, { message: i18nValidationMessage<I18nTranslations>('validation.MIN') })
  @ApiPropertyOptional({ example: 1, description: 'replacementShippingFee' })
  replacementShippingFee?: number;

  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  @ApiPropertyOptional({ example: 'Store fault or waived shipping', description: 'shippingFeeReason' })
  shippingFeeReason?: string;

  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  @ApiPropertyOptional({ example: "Return request rejected after review", description: 'note' })
  note?: string;
}

export class RefundAllocationDto {
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  @IsIn(['wallet', 'original_payment', 'manual'], {
    message: i18nValidationMessage<I18nTranslations>('validation.IS_ENUM'),
  })
  @ApiProperty({ example: 'wallet', description: 'destination' })
  destination!: 'wallet' | 'original_payment' | 'manual';

  @IsNumber({}, { message: i18nValidationMessage<I18nTranslations>('validation.IS_NUMBER') })
  @Min(0, { message: i18nValidationMessage<I18nTranslations>('validation.MIN') })
  @ApiProperty({ example: 50, description: 'amount' })
  amount!: number;

  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  @ApiPropertyOptional({ example: '1', description: 'paymentTransactionId' })
  paymentTransactionId?: string;
}

export class AdminReturnRefundDto {
  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  @ApiPropertyOptional({ example: "Return request rejected after review", description: 'note' })
  note?: string;

  @IsOptional()
  @IsArray({ message: i18nValidationMessage<I18nTranslations>('validation.IS_ARRAY') })
  @ValidateNested({ each: true })
  @Type(() => RefundAllocationDto)
  @ApiPropertyOptional({ example: [], description: 'refundAllocations' })
  refundAllocations?: RefundAllocationDto[];
}

export class AdminExchangePaymentDto {
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  @IsIn([PAYMENT_METHODS.stripeCheckout, PAYMENT_METHODS.stripeIntent], {
    message: i18nValidationMessage<I18nTranslations>('validation.IS_ENUM'),
  })
  @ApiProperty({ example: "cod", description: 'paymentMethod' })
  paymentMethod!: string;
}

export class AdminVerifyExchangePaymentDto {
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  @ApiProperty({ example: "pi_1234567890", description: 'transactionRef' })
  transactionRef!: string;
}
