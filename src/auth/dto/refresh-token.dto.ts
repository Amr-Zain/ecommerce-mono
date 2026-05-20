import { IsString, IsOptional } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { I18nTranslations } from '../../generated/i18n.generated';

export class RefreshTokenDto {
  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  refreshToken?: string;
}
