import { IsEmail, IsString, IsEnum, ValidateIf, IsNotEmpty } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { I18nTranslations } from '../../generated/i18n.generated';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @IsEnum(['email', 'phone'], { message: i18nValidationMessage<I18nTranslations>('validation.IS_ENUM') })
  @ApiProperty({ example: 'email', description: 'type' })
  type!: 'email' | 'phone';

  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  @ApiProperty({ example: 'John Doe', description: 'name' })
  name!: string;

  @ValidateIf((o: RegisterDto) => o.type === 'email')
  @IsEmail({}, { message: i18nValidationMessage<I18nTranslations>('validation.IS_EMAIL') })
  @ApiPropertyOptional({ example: 'john.doe@example.com', description: 'email' })
  email?: string;

  @ValidateIf((o: RegisterDto) => o.type === 'phone')
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.IS_NOT_EMPTY') })
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  @ApiPropertyOptional({ example: '512345678', description: 'phone' })
  phone?: string;

  @ValidateIf((o: RegisterDto) => o.type === 'phone')
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.IS_NOT_EMPTY') })
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  @ApiProperty({ example: '966', description: 'phoneCode' })
  phoneCode!: string;
}
