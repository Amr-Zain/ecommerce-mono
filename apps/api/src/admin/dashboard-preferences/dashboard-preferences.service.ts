import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, PrismaService } from '@/prisma';
import {
  ALLOWED_DASHBOARD_THEME_VARIABLES,
  createDefaultDashboardPreferences,
  type DashboardPreferences,
  type DashboardThemeVariables,
} from './dashboard-preferences.types';
import { UpdateDashboardPreferencesDto } from './dto/update-dashboard-preferences.dto';
import { I18nService } from 'nestjs-i18n';
import { I18nTranslations } from '@/generated/i18n.generated';

const allowedVariables = new Set<string>(ALLOWED_DASHBOARD_THEME_VARIABLES);
const MAX_VARIABLES_PER_MODE = ALLOWED_DASHBOARD_THEME_VARIABLES.length;
const UNSAFE_VALUE = /[;{}]|url\s*\(|@import|expression\s*\(/i;

@Injectable()
export class DashboardPreferencesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly i18n: I18nService<I18nTranslations>,
  ) {}

  async get(userId: bigint): Promise<DashboardPreferences> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { settings: true, userType: true },
    });
    if (!user) throw new NotFoundException(this.i18n.t('errors.user_not_found'));
    this.assertAdmin(user.userType);

    const settings = this.asRecord(user.settings);
    return this.normalize(settings.dashboard_preferences, settings.language);
  }

  async update(userId: bigint, dto: UpdateDashboardPreferencesDto): Promise<DashboardPreferences> {
    if (!this.isValidRadius(dto.radius)) {
      throw new BadRequestException(this.i18n.t('validation.INVALID_THEME_RADIUS', { args: { property: 'radius' } }));
    }
    this.validateVariableModes(dto.theme.customVariables, 'customVariables');
    this.validateVariableModes(dto.theme.overrides, 'overrides');

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { settings: true, userType: true },
    });
    if (!user) throw new NotFoundException(this.i18n.t('errors.user_not_found'));
    this.assertAdmin(user.userType);

    const settings = this.asRecord(user.settings);
    const preferences = this.normalize(dto, settings.language);
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        settings: {
          ...settings,
          dashboard_preferences: preferences,
        } as unknown as Prisma.InputJsonValue,
      },
    });
    return preferences;
  }

  private normalize(value: unknown, language: unknown): DashboardPreferences {
    const defaults = createDefaultDashboardPreferences(language);
    const raw = this.asRecord(value);
    const theme = this.asRecord(raw.theme);
    const customVariables = this.asRecord(theme.customVariables);
    const overrides = this.asRecord(theme.overrides);
    const sidebar = this.asRecord(raw.sidebar);
    const fonts = this.asRecord(raw.fonts);

    return {
      version: 1,
      mode: this.oneOf(raw.mode, ['light', 'dark', 'system'], defaults.mode),
      theme: {
        source: this.oneOf(theme.source, ['default', 'shadcn', 'tweakcn', 'imported'], defaults.theme.source),
        presetId:
          theme.presetId === null
            ? null
            : typeof theme.presetId === 'string'
              ? theme.presetId.slice(0, 80)
              : defaults.theme.presetId,
        customVariables: {
          light: this.validVariables(customVariables.light),
          dark: this.validVariables(customVariables.dark),
        },
        overrides: {
          light: this.validVariables(overrides.light),
          dark: this.validVariables(overrides.dark),
        },
      },
      radius: this.validRadius(raw.radius, defaults.radius),
      fonts: {
        latin: this.oneOf(fonts.latin, ['inter', 'manrope', 'poppins'], defaults.fonts.latin),
        arabic: this.oneOf(fonts.arabic, ['noto-sans-arabic', 'cairo', 'tajawal'], defaults.fonts.arabic),
      },
      sidebar: {
        variant: this.oneOf(sidebar.variant, ['sidebar', 'floating', 'inset'], defaults.sidebar.variant),
        collapsible: this.oneOf(sidebar.collapsible, ['offcanvas', 'icon', 'none'], defaults.sidebar.collapsible),
        side: this.oneOf(sidebar.side, ['left', 'right'], defaults.sidebar.side),
      },
    };
  }

  private validateVariableModes(
    modes: { light: DashboardThemeVariables; dark: DashboardThemeVariables },
    name: string,
  ) {
    this.validateVariables(modes.light, `${name}.light`);
    this.validateVariables(modes.dark, `${name}.dark`);
  }

  private validateVariables(value: DashboardThemeVariables, path: string) {
    const entries = Object.entries(value);
    if (entries.length > MAX_VARIABLES_PER_MODE) {
      throw new BadRequestException(this.i18n.t('errors.dashboard_theme_variables_limit', { args: { path } }));
    }
    for (const [key, rawValue] of entries) {
      if (!allowedVariables.has(key)) {
        throw new BadRequestException(
          this.i18n.t('errors.dashboard_theme_variable_unsupported', { args: { variable: key } }),
        );
      }
      if (typeof rawValue !== 'string' || rawValue.length > 256 || UNSAFE_VALUE.test(rawValue)) {
        throw new BadRequestException(
          this.i18n.t('errors.dashboard_theme_variable_invalid', { args: { variable: key } }),
        );
      }
    }
  }

  private validVariables(value: unknown): DashboardThemeVariables {
    const result: DashboardThemeVariables = {};
    for (const [key, rawValue] of Object.entries(this.asRecord(value))) {
      if (
        allowedVariables.has(key) &&
        typeof rawValue === 'string' &&
        rawValue.length <= 256 &&
        !UNSAFE_VALUE.test(rawValue)
      ) {
        result[key] = rawValue;
      }
    }
    return result;
  }

  private asRecord(value: unknown): Record<string, unknown> {
    return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
  }

  private oneOf<T extends string>(value: unknown, options: readonly T[], fallback: T): T {
    return typeof value === 'string' && options.includes(value as T) ? (value as T) : fallback;
  }

  private validRadius(value: unknown, fallback: string): string {
    return this.isValidRadius(value) ? value : fallback;
  }

  private isValidRadius(value: unknown): value is string {
    return typeof value === 'string' && /^\d+(?:\.\d+)?rem$/.test(value) && Number.parseFloat(value) <= 2;
  }

  private assertAdmin(userType: string | null) {
    if (userType !== 'admin' && userType !== 'super_admin') {
      throw new ForbiddenException(this.i18n.t('errors.Forbidden'));
    }
  }
}
