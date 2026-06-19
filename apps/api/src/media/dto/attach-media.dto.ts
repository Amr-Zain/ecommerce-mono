import { IsNotEmpty, IsString, IsIn } from 'class-validator';
import { ALLOWED_MEDIA_MODELS } from './upload-media.dto';
import { i18nValidationMessage } from 'nestjs-i18n';
import { I18nTranslations } from '../../generated/i18n.generated';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AttachMediaDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(ALLOWED_MEDIA_MODELS, { message: i18nValidationMessage<I18nTranslations>('validation.INVALID_MEDIA_MODEL') })
  @ApiProperty({ example: "product", description: 'model' })
  model!: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: "HASH_FROM_UPLOAD", description: 'attachHash' })
  attachHash!: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: "1", description: 'modelId' })
  modelId!: string;
}
