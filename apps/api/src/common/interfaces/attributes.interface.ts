import { PaginatedResult } from '../dto/pagination.dto';
import { QueryOptions } from '../../common/repositories/base.repository';

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

export const ATTRIBUTES_REPOSITORY = Symbol('IAttributesRepository');

export interface IAttributesRepository {
  findAll(query: unknown, langId?: string, options?: QueryOptions): Promise<PaginatedResult<Attribute> | Attribute[]>;
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
