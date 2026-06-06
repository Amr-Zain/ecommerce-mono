import { IsEmail, IsString, IsEnum, ValidateIf, IsNotEmpty } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { I18nTranslations } from '../../generated/i18n.generated';

export class RegisterDto {
  @IsEnum(['email', 'phone'], { message: i18nValidationMessage<I18nTranslations>('validation.IS_ENUM') })
  type!: 'email' | 'phone';

  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  name!: string;

  @ValidateIf((o: RegisterDto) => o.type === 'email')
  @IsEmail({}, { message: i18nValidationMessage<I18nTranslations>('validation.IS_EMAIL') })
  email?: string;

  @ValidateIf((o: RegisterDto) => o.type === 'phone')
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.IS_NOT_EMPTY') })
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  phone?: string;

  @ValidateIf((o: RegisterDto) => o.type === 'phone')
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.IS_NOT_EMPTY') })
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  phoneCode!: string;
}
