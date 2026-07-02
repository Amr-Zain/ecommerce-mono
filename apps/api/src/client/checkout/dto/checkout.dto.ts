import { IsIn, IsNumber, IsOptional, IsString } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { I18nTranslations } from '../../../generated/i18n.generated';
import { PAYMENT_METHODS } from '@/shared/payment/payment.constants';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CheckoutPreviewDto {
  @IsNumber({}, { message: i18nValidationMessage<I18nTranslations>('validation.IS_NUMBER') })
  @ApiProperty({ example: 1, description: 'addressId' })
  addressId!: number;

  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  @ApiPropertyOptional({ example: 'SUMMER20', description: 'couponCode' })
  couponCode?: string;

  @IsOptional()
  @IsNumber({}, { message: i18nValidationMessage<I18nTranslations>('validation.IS_NUMBER') })
  @ApiPropertyOptional({ example: 150, description: 'walletAmount' })
  walletAmount?: number;

  @IsOptional()
  @IsNumber({}, { message: i18nValidationMessage<I18nTranslations>('validation.IS_NUMBER') })
  @ApiPropertyOptional({ example: 1, description: 'rewardId' })
  rewardId?: number;
}

export class PlaceOrderDto {
  @IsNumber({}, { message: i18nValidationMessage<I18nTranslations>('validation.IS_NUMBER') })
  @ApiProperty({ example: 1, description: 'addressId' })
  addressId!: number;

  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  @IsIn(Object.values(PAYMENT_METHODS), { message: i18nValidationMessage<I18nTranslations>('validation.IS_ENUM') })
  @ApiProperty({ example: 'cod', description: 'paymentMethod' })
  paymentMethod!: string;

  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  @ApiPropertyOptional({ example: 'SUMMER20', description: 'couponCode' })
  couponCode?: string;

  @IsOptional()
  @IsNumber({}, { message: i18nValidationMessage<I18nTranslations>('validation.IS_NUMBER') })
  @ApiPropertyOptional({ example: 150, description: 'walletAmount' })
  walletAmount?: number;

  @IsOptional()
  @IsNumber({}, { message: i18nValidationMessage<I18nTranslations>('validation.IS_NUMBER') })
  @ApiPropertyOptional({ example: 1, description: 'rewardId' })
  rewardId?: number;

  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  @ApiPropertyOptional({ example: 'Leave at door', description: 'notes' })
  notes?: string;
}

export class VerifyCheckoutPaymentDto {
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  @ApiProperty({ example: 'chk_1234567890', description: 'checkoutId' })
  checkoutId!: string;
}
