import { BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export function assertStorageSegment(value: string): void {
  if (!/^[a-zA-Z0-9_-]{1,128}$/.test(value) || /^(con|prn|aux|nul|com[0-9]|lpt[0-9])$/i.test(value)) {
    throw new BadRequestException('Invalid media storage identifier.');
  }
}

/** Reject escaping paths and existing symlinks/junctions before filesystem operations. */
export function resolveStoragePath(root: string, ...segments: string[]): string {
  const resolvedRoot = path.resolve(root);
  const target = path.resolve(resolvedRoot, ...segments);
  const relative = path.relative(resolvedRoot, target);
  if (!relative || relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
    throw new BadRequestException('Invalid media storage path.');
  }
  let current = resolvedRoot;
  for (const segment of ['', ...relative.split(path.sep)]) {
    current = path.join(current, segment);
    try {
      if (fs.lstatSync(current).isSymbolicLink()) throw new BadRequestException('Media storage links are not allowed.');
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    }
  }
  return target;
}
