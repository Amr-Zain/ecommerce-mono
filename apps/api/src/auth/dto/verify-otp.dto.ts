import { IsEmail, IsString, IsEnum, IsOptional, Length, ValidateIf } from 'class-validator';
import { Transform } from 'class-transformer';
import { i18nValidationMessage } from 'nestjs-i18n';
import { I18nTranslations } from '../../generated/i18n.generated';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class VerifyOtpDto {
  @IsEnum(['email', 'phone'], { message: i18nValidationMessage<I18nTranslations>('validation.IS_ENUM') })
  @ApiProperty({ example: 'email', description: 'type' })
  type!: 'email' | 'phone';

  @ValidateIf((o: VerifyOtpDto) => o.type === 'email')
  @IsEmail({}, { message: i18nValidationMessage<I18nTranslations>('validation.IS_EMAIL') })
  @ApiPropertyOptional({ example: 'john.doe@example.com', description: 'email' })
  email?: string;

  @ValidateIf((o: VerifyOtpDto) => o.type === 'phone')
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  @ApiPropertyOptional({ example: '512345678', description: 'phone' })
  phone?: string;

  @ValidateIf((o: VerifyOtpDto) => o.type === 'phone')
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  @IsOptional()
  @ApiPropertyOptional({ example: '966', description: 'phoneCode' })
  phoneCode?: string;

  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  @Transform(({ value }) =>
    String(value ?? '')
      .replace(/\D/g, '')
      .slice(0, 4),
  )
  @Length(4, 4, { message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  @ApiProperty({ example: '1111', description: 'code' })
  code!: string;
}
