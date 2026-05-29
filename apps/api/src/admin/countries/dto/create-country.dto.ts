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

export class CountryTranslationDto {
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.IS_NOT_EMPTY') })
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  langId!: string;

  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.IS_NOT_EMPTY') })
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  name!: string;

  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.IS_NOT_EMPTY') })
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  nationality?: string;

  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  shortName?: string;

  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  currencyCode?: string;
}

export class CreateCountryDto {
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.IS_NOT_EMPTY') })
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  @Matches(/^[0-9]+$/, { message: i18nValidationMessage<I18nTranslations>('validation.IS_NUMERIC') })
  @Length(2, 4, { message: i18nValidationMessage<I18nTranslations>('validation.IS_LENGTH', { min: 2, max: 4 }) })
  phoneCode!: string;

  @IsOptional()
  @IsInt({ message: i18nValidationMessage<I18nTranslations>('validation.IS_INT') })
  phoneLength?: number;

  @IsOptional()
  @IsNumber({}, { message: i18nValidationMessage<I18nTranslations>('validation.IS_NUMBER') })
  @Min(0, { message: i18nValidationMessage<I18nTranslations>('validation.MIN', { min: 0 }) })
  shippingPrice?: number;

  @IsOptional()
  @IsBoolean({ message: i18nValidationMessage<I18nTranslations>('validation.IS_BOOLEAN') })
  isActive?: boolean;

  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.IS_NOT_EMPTY') })
  @IsNumber({}, { message: i18nValidationMessage<I18nTranslations>('validation.IS_NUMBER') })
  @Min(0, { message: i18nValidationMessage<I18nTranslations>('validation.MIN', { min: 0 }) })
  @Max(10, { message: i18nValidationMessage<I18nTranslations>('validation.MAX', { max: 10 }) })
  phoneStartWith!: number;

  @IsArray({ message: i18nValidationMessage<I18nTranslations>('validation.IS_ARRAY') })
  @ValidateNested({ each: true })
  @Type(() => CountryTranslationDto)
  translations!: CountryTranslationDto[];

  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.IS_NOT_EMPTY') })
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  flag!: string;
}
