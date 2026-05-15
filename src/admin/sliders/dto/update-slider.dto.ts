import { PartialType } from '@nestjs/mapped-types';
import { CreateSliderDto } from './create-slider.dto';
import { IsOptional, IsString } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { I18nTranslations } from '@/generated/i18n.generated';

export class UpdateSliderDto extends PartialType(CreateSliderDto) {
  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  media?: string;
}
