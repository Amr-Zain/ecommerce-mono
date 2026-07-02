import { IsEmail, IsString, MinLength } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { I18nTranslations } from '../../generated/i18n.generated';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @IsEmail({}, { message: i18nValidationMessage<I18nTranslations>('validation.IS_EMAIL') })
  @ApiProperty({ example: 'admin@ecommerce.com', description: 'email' })
  email!: string;

  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  @MinLength(6, { message: i18nValidationMessage<I18nTranslations>('validation.MIN_LENGTH') })
  @ApiProperty({ example: 'password123', description: 'password' })
  password!: string;
}
