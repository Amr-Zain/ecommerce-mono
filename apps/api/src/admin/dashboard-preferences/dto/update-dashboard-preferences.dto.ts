import { Type } from 'class-transformer';
import { IsIn, IsInt, IsObject, IsOptional, IsString, Matches, MaxLength, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { i18nValidationMessage } from 'nestjs-i18n';
import { I18nTranslations } from '@/generated/i18n.generated';
import {
  DASHBOARD_SIDEBAR_COLLAPSIBLE,
  DASHBOARD_SIDEBAR_SIDES,
  DASHBOARD_SIDEBAR_VARIANTS,
  DASHBOARD_ARABIC_FONTS,
  DASHBOARD_LATIN_FONTS,
  DASHBOARD_THEME_MODES,
  DASHBOARD_THEME_SOURCES,
  type DashboardSidebarCollapsible,
  type DashboardSidebarSide,
  type DashboardSidebarVariant,
  type DashboardThemeMode,
  type DashboardThemeSource,
  type DashboardThemeVariables,
} from '../dashboard-preferences.types';

class ThemeVariableModesDto {
  @IsObject({ message: i18nValidationMessage<I18nTranslations>('validation.IS_OBJECT') })
  @ApiProperty({ type: 'object', additionalProperties: { type: 'string' } })
  light!: DashboardThemeVariables;

  @IsObject({ message: i18nValidationMessage<I18nTranslations>('validation.IS_OBJECT') })
  @ApiProperty({ type: 'object', additionalProperties: { type: 'string' } })
  dark!: DashboardThemeVariables;
}

class DashboardThemeDto {
  @IsIn(DASHBOARD_THEME_SOURCES, { message: i18nValidationMessage<I18nTranslations>('validation.IS_ENUM') })
  @ApiProperty({ enum: DASHBOARD_THEME_SOURCES, example: 'tweakcn' })
  source!: DashboardThemeSource;

  @IsOptional()
  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  @MaxLength(80, { message: i18nValidationMessage<I18nTranslations>('validation.MAX_LENGTH') })
  @ApiPropertyOptional({ example: 'violet-bloom', nullable: true })
  presetId!: string | null;

  @ValidateNested()
  @Type(() => ThemeVariableModesDto)
  @ApiProperty({ type: ThemeVariableModesDto })
  customVariables!: ThemeVariableModesDto;

  @ValidateNested()
  @Type(() => ThemeVariableModesDto)
  @ApiProperty({ type: ThemeVariableModesDto })
  overrides!: ThemeVariableModesDto;
}

class DashboardSidebarDto {
  @IsIn(DASHBOARD_SIDEBAR_VARIANTS, { message: i18nValidationMessage<I18nTranslations>('validation.IS_ENUM') })
  @ApiProperty({ enum: DASHBOARD_SIDEBAR_VARIANTS, example: 'inset' })
  variant!: DashboardSidebarVariant;

  @IsIn(DASHBOARD_SIDEBAR_COLLAPSIBLE, { message: i18nValidationMessage<I18nTranslations>('validation.IS_ENUM') })
  @ApiProperty({ enum: DASHBOARD_SIDEBAR_COLLAPSIBLE, example: 'icon' })
  collapsible!: DashboardSidebarCollapsible;

  @IsIn(DASHBOARD_SIDEBAR_SIDES, { message: i18nValidationMessage<I18nTranslations>('validation.IS_ENUM') })
  @ApiProperty({ enum: DASHBOARD_SIDEBAR_SIDES, example: 'left' })
  side!: DashboardSidebarSide;
}

class DashboardFontsDto {
  @IsIn(DASHBOARD_LATIN_FONTS, { message: i18nValidationMessage<I18nTranslations>('validation.IS_ENUM') })
  @ApiProperty({ enum: DASHBOARD_LATIN_FONTS, example: 'poppins' })
  latin!: (typeof DASHBOARD_LATIN_FONTS)[number];

  @IsIn(DASHBOARD_ARABIC_FONTS, { message: i18nValidationMessage<I18nTranslations>('validation.IS_ENUM') })
  @ApiProperty({ enum: DASHBOARD_ARABIC_FONTS, example: 'cairo' })
  arabic!: (typeof DASHBOARD_ARABIC_FONTS)[number];
}

export class UpdateDashboardPreferencesDto {
  @IsInt({ message: i18nValidationMessage<I18nTranslations>('validation.IS_INT') })
  @IsIn([1], { message: i18nValidationMessage<I18nTranslations>('validation.IS_ENUM') })
  @ApiProperty({ example: 1, enum: [1] })
  version!: 1;

  @IsIn(DASHBOARD_THEME_MODES, { message: i18nValidationMessage<I18nTranslations>('validation.IS_ENUM') })
  @ApiProperty({ enum: DASHBOARD_THEME_MODES, example: 'dark' })
  mode!: DashboardThemeMode;

  @ValidateNested()
  @Type(() => DashboardThemeDto)
  @ApiProperty({ type: DashboardThemeDto })
  theme!: DashboardThemeDto;

  @IsString({ message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING') })
  @MaxLength(8, { message: i18nValidationMessage<I18nTranslations>('validation.MAX_LENGTH') })
  @Matches(/^\d+(?:\.\d+)?rem$/, {
    message: i18nValidationMessage<I18nTranslations>('validation.INVALID_THEME_RADIUS'),
  })
  @ApiProperty({ example: '1rem', description: 'Border radius in rem, between 0 and 2rem' })
  radius!: string;

  @ValidateNested()
  @Type(() => DashboardFontsDto)
  @ApiProperty({ type: DashboardFontsDto })
  fonts!: DashboardFontsDto;

  @ValidateNested()
  @Type(() => DashboardSidebarDto)
  @ApiProperty({ type: DashboardSidebarDto })
  sidebar!: DashboardSidebarDto;
}
