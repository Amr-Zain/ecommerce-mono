import { TransactionContext } from '@/common/persistence';

export const CLIENT_ADDRESSES_REPOSITORY = Symbol('ClientAddressesRepository');

export interface AddressLocationView {
  id: bigint;
  translations: Array<{ name: string; langId: string }>;
}

export interface ClientAddressView {
  id: bigint;
  address: string;
  cityId: bigint | null;
  countryId: bigint | null;
  streetName: string | null;
  buildingNumber: string | null;
  isDefault: boolean;
  city: AddressLocationView | null;
  country: (AddressLocationView & { phoneCode: string }) | null;
}

export interface AddressWriteData {
  address?: string;
  cityId?: bigint | null;
  countryId?: bigint | null;
  streetName?: string;
  buildingNumber?: string;
  isDefault?: boolean;
}

export interface ClientAddressesRepositoryPort {
  listForUser(userId: bigint, langId: string): Promise<ClientAddressView[]>;
  ownedAddressExists(userId: bigint, id: bigint): Promise<boolean>;
  activeCountryExists(id: bigint, context?: TransactionContext): Promise<boolean>;
  activeCityExists(id: bigint, countryId?: bigint | null, context?: TransactionContext): Promise<boolean>;
  clearDefault(userId: bigint, context: TransactionContext): Promise<void>;
  createForUser(
    userId: bigint,
    data: AddressWriteData & { address: string },
    langId: string,
    context: TransactionContext,
  ): Promise<ClientAddressView>;
  updateOwned(userId: bigint, id: bigint, data: AddressWriteData, langId: string): Promise<ClientAddressView | null>;
  deleteOwned(userId: bigint, id: bigint): Promise<ClientAddressView | null>;
  setDefault(userId: bigint, id: bigint, langId: string, context: TransactionContext): Promise<ClientAddressView | null>;
}
