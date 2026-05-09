import { IsOptional, IsString, IsNotEmpty, IsIn } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

import { I18nTranslations } from '../../generated/i18n.generated';

export const ALLOWED_MEDIA_MODELS = [
  'user',
  'category',
  'product',
  'slider',
  'review',
  'static_page',
  'page_section',
  'faq',
  'attribute',
];

export class UploadMediaDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(ALLOWED_MEDIA_MODELS, { message: i18nValidationMessage<I18nTranslations>('validation.INVALID_MEDIA_MODEL') })
  model!: string;

  @IsString()
  @IsOptional()
  modelId?: string;

  @IsString()
  @IsOptional()
  collection?: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsString()
  @IsOptional()
  attachHash?: string;
}
