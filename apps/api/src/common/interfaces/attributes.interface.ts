import { PaginatedResult } from '../dto/pagination.dto';

export interface AttributeTranslation {
  id: bigint;
  recordId: bigint;
  langId: string;
  name: string;
}

export interface AttributeValueTranslation {
  id: bigint;
  recordId: bigint;
  langId: string;
  name: string;
}

export interface AttributeValue {
  id: bigint;
  attributeId: bigint;
  isActive: boolean;
  createdAt: Date;
  translations: AttributeValueTranslation[];
}

export interface Attribute {
  id: bigint;
  createdAt: Date;
  translations: AttributeTranslation[];
  values: AttributeValue[];
}

export interface ClientAttributeView {
  id: bigint;
  translations: Array<Pick<AttributeTranslation, 'name' | 'langId'>>;
  values: Array<{
    id: bigint;
    isActive: boolean;
    translations: Array<Pick<AttributeValueTranslation, 'name' | 'langId'>>;
  }>;
}

export const ATTRIBUTES_REPOSITORY = Symbol('IAttributesRepository');

export interface IAttributesRepository {
  findAll(query: unknown, langId?: string): Promise<PaginatedResult<Attribute> | Attribute[]>;
  findClientList(query: unknown, langId: string): Promise<ClientAttributeView[]>;
  findByIdWithValues(id: number | bigint): Promise<Attribute | null>;
  createAttribute(data: unknown): Promise<Attribute>;
  updateAttribute(id: number, data: unknown): Promise<Attribute>;
  deleteAttribute(id: number | bigint): Promise<Attribute>;
}

export const ATTRIBUTE_VALUES_REPOSITORY = Symbol('IAttributeValuesRepository');

export interface IAttributeValuesRepository {
  findAll(query: unknown, langId?: string): Promise<PaginatedResult<AttributeValue> | AttributeValue[]>;
  findByIdWithAllTranslations(id: number | bigint): Promise<AttributeValue | null>;
  createValue(data: unknown): Promise<AttributeValue>;
  updateValue(id: number, data: unknown): Promise<AttributeValue>;
  deleteValue(id: number | bigint): Promise<AttributeValue>;
}
