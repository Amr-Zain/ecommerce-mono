import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateAddressDto, UpdateAddressDto } from './dto/address.dto';

@Injectable()
export class ClientAddressesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: bigint, langId: string = 'en') {
    return this.prisma.address.findMany({
      where: { userId },
      select: {
        id: true,
        address: true,
        cityId: true,
        countryId: true,
        streetName: true,
        buildingNumber: true,
        isDefault: true,
        city: {
          select: {
            id: true,
            translations: { where: { langId }, select: { name: true, langId: true }, take: 1 },
          },
        },
        country: {
          select: {
            id: true,
            phoneCode: true,
            translations: { where: { langId }, select: { name: true, langId: true }, take: 1 },
          },
        },
      },
      orderBy: { isDefault: 'desc' },
    });
  }

  async create(userId: bigint, dto: CreateAddressDto, langId: string = 'en') {
    return this.prisma.$transaction(async (tx) => {
      const countryId = dto.countryId ? BigInt(dto.countryId) : null;
      const cityId = dto.cityId ? BigInt(dto.cityId) : null;

      if (countryId) {
        const country = await tx.country.findFirst({
          where: { id: countryId, isActive: true },
          select: { id: true },
        });
        if (!country) {
          throw new BadRequestException('Selected country is invalid');
        }
      }

      if (cityId) {
        const city = await tx.city.findFirst({
          where: {
            id: cityId,
            isActive: true,
            ...(countryId ? { countryId } : {}),
          },
          select: { id: true, countryId: true },
        });
        if (!city) {
          throw new BadRequestException('Selected city is invalid or does not belong to the selected country');
        }
      }

      if (dto.isDefault) {
        await tx.address.updateMany({
          where: { userId },
          data: { isDefault: false },
        });
      }
      return tx.address.create({
        data: {
          userId,
          address: dto.address,
          cityId,
          countryId,
          streetName: dto.streetName,
          buildingNumber: dto.buildingNumber,
          isDefault: dto.isDefault ?? false,
        },
        select: {
          id: true,
          address: true,
          cityId: true,
          countryId: true,
          streetName: true,
          buildingNumber: true,
          isDefault: true,
          city: {
            select: {
              id: true,
              translations: { where: { langId }, select: { name: true, langId: true } },
            },
          },
          country: {
            select: {
              id: true,
              phoneCode: true,
              translations: { where: { langId }, select: { name: true, langId: true }, take: 1 },
            },
          },
        },
      });
    });
  }

  async update(userId: bigint, id: bigint, dto: UpdateAddressDto, langId: string = 'en') {
    const address = await this.prisma.address.findFirst({ where: { id, userId }, select: { id: true } });
    if (!address) throw new NotFoundException('Address not found');

    const data: Record<string, unknown> = {};
    if (dto.address !== undefined) data.address = dto.address;
    if (dto.cityId !== undefined) data.cityId = dto.cityId ? BigInt(dto.cityId) : null;
    if (dto.countryId !== undefined) data.countryId = dto.countryId ? BigInt(dto.countryId) : null;
    if (dto.streetName !== undefined) data.streetName = dto.streetName;
    if (dto.buildingNumber !== undefined) data.buildingNumber = dto.buildingNumber;
    if (dto.isDefault !== undefined) data.isDefault = dto.isDefault;

    return this.prisma.address.update({
      where: { id },
      data,
      select: {
        id: true,
        address: true,
        cityId: true,
        countryId: true,
        streetName: true,
        buildingNumber: true,
        isDefault: true,
        city: {
          select: {
            id: true,
            translations: { where: { langId }, select: { name: true, langId: true } },
          },
        },
        country: {
          select: {
            id: true,
            phoneCode: true,
            translations: { where: { langId }, select: { name: true, langId: true }, take: 1 },
          },
        },
      },
    });
  }

  async remove(userId: bigint, id: bigint) {
    const address = await this.prisma.address.findFirst({ where: { id, userId }, select: { id: true } });
    if (!address) throw new NotFoundException('Address not found');

    return this.prisma.address.delete({
      where: { id },
    });
  }

  async setDefault(userId: bigint, id: bigint, langId: string = 'en') {
    const address = await this.prisma.address.findFirst({ where: { id, userId }, select: { id: true } });
    if (!address) throw new NotFoundException('Address not found');

    return this.prisma.$transaction(async (tx) => {
      await tx.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
      return tx.address.update({
        where: { id },
        data: { isDefault: true },
        select: {
          id: true,
          address: true,
          cityId: true,
          countryId: true,
          streetName: true,
          buildingNumber: true,
          isDefault: true,
          city: {
            select: {
              id: true,
              translations: { where: { langId }, select: { name: true, langId: true }, take: 1 },
            },
          },
          country: {
            select: {
              id: true,
              phoneCode: true,
              translations: { where: { langId }, select: { name: true, langId: true }, take: 1 },
            },
          },
        },
      });
    });
  }
}
