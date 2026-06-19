import { IsNotEmpty, IsString, IsArray, ValidateNested, IsInt, IsBoolean, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { i18nValidationMessage } from 'nestjs-i18n';
import { I18nTranslations } from '@/generated/i18n.generated';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export { AttributeValueQueryDto } from '@/common/dto/attribute-value-query.dto';

export class AttributeValueTranslationDto {
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.IS_NOT_EMPTY') })
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  @ApiProperty({ example: "en", description: 'langId' })
  langId!: string;

  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.IS_NOT_EMPTY') })
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  @ApiProperty({ example: "Red", description: 'name' })
  name!: string;
}

export class CreateAttributeValueDto {
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.IS_NOT_EMPTY') })
  @IsInt({ message: i18nValidationMessage<I18nTranslations>('validation.IS_INT') })
  @Type(() => Number)
  @ApiProperty({ example: 1, description: 'attributeId' })
  attributeId!: number;

  @IsBoolean({ message: i18nValidationMessage<I18nTranslations>('validation.IS_BOOLEAN') })
  @IsOptional()
  @ApiPropertyOptional({ example: true, description: 'isActive' })
  isActive?: boolean;

  @IsArray({ message: i18nValidationMessage<I18nTranslations>('validation.IS_ARRAY') })
  @ValidateNested({ each: true })
  @Type(() => AttributeValueTranslationDto)
  @ApiProperty({ example: [{ langId: 'en', name: 'Red' }, { langId: 'ar', name: 'أحمر' }], description: 'translations' })
  translations!: AttributeValueTranslationDto[];
}
