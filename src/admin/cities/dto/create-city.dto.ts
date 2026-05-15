import { i18nValidationMessage } from 'nestjs-i18n';
import { I18nTranslations } from '@/generated/i18n.generated';
import { IsArray, IsBoolean, IsInt, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CityTranslationDto {
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  langId!: string;
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  name!: string;
}

export class createCityDto {
  @IsInt({ message: i18nValidationMessage<I18nTranslations>('validation.IS_INT') })
  countryId!: number;
  @IsArray({ message: i18nValidationMessage<I18nTranslations>('validation.IS_ARRAY') })
  @ValidateNested({ each: true })
  @Type(() => CityTranslationDto)
  translations!: CityTranslationDto[];
  @IsBoolean({ message: i18nValidationMessage<I18nTranslations>('validation.IS_BOOLEAN') })
  isActive!: boolean;
}
