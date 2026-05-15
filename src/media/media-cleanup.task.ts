import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma';
import { StorageInterface } from './storage/storage.interface';
import { Inject } from '@nestjs/common';

@Injectable()
export class MediaCleanupTask {
  private readonly logger = new Logger(MediaCleanupTask.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject('StorageInterface') private readonly storage: StorageInterface,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCleanup() {
    this.logger.log('Starting unattached media cleanup...');

    // Find media with attachHash older than 1 hour
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);

    const oldMedia = await this.prisma.media.findMany({
      where: {
        attachHash: { not: null },
        modelId: null,
        createdAt: { lt: oneHourAgo },
      },
    });

    if (oldMedia.length === 0) {
      this.logger.log('No old unattached media found.');
      return;
    }

    this.logger.log(`Found ${oldMedia.length} unattached media files to delete.`);

    for (const media of oldMedia) {
      try {
        // 1. Delete physically
        await this.storage.deleteFile(media.path);

        // 2. Delete from DB
        await this.prisma.media.delete({ where: { id: media.id } });

        this.logger.log(`Deleted media: ${media.uuid} (${media.path})`);
      } catch (error) {
        this.logger.error(
          `Failed to delete media ${media.uuid}: ${error instanceof Error ? error.message : JSON.stringify(error)}`,
        );
      }
    }

    this.logger.log('Cleanup finished.');
  }
}
