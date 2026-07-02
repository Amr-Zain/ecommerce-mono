import { IsString, IsOptional, IsBoolean, IsInt, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { i18nValidationMessage } from 'nestjs-i18n';
import { I18nTranslations } from '@/generated/i18n.generated';
import { IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FaqTranslationDto {
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.IS_NOT_EMPTY') })
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  @ApiProperty({ example: 'en', description: 'langId' })
  langId!: string;

  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.IS_NOT_EMPTY') })
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  @ApiProperty({ example: 'What is your return policy?', description: 'question' })
  question!: string;

  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.IS_NOT_EMPTY') })
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  @ApiProperty({ example: 'You can return any item within 30 days.', description: 'answer' })
  answer!: string;
}

export class CreateFaqDto {
  @IsOptional()
  @IsInt({ message: i18nValidationMessage<I18nTranslations>('validation.IS_INT') })
  @ApiPropertyOptional({ example: 0, description: 'sortOrder' })
  sortOrder?: number;

  @IsOptional()
  @IsBoolean({ message: i18nValidationMessage<I18nTranslations>('validation.IS_BOOLEAN') })
  @ApiPropertyOptional({ example: true, description: 'isActive' })
  isActive?: boolean;

  @IsArray({ message: i18nValidationMessage<I18nTranslations>('validation.IS_ARRAY') })
  @ValidateNested({ each: true })
  @Type(() => FaqTranslationDto)
  @ApiProperty({
    example: [
      { langId: 'en', question: 'What is your return policy?', answer: 'You can return any item within 30 days.' },
      { langId: 'ar', question: 'ما هي سياسة الإرجاع؟', answer: 'يمكنك إرجاع أي منتج خلال 30 يوماً.' },
    ],
    description: 'translations',
  })
  translations!: FaqTranslationDto[];
}
