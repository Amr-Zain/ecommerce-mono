import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { TransactionContext } from '@/common/persistence';
import { PrismaService, resolvePrismaClient } from '@/prisma';
import {
  AddressWriteData,
  ClientAddressView,
  ClientAddressesRepositoryPort,
} from './client-addresses.repository.port';

@Injectable()
export class ClientAddressesRepository implements ClientAddressesRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  listForUser(userId: bigint, langId: string) {
    return this.prisma.address.findMany({
      where: { userId },
      select: this.viewSelect(langId),
      orderBy: { isDefault: 'desc' },
    });
  }

  async ownedAddressExists(userId: bigint, id: bigint) {
    return Boolean(await this.prisma.address.findFirst({ where: { id, userId }, select: { id: true } }));
  }

  async activeCountryExists(id: bigint, context?: TransactionContext) {
    const db = resolvePrismaClient(context, this.prisma);
    return Boolean(await db.country.findFirst({ where: { id, isActive: true }, select: { id: true } }));
  }

  async activeCityExists(id: bigint, countryId?: bigint | null, context?: TransactionContext) {
    const db = resolvePrismaClient(context, this.prisma);
    return Boolean(
      await db.city.findFirst({
        where: { id, isActive: true, ...(countryId ? { countryId } : {}) },
        select: { id: true },
      }),
    );
  }

  async clearDefault(userId: bigint, context: TransactionContext) {
    const db = resolvePrismaClient(context, this.prisma);
    await db.address.updateMany({ where: { userId }, data: { isDefault: false } });
  }

  async createForUser(
    userId: bigint,
    data: AddressWriteData & { address: string },
    langId: string,
    context: TransactionContext,
  ): Promise<ClientAddressView> {
    const db = resolvePrismaClient(context, this.prisma);
    return db.address.create({
      data: { userId, ...data },
      select: this.viewSelect(langId),
    }) as Promise<ClientAddressView>;
  }

  async updateOwned(userId: bigint, id: bigint, data: AddressWriteData, langId: string) {
    if (!(await this.ownedAddressExists(userId, id))) return null;
    return this.prisma.address.update({ where: { id }, data, select: this.viewSelect(langId) });
  }

  async deleteOwned(userId: bigint, id: bigint) {
    if (!(await this.ownedAddressExists(userId, id))) return null;
    return this.prisma.address.delete({ where: { id }, select: this.viewSelect('en') });
  }

  async setDefault(userId: bigint, id: bigint, langId: string, context: TransactionContext) {
    const db = resolvePrismaClient(context, this.prisma);
    const owned = await db.address.findFirst({ where: { id, userId }, select: { id: true } });
    if (!owned) return null;
    await db.address.updateMany({ where: { userId }, data: { isDefault: false } });
    return db.address.update({ where: { id }, data: { isDefault: true }, select: this.viewSelect(langId) });
  }

  private viewSelect(langId: string) {
    return {
      id: true,
      address: true,
      cityId: true,
      countryId: true,
      streetName: true,
      buildingNumber: true,
      isDefault: true,
      city: { select: { id: true, translations: { where: { langId }, select: { name: true, langId: true }, take: 1 } } },
      country: {
        select: {
          id: true,
          phoneCode: true,
          translations: { where: { langId }, select: { name: true, langId: true }, take: 1 },
        },
      },
    } as const satisfies Prisma.AddressSelect;
  }
}
