import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { assertStorageSegment, resolveStoragePath } from './storage-path';

describe('Storage path containment', () => {
  let root: string;
  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'media-security-'));
  });
  afterEach(() => fs.rmSync(root, { recursive: true, force: true }));

  it.each(['../outside', '..', 'a/b', 'a\\b', 'C:\\outside', 'CON', 'nul', 'a:stream', ''])(
    'rejects unsafe identifier %s',
    (value) => expect(() => assertStorageSegment(value)).toThrow(),
  );
  it.each(['../../outside', '..', '.', 'C:\\outside'])('rejects escaping path %s', (value) =>
    expect(() => resolveStoragePath(root, value)).toThrow(),
  );
  it('allows contained media paths', () => {
    expect(resolveStoragePath(root, 'product', 'hash_123', 'image.png')).toBe(
      path.join(root, 'product', 'hash_123', 'image.png'),
    );
  });
  it('rejects existing junctions', () => {
    const target = path.join(root, 'target');
    fs.mkdirSync(target);
    fs.symlinkSync(target, path.join(root, 'link'), 'junction');
    expect(() => resolveStoragePath(root, 'link', 'image.png')).toThrow();
  });
});
