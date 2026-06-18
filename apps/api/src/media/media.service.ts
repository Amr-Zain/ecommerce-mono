import { Injectable, Inject, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService, Prisma } from '../prisma';
import { StorageInterface } from './storage/storage.interface';
import { UploadMediaDto } from './dto/upload-media.dto';
import { AttachMediaDto } from './dto/attach-media.dto';
import { MediaType } from './enums/media-type.enum';
import { randomUUID } from 'crypto';
import * as path from 'path';
import { MediaRecord, MEDIA_SELECT } from './media.types';

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject('StorageInterface') private readonly storage: StorageInterface,
  ) {}

  /**
   * Helper to format path to full URL
   */
  formatPath(filePath: string): string {
    if (!filePath) return filePath;
    if (filePath.startsWith('http')) return filePath;
    const baseUrl = process.env.APP_URL || 'http://localhost:3030';
    return `${baseUrl}${filePath}`;
  }

  /**
   * Determine logical generic type based on mime
   */
  private getLogicalType(mimeType: string): string {
    if (mimeType.startsWith('image/')) return MediaType.IMAGE;
    if (mimeType.startsWith('video/')) return MediaType.VIDEO;
    if (mimeType.startsWith('audio/')) return MediaType.AUDIO;
    if (mimeType.includes('pdf') || mimeType.includes('msword') || mimeType.includes('document'))
      return MediaType.DOCUMENT;
    if (mimeType.includes('zip') || mimeType.includes('tar') || mimeType.includes('rar')) return MediaType.ARCHIVE;
    return MediaType.OTHER;
  }

  /**
   * Upload multiple physical files and store their metadata
   */
  async uploadMultiple(files: Express.Multer.File[], dto: UploadMediaDto) {
    const attachHash = dto.modelId ? null : dto.attachHash || randomUUID();
    const idOrHash = dto.modelId || attachHash; // Passed to folder logic

    if (!idOrHash) {
      throw new Error('Fatal error resolving an attachable identification.');
    }

    const savedMedia = [];

    for (const file of files) {
      // 1. Upload physically
      const { path: filePath, filename } = await this.storage.uploadFile(file, dto.model, idOrHash);

      // 2. Infer meta attributes
      const mimeType = file.mimetype;
      const extension = path.extname(file.originalname).replace('.', '') || 'unknown';
      const logicalType = dto.type || this.getLogicalType(mimeType);

      // 3. Save to DB
      const result = await this.prisma.media.create({
        data: {
          model: dto.model,
          modelId: dto.modelId ? BigInt(dto.modelId) : null,
          attachHash: dto.modelId ? null : attachHash,
          collection: dto.collection || 'default',
          path: filePath,
          filename: filename,
          originalName: file.originalname,
          extension: extension,
          mimeType: mimeType,
          type: logicalType,
          size: file.size,
          isMain: dto.isMain || false,
          metadata: {},
        },
      });

      // Prisma BigInt conversion mapping safely to JSON response
      savedMedia.push({
        ...result,
        id: result.id.toString(), // Provide stringified ID if needed
      });
    }

    return savedMedia;
  }

  /**
   * Links temporarily uploaded media to a model once it has been created
   */
  async attachTempMedia(dto: AttachMediaDto, tx?: Prisma.TransactionClient) {
    const prisma = tx || this.prisma;

    const mediaItems = await prisma.media.findMany({
      where: {
        model: dto.model,
        attachHash: dto.attachHash,
        modelId: null,
      },
    });

    if (mediaItems.length === 0) return { count: 0 };

    // 1. Move directories on disk
    const newPathBase = await this.storage.moveDir(dto.model, dto.attachHash, dto.modelId);

    // 2. Update DB records
    const bigIntModelId = BigInt(dto.modelId);

    for (const item of mediaItems) {
      const newPath = item.path.replace(`/uploads/${dto.model}/${dto.attachHash}`, newPathBase);

      await prisma.media.update({
        where: { id: item.id },
        data: {
          modelId: bigIntModelId,
          attachHash: null,
          path: newPath,
        },
      });
    }

    return { count: mediaItems.length };
  }

  async attachTempMediaMany(
    input: { model: string; attachHashes: string[]; modelId: string },
    tx?: Prisma.TransactionClient,
  ) {
    const attachHashes = [...new Set(input.attachHashes.filter(Boolean))];
    if (attachHashes.length === 0) return { count: 0 };

    const prisma = tx || this.prisma;
    const mediaItems = await prisma.media.findMany({
      where: {
        model: input.model,
        attachHash: { in: attachHashes },
        modelId: null,
      },
    });

    if (mediaItems.length === 0) return { count: 0 };

    const pathByHash = new Map<string, string>();
    for (const attachHash of attachHashes) {
      if (mediaItems.some((item) => item.attachHash === attachHash)) {
        pathByHash.set(attachHash, await this.storage.moveDir(input.model, attachHash, input.modelId));
      }
    }

    const bigIntModelId = BigInt(input.modelId);
    for (const item of mediaItems) {
      if (!item.attachHash) continue;
      const newPathBase = pathByHash.get(item.attachHash);
      if (!newPathBase) continue;
      const newPath = item.path.replace(`/uploads/${input.model}/${item.attachHash}`, newPathBase);

      await prisma.media.update({
        where: { id: item.id },
        data: {
          modelId: bigIntModelId,
          attachHash: null,
          path: newPath,
        },
      });
    }

    return { count: mediaItems.length };
  }

  async findByUuid(uuid: string) {
    const media = await this.prisma.media.findUnique({ where: { uuid } });
    if (!media) throw new NotFoundException('Media not found');
    return { ...media, id: media.id.toString() };
  }

  async findByEntity(model: string, modelId: number | string | bigint, collection?: string): Promise<MediaRecord[]> {
    const where: Prisma.MediaWhereInput = {
      model: model.toLowerCase(),
      modelId: typeof modelId === 'bigint' ? modelId : BigInt(modelId),
    };

    if (collection) where.collection = collection;

    const items = await this.prisma.media.findMany({
      where,
      select: MEDIA_SELECT,
      orderBy: { createdAt: 'asc' },
    });

    return items;
  }

  /**
   * Bulk fetch media for multiple entities
   */
  async findByEntities(model: string, modelIds: bigint[]): Promise<Map<string, MediaRecord[]>> {
    const items = await this.prisma.media.findMany({
      where: {
        model: model.toLowerCase(),
        modelId: { in: modelIds },
      },
      select: {
        ...MEDIA_SELECT,
        modelId: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    const result = new Map<string, MediaRecord[]>();
    for (const item of items) {
      const key = item.modelId!.toString();
      if (!result.has(key)) result.set(key, []);
      const { modelId: _, ...mediaRecord } = item;
      result.get(key)!.push(mediaRecord);
    }
    return result;
  }

  async findProductImagePaths(
    items: Array<{ productId: bigint; variantId?: bigint | null }>,
  ): Promise<Array<string | null>> {
    if (items.length === 0) return [];

    const productIds = [...new Set(items.map((item) => item.productId))];
    const variantIds = [...new Set(items.map((item) => item.variantId).filter((id): id is bigint => id != null))];
    const media = await this.prisma.media.findMany({
      where: {
        OR: [
          {
            model: 'product',
            modelId: { in: productIds },
            collection: { in: ['image', 'gallery'] },
          },
          ...(variantIds.length > 0
            ? [
                {
                  model: 'productvariant',
                  modelId: { in: variantIds },
                  collection: 'gallery',
                },
              ]
            : []),
        ],
      },
      select: {
        model: true,
        modelId: true,
        collection: true,
        isMain: true,
        path: true,
      },
      orderBy: [{ isMain: 'desc' }, { createdAt: 'asc' }],
    });

    const byEntity = new Map<string, typeof media>();
    for (const item of media) {
      const key = `${item.model}:${item.modelId?.toString() ?? ''}`;
      const existing = byEntity.get(key);
      if (existing) {
        existing.push(item);
      } else {
        byEntity.set(key, [item]);
      }
    }

    return items.map(({ productId, variantId }) => {
      const variantMedia = variantId ? byEntity.get(`productvariant:${variantId.toString()}`) : undefined;
      const productMedia = byEntity.get(`product:${productId.toString()}`);
      const preferred =
        variantMedia?.[0] ?? productMedia?.find((item) => item.collection === 'image') ?? productMedia?.[0];

      return preferred ? this.formatPath(preferred.path) : null;
    });
  }

  /**
   * Delete all media for an entity
   */
  async deleteByEntity(
    model: string,
    modelId: number | string | bigint,
    collection?: string,
    tx?: Prisma.TransactionClient,
  ) {
    const prisma = tx || this.prisma;

    const where: Prisma.MediaWhereInput = {
      model: model.toLowerCase(),
      modelId: typeof modelId === 'bigint' ? modelId : BigInt(modelId),
    };

    if (collection) where.collection = collection;

    const items = await prisma.media.findMany({ where });

    for (const item of items) {
      await this.storage.deleteFile(item.path);
    }

    await prisma.media.deleteMany({ where });
  }

  async deleteByUuid(uuid: string) {
    const media = await this.prisma.media.findUnique({ where: { uuid } });
    if (!media) throw new NotFoundException('Media not found');

    // Remove file physically
    await this.storage.deleteFile(media.path);

    // Hard delete from DB as per requirement
    await this.prisma.media.delete({ where: { id: media.id } });

    return true;
  }
}
