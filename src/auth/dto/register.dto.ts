import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { I18nTranslations } from '../../generated/i18n.generated';

export class RegisterDto {
    @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
    name!: string;

    @IsEmail({}, { message: i18nValidationMessage<I18nTranslations>('validation.IS_EMAIL') })
    email!: string;

    @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
    @MinLength(6, { message: i18nValidationMessage<I18nTranslations>('validation.MIN_LENGTH') })
    password!: string;

    @IsOptional()
    @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
    phone?: string;

    @IsOptional()
    @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
    phoneCode?: string;
}
