import { IsBoolean, IsInt, IsOptional, IsPositive, IsString } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { I18nTranslations } from '../../../generated/i18n.generated';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAddressDto {
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  @ApiProperty({ example: "123 Main Street", description: 'address' })
  address!: string;

  @IsOptional()
  @IsInt({ message: i18nValidationMessage<I18nTranslations>('validation.IS_INT') })
  @IsPositive({ message: i18nValidationMessage<I18nTranslations>('validation.IS_POSITIVE') })
  @ApiPropertyOptional({ example: 1, description: 'cityId' })
  cityId?: number;

  @IsOptional()
  @IsInt({ message: i18nValidationMessage<I18nTranslations>('validation.IS_INT') })
  @IsPositive({ message: i18nValidationMessage<I18nTranslations>('validation.IS_POSITIVE') })
  @ApiPropertyOptional({ example: 1, description: 'countryId' })
  countryId?: number;

  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  @ApiPropertyOptional({ example: "Main St", description: 'streetName' })
  streetName?: string;

  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  @ApiPropertyOptional({ example: "123", description: 'buildingNumber' })
  buildingNumber?: string;

  @IsOptional()
  @IsBoolean({ message: i18nValidationMessage<I18nTranslations>('validation.IS_BOOLEAN') })
  @ApiPropertyOptional({ example: true, description: 'isDefault' })
  isDefault?: boolean;
}

export class UpdateAddressDto {
  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  @ApiPropertyOptional({ example: "123 Main Street", description: 'address' })
  address?: string;

  @IsOptional()
  @IsInt({ message: i18nValidationMessage<I18nTranslations>('validation.IS_INT') })
  @IsPositive({ message: i18nValidationMessage<I18nTranslations>('validation.IS_POSITIVE') })
  @ApiPropertyOptional({ example: 1, description: 'cityId' })
  cityId?: number;

  @IsOptional()
  @IsInt({ message: i18nValidationMessage<I18nTranslations>('validation.IS_INT') })
  @IsPositive({ message: i18nValidationMessage<I18nTranslations>('validation.IS_POSITIVE') })
  @ApiPropertyOptional({ example: 1, description: 'countryId' })
  countryId?: number;

  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  @ApiPropertyOptional({ example: "Main St", description: 'streetName' })
  streetName?: string;

  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  @ApiPropertyOptional({ example: "123", description: 'buildingNumber' })
  buildingNumber?: string;

  @IsOptional()
  @IsBoolean({ message: i18nValidationMessage<I18nTranslations>('validation.IS_BOOLEAN') })
  @ApiPropertyOptional({ example: true, description: 'isDefault' })
  isDefault?: boolean;
}
