import { IsNotEmpty, IsString, IsArray, ValidateNested, IsInt, IsBoolean, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { i18nValidationMessage } from 'nestjs-i18n';
import { I18nTranslations } from '@/generated/i18n.generated';

export { AttributeValueQueryDto } from '@/common/dto/attribute-value-query.dto';

export class AttributeValueTranslationDto {
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.IS_NOT_EMPTY') })
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  langId!: string;

  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.IS_NOT_EMPTY') })
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  name!: string;
}

export class CreateAttributeValueDto {
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.IS_NOT_EMPTY') })
  @IsInt({ message: i18nValidationMessage<I18nTranslations>('validation.IS_INT') })
  @Type(() => Number)
  attributeId!: number;

  @IsBoolean({ message: i18nValidationMessage<I18nTranslations>('validation.IS_BOOLEAN') })
  @IsOptional()
  isActive?: boolean;

  @IsArray({ message: i18nValidationMessage<I18nTranslations>('validation.IS_ARRAY') })
  @ValidateNested({ each: true })
  @Type(() => AttributeValueTranslationDto)
  translations!: AttributeValueTranslationDto[];
}
