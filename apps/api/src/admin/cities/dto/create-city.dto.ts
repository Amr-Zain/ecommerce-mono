import { i18nValidationMessage } from 'nestjs-i18n';
import { I18nTranslations } from '@/generated/i18n.generated';
import { IsArray, IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CityTranslationDto {
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.IS_NOT_EMPTY') })
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  langId!: string;

  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.IS_NOT_EMPTY') })
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  name!: string;
}

export class createCityDto {
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.IS_NOT_EMPTY') })
  @IsInt({ message: i18nValidationMessage<I18nTranslations>('validation.IS_INT') })
  countryId!: number;

  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.IS_NOT_EMPTY') })
  @IsArray({ message: i18nValidationMessage<I18nTranslations>('validation.IS_ARRAY') })
  @ValidateNested({ each: true })
  @Type(() => CityTranslationDto)
  translations!: CityTranslationDto[];

  @IsOptional()
  @IsBoolean({ message: i18nValidationMessage<I18nTranslations>('validation.IS_BOOLEAN') })
  isActive?: boolean;
}
