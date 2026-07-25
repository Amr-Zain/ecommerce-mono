import { TransactionContext } from '@/common/persistence';
import { MediaRecord } from './media.types';

export const MEDIA_REPOSITORY = Symbol('MediaRepository');

export interface MediaPersistenceRecord {
  id: bigint;
  uuid: string;
  model: string;
  modelId: bigint | null;
  attachHash: string | null;
  collection: string;
  path: string;
  filename: string;
  originalName: string;
  extension: string;
  mimeType: string;
  type: string;
  size: number;
  isMain: boolean;
  metadata: unknown;
  createdAt: Date;
  updatedAt: Date;
}

export interface MediaCreateData {
  model: string;
  modelId: bigint | null;
  attachHash: string | null;
  collection: string;
  path: string;
  filename: string;
  originalName: string;
  extension: string;
  mimeType: string;
  type: string;
  size: number;
  isMain: boolean;
}

export interface MediaAttachmentUpdate {
  id: bigint;
  modelId: bigint;
  path: string;
}

export interface ProductImageCandidate {
  model: string;
  modelId: bigint | null;
  collection: string;
  isMain: boolean;
  path: string;
}

export interface MediaRepositoryPort {
  create(data: MediaCreateData): Promise<MediaPersistenceRecord>;
  findTemporary(model: string, attachHashes: string[], context?: TransactionContext): Promise<MediaPersistenceRecord[]>;
  attach(updates: MediaAttachmentUpdate[], context?: TransactionContext): Promise<void>;
  findByUuid(uuid: string): Promise<MediaPersistenceRecord | null>;
  findByEntity(model: string, modelId: bigint, collection?: string): Promise<MediaRecord[]>;
  findByEntities(model: string, modelIds: bigint[]): Promise<Array<MediaRecord & { modelId: bigint | null }>>;
  findProductImages(productIds: bigint[], variantIds: bigint[]): Promise<ProductImageCandidate[]>;
  findEntityRecords(
    model: string,
    modelId: bigint,
    collection?: string,
    context?: TransactionContext,
  ): Promise<MediaPersistenceRecord[]>;
  findUnattachedBefore(before: Date): Promise<MediaPersistenceRecord[]>;
  deleteById(id: bigint, context?: TransactionContext): Promise<void>;
  deleteEntityRecords(
    model: string,
    modelId: bigint,
    collection?: string,
    excludeIds?: bigint[],
    context?: TransactionContext,
  ): Promise<void>;
}
