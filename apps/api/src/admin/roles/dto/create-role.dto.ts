import { IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { i18nValidationMessage } from 'nestjs-i18n';
import { I18nTranslations } from '../../../generated/i18n.generated';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RoleTranslationDto {
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.NOT_EMPTY') })
  @ApiProperty({ example: 'en', description: 'langId' })
  langId!: string;

  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.NOT_EMPTY') })
  @ApiProperty({ example: 'Manager', description: 'name' })
  name!: string;
}

export class CreateRoleDto {
  @IsArray({ message: i18nValidationMessage<I18nTranslations>('validation.IS_ARRAY') })
  @ValidateNested({ each: true })
  @Type(() => RoleTranslationDto)
  @ApiProperty({
    example: [
      { langId: 'en', name: 'Manager' },
      { langId: 'ar', name: 'مدير' },
    ],
    description: 'translations',
  })
  translations!: RoleTranslationDto[];

  @IsArray({ message: i18nValidationMessage<I18nTranslations>('validation.IS_ARRAY') })
  @ApiPropertyOptional({ example: [], description: 'permissions' })
  permissions?: number[];

  @IsBoolean({ message: i18nValidationMessage<I18nTranslations>('validation.IS_BOOLEAN') })
  @IsOptional()
  @ApiPropertyOptional({ example: true, description: 'isActive' })
  isActive?: boolean;
}
