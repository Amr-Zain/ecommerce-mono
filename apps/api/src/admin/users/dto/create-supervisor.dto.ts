import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  IsBoolean,
  IsObject,
  IsIn,
  ValidateNested,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { I18nTranslations } from '../../../generated/i18n.generated';
import { Type } from 'class-transformer';
import { Match } from '../../../common/decorators/match.decorator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SupervisorSettingsDto {
  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({ example: true, description: 'allowNotifications' })
  allowNotifications?: boolean;

  @IsOptional()
  @IsString()
  @IsIn(['ar', 'en'])
  @ApiPropertyOptional({ example: 'en', description: 'language' })
  language?: string;
}

export class CreateSupervisorDto {
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.NOT_EMPTY') })
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  @ApiProperty({ example: 'mock-avatar-hash', description: 'avatar' })
  avatar!: string;

  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.NOT_EMPTY') })
  @ApiProperty({ example: 'Test Supervisor', description: 'name' })
  name!: string;

  @IsEmail({}, { message: i18nValidationMessage<I18nTranslations>('validation.IS_EMAIL') })
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.NOT_EMPTY') })
  @ApiProperty({ example: 'test@ecommerce.com', description: 'email' })
  email!: string;

  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  @MinLength(6, { message: i18nValidationMessage<I18nTranslations>('validation.MIN_LENGTH') })
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.NOT_EMPTY') })
  @ApiProperty({ example: 'password123', description: 'password' })
  password!: string;

  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.NOT_EMPTY') })
  @Match('password', { message: i18nValidationMessage<I18nTranslations>('validation.PASSWORDS_MATCH') })
  @ApiProperty({ example: 'password123', description: 'passwordConfirm' })
  passwordConfirm!: string;

  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.NOT_EMPTY') })
  @Type(() => BigInt)
  @ApiProperty({ example: 1, description: 'roleId' })
  roleId!: bigint;

  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  @ApiPropertyOptional({ example: '512345678', description: 'phone' })
  phone?: string;

  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  @ApiPropertyOptional({ example: '966', description: 'phoneCode' })
  phoneCode?: string;

  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  @IsIn(['male', 'female'])
  @ApiPropertyOptional({ example: 'male', description: 'gender' })
  gender?: string;

  @IsOptional()
  @IsBoolean({ message: i18nValidationMessage<I18nTranslations>('validation.IS_BOOLEAN') })
  @ApiPropertyOptional({ example: true, description: 'isActive' })
  isActive?: boolean;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => SupervisorSettingsDto)
  @ApiPropertyOptional({ example: {}, description: 'settings' })
  settings?: SupervisorSettingsDto;
}
