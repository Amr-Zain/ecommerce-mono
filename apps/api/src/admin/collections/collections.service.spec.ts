import { Test, TestingModule } from '@nestjs/testing';
import { COLLECTIONS_REPOSITORY } from '@/common/interfaces';
import { CollectionsService } from './collections.service';
import { PublicCacheInvalidationPublisher } from '@/shared/cache/public-cache-invalidation.service';

describe('CollectionsService', () => {
  let service: CollectionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CollectionsService,
        {
          provide: COLLECTIONS_REPOSITORY,
          useValue: {},
        },
        { provide: PublicCacheInvalidationPublisher, useValue: { publish: jest.fn() } },
      ],
    }).compile();

    service = module.get<CollectionsService>(CollectionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
