import { PartialType, OmitType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import {
  IsString,
  IsArray,
  ValidateNested,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsPositive,
  Min,
  Validate,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { I18nTranslations } from '@/generated/i18n.generated';
import {
  ProductTranslationDto,
  VariantAttributeDto,
  MaxPercentageConstraint,
} from '@/common/dto/product.dto';

/* ── Update Product ─────────────────────────────────────────── */

export class UpdateProductDto {
  @IsOptional()
  @IsNumber({}, { message: i18nValidationMessage<I18nTranslations>('validation.IS_NUMBER') })
  @IsPositive({ message: i18nValidationMessage<I18nTranslations>('validation.IS_POSITIVE') })
  collectionId?: number;

  @IsOptional()
  @IsBoolean({ message: i18nValidationMessage<I18nTranslations>('validation.IS_BOOLEAN') })
  hasVariants?: boolean;

  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  discountType?: 'FIXED' | 'PERCENTAGE';

  @IsOptional()
  @IsNumber({}, { message: i18nValidationMessage<I18nTranslations>('validation.IS_NUMBER') })
  @Min(0, { message: i18nValidationMessage<I18nTranslations>('validation.MIN', { min: 0 }) })
  @Validate(MaxPercentageConstraint, {
    message: i18nValidationMessage<I18nTranslations>('validation.MAX', { max: 100 }),
  })
  discountValue?: number;

  @IsOptional()
  @IsArray({ message: i18nValidationMessage<I18nTranslations>('validation.IS_ARRAY') })
  @ValidateNested({ each: true })
  @Type(() => ProductTranslationDto)
  translations?: ProductTranslationDto[];

  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  image?: string;

  @IsOptional()
  @IsArray({ message: i18nValidationMessage<I18nTranslations>('validation.IS_ARRAY') })
  @IsString({ each: true, message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  gallery?: string[];

  @IsOptional()
  @IsArray({ message: i18nValidationMessage<I18nTranslations>('validation.IS_ARRAY') })
  @IsString({ each: true, message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  tags?: string[];

  /* Virtual fields — only meaningful for simple products */
  @IsOptional()
  @IsNumber({}, { message: i18nValidationMessage<I18nTranslations>('validation.IS_NUMBER') })
  @Min(0, { message: i18nValidationMessage<I18nTranslations>('validation.MIN', { min: 0 }) })
  price?: number;

  @IsOptional()
  @IsNumber({}, { message: i18nValidationMessage<I18nTranslations>('validation.IS_NUMBER') })
  @Min(0, { message: i18nValidationMessage<I18nTranslations>('validation.MIN', { min: 0 }) })
  stock?: number;

  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  sku?: string;

  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  barcode?: string;

  @IsOptional()
  @IsNumber({}, { message: i18nValidationMessage<I18nTranslations>('validation.IS_NUMBER') })
  @Min(0, { message: i18nValidationMessage<I18nTranslations>('validation.MIN', { min: 0 }) })
  costPrice?: number;
}

/* ── Update Variant ─────────────────────────────────────────── */

export class UpdateVariantDto {
  @IsOptional()
  @IsNumber({}, { message: i18nValidationMessage<I18nTranslations>('validation.IS_NUMBER') })
  @Min(0, { message: i18nValidationMessage<I18nTranslations>('validation.MIN', { min: 0 }) })
  price?: number;

  @IsOptional()
  @IsNumber({}, { message: i18nValidationMessage<I18nTranslations>('validation.IS_NUMBER') })
  @Min(0, { message: i18nValidationMessage<I18nTranslations>('validation.MIN', { min: 0 }) })
  compareAtPrice?: number;

  @IsOptional()
  @IsNumber({}, { message: i18nValidationMessage<I18nTranslations>('validation.IS_NUMBER') })
  @Min(0, { message: i18nValidationMessage<I18nTranslations>('validation.MIN', { min: 0 }) })
  costPrice?: number;

  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  discountType?: 'FIXED' | 'PERCENTAGE';

  @IsOptional()
  @IsNumber({}, { message: i18nValidationMessage<I18nTranslations>('validation.IS_NUMBER') })
  @Min(0, { message: i18nValidationMessage<I18nTranslations>('validation.MIN', { min: 0 }) })
  @Validate(MaxPercentageConstraint, {
    message: i18nValidationMessage<I18nTranslations>('validation.MAX', { max: 100 }),
  })
  discountValue?: number;

  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  sku?: string;

  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  barcode?: string;

  @IsOptional()
  @IsNumber({}, { message: i18nValidationMessage<I18nTranslations>('validation.IS_NUMBER') })
  @Min(0, { message: i18nValidationMessage<I18nTranslations>('validation.MIN', { min: 0 }) })
  stockQuantity?: number;

  @IsOptional()
  @IsBoolean({ message: i18nValidationMessage<I18nTranslations>('validation.IS_BOOLEAN') })
  isActive?: boolean;

  @IsOptional()
  @IsArray({ message: i18nValidationMessage<I18nTranslations>('validation.IS_ARRAY') })
  @ValidateNested({ each: true })
  @Type(() => VariantAttributeDto)
  attributes?: VariantAttributeDto[];

  @IsOptional()
  @IsArray({ message: i18nValidationMessage<I18nTranslations>('validation.IS_ARRAY') })
  @IsString({ each: true, message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  gallery?: string[];
}
