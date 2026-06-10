import { Injectable } from '@nestjs/common';
import { PrismaService, Prisma } from '@/prisma';
import { QueryBuilderService } from '@/common/services/query-builder.service';
import { BaseRepository, TranslationFields } from '@/common/repositories/base.repository';
import { MediaService } from '@/media/media.service';
import { IFaqsRepository } from '@/common/interfaces';

type FaqType = Prisma.FaqGetPayload<{ include: { translations: true } }>;

@Injectable()
export class FaqsRepository extends BaseRepository<FaqType> implements IFaqsRepository {
  protected readonly searchConfig = {
    translationFields: ['question', 'answer'] satisfies TranslationFields<FaqType>[],
  };

  protected readonly defaultListInclude = {
    translations: {
      where: { langId: '__langId__' },
      take: 1,
    },
  };

  protected readonly defaultDetailInclude = {
    translations: true,
  };

  protected readonly allowedIncludes = {
    translations: true,
  };

  constructor(
    prisma: PrismaService,
    queryBuilder: QueryBuilderService,
    mediaService: MediaService,
  ) {
    super(prisma, mediaService, queryBuilder);
  }

  protected getModel() {
    return this.prisma.faq;
  }

  async findByIdWithAllTranslations(id: number | bigint): Promise<FaqType | null> {
    return this.findById(id, {
      include: { translations: true },
    });
  }
}
