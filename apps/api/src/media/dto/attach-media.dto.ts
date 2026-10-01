import { IsNotEmpty, IsString, IsIn, Matches } from 'class-validator';
import { ALLOWED_MEDIA_MODELS } from './upload-media.dto';
import { i18nValidationMessage } from 'nestjs-i18n';
import { I18nTranslations } from '../../generated/i18n.generated';
import { ApiProperty } from '@nestjs/swagger';

export class AttachMediaDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(ALLOWED_MEDIA_MODELS, { message: i18nValidationMessage<I18nTranslations>('validation.INVALID_MEDIA_MODEL') })
  @ApiProperty({ example: 'product', description: 'model' })
  model!: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'HASH_FROM_UPLOAD', description: 'attachHash' })
  @Matches(/^[a-zA-Z0-9_-]{1,128}$/)
  attachHash!: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: '1', description: 'modelId' })
  @Matches(/^[1-9][0-9]{0,18}$/)
  modelId!: string;
}
