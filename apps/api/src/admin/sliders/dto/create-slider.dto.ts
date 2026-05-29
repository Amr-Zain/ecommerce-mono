import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  IsArray,
  ValidateNested,
  IsDateString,
  IsNotEmpty,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { i18nValidationMessage } from 'nestjs-i18n';
import { I18nTranslations } from '@/generated/i18n.generated';
import { IsAfter } from '@/common/decorators/is-after.decorator';
import { IsNotPast } from '@/common/decorators/is-not-past.decorator';

export class SliderTranslationDto {
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.IS_NOT_EMPTY') })
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  langId!: string;

  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.IS_NOT_EMPTY') })
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  title!: string;
}

export class CreateSliderDto {
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => (value !== undefined && value !== '' ? Number(value) : undefined))
  @IsInt({ message: i18nValidationMessage<I18nTranslations>('validation.IS_INT') })
  sortOrder?: number;

  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.IS_NOT_EMPTY') })
  @IsDateString({}, { message: i18nValidationMessage<I18nTranslations>('validation.INVALID_DATE') })
  @IsNotPast({ message: i18nValidationMessage<I18nTranslations>('validation.DATE_NOT_PAST') })
  startDate?: string;

  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.IS_NOT_EMPTY') })
  @IsDateString({}, { message: i18nValidationMessage<I18nTranslations>('validation.INVALID_DATE') })
  @IsAfter('startDate', { message: i18nValidationMessage<I18nTranslations>('validation.DATE_MUST_BE_AFTER') })
  endDate?: string;

  @IsOptional()
  @IsBoolean({ message: i18nValidationMessage<I18nTranslations>('validation.IS_BOOLEAN') })
  isActive?: boolean;

  @IsArray({ message: i18nValidationMessage<I18nTranslations>('validation.IS_ARRAY') })
  @ValidateNested({ each: true })
  @Type(() => SliderTranslationDto)
  translations!: SliderTranslationDto[];

  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.IS_NOT_EMPTY') })
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  slide!: string;
}
