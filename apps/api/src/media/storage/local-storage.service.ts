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

  uploadFile(file: Express.Multer.File, model: string, idOrHash: string): Promise<{ path: string; filename: string }> {
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

    return Promise.resolve({
      path: dbPath,
      filename: newFilename,
    });
  }

  deleteFile(filePath: string): Promise<void> {
    try {
      const absolutePath = path.join(process.cwd(), filePath);
      if (fs.existsSync(absolutePath)) {
        fs.unlinkSync(absolutePath);
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      this.logger.error(`Failed to delete file ${filePath}: ${errorMessage}`);
    }

    return Promise.resolve();
  }

  getFileUrl(filePath: string): string {
    return filePath; // Since it's local, we might serve it via a static controller
  }

  /**
   * Recursively move files from src directory into dest directory.
   * Creates subdirectories in dest as needed. Removes src when done.
   */
  private async mergeDirContents(src: string, dest: string): Promise<void> {
    const entries = await fs.promises.readdir(src, { withFileTypes: true });
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      if (entry.isDirectory()) {
        if (!fs.existsSync(destPath)) {
          await fs.promises.mkdir(destPath, { recursive: true });
        }
        await this.mergeDirContents(srcPath, destPath);
      } else {
        if (!fs.existsSync(path.dirname(destPath))) {
          await fs.promises.mkdir(path.dirname(destPath), { recursive: true });
        }
        await fs.promises.rename(srcPath, destPath);
      }
    }
  }

  async moveDir(model: string, oldIdOrHash: string, newIdOrHash: string): Promise<string> {
    const oldDir = path.join(this.baseUploadsPath, model, oldIdOrHash);
    const newDir = path.join(this.baseUploadsPath, model, newIdOrHash);

    if (fs.existsSync(oldDir)) {
      if (fs.existsSync(newDir)) {
        // Destination exists (multiple hashes → same entity) — merge contents
        await this.mergeDirContents(oldDir, newDir);
        await fs.promises.rm(oldDir, { recursive: true, force: true });
      } else {
        if (!fs.existsSync(path.dirname(newDir))) {
          await fs.promises.mkdir(path.dirname(newDir), { recursive: true });
        }
        await fs.promises.rename(oldDir, newDir);
      }
    }

    return `/uploads/${model}/${newIdOrHash}`;
  }
}
