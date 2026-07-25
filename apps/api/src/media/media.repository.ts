import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { TransactionContext } from '@/common/persistence';
import { PrismaService, resolvePrismaClient } from '@/prisma';
import { MEDIA_SELECT } from './media.types';
import {
  MediaAttachmentUpdate,
  MediaCreateData,
  MediaRepositoryPort,
} from './media.repository.port';

@Injectable()
export class MediaRepository implements MediaRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  create(data: MediaCreateData) {
    return this.prisma.media.create({ data: { ...data, metadata: {} } });
  }

  findTemporary(model: string, attachHashes: string[], context?: TransactionContext) {
    const db = resolvePrismaClient(context, this.prisma);
    return db.media.findMany({
      where: {
        model,
        attachHash: attachHashes.length === 1 ? attachHashes[0] : { in: attachHashes },
        modelId: null,
      },
    });
  }

  async attach(updates: MediaAttachmentUpdate[], context?: TransactionContext) {
    const db = resolvePrismaClient(context, this.prisma);
    for (const update of updates) {
      await db.media.update({
        where: { id: update.id },
        data: { modelId: update.modelId, attachHash: null, path: update.path },
      });
    }
  }

  findByUuid(uuid: string) {
    return this.prisma.media.findUnique({ where: { uuid } });
  }

  findByEntity(model: string, modelId: bigint, collection?: string) {
    return this.prisma.media.findMany({
      where: { model: model.toLowerCase(), modelId, ...(collection ? { collection } : {}) },
      select: MEDIA_SELECT,
      orderBy: { createdAt: 'asc' },
    });
  }

  findByEntities(model: string, modelIds: bigint[]) {
    return this.prisma.media.findMany({
      where: { model: model.toLowerCase(), modelId: { in: modelIds } },
      select: { ...MEDIA_SELECT, modelId: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  findProductImages(productIds: bigint[], variantIds: bigint[]) {
    return this.prisma.media.findMany({
      where: {
        OR: [
          { model: 'product', modelId: { in: productIds }, collection: { in: ['image', 'gallery'] } },
          ...(variantIds.length
            ? [{ model: 'productvariant', modelId: { in: variantIds }, collection: 'gallery' }]
            : []),
        ],
      },
      select: { model: true, modelId: true, collection: true, isMain: true, path: true },
      orderBy: [{ isMain: 'desc' }, { createdAt: 'asc' }],
    });
  }

  findEntityRecords(model: string, modelId: bigint, collection?: string, context?: TransactionContext) {
    const db = resolvePrismaClient(context, this.prisma);
    return db.media.findMany({
      where: { model: model.toLowerCase(), modelId, ...(collection ? { collection } : {}) },
    });
  }

  findUnattachedBefore(before: Date) {
    return this.prisma.media.findMany({
      where: { attachHash: { not: null }, modelId: null, createdAt: { lt: before } },
    });
  }

  async deleteById(id: bigint, context?: TransactionContext) {
    const db = resolvePrismaClient(context, this.prisma);
    await db.media.delete({ where: { id } });
  }

  async deleteEntityRecords(model: string, modelId: bigint, collection?: string, excludeIds?: bigint[], context?: TransactionContext) {
    const db = resolvePrismaClient(context, this.prisma);
    const where: Prisma.MediaWhereInput = {
      model: model.toLowerCase(),
      modelId,
      ...(collection ? { collection } : {}),
      ...(excludeIds?.length ? { id: { notIn: excludeIds } } : {}),
    };
    await db.media.deleteMany({ where });
  }
}
