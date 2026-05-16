import { PartialType } from '@nestjs/mapped-types';
import { CreateSupervisorDto } from './create-supervisor.dto';
import { IsOptional, IsString, MinLength } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { I18nTranslations } from '../../../generated/i18n.generated';
import { Match } from '../../../common/decorators/match.decorator';

export class UpdateSupervisorDto extends PartialType(CreateSupervisorDto) {
  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  @MinLength(6, { message: i18nValidationMessage<I18nTranslations>('validation.MIN_LENGTH') })
  override password?: string;

  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  @Match('password', { message: i18nValidationMessage<I18nTranslations>('validation.PASSWORDS_MATCH') })
  override passwordConfirm?: string;
}
