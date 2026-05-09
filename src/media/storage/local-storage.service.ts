import { Injectable, Logger } from '@nestjs/common';
import { StorageInterface } from './storage.interface';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';

@Injectable()
export class LocalStorageService implements StorageInterface {
  private readonly logger = new Logger(LocalStorageService.name);
  private readonly baseUploadsPath = path.join(process.cwd(), 'uploads');

  constructor() {
    if (!fs.existsSync(this.baseUploadsPath)) {
      fs.mkdirSync(this.baseUploadsPath, { recursive: true });
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    model: string,
    idOrHash: string,
  ): Promise<{ path: string; filename: string }> {
    const now = new Date();
    const year = now.getFullYear().toString();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');

    // Structure: /uploads/{model}/{modelId or hash}/{yyyy}/{mm}/
    const uploadDir = path.join(this.baseUploadsPath, model, idOrHash, year, month);

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const extension = path.extname(file.originalname);
    const newFilename = `${randomUUID()}${extension}`;
    const filePath = path.join(uploadDir, newFilename);

    fs.writeFileSync(filePath, file.buffer);

    // Return relative path to be stored taking uploads as root or absolute relative
    const dbPath = `/uploads/${model}/${idOrHash}/${year}/${month}/${newFilename}`;

    return {
      path: dbPath,
      filename: newFilename,
    };
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      const absolutePath = path.join(process.cwd(), filePath);
      if (fs.existsSync(absolutePath)) {
        fs.unlinkSync(absolutePath);
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      this.logger.error(`Failed to delete file ${filePath}: ${errorMessage}`);
    }
  }

  getFileUrl(filePath: string): string {
    return filePath; // Since it's local, we might serve it via a static controller
  }
}
