import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@/prisma';
import { UpdateSettingsDto } from './dto/settings.dto';

export type AppSettingDefault = {
  value: boolean | number | string;
  group: string;
  groupLabel: string;
  type: string;
  keyLabel: string;
};

const toJson = (value: unknown): Prisma.InputJsonValue => value as Prisma.InputJsonValue;

@Injectable()
export class AppSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async listSettings(defaults?: Record<string, AppSettingDefault>) {
    if (defaults) await this.ensureDefaults(defaults);
    const settings = await this.prisma.appSetting.findMany({ orderBy: [{ group: 'asc' }, { id: 'asc' }] });
    return settings.map((setting) => ({
      id: setting.id.toString(),
      key: setting.key,
      value: this.unwrapValue(setting.value),
      group: setting.group,
      groupLabel: setting.groupLabel,
      type: setting.type,
      keyLabel: setting.keyLabel,
      createdAt: setting.createdAt,
      updatedAt: setting.updatedAt,
    }));
  }

  async updateSettings(dto: UpdateSettingsDto, defaults?: Record<string, AppSettingDefault>) {
    if (defaults) await this.ensureDefaults(defaults);
    for (const setting of dto.settings || []) {
      const existing = await this.prisma.appSetting.findUnique({ where: { key: setting.key } });
      if (!existing) continue;
      await this.prisma.appSetting.update({
        where: { key: setting.key },
        data: { value: toJson({ value: this.castValue(setting.value, existing.type) }) },
      });
    }
    return this.listSettings(defaults);
  }

  async getSettingsMap(defaults?: Record<string, AppSettingDefault>) {
    if (defaults) await this.ensureDefaults(defaults);
    const settings = await this.prisma.appSetting.findMany();
    return Object.fromEntries(settings.map((setting) => [setting.key, this.unwrapValue(setting.value)]));
  }

  async getValue<T = unknown>(key: string, fallback?: T, defaults?: Record<string, AppSettingDefault>) {
    if (defaults) await this.ensureDefaults(defaults);
    const setting = await this.prisma.appSetting.findUnique({ where: { key } });
    return setting ? (this.unwrapValue(setting.value) as T) : fallback;
  }

  async ensureDefaults(defaults: Record<string, AppSettingDefault>) {
    for (const [key, setting] of Object.entries(defaults)) {
      await this.prisma.appSetting.upsert({
        where: { key },
        update: {},
        create: {
          key,
          value: toJson({ value: setting.value }),
          group: setting.group,
          groupLabel: setting.groupLabel,
          type: setting.type,
          keyLabel: setting.keyLabel,
        },
      });
    }
  }

  unwrapValue(value: Prisma.JsonValue) {
    if (value && typeof value === 'object' && !Array.isArray(value) && 'value' in value) {
      return (value as { value: unknown }).value;
    }
    return value;
  }

  private castValue(value: string | number | boolean, type: string) {
    if (type === 'boolean') return value === true || value === 'true' || value === '1' || value === 1;
    if (type === 'integer') return Number(value || 0);
    return String(value ?? '');
  }
}
