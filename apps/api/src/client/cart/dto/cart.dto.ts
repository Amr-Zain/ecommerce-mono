import { IsNumber, IsOptional, Min } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { I18nTranslations } from '../../../generated/i18n.generated';

export class AddToCartDto {
  @IsNumber({}, { message: i18nValidationMessage<I18nTranslations>('validation.IS_NUMBER') })
  productId!: number;

  @IsOptional()
  @IsNumber({}, { message: i18nValidationMessage<I18nTranslations>('validation.IS_NUMBER') })
  variantId?: number;

  @IsNumber({}, { message: i18nValidationMessage<I18nTranslations>('validation.IS_NUMBER') })
  @Min(1, { message: i18nValidationMessage<I18nTranslations>('validation.MIN') })
  quantity!: number;
}

export class UpdateCartItemDto {
  @IsNumber({}, { message: i18nValidationMessage<I18nTranslations>('validation.IS_NUMBER') })
  @Min(1, { message: i18nValidationMessage<I18nTranslations>('validation.MIN') })
  quantity!: number;
}
