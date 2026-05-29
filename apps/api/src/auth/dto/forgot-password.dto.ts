import { IsEmail } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { I18nTranslations } from '../../generated/i18n.generated';

export class ForgotPasswordDto {
  @IsEmail({}, { message: i18nValidationMessage<I18nTranslations>('validation.IS_EMAIL') })
  email!: string;
}
