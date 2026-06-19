import { IsString, IsOptional, IsBoolean, IsInt, IsArray, ValidateNested, IsNumber, IsEmail } from 'class-validator';
import { Type } from 'class-transformer';
import { i18nValidationMessage } from 'nestjs-i18n';
import { I18nTranslations } from '@/generated/i18n.generated';
import { IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ShowRoomTranslationDto {
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.IS_NOT_EMPTY') })
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  @ApiProperty({ example: "en", description: 'langId' })
  langId!: string;

  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.IS_NOT_EMPTY') })
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  @ApiProperty({ example: "Riyadh Showroom", description: 'name' })
  name!: string;

  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.IS_NOT_EMPTY') })
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  @ApiProperty({ example: "King Fahd Road, Olaya District", description: 'address' })
  address!: string;

  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.IS_NOT_EMPTY') })
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  @ApiProperty({ example: "Riyadh", description: 'city' })
  city!: string;
}

export class CreateShowRoomDto {
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.IS_NOT_EMPTY') })
  @Type(() => Number)
  @IsInt({ message: i18nValidationMessage<I18nTranslations>('validation.IS_INT') })
  @ApiProperty({ example: 1, description: 'countryId' })
  countryId!: number;

  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.IS_NOT_EMPTY') })
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  @ApiProperty({ example: "+966", description: 'phoneCode' })
  phoneCode!: string;

  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.IS_NOT_EMPTY') })
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  @ApiProperty({ example: "512345678", description: 'phone' })
  phone!: string;

  @IsOptional()
  @IsEmail({}, { message: i18nValidationMessage<I18nTranslations>('validation.IS_EMAIL') })
  @ApiPropertyOptional({ example: "riyadh@example.com", description: 'email' })
  email?: string;

  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  @ApiPropertyOptional({ example: "https://maps.google.com/?q=24.7136,46.6753", description: 'url' })
  url?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: i18nValidationMessage<I18nTranslations>('validation.IS_NUMBER') })
  @ApiPropertyOptional({ example: 24.7136, description: 'lat' })
  lat?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: i18nValidationMessage<I18nTranslations>('validation.IS_NUMBER') })
  @ApiPropertyOptional({ example: 46.6753, description: 'lng' })
  lng?: number;

  @IsOptional()
  @IsBoolean({ message: i18nValidationMessage<I18nTranslations>('validation.IS_BOOLEAN') })
  @ApiPropertyOptional({ example: true, description: 'isActive' })
  isActive?: boolean;

  @IsArray({ message: i18nValidationMessage<I18nTranslations>('validation.IS_ARRAY') })
  @ValidateNested({ each: true })
  @Type(() => ShowRoomTranslationDto)
  @ApiProperty({ example: [{ langId: 'en', name: 'Riyadh Showroom', address: 'King Fahd Road, Olaya District', city: 'Riyadh' }, { langId: 'ar', name: 'معرض الرياض', address: 'طريق الملك فهد، حي العليا', city: 'الرياض' }], description: 'translations' })
  translations!: ShowRoomTranslationDto[];
}
