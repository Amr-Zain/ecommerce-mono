import { IsNumber, IsOptional, Min } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { I18nTranslations } from '../../../generated/i18n.generated';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddToCartDto {
  @IsNumber({}, { message: i18nValidationMessage<I18nTranslations>('validation.IS_NUMBER') })
  @ApiProperty({ example: 1, description: 'productId' })
  productId!: number;

  @IsOptional()
  @IsNumber({}, { message: i18nValidationMessage<I18nTranslations>('validation.IS_NUMBER') })
  @ApiPropertyOptional({ example: 1, description: 'variantId' })
  variantId?: number;

  @IsNumber({}, { message: i18nValidationMessage<I18nTranslations>('validation.IS_NUMBER') })
  @Min(1, { message: i18nValidationMessage<I18nTranslations>('validation.MIN') })
  @ApiProperty({ example: 3, description: 'quantity' })
  quantity!: number;
}

export class UpdateCartItemDto {
  @IsOptional()
  @IsNumber({}, { message: i18nValidationMessage<I18nTranslations>('validation.IS_NUMBER') })
  @Min(1, { message: i18nValidationMessage<I18nTranslations>('validation.MIN') })
  @ApiPropertyOptional({ example: 3, description: 'quantity' })
  quantity?: number;

  @IsOptional()
  @IsNumber({}, { message: i18nValidationMessage<I18nTranslations>('validation.IS_NUMBER') })
  @ApiPropertyOptional({ example: 1, description: 'variantId' })
  variantId?: number;
}
