import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  IsArray,
  ValidateNested,
  IsNumber,
  Matches,
  Length,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { i18nValidationMessage } from 'nestjs-i18n';
import { I18nTranslations } from '@/generated/i18n.generated';
import { IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CountryTranslationDto {
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.IS_NOT_EMPTY') })
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  @ApiProperty({ example: 'en', description: 'langId' })
  langId!: string;

  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.IS_NOT_EMPTY') })
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  @ApiProperty({ example: "Saudi Arabia", description: 'name' })
  name!: string;

  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.IS_NOT_EMPTY') })
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  @ApiPropertyOptional({ example: "Saudi", description: 'nationality' })
  nationality?: string;

  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  @ApiPropertyOptional({ example: "SA", description: 'shortName' })
  shortName?: string;

  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  @ApiPropertyOptional({ example: "SAR", description: 'currencyCode' })
  currencyCode?: string;
}

export class CreateCountryDto {
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.IS_NOT_EMPTY') })
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  @Matches(/^[0-9]+$/, { message: i18nValidationMessage<I18nTranslations>('validation.IS_NUMERIC') })
  @Length(2, 4, { message: i18nValidationMessage<I18nTranslations>('validation.IS_LENGTH', { min: 2, max: 4 }) })
  @ApiProperty({ example: "966", description: 'phoneCode' })
  phoneCode!: string;

  @IsOptional()
  @IsInt({ message: i18nValidationMessage<I18nTranslations>('validation.IS_INT') })
  @ApiPropertyOptional({ example: 1, description: 'phoneLength' })
  phoneLength?: number;

  @IsOptional()
  @IsNumber({}, { message: i18nValidationMessage<I18nTranslations>('validation.IS_NUMBER') })
  @Min(0, { message: i18nValidationMessage<I18nTranslations>('validation.MIN', { min: 0 }) })
  @ApiPropertyOptional({ example: 1, description: 'shippingPrice' })
  shippingPrice?: number;

  @IsOptional()
  @IsBoolean({ message: i18nValidationMessage<I18nTranslations>('validation.IS_BOOLEAN') })
  @ApiPropertyOptional({ example: true, description: 'isActive' })
  isActive?: boolean;

  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.IS_NOT_EMPTY') })
  @IsNumber({}, { message: i18nValidationMessage<I18nTranslations>('validation.IS_NUMBER') })
  @Min(0, { message: i18nValidationMessage<I18nTranslations>('validation.MIN', { min: 0 }) })
  @Max(10, { message: i18nValidationMessage<I18nTranslations>('validation.MAX', { max: 10 }) })
  @ApiProperty({ example: 1, description: 'phoneStartWith' })
  phoneStartWith!: number;

  @IsArray({ message: i18nValidationMessage<I18nTranslations>('validation.IS_ARRAY') })
  @ValidateNested({ each: true })
  @Type(() => CountryTranslationDto)
  @ApiProperty({ example: [{ langId: 'en', name: 'Saudi Arabia', nationality: 'Saudi', shortName: 'SA', currencyCode: 'SAR' }, { langId: 'ar', name: 'المملكة العربية السعودية', nationality: 'سعودي', shortName: 'SA', currencyCode: 'SAR' }], description: 'translations' })
  translations!: CountryTranslationDto[];

  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.IS_NOT_EMPTY') })
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  @ApiProperty({ example: "🇸🇦", description: 'flag' })
  flag!: string;
}
