import { IsOptional, IsString, IsNotEmpty, IsIn } from 'class-validator';
import { Prisma } from '@prisma/client';
import { i18nValidationMessage } from 'nestjs-i18n';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { I18nTranslations } from '../../generated/i18n.generated';

export const ALLOWED_MEDIA_MODELS = Object.values(Prisma.ModelName).map((model) => model.toLowerCase());

export class UploadMediaDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(ALLOWED_MEDIA_MODELS, { message: i18nValidationMessage<I18nTranslations>('validation.INVALID_MEDIA_MODEL') })
  @ApiProperty({ example: "product", description: 'model' })
  model!: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ example: "1", description: 'modelId' })
  modelId?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ example: "products", description: 'collection' })
  collection?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ example: "email", description: 'type' })
  type?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ example: "HASH_FROM_UPLOAD", description: 'attachHash' })
  attachHash?: string;

  @IsOptional()
  @ApiPropertyOptional({ example: true, description: 'isMain' })
  isMain?: boolean;
}
