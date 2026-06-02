import { IsIn, IsNumber, IsOptional, IsString } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { I18nTranslations } from '../../../generated/i18n.generated';
import { PAYMENT_METHODS } from '@/shared/payment/payment.constants';

export class CheckoutPreviewDto {
  @IsNumber({}, { message: i18nValidationMessage<I18nTranslations>('validation.IS_NUMBER') })
  addressId!: number;

  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  couponCode?: string;
}

export class PlaceOrderDto {
  @IsNumber({}, { message: i18nValidationMessage<I18nTranslations>('validation.IS_NUMBER') })
  addressId!: number;

  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  @IsIn(Object.values(PAYMENT_METHODS), { message: i18nValidationMessage<I18nTranslations>('validation.IS_ENUM') })
  paymentMethod!: string;

  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  couponCode?: string;

  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  notes?: string;
}

export class VerifyCheckoutPaymentDto {
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  checkoutId!: string;
}
