import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { i18nValidationMessage } from 'nestjs-i18n';

import { I18nTranslations } from '@/generated/i18n.generated';

export class StaticPageTranslationDto {
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.IS_NOT_EMPTY') })
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  @ApiProperty({ example: 'en', description: 'langId' })
  langId!: string;

  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.IS_NOT_EMPTY') })
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  @ApiProperty({ example: 'Privacy Policy', description: 'title' })
  title!: string;

  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.IS_NOT_EMPTY') })
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  @ApiProperty({ example: 'How we collect, use, and protect customer data.', description: 'content' })
  content!: string;
}

export class StaticPageSectionDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: i18nValidationMessage<I18nTranslations>('validation.IS_INT') })
  @ApiPropertyOptional({ example: 12, description: 'id' })
  id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: i18nValidationMessage<I18nTranslations>('validation.IS_INT') })
  @ApiPropertyOptional({ example: 1, description: 'sortOrder' })
  sortOrder?: number;

  @IsOptional()
  @IsBoolean({ message: i18nValidationMessage<I18nTranslations>('validation.IS_BOOLEAN') })
  @ApiPropertyOptional({ example: true, description: 'isActive' })
  isActive?: boolean;

  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  @ApiPropertyOptional({ example: 'uploaded-section-image-hash', description: 'image' })
  image?: string;

  @Type(() => StaticPageTranslationDto)
  @ValidateNested({ each: true })
  @IsArray({ message: i18nValidationMessage<I18nTranslations>('validation.IS_ARRAY') })
  @ApiProperty({
    example: [
      { langId: 'en', title: 'What is covered', content: 'Warranty coverage begins on delivery.' },
      { langId: 'ar', title: 'What is covered', content: 'Warranty coverage begins on delivery.' },
    ],
    description: 'translations',
  })
  translations!: StaticPageTranslationDto[];
}

export class CreateStaticPageDto {
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.IS_NOT_EMPTY') })
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  @ApiProperty({ example: 'privacy-policy', description: 'slug' })
  slug!: string;

  @Type(() => StaticPageTranslationDto)
  @ValidateNested({ each: true })
  @IsArray({ message: i18nValidationMessage<I18nTranslations>('validation.IS_ARRAY') })
  @ApiProperty({
    example: [
      { langId: 'en', title: 'Privacy Policy', content: 'How we collect, use, and protect customer data.' },
      { langId: 'ar', title: 'Privacy Policy', content: 'How we collect, use, and protect customer data.' },
    ],
    description: 'translations',
  })
  translations!: StaticPageTranslationDto[];

  @IsOptional()
  @Type(() => StaticPageSectionDto)
  @ValidateNested({ each: true })
  @IsArray({ message: i18nValidationMessage<I18nTranslations>('validation.IS_ARRAY') })
  @ApiPropertyOptional({ description: 'sections' })
  sections?: StaticPageSectionDto[];

  @IsOptional()
  @IsBoolean({ message: i18nValidationMessage<I18nTranslations>('validation.IS_BOOLEAN') })
  @ApiPropertyOptional({ example: true, description: 'isActive' })
  isActive?: boolean;

  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  @ApiPropertyOptional({ example: 'uploaded-main-image-hash', description: 'image' })
  image?: string;
}
