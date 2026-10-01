import {
  BadRequestException,
  FileTypeValidator,
  Injectable,
  PayloadTooLargeException,
  PipeTransform,
} from '@nestjs/common';
import type { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import * as path from 'path';

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
export const MAX_UPLOAD_FILES = 10;
const extensions: Record<string, readonly string[]> = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'image/gif': ['.gif'],
  'application/pdf': ['.pdf'],
};

export const uploadOptions: MulterOptions = {
  limits: { fileSize: MAX_UPLOAD_BYTES, files: MAX_UPLOAD_FILES, fields: 10, fieldSize: 16 * 1024, parts: 20 },
  fileFilter: (_request, file, callback) => {
    if (!extensions[file.mimetype]?.includes(path.extname(file.originalname).toLowerCase())) {
      return callback(new BadRequestException('Only JPEG, PNG, WebP, GIF and PDF uploads are allowed.'), false);
    }
    callback(null, true);
  },
};

/** Nest detects magic bytes; do not fall back to client-supplied MIME types. */
@Injectable()
export class UploadValidationPipe implements PipeTransform {
  async transform(value: Express.Multer.File | Express.Multer.File[] | undefined) {
    const files = Array.isArray(value) ? value : value ? [value] : [];
    if (files.length > MAX_UPLOAD_FILES) throw new BadRequestException('At most 10 files are allowed.');
    for (const file of files) {
      if (!file.buffer?.length) throw new BadRequestException('Empty files are not allowed.');
      if (file.buffer.length > MAX_UPLOAD_BYTES) throw new PayloadTooLargeException('Files must not exceed 10 MB.');
      if (
        !extensions[file.mimetype]?.includes(path.extname(file.originalname).toLowerCase()) ||
        !(await new FileTypeValidator({ fileType: new RegExp(`^${file.mimetype}$`) }).isValid(file))
      ) {
        throw new BadRequestException('File contents must match an allowed file type and extension.');
      }
    }
    return value;
  }
}
