import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const SOURCE_ROOT = join(__dirname, '..', '..');
const APPLICATION_SUFFIXES = ['.service.ts', '.controller.ts', '.dto.ts', '.task.ts'];

function sourceFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    return statSync(path).isDirectory() ? sourceFiles(path) : path.endsWith('.ts') ? [path] : [];
  });
}

function workspacePath(path: string) {
  return relative(SOURCE_ROOT, path).split(sep).join('/');
}

describe('persistence architecture boundary', () => {
  const files = sourceFiles(SOURCE_ROOT).filter((path) => !path.endsWith('.spec.ts'));

  it('keeps Prisma out of controllers, services, DTOs, and scheduled tasks', () => {
    const violations = files
      .filter((path) => APPLICATION_SUFFIXES.some((suffix) => path.endsWith(suffix)))
      .filter((path) => !workspacePath(path).startsWith('prisma/'))
      .flatMap((path) => {
        const source = readFileSync(path, 'utf8');
        const reasons = [
          /from\s+['"]@prisma\/client['"]/.test(source) && 'Prisma import',
          /from\s+['"][^'"]*prisma[^'"]*['"]/.test(source) && 'Prisma infrastructure import',
          /\bPrismaService\b/.test(source) && 'PrismaService',
          /\.\$(?:transaction|queryRaw|executeRaw)\b/.test(source) && 'direct database operation',
          /\bPrisma\.TransactionClient\b/.test(source) && 'Prisma transaction client',
        ].filter(Boolean);
        return reasons.map((reason) => `${workspacePath(path)}: ${reason}`);
      });

    expect(violations).toEqual([]);
  });

  it('keeps every repository port structural and ORM agnostic', () => {
    const violations = files
      .filter((path) => workspacePath(path).startsWith('common/interfaces/') || path.endsWith('.port.ts'))
      .filter((path) =>
        /@prisma\/client|\bPrisma\.|\bTransactionClient\b|\bany\b|\bQueryOptions\b|\b(?:select|include)\??\s*:/.test(
          readFileSync(path, 'utf8'),
        ),
      )
      .map(workspacePath);

    expect(violations).toEqual([]);
  });

  it('allows direct database access only in repositories and Prisma infrastructure', () => {
    const violations = files
      .filter((path) => {
        const relativePath = workspacePath(path);
        return (
          relativePath !== 'app.module.ts' &&
          !relativePath.startsWith('prisma/') &&
          !relativePath.endsWith('.repository.ts') &&
          relativePath !== 'common/repositories/base.repository.ts'
        );
      })
      .filter((path) =>
        /@prisma\/client|(?:from\s+['"][^'"]*prisma[^'"]*['"])|\bPrismaService\b|\.\$(?:transaction|queryRaw|executeRaw)\b|\bTransactionClient\b/.test(
          readFileSync(path, 'utf8'),
        ),
      )
      .map(workspacePath);

    expect(violations).toEqual([]);
  });
});
