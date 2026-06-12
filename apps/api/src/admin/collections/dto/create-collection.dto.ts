import { IsNotEmpty, IsString, IsOptional, IsInt, IsBoolean, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { i18nValidationMessage } from 'nestjs-i18n';
import { I18nTranslations } from '@/generated/i18n.generated';

export class CollectionTranslationDto {
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

export class CreateCollectionDto {
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.IS_NOT_EMPTY') })
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  slug!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: i18nValidationMessage<I18nTranslations>('validation.IS_INT') })
  parentId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: i18nValidationMessage<I18nTranslations>('validation.IS_INT') })
  @Min(0, { message: i18nValidationMessage<I18nTranslations>('validation.MIN') })
  sortOrder?: number = 0;

  @IsOptional()
  @IsBoolean({ message: i18nValidationMessage<I18nTranslations>('validation.IS_BOOLEAN') })
  isActive?: boolean = true;

  @IsArray({ message: i18nValidationMessage<I18nTranslations>('validation.IS_ARRAY') })
  @ValidateNested({ each: true })
  @Type(() => CollectionTranslationDto)
  translations!: CollectionTranslationDto[];

  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  image?: string;
}
