import { I18nTranslations } from '@/generated/i18n.generated';
import { i18nValidationMessage } from 'nestjs-i18n';
import { IsString, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStaticPageTranslaitonsDto {
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.IS_NOT_EMPTY') })
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  @ApiProperty({ example: "en", description: 'langId' })
  langId!: string;

  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.IS_NOT_EMPTY') })
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  @ApiProperty({ example: "Welcome to Ecommerce", description: 'title' })
  title!: string;

  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.IS_NOT_EMPTY') })
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  @ApiProperty({ example: "This is a sample page content.", description: 'content' })
  content!: string;
}

export class CreateStaticPageDto {
  @Type(() => CreateStaticPageTranslaitonsDto)
  @ValidateNested({ each: true })
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.IS_NOT_EMPTY') })
  @ApiProperty({ example: [{ langId: 'en', title: 'Welcome to Ecommerce', content: 'This is a sample page content.' }, { langId: 'ar', title: 'مرحباً بكم في فييندرا', content: 'هذا محتوى صفحة تجريبي.' }], description: 'translations' })
  translations!: CreateStaticPageTranslaitonsDto[];

  @Type(() => CreateStaticPageTranslaitonsDto)
  @ValidateNested({ each: true })
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.IS_NOT_EMPTY') })
  @ApiProperty({ example: [{ langId: 'en', title: 'Welcome to Ecommerce', content: 'This is a sample page content.' }, { langId: 'ar', title: 'مرحباً بكم في فييندرا', content: 'هذا محتوى صفحة تجريبي.' }], description: 'sections' })
  sections!: CreateStaticPageTranslaitonsDto[];

  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  @IsNotEmpty({ message: i18nValidationMessage<I18nTranslations>('validation.IS_NOT_EMPTY') })
  @ApiProperty({ example: "mock-main-image-hash", description: 'image' })
  image!: string;
}
