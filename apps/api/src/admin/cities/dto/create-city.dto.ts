import { i18nValidationMessage } from 'nestjs-i18n';
import { I18nTranslations } from '@/generated/i18n.generated';
import { IsArray, IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CityTranslationDto {
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.IS_NOT_EMPTY') })
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  @ApiProperty({ example: 'en', description: 'langId' })
  langId!: string;

  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.IS_NOT_EMPTY') })
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  @ApiProperty({ example: 'Riyadh', description: 'name' })
  name!: string;
}

export class createCityDto {
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.IS_NOT_EMPTY') })
  @IsInt({ message: i18nValidationMessage<I18nTranslations>('validation.IS_INT') })
  @ApiProperty({ example: 1, description: 'countryId' })
  countryId!: number;

  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.IS_NOT_EMPTY') })
  @IsArray({ message: i18nValidationMessage<I18nTranslations>('validation.IS_ARRAY') })
  @ValidateNested({ each: true })
  @Type(() => CityTranslationDto)
  @ApiProperty({
    example: [
      { langId: 'en', name: 'Riyadh' },
      { langId: 'ar', name: 'الرياض' },
    ],
    description: 'translations',
  })
  translations!: CityTranslationDto[];

  @IsOptional()
  @IsBoolean({ message: i18nValidationMessage<I18nTranslations>('validation.IS_BOOLEAN') })
  @ApiPropertyOptional({ example: true, description: 'isActive' })
  isActive?: boolean;
}
