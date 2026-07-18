import { Injectable } from '@nestjs/common';
import { UpdateSettingsDto } from './dto/settings.dto';
import { AppSettingsRepository } from './settings.repository';

export type AppSettingDefault = {
  value: boolean | number | string;
  group: string;
  groupLabel: string;
  type: string;
  keyLabel: string;
};

@Injectable()
export class AppSettingsService {
  constructor(private readonly settings: AppSettingsRepository) {}

  async listSettings(defaults?: Record<string, AppSettingDefault>) {
    if (defaults) await this.ensureDefaults(defaults);
    const settings = await this.settings.listOrdered();
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
      const existing = await this.settings.findByKey(setting.key);
      if (!existing) continue;
      await this.settings.updateValue(setting.key, this.castValue(setting.value, existing.type));
    }
    return this.listSettings(defaults);
  }

  async getSettingsMap(defaults?: Record<string, AppSettingDefault>) {
    if (defaults) await this.ensureDefaults(defaults);
    const settings = await this.settings.list();
    return Object.fromEntries(settings.map((setting) => [setting.key, this.unwrapValue(setting.value)]));
  }

  async getValue<T = unknown>(key: string, fallback?: T, defaults?: Record<string, AppSettingDefault>) {
    if (defaults) await this.ensureDefaults(defaults);
    const setting = await this.settings.findByKey(key);
    return setting ? (this.unwrapValue(setting.value) as T) : fallback;
  }

  async ensureDefaults(defaults: Record<string, AppSettingDefault>) {
    await this.settings.ensureDefaults(defaults);
  }

  unwrapValue(value: unknown) {
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
