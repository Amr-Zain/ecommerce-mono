import { BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { MediaType } from '@/media/enums/media-type.enum';
import { MediaService } from '@/media/media.service';
import { MediaSlotConfig } from '@/media/media.types';
import { PrismaService, PrismaTransactionContext } from '@/prisma';
import { QueryBuilderService } from '../services/query-builder.service';
import { BaseRepository, PreparedWrite } from './base.repository';

type DataInput = Record<string, unknown>;

/**
 * Persistence-only support for aggregates that expose polymorphic media slots.
 * Generic CRUD/query behavior stays in BaseRepository; media lifecycle behavior
 * is opt-in and requires an explicit persistence model name.
 */
export abstract class MediaAwareRepository<T extends { id: number | bigint }> extends BaseRepository<T> {
  protected abstract readonly mediaModel: string;
  protected abstract readonly mediaConfig: Record<string, MediaSlotConfig>;

  constructor(
    prisma: PrismaService,
    protected readonly mediaService: MediaService,
    queryBuilder?: QueryBuilderService,
  ) {
    super(prisma, queryBuilder);
  }

  protected get hasMedia(): boolean {
    return Object.keys(this.mediaConfig).length > 0;
  }

  protected override prepareWrite(data: DataInput): PreparedWrite {
    const mediaPayload: Record<string, string | string[]> = {};
    const persistenceData = { ...data };

    for (const key of Object.keys(this.mediaConfig)) {
      if (data[key] !== undefined) {
        mediaPayload[key] = data[key] as string | string[];
        delete persistenceData[key];
      }
    }

    return {
      data: persistenceData,
      afterWrite:
        Object.keys(mediaPayload).length > 0 ? (id) => this.handleMediaAttachment(id, mediaPayload) : undefined,
    };
  }

  protected override async enrich<R extends T | T[]>(data: R): Promise<R> {
    if (!data) return data;

    const records = (Array.isArray(data) ? data : [data]) as T[];
    if (records.length === 0) return data;

    const mediaMap = await this.mediaService.findByEntities(
      this.mediaModel,
      records.map((record) => BigInt(record.id)),
    );

    for (const record of records) {
      const entityMedia = mediaMap.get(record.id.toString()) ?? [];
      const enrichedRecord = record as unknown as Record<string, unknown>;

      for (const [key, config] of Object.entries(this.mediaConfig)) {
        const collectionMedia = entityMedia.filter((media) => media.collection === config.collection);
        enrichedRecord[key] = config.single ? (collectionMedia[0] ?? null) : collectionMedia;
      }
    }

    return data;
  }

  protected mergeMedia<R extends T | T[]>(data: R): Promise<R> {
    return this.enrich(data);
  }

  protected override async beforeDelete(id: number | bigint): Promise<void> {
    await this.mediaService.deleteByEntity(this.mediaModel, id);
  }

  protected async handleMediaAttachment(
    id: number | bigint,
    mediaPayload: Record<string, string | string[]>,
    tx?: Prisma.TransactionClient,
    modelOverride?: string,
  ): Promise<void> {
    const prisma = tx ?? this.prisma;
    const model = (modelOverride ?? this.mediaModel).toLowerCase();

    for (const [key, payload] of Object.entries(mediaPayload)) {
      const config = this.mediaConfig[key];
      if (!config) continue;

      const hashes = Array.isArray(payload) ? payload : [payload];
      if (hashes.length === 0) continue;

      if (config.single) {
        await this.mediaService.deleteByEntity(
          model,
          id,
          config.collection,
          tx ? new PrismaTransactionContext(tx) : undefined,
        );
      }

      for (const [index, hash] of hashes.entries()) {
        if (typeof hash !== 'string') continue;

        const mediaItems = await prisma.media.findMany({
          where: {
            OR: [
              { attachHash: hash, modelId: null },
              { attachHash: hash, modelId: BigInt(id) },
              { uuid: hash, modelId: null },
              { uuid: hash, modelId: BigInt(id) },
            ],
          },
        });

        if (mediaItems.length === 0) continue;
        if (mediaItems[0].model.toLowerCase() !== model) {
          throw new BadRequestException(`Media model mismatch. Expected ${model}, got ${mediaItems[0].model}`);
        }

        for (const item of mediaItems) {
          if (config.allowedTypes?.length && !config.allowedTypes.includes(item.type as MediaType)) {
            throw new BadRequestException(
              `Media type mismatch. Expected ${config.allowedTypes.join(', ')}, got ${item.type}`,
            );
          }

          if (item.modelId === null && item.attachHash) {
            await this.mediaService.attachTempMedia(
              { model, attachHash: item.attachHash, modelId: id.toString() },
              tx ? new PrismaTransactionContext(tx) : undefined,
            );
          }

          await prisma.media.update({
            where: { id: item.id },
            data: { collection: config.collection, isMain: index === 0 },
          });
        }
      }
    }
  }
}
