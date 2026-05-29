import { I18nTranslations } from '@/generated/i18n.generated';
import { i18nValidationMessage } from 'nestjs-i18n';
import { IsString, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateStaticPageTranslaitonsDto {
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.IS_NOT_EMPTY') })
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  langId!: string;

  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.IS_NOT_EMPTY') })
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  title!: string;

  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.IS_NOT_EMPTY') })
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  content!: string;
}

export class CreateStaticPageDto {
  @Type(() => CreateStaticPageTranslaitonsDto)
  @ValidateNested({ each: true })
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.IS_NOT_EMPTY') })
  translations!: CreateStaticPageTranslaitonsDto[];

  @Type(() => CreateStaticPageTranslaitonsDto)
  @ValidateNested({ each: true })
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.IS_NOT_EMPTY') })
  sections!: CreateStaticPageTranslaitonsDto[];

  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.IS_NOT_EMPTY') })
  image!: string;
}
