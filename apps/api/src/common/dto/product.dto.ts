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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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
  @ApiProperty({ example: 'en', description: 'langId' })
  langId!: string;

  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.IS_NOT_EMPTY') })
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  @ApiProperty({ example: 'Test Product', description: 'name' })
  name!: string;

  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  @ApiPropertyOptional({ example: 'Sample description', description: 'description' })
  description?: string;
}

export class CreateProductDto {
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.IS_NOT_EMPTY') })
  @IsNumber({}, { message: i18nValidationMessage<I18nTranslations>('validation.IS_NUMBER') })
  @IsPositive({ message: i18nValidationMessage<I18nTranslations>('validation.IS_POSITIVE') })
  @ApiProperty({ example: 1, description: 'collectionId' })
  collectionId!: number;

  @IsBoolean({ message: i18nValidationMessage<I18nTranslations>('validation.IS_BOOLEAN') })
  @IsOptional()
  @ApiPropertyOptional({ example: true, description: 'hasVariants' })
  hasVariants?: boolean = false;

  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  @ApiPropertyOptional({ example: 'PERCENTAGE', description: 'discountType' })
  discountType?: 'FIXED' | 'PERCENTAGE';

  @IsOptional()
  @IsNumber({}, { message: i18nValidationMessage<I18nTranslations>('validation.IS_NUMBER') })
  @Min(0, { message: i18nValidationMessage<I18nTranslations>('validation.MIN', { min: 0 }) })
  @Validate(MaxPercentageConstraint, {
    message: i18nValidationMessage<I18nTranslations>('validation.MAX', { max: 100 }),
  })
  @ApiPropertyOptional({ example: 20, description: 'discountValue' })
  discountValue?: number;

  @IsArray({ message: i18nValidationMessage<I18nTranslations>('validation.IS_ARRAY') })
  @ValidateNested({ each: true })
  @Type(() => ProductTranslationDto)
  @ApiProperty({
    example: [
      { langId: 'en', name: 'Test Product' },
      { langId: 'ar', name: 'منتج تجريبي' },
    ],
    description: 'translations',
  })
  translations!: ProductTranslationDto[];

  @IsArray({ message: i18nValidationMessage<I18nTranslations>('validation.IS_ARRAY') })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateVariantDto)
  @ApiPropertyOptional({ example: [], description: 'variants' })
  variants?: CreateVariantDto[];

  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.IS_NOT_EMPTY') })
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  @ApiProperty({ example: 'mock-main-image-hash', description: 'image' })
  image!: string;

  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.IS_NOT_EMPTY') })
  @IsArray({ message: i18nValidationMessage<I18nTranslations>('validation.IS_ARRAY') })
  @IsString({ each: true, message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  @ApiProperty({ example: [], description: 'gallery' })
  gallery!: string[];

  @IsOptional()
  @IsArray({ message: i18nValidationMessage<I18nTranslations>('validation.IS_ARRAY') })
  @IsString({ each: true, message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  @ApiPropertyOptional({ example: [], description: 'tags' })
  tags?: string[];
}

export class VariantAttributeDto {
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.IS_NOT_EMPTY') })
  @IsNumber({}, { message: i18nValidationMessage<I18nTranslations>('validation.IS_NUMBER') })
  @IsPositive({ message: i18nValidationMessage<I18nTranslations>('validation.IS_POSITIVE') })
  @ApiProperty({ example: 1, description: 'attributeId' })
  attributeId!: number;

  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.IS_NOT_EMPTY') })
  @IsNumber({}, { message: i18nValidationMessage<I18nTranslations>('validation.IS_NUMBER') })
  @IsPositive({ message: i18nValidationMessage<I18nTranslations>('validation.IS_POSITIVE') })
  @ApiProperty({ example: 1, description: 'valueId' })
  valueId!: number;
}

export class CreateVariantDto {
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.IS_NOT_EMPTY') })
  @IsNumber({}, { message: i18nValidationMessage<I18nTranslations>('validation.IS_NUMBER') })
  @Min(0, { message: i18nValidationMessage<I18nTranslations>('validation.MIN', { min: 0 }) })
  @ApiProperty({ example: 150, description: 'price' })
  price!: number;

  @IsOptional()
  @IsNumber({}, { message: i18nValidationMessage<I18nTranslations>('validation.IS_NUMBER') })
  @Min(0, { message: i18nValidationMessage<I18nTranslations>('validation.MIN', { min: 0 }) })
  @ApiPropertyOptional({ example: 200, description: 'compareAtPrice' })
  compareAtPrice?: number;

  @IsOptional()
  @IsNumber({}, { message: i18nValidationMessage<I18nTranslations>('validation.IS_NUMBER') })
  @Min(0, { message: i18nValidationMessage<I18nTranslations>('validation.MIN', { min: 0 }) })
  @ApiPropertyOptional({ example: 1, description: 'costPrice' })
  costPrice?: number;

  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  @ApiPropertyOptional({ example: 'PERCENTAGE', description: 'discountType' })
  discountType?: 'FIXED' | 'PERCENTAGE';

  @IsOptional()
  @IsNumber({}, { message: i18nValidationMessage<I18nTranslations>('validation.IS_NUMBER') })
  @Min(0, { message: i18nValidationMessage<I18nTranslations>('validation.MIN', { min: 0 }) })
  @Validate(MaxPercentageConstraint, {
    message: i18nValidationMessage<I18nTranslations>('validation.MAX', { max: 100 }),
  })
  @ApiPropertyOptional({ example: 20, description: 'discountValue' })
  discountValue?: number;

  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  @ApiPropertyOptional({ example: 'PROD-1-VAR-1', description: 'sku' })
  sku?: string;

  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  @ApiPropertyOptional({ example: '123456789012', description: 'barcode' })
  barcode?: string;

  @IsNumber({}, { message: i18nValidationMessage<I18nTranslations>('validation.IS_NUMBER') })
  @IsOptional()
  @Min(0, { message: i18nValidationMessage<I18nTranslations>('validation.MIN', { min: 0 }) })
  @ApiPropertyOptional({ example: 5, description: 'stockQuantity' })
  stockQuantity?: number = 0;

  @IsBoolean({ message: i18nValidationMessage<I18nTranslations>('validation.IS_BOOLEAN') })
  @IsOptional()
  @ApiPropertyOptional({ example: true, description: 'isActive' })
  isActive?: boolean = true;

  @IsBoolean({ message: i18nValidationMessage<I18nTranslations>('validation.IS_BOOLEAN') })
  @IsOptional()
  @ApiPropertyOptional({ example: false, description: 'isDefault' })
  isDefault?: boolean = false;

  @IsArray({ message: i18nValidationMessage<I18nTranslations>('validation.IS_ARRAY') })
  @ValidateNested({ each: true })
  @Type(() => VariantAttributeDto)
  @ApiProperty({ example: [], description: 'attributes' })
  attributes!: VariantAttributeDto[];

  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.IS_NOT_EMPTY') })
  @IsArray({ message: i18nValidationMessage<I18nTranslations>('validation.IS_ARRAY') })
  @IsString({ each: true, message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  @ApiProperty({ example: [], description: 'gallery' })
  gallery!: string[];
}

export class AdjustStockDto {
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.IS_NOT_EMPTY') })
  @IsNumber({}, { message: i18nValidationMessage<I18nTranslations>('validation.IS_NUMBER') })
  @IsPositive({ message: i18nValidationMessage<I18nTranslations>('validation.IS_POSITIVE') })
  @ApiProperty({ example: 1, description: 'variantId' })
  variantId!: number;

  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.IS_NOT_EMPTY') })
  @IsNumber({}, { message: i18nValidationMessage<I18nTranslations>('validation.IS_NUMBER') })
  @ApiProperty({ example: 5, description: 'amount' })
  amount!: number;

  @IsOptional()
  @IsEnum(['RESTOCK', 'SALE', 'ADJUSTMENT', 'RETURN'], {
    message: i18nValidationMessage<I18nTranslations>('validation.IS_ENUM'),
  })
  @ApiProperty({ example: 'RESTOCK', description: 'reason' })
  reason!: 'RESTOCK' | 'SALE' | 'ADJUSTMENT' | 'RETURN';
}
