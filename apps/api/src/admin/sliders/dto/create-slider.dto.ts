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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SliderTranslationDto {
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.IS_NOT_EMPTY') })
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  @ApiProperty({ example: "en", description: 'langId' })
  langId!: string;

  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.IS_NOT_EMPTY') })
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  @ApiProperty({ example: "Summer Sale", description: 'title' })
  title!: string;
}

export class CreateSliderDto {
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => (value !== undefined && value !== '' ? Number(value) : undefined))
  @IsInt({ message: i18nValidationMessage<I18nTranslations>('validation.IS_INT') })
  @ApiPropertyOptional({ example: 0, description: 'sortOrder' })
  sortOrder?: number;

  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.IS_NOT_EMPTY') })
  @IsDateString({}, { message: i18nValidationMessage<I18nTranslations>('validation.INVALID_DATE') })
  @IsNotPast({ message: i18nValidationMessage<I18nTranslations>('validation.DATE_NOT_PAST') })
  @ApiPropertyOptional({ example: "2026-05-01T00:00:00Z", description: 'startDate' })
  startDate?: string;

  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.IS_NOT_EMPTY') })
  @IsDateString({}, { message: i18nValidationMessage<I18nTranslations>('validation.INVALID_DATE') })
  @IsAfter('startDate', { message: i18nValidationMessage<I18nTranslations>('validation.DATE_MUST_BE_AFTER') })
  @ApiPropertyOptional({ example: "2026-08-31T23:59:59Z", description: 'endDate' })
  endDate?: string;

  @IsOptional()
  @IsBoolean({ message: i18nValidationMessage<I18nTranslations>('validation.IS_BOOLEAN') })
  @ApiPropertyOptional({ example: true, description: 'isActive' })
  isActive?: boolean;

  @IsArray({ message: i18nValidationMessage<I18nTranslations>('validation.IS_ARRAY') })
  @ValidateNested({ each: true })
  @Type(() => SliderTranslationDto)
  @ApiProperty({ example: [{ langId: 'en', title: 'Summer Sale' }, { langId: 'ar', title: 'تخفيضات الصيف' }], description: 'translations' })
  translations!: SliderTranslationDto[];

  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.IS_NOT_EMPTY') })
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  @ApiProperty({ example: "mock-slide-image-hash", description: 'slide' })
  slide!: string;
}
