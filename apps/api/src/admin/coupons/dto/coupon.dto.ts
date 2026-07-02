import { IsNumber, IsOptional, IsString, IsBoolean, IsDateString, IsNotEmpty } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { I18nTranslations } from '../../../generated/i18n.generated';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCouponDto {
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.NOT_EMPTY') })
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  @ApiProperty({ example: 'SUMMER20', description: 'code' })
  code!: string;

  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.NOT_EMPTY') })
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  @ApiProperty({ example: 'PERCENTAGE', description: 'discountType' })
  discountType!: string;

  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.NOT_EMPTY') })
  @IsNumber({}, { message: i18nValidationMessage<I18nTranslations>('validation.IS_NUMBER') })
  @ApiProperty({ example: 20, description: 'discountValue' })
  discountValue!: number;

  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.NOT_EMPTY') })
  @IsNumber({}, { message: i18nValidationMessage<I18nTranslations>('validation.IS_NUMBER') })
  @ApiProperty({ example: 100, description: 'minOrderAmount' })
  minOrderAmount!: number;

  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.NOT_EMPTY') })
  @IsNumber({}, { message: i18nValidationMessage<I18nTranslations>('validation.IS_NUMBER') })
  @ApiProperty({ example: 50, description: 'maxDiscount' })
  maxDiscount!: number;

  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.NOT_EMPTY') })
  @IsNumber({}, { message: i18nValidationMessage<I18nTranslations>('validation.IS_NUMBER') })
  @ApiProperty({ example: 100, description: 'usageLimit' })
  usageLimit!: number;

  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.NOT_EMPTY') })
  @IsNumber({}, { message: i18nValidationMessage<I18nTranslations>('validation.IS_NUMBER') })
  @ApiProperty({ example: 1, description: 'perUserLimit' })
  perUserLimit!: number;

  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.NOT_EMPTY') })
  @IsDateString({}, { message: i18nValidationMessage<I18nTranslations>('validation.INVALID_DATE') })
  @ApiProperty({ example: '2026-06-01T00:00:00Z', description: 'startsAt' })
  startsAt!: string;

  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.NOT_EMPTY') })
  @IsDateString({}, { message: i18nValidationMessage<I18nTranslations>('validation.INVALID_DATE') })
  @ApiProperty({ example: '2026-07-01T00:00:00Z', description: 'expiresAt' })
  expiresAt!: string;

  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.NOT_EMPTY') })
  @IsBoolean({ message: i18nValidationMessage<I18nTranslations>('validation.IS_BOOLEAN') })
  @ApiProperty({ example: true, description: 'isActive' })
  isActive!: boolean;
}

export class UpdateCouponDto {
  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  @ApiPropertyOptional({ example: 'SUMMER20', description: 'code' })
  code?: string;

  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  @ApiPropertyOptional({ example: 'PERCENTAGE', description: 'discountType' })
  discountType?: string;

  @IsOptional()
  @IsNumber({}, { message: i18nValidationMessage<I18nTranslations>('validation.IS_NUMBER') })
  @ApiPropertyOptional({ example: 20, description: 'discountValue' })
  discountValue?: number;

  @IsOptional()
  @IsNumber({}, { message: i18nValidationMessage<I18nTranslations>('validation.IS_NUMBER') })
  @ApiPropertyOptional({ example: 100, description: 'minOrderAmount' })
  minOrderAmount?: number;

  @IsOptional()
  @IsNumber({}, { message: i18nValidationMessage<I18nTranslations>('validation.IS_NUMBER') })
  @ApiPropertyOptional({ example: 50, description: 'maxDiscount' })
  maxDiscount?: number;

  @IsOptional()
  @IsNumber({}, { message: i18nValidationMessage<I18nTranslations>('validation.IS_NUMBER') })
  @ApiPropertyOptional({ example: 100, description: 'usageLimit' })
  usageLimit?: number;

  @IsOptional()
  @IsNumber({}, { message: i18nValidationMessage<I18nTranslations>('validation.IS_NUMBER') })
  @ApiPropertyOptional({ example: 1, description: 'perUserLimit' })
  perUserLimit?: number;

  @IsOptional()
  @IsDateString({}, { message: i18nValidationMessage<I18nTranslations>('validation.INVALID_DATE') })
  @ApiPropertyOptional({ example: '2026-06-01T00:00:00Z', description: 'startsAt' })
  startsAt?: string;

  @IsOptional()
  @IsDateString({}, { message: i18nValidationMessage<I18nTranslations>('validation.INVALID_DATE') })
  @ApiPropertyOptional({ example: '2026-07-01T00:00:00Z', description: 'expiresAt' })
  expiresAt?: string;

  @IsOptional()
  @IsBoolean({ message: i18nValidationMessage<I18nTranslations>('validation.IS_BOOLEAN') })
  @ApiPropertyOptional({ example: true, description: 'isActive' })
  isActive?: boolean;
}
