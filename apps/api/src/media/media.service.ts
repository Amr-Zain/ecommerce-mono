import { Injectable, Inject, NotFoundException, Logger } from '@nestjs/common';
import { TransactionContext } from '@/common/persistence';
import { StorageInterface } from './storage/storage.interface';
import { UploadMediaDto } from './dto/upload-media.dto';
import { AttachMediaDto } from './dto/attach-media.dto';
import { MediaType } from './enums/media-type.enum';
import { randomUUID } from 'crypto';
import * as path from 'path';
import { MediaRecord } from './media.types';
import { MEDIA_REPOSITORY, MediaRepositoryPort } from './media.repository.port';

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);

  constructor(
    @Inject(MEDIA_REPOSITORY) private readonly media: MediaRepositoryPort,
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
      const result = await this.media.create({
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
  async attachTempMedia(dto: AttachMediaDto, context?: TransactionContext) {
    const mediaItems = await this.media.findTemporary(dto.model, [dto.attachHash], context);

    if (mediaItems.length === 0) return { count: 0 };

    // 1. Move directories on disk
    const newPathBase = await this.storage.moveDir(dto.model, dto.attachHash, dto.modelId);

    // 2. Update DB records
    const bigIntModelId = BigInt(dto.modelId);

    await this.media.attach(
      mediaItems.map((item) => ({
        id: item.id,
        modelId: bigIntModelId,
        path: item.path.replace(`/uploads/${dto.model}/${dto.attachHash}`, newPathBase),
      })),
      context,
    );

    return { count: mediaItems.length };
  }

  async attachTempMediaMany(
    input: { model: string; attachHashes: string[]; modelId: string },
    context?: TransactionContext,
  ) {
    const attachHashes = [...new Set(input.attachHashes.filter(Boolean))];
    if (attachHashes.length === 0) return { count: 0 };

    const mediaItems = await this.media.findTemporary(input.model, attachHashes, context);

    if (mediaItems.length === 0) return { count: 0 };

    const pathByHash = new Map<string, string>();
    for (const attachHash of attachHashes) {
      if (mediaItems.some((item) => item.attachHash === attachHash)) {
        pathByHash.set(attachHash, await this.storage.moveDir(input.model, attachHash, input.modelId));
      }
    }

    const bigIntModelId = BigInt(input.modelId);
    const updates = [];
    for (const item of mediaItems) {
      if (!item.attachHash) continue;
      const newPathBase = pathByHash.get(item.attachHash);
      if (!newPathBase) continue;
      const newPath = item.path.replace(`/uploads/${input.model}/${item.attachHash}`, newPathBase);

      updates.push({ id: item.id, modelId: bigIntModelId, path: newPath });
    }
    await this.media.attach(updates, context);

    return { count: mediaItems.length };
  }

  async findByUuid(uuid: string) {
    const media = await this.media.findByUuid(uuid);
    if (!media) throw new NotFoundException('Media not found');
    return { ...media, id: media.id.toString() };
  }

  async findByEntity(model: string, modelId: number | string | bigint, collection?: string): Promise<MediaRecord[]> {
    return this.media.findByEntity(model, typeof modelId === 'bigint' ? modelId : BigInt(modelId), collection);
  }

  /**
   * Bulk fetch media for multiple entities
   */
  async findByEntities(model: string, modelIds: bigint[]): Promise<Map<string, MediaRecord[]>> {
    const items = await this.media.findByEntities(model, modelIds);

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
    const media = await this.media.findProductImages(productIds, variantIds);

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
    context?: TransactionContext,
  ) {
    const normalizedId = typeof modelId === 'bigint' ? modelId : BigInt(modelId);
    const items = await this.media.findEntityRecords(model, normalizedId, collection, context);

    for (const item of items) {
      await this.storage.deleteFile(item.path);
    }

    await this.media.deleteEntityRecords(model, normalizedId, collection, context);
  }

  async deleteByUuid(uuid: string) {
    const media = await this.media.findByUuid(uuid);
    if (!media) throw new NotFoundException('Media not found');

    // Remove file physically
    await this.storage.deleteFile(media.path);

    // Hard delete from DB as per requirement
    await this.media.deleteById(media.id);

    return true;
  }
}
