import { IsNotEmpty, IsString, IsIn } from 'class-validator';
import { ALLOWED_MEDIA_MODELS } from './upload-media.dto';
import { i18nValidationMessage } from 'nestjs-i18n';
import { I18nTranslations } from '../../generated/i18n.generated';

export class AttachMediaDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(ALLOWED_MEDIA_MODELS, { message: i18nValidationMessage<I18nTranslations>('validation.INVALID_MEDIA_MODEL') })
  model!: string;

  @IsString()
  @IsNotEmpty()
  attachHash!: string;

  @IsString()
  @IsNotEmpty()
  modelId!: string;
}
