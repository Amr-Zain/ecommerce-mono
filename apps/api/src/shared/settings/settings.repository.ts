import { Injectable } from '@nestjs/common';
import { Prisma, PrismaService } from '@/prisma';
import type { AppSettingDefault } from './settings.service';

@Injectable()
export class AppSettingsRepository {
  constructor(private readonly prisma: PrismaService) {}

  listOrdered() {
    return this.prisma.appSetting.findMany({ orderBy: [{ group: 'asc' }, { id: 'asc' }] });
  }

  list() {
    return this.prisma.appSetting.findMany();
  }

  findByKey(key: string) {
    return this.prisma.appSetting.findUnique({ where: { key } });
  }

  async updateValue(key: string, value: unknown): Promise<void> {
    await this.prisma.appSetting.update({
      where: { key },
      data: { value: { value } as Prisma.InputJsonValue },
    });
  }

  async ensureDefaults(defaults: Record<string, AppSettingDefault>): Promise<void> {
    await this.prisma.$transaction(
      Object.entries(defaults).map(([key, setting]) =>
        this.prisma.appSetting.upsert({
          where: { key },
          update: {},
          create: {
            key,
            value: { value: setting.value } as Prisma.InputJsonValue,
            group: setting.group,
            groupLabel: setting.groupLabel,
            type: setting.type,
            keyLabel: setting.keyLabel,
          },
        }),
      ),
    );
  }
}
