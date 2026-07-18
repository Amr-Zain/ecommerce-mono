import { QueryBuilderService } from '@/common/services/query-builder.service';
import { CollectionsRepository } from './collections.repository';

const collection = (id: bigint, parentId: bigint | null) => ({
  id,
  parentId,
  slug: `collection-${id}`,
  isActive: true,
  sortOrder: Number(id),
  createdAt: new Date(),
  updatedAt: new Date(),
  translations: [{ name: `Collection ${id}` }],
  _count: { products: Number(id) },
});

describe('CollectionsRepository catalog helpers', () => {
  it('returns active descendant ids from the repository-local recursive query', async () => {
    const prisma = {
      collection: {
        findFirst: jest.fn().mockResolvedValue({
          id: 1n,
          children: [{ id: 2n, children: [{ id: 3n }] }],
        }),
      },
    };
    const repository = new CollectionsRepository(prisma as never, new QueryBuilderService(), {
      findByEntities: jest.fn(),
    } as never);

    await expect(repository.findActiveDescendantIds(1n)).resolves.toEqual([1n, 2n, 3n]);
    expect(prisma.collection.findFirst).toHaveBeenCalledTimes(1);
  });

  it('assembles the active hierarchy after one bulk media hydration', async () => {
    const rows = [collection(1n, null), collection(2n, 1n), collection(3n, 2n)];
    const prisma = {
      collection: {
        findMany: jest.fn().mockResolvedValue(rows),
      },
      product: {
        findMany: jest.fn().mockResolvedValue([]),
      },
    };
    const media = {
      findByEntities: jest.fn().mockResolvedValue(new Map()),
    };
    const repository = new CollectionsRepository(prisma as never, new QueryBuilderService(), media as never);

    const tree = await repository.findActiveTree();

    expect(tree).toHaveLength(1);
    expect(tree[0]?.children?.[0]?.children?.[0]?.id).toBe(3n);
    expect(prisma.collection.findMany).toHaveBeenCalledTimes(1);
    expect(media.findByEntities).toHaveBeenCalledTimes(1);
  });
});
