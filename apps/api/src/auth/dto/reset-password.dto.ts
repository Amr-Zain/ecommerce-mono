import { IsEmail, IsString, MinLength, Length } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { I18nTranslations } from '../../generated/i18n.generated';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @IsEmail({}, { message: i18nValidationMessage<I18nTranslations>('validation.IS_EMAIL') })
  @ApiProperty({ example: 'john.doe@example.com', description: 'email' })
  email!: string;

  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  @Length(4, 4, { message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  @ApiProperty({ example: '123456', description: 'code' })
  code!: string;

  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  @MinLength(6, { message: i18nValidationMessage<I18nTranslations>('validation.MIN_LENGTH') })
  @ApiProperty({ example: 'newPassword123', description: 'newPassword' })
  newPassword!: string;
}
