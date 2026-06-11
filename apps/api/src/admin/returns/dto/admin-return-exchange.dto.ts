import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsIn, IsInt, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { I18nTranslations } from '../../../generated/i18n.generated';
import { ITEM_DISPOSITIONS } from '@/common/constants/return-exchange.constants';
import { PAYMENT_METHODS } from '@/shared/payment/payment.constants';
import { AdvancedQueryDto } from '@/common/dto/advanced-query.dto';

export class AdminReturnExchangeQueryDto extends AdvancedQueryDto {
  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  status?: string;
}

export class AdminRejectRequestDto {
  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  note?: string;
}

export class AdminReceiveRequestItemDto {
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  id!: string;

  @IsInt({ message: i18nValidationMessage<I18nTranslations>('validation.IS_INT') })
  @Min(0, { message: i18nValidationMessage<I18nTranslations>('validation.MIN') })
  acceptedQuantity!: number;

  @IsIn(Object.values(ITEM_DISPOSITIONS), { message: i18nValidationMessage<I18nTranslations>('validation.IS_ENUM') })
  disposition!: string;

  @IsOptional()
  @IsNumber({}, { message: i18nValidationMessage<I18nTranslations>('validation.IS_NUMBER') })
  @Min(0, { message: i18nValidationMessage<I18nTranslations>('validation.MIN') })
  adjustedRefundAmount?: number;

  @IsOptional()
  @IsNumber({}, { message: i18nValidationMessage<I18nTranslations>('validation.IS_NUMBER') })
  @Min(0, { message: i18nValidationMessage<I18nTranslations>('validation.MIN') })
  adjustedVatRefundAmount?: number;

  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  refundAdjustmentReason?: string;

  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  note?: string;
}

export class AdminReceiveReturnDto {
  @IsArray({ message: i18nValidationMessage<I18nTranslations>('validation.IS_ARRAY') })
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => AdminReceiveRequestItemDto)
  items!: AdminReceiveRequestItemDto[];

  @IsOptional()
  @IsNumber({}, { message: i18nValidationMessage<I18nTranslations>('validation.IS_NUMBER') })
  @Min(0, { message: i18nValidationMessage<I18nTranslations>('validation.MIN') })
  shippingRefundAmount?: number;

  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  shippingRefundReason?: string;

  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  note?: string;
}

export class AdminReceiveExchangeDto {
  @IsArray({ message: i18nValidationMessage<I18nTranslations>('validation.IS_ARRAY') })
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => AdminReceiveRequestItemDto)
  items!: AdminReceiveRequestItemDto[];

  @IsOptional()
  @IsNumber({}, { message: i18nValidationMessage<I18nTranslations>('validation.IS_NUMBER') })
  @Min(0, { message: i18nValidationMessage<I18nTranslations>('validation.MIN') })
  replacementShippingFee?: number;

  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  shippingFeeReason?: string;

  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  note?: string;
}

export class AdminReturnRefundDto {
  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  note?: string;
}

export class AdminExchangePaymentDto {
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  @IsIn([PAYMENT_METHODS.stripeCheckout, PAYMENT_METHODS.stripeIntent], { message: i18nValidationMessage<I18nTranslations>('validation.IS_ENUM') })
  paymentMethod!: string;
}

export class AdminVerifyExchangePaymentDto {
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  transactionRef!: string;
}
