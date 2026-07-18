import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { TransactionContext, UNIT_OF_WORK, UnitOfWork } from '@/common/persistence';
import { CreateAddressDto, UpdateAddressDto } from './dto/address.dto';
import {
  CLIENT_ADDRESSES_REPOSITORY,
  ClientAddressesRepositoryPort,
  AddressWriteData,
} from './client-addresses.repository.port';

@Injectable()
export class ClientAddressesService {
  constructor(
    @Inject(CLIENT_ADDRESSES_REPOSITORY) private readonly addresses: ClientAddressesRepositoryPort,
    @Inject(UNIT_OF_WORK) private readonly unitOfWork: UnitOfWork,
  ) {}

  findAll(userId: bigint, langId = 'en') {
    return this.addresses.listForUser(userId, langId);
  }

  create(userId: bigint, dto: CreateAddressDto, langId = 'en') {
    return this.unitOfWork.execute(async (context) => {
      const data = this.writeData(dto);
      await this.assertLocation(data.countryId, data.cityId, context);
      if (data.isDefault) await this.addresses.clearDefault(userId, context);
      return this.addresses.createForUser(userId, { ...data, address: dto.address }, langId, context);
    });
  }

  async update(userId: bigint, id: bigint, dto: UpdateAddressDto, langId = 'en') {
    const data = this.writeData(dto);
    await this.assertLocation(data.countryId, data.cityId);
    const address = await this.addresses.updateOwned(userId, id, data, langId);
    if (!address) throw new NotFoundException('Address not found');
    return address;
  }

  async remove(userId: bigint, id: bigint) {
    const address = await this.addresses.deleteOwned(userId, id);
    if (!address) throw new NotFoundException('Address not found');
    return address;
  }

  async setDefault(userId: bigint, id: bigint, langId = 'en') {
    const address = await this.unitOfWork.execute((context) => this.addresses.setDefault(userId, id, langId, context));
    if (!address) throw new NotFoundException('Address not found');
    return address;
  }

  private writeData(dto: CreateAddressDto | UpdateAddressDto): AddressWriteData {
    return {
      ...(dto.address !== undefined ? { address: dto.address } : {}),
      ...(dto.cityId !== undefined ? { cityId: dto.cityId ? BigInt(dto.cityId) : null } : {}),
      ...(dto.countryId !== undefined ? { countryId: dto.countryId ? BigInt(dto.countryId) : null } : {}),
      ...(dto.streetName !== undefined ? { streetName: dto.streetName } : {}),
      ...(dto.buildingNumber !== undefined ? { buildingNumber: dto.buildingNumber } : {}),
      ...(dto.isDefault !== undefined ? { isDefault: dto.isDefault } : {}),
    };
  }

  private async assertLocation(countryId?: bigint | null, cityId?: bigint | null, context?: TransactionContext) {
    if (countryId && !(await this.addresses.activeCountryExists(countryId, context))) {
      throw new BadRequestException('Selected country is invalid');
    }
    if (cityId && !(await this.addresses.activeCityExists(cityId, countryId, context))) {
      throw new BadRequestException('Selected city is invalid or does not belong to the selected country');
    }
  }
}
