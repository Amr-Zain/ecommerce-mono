import {
  IsNotEmpty,
  IsString,
  IsArray,
  ValidateNested,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsEnum,
  Min,
  IsPositive,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  Validate,
} from 'class-validator';
import { Type } from 'class-transformer';
import { i18nValidationMessage } from 'nestjs-i18n';
import { I18nTranslations } from '@/generated/i18n.generated';

@ValidatorConstraint({ name: 'maxPercentage', async: false })
export class MaxPercentageConstraint implements ValidatorConstraintInterface {
  validate(value: unknown, args: ValidationArguments) {
    const object = args.object as { discountType?: string };
    if (object.discountType === 'PERCENTAGE' && typeof value === 'number') {
      return value <= 100;
    }
    return true;
  }
}

export class ProductTranslationDto {
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.IS_NOT_EMPTY') })
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  langId!: string;

  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.IS_NOT_EMPTY') })
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  name!: string;

  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  description?: string;
}

export class CreateProductDto {
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.IS_NOT_EMPTY') })
  @IsNumber({}, { message: i18nValidationMessage<I18nTranslations>('validation.IS_NUMBER') })
  @IsPositive({ message: i18nValidationMessage<I18nTranslations>('validation.IS_POSITIVE') })
  collectionId!: number;

  @IsBoolean({ message: i18nValidationMessage<I18nTranslations>('validation.IS_BOOLEAN') })
  @IsOptional()
  hasVariants?: boolean = false;

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

  @IsArray({ message: i18nValidationMessage<I18nTranslations>('validation.IS_ARRAY') })
  @ValidateNested({ each: true })
  @Type(() => ProductTranslationDto)
  translations!: ProductTranslationDto[];

  @IsArray({ message: i18nValidationMessage<I18nTranslations>('validation.IS_ARRAY') })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateVariantDto)
  variants?: CreateVariantDto[];

  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.IS_NOT_EMPTY') })
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  image!: string;

  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.IS_NOT_EMPTY') })
  @IsArray({ message: i18nValidationMessage<I18nTranslations>('validation.IS_ARRAY') })
  @IsString({ each: true, message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  gallery!: string[];

  @IsOptional()
  @IsArray({ message: i18nValidationMessage<I18nTranslations>('validation.IS_ARRAY') })
  @IsString({ each: true, message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  tags?: string[];
}

export class VariantAttributeDto {
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.IS_NOT_EMPTY') })
  @IsNumber({}, { message: i18nValidationMessage<I18nTranslations>('validation.IS_NUMBER') })
  @IsPositive({ message: i18nValidationMessage<I18nTranslations>('validation.IS_POSITIVE') })
  attributeId!: number;

  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.IS_NOT_EMPTY') })
  @IsNumber({}, { message: i18nValidationMessage<I18nTranslations>('validation.IS_NUMBER') })
  @IsPositive({ message: i18nValidationMessage<I18nTranslations>('validation.IS_POSITIVE') })
  valueId!: number;
}

export class CreateVariantDto {
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.IS_NOT_EMPTY') })
  @IsNumber({}, { message: i18nValidationMessage<I18nTranslations>('validation.IS_NUMBER') })
  @Min(0, { message: i18nValidationMessage<I18nTranslations>('validation.MIN', { min: 0 }) })
  price!: number;

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

  @IsNumber({}, { message: i18nValidationMessage<I18nTranslations>('validation.IS_NUMBER') })
  @IsOptional()
  @Min(0, { message: i18nValidationMessage<I18nTranslations>('validation.MIN', { min: 0 }) })
  stockQuantity?: number = 0;

  @IsBoolean({ message: i18nValidationMessage<I18nTranslations>('validation.IS_BOOLEAN') })
  @IsOptional()
  isActive?: boolean = true;

  @IsArray({ message: i18nValidationMessage<I18nTranslations>('validation.IS_ARRAY') })
  @ValidateNested({ each: true })
  @Type(() => VariantAttributeDto)
  attributes!: VariantAttributeDto[];

  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.IS_NOT_EMPTY') })
  @IsArray({ message: i18nValidationMessage<I18nTranslations>('validation.IS_ARRAY') })
  @IsString({ each: true, message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  gallery!: string[];
}

export class AdjustStockDto {
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.IS_NOT_EMPTY') })
  @IsNumber({}, { message: i18nValidationMessage<I18nTranslations>('validation.IS_NUMBER') })
  @IsPositive({ message: i18nValidationMessage<I18nTranslations>('validation.IS_POSITIVE') })
  variantId!: number;

  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.IS_NOT_EMPTY') })
  @IsNumber({}, { message: i18nValidationMessage<I18nTranslations>('validation.IS_NUMBER') })
  amount!: number;

  @IsOptional()
  @IsEnum(['RESTOCK', 'SALE', 'ADJUSTMENT', 'RETURN'], {
    message: i18nValidationMessage<I18nTranslations>('validation.IS_ENUM'),
  })
  reason!: 'RESTOCK' | 'SALE' | 'ADJUSTMENT' | 'RETURN';
}
