import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateAddressDto, UpdateAddressDto } from './dto/address.dto';

@Injectable()
export class ClientAddressesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: bigint) {
    return this.prisma.address.findMany({
      where: { userId },
      include: {
        city: {
          include: { translations: true },
        },
        country: {
          include: { translations: true },
        },
      },
      orderBy: { isDefault: 'desc' },
    });
  }

  async create(userId: bigint, dto: CreateAddressDto) {
    if (dto.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }
    return this.prisma.address.create({
      data: {
        userId,
        address: dto.address,
        cityId: dto.cityId ? BigInt(dto.cityId) : null,
        countryId: dto.countryId ? BigInt(dto.countryId) : null,
        streetName: dto.streetName,
        buildingNumber: dto.buildingNumber,
        isDefault: dto.isDefault ?? false,
      },
      include: {
        city: { include: { translations: true } },
        country: { include: { translations: true } },
      },
    });
  }

  async update(id: bigint, dto: UpdateAddressDto) {
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
      include: {
        city: { include: { translations: true } },
        country: { include: { translations: true } },
      },
    });
  }

  async remove(id: bigint) {
    return this.prisma.address.delete({
      where: { id },
    });
  }

  async setDefault(userId: bigint, id: bigint) {
    await this.prisma.address.updateMany({
      where: { userId },
      data: { isDefault: false },
    });
    return this.prisma.address.update({
      where: { id },
      data: { isDefault: true },
      include: {
        city: { include: { translations: true } },
        country: { include: { translations: true } },
      },
    });
  }
}