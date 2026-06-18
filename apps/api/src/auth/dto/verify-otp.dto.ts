import { IsEmail, IsString, IsEnum, IsOptional, Length, ValidateIf } from 'class-validator';
import { Transform } from 'class-transformer';
import { i18nValidationMessage } from 'nestjs-i18n';
import { I18nTranslations } from '../../generated/i18n.generated';

export class VerifyOtpDto {
  @IsEnum(['email', 'phone'], { message: i18nValidationMessage<I18nTranslations>('validation.IS_ENUM') })
  type!: 'email' | 'phone';

  @ValidateIf((o: VerifyOtpDto) => o.type === 'email')
  @IsEmail({}, { message: i18nValidationMessage<I18nTranslations>('validation.IS_EMAIL') })
  email?: string;

  @ValidateIf((o: VerifyOtpDto) => o.type === 'phone')
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  phone?: string;

  @ValidateIf((o: VerifyOtpDto) => o.type === 'phone')
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  @IsOptional()
  phoneCode?: string;

  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  @Transform(({ value }) => String(value ?? '').replace(/\D/g, '').slice(0, 4))
  @Length(4, 4, { message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  code!: string;

}
