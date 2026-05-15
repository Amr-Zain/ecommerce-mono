import { Injectable, Inject, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService, Prisma } from '../prisma';
import { StorageInterface } from './storage/storage.interface';
import { UploadMediaDto } from './dto/upload-media.dto';
import { AttachMediaDto } from './dto/attach-media.dto';
import { MediaType } from './enums/media-type.enum';
import { randomUUID } from 'crypto';
import * as path from 'path';

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
    const baseUrl = process.env.APP_URL || 'http://localhost:3000';
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

      // Map model name to relation ID key (e.g., "static_page" -> "staticPageId")
      const relationIdKey =
        dto.model
          .split('_')
          .map((word, index) => (index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)))
          .join('') + 'Id';

      // 3. Save to DB
      const result = await this.prisma.media.create({
        data: {
          model: dto.model,
          modelId: dto.modelId ? BigInt(dto.modelId) : null,
          [relationIdKey]: dto.modelId ? BigInt(dto.modelId) : null,
          attachHash: dto.modelId ? null : attachHash,
          collection: dto.collection || null,
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
  async attachTempMedia(dto: AttachMediaDto) {
    const mediaItems = await this.prisma.media.findMany({
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

    // Map model name to relation ID key (e.g., "static_page" -> "staticPageId")
    const relationIdKey =
      dto.model
        .split('_')
        .map((word, index) => (index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)))
        .join('') + 'Id';

    let count = 0;

    for (const item of mediaItems) {
      const newPath = item.path.replace(`/uploads/${dto.model}/${dto.attachHash}`, newPathBase);

      await this.prisma.media.update({
        where: { id: item.id },
        data: {
          modelId: bigIntModelId,
          [relationIdKey]: bigIntModelId,
          attachHash: null,
          path: newPath,
        },
      });
      count++;
    }

    return { count };
  }

  async findByUuid(uuid: string) {
    const media = await this.prisma.media.findUnique({ where: { uuid } });
    if (!media) throw new NotFoundException('Media not found');
    return { ...media, id: media.id.toString() };
  }

  async findByEntity(model: string, modelId: string, collection?: string) {
    const where: Prisma.MediaWhereInput = {
      model,
      modelId: BigInt(modelId),
    };

    if (collection) where.collection = collection;

    const items = await this.prisma.media.findMany({ where, orderBy: { createdAt: 'asc' } });

    return items.map((i) => ({ ...i, id: i.id.toString() }));
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
