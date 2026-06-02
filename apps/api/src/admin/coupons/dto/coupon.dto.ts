import { IsNumber, IsOptional, IsString, IsBoolean, IsDateString, IsNotEmpty } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { I18nTranslations } from '../../../generated/i18n.generated';

export class CreateCouponDto {
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.NOT_EMPTY') })
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  code!: string;

  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.NOT_EMPTY') })
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  discountType!: string;

  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.NOT_EMPTY') })
  @IsNumber({}, { message: i18nValidationMessage<I18nTranslations>('validation.IS_NUMBER') })
  discountValue!: number;

  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.NOT_EMPTY') })
  @IsNumber({}, { message: i18nValidationMessage<I18nTranslations>('validation.IS_NUMBER') })
  minOrderAmount!: number;

  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.NOT_EMPTY') })
  @IsNumber({}, { message: i18nValidationMessage<I18nTranslations>('validation.IS_NUMBER') })
  maxDiscount!: number;

  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.NOT_EMPTY') })
  @IsNumber({}, { message: i18nValidationMessage<I18nTranslations>('validation.IS_NUMBER') })
  usageLimit!: number;

  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.NOT_EMPTY') })
  @IsNumber({}, { message: i18nValidationMessage<I18nTranslations>('validation.IS_NUMBER') })
  perUserLimit!: number;

  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.NOT_EMPTY') })
  @IsDateString({}, { message: i18nValidationMessage<I18nTranslations>('validation.INVALID_DATE') })
  startsAt!: string;

  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.NOT_EMPTY') })
  @IsDateString({}, { message: i18nValidationMessage<I18nTranslations>('validation.INVALID_DATE') })
  expiresAt!: string;

  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.NOT_EMPTY') })
  @IsBoolean({ message: i18nValidationMessage<I18nTranslations>('validation.IS_BOOLEAN') })
  isActive!: boolean;
}

export class UpdateCouponDto {
  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  code?: string;

  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  discountType?: string;

  @IsOptional()
  @IsNumber({}, { message: i18nValidationMessage<I18nTranslations>('validation.IS_NUMBER') })
  discountValue?: number;

  @IsOptional()
  @IsNumber({}, { message: i18nValidationMessage<I18nTranslations>('validation.IS_NUMBER') })
  minOrderAmount?: number;

  @IsOptional()
  @IsNumber({}, { message: i18nValidationMessage<I18nTranslations>('validation.IS_NUMBER') })
  maxDiscount?: number;

  @IsOptional()
  @IsNumber({}, { message: i18nValidationMessage<I18nTranslations>('validation.IS_NUMBER') })
  usageLimit?: number;

  @IsOptional()
  @IsNumber({}, { message: i18nValidationMessage<I18nTranslations>('validation.IS_NUMBER') })
  perUserLimit?: number;

  @IsOptional()
  @IsDateString({}, { message: i18nValidationMessage<I18nTranslations>('validation.INVALID_DATE') })
  startsAt?: string;

  @IsOptional()
  @IsDateString({}, { message: i18nValidationMessage<I18nTranslations>('validation.INVALID_DATE') })
  expiresAt?: string;

  @IsOptional()
  @IsBoolean({ message: i18nValidationMessage<I18nTranslations>('validation.IS_BOOLEAN') })
  isActive?: boolean;
}
