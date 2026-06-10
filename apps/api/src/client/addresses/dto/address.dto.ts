import { IsBoolean, IsInt, IsOptional, IsPositive, IsString } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { I18nTranslations } from '../../../generated/i18n.generated';

export class CreateAddressDto {
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  address!: string;

  @IsOptional()
  @IsInt({ message: i18nValidationMessage<I18nTranslations>('validation.IS_INT') })
  @IsPositive({ message: i18nValidationMessage<I18nTranslations>('validation.IS_POSITIVE') })
  cityId?: number;

  @IsOptional()
  @IsInt({ message: i18nValidationMessage<I18nTranslations>('validation.IS_INT') })
  @IsPositive({ message: i18nValidationMessage<I18nTranslations>('validation.IS_POSITIVE') })
  countryId?: number;

  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  streetName?: string;

  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  buildingNumber?: string;

  @IsOptional()
  @IsBoolean({ message: i18nValidationMessage<I18nTranslations>('validation.IS_BOOLEAN') })
  isDefault?: boolean;
}

export class UpdateAddressDto {
  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  address?: string;

  @IsOptional()
  @IsInt({ message: i18nValidationMessage<I18nTranslations>('validation.IS_INT') })
  @IsPositive({ message: i18nValidationMessage<I18nTranslations>('validation.IS_POSITIVE') })
  cityId?: number;

  @IsOptional()
  @IsInt({ message: i18nValidationMessage<I18nTranslations>('validation.IS_INT') })
  @IsPositive({ message: i18nValidationMessage<I18nTranslations>('validation.IS_POSITIVE') })
  countryId?: number;

  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  streetName?: string;

  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  buildingNumber?: string;

  @IsOptional()
  @IsBoolean({ message: i18nValidationMessage<I18nTranslations>('validation.IS_BOOLEAN') })
  isDefault?: boolean;
}