import { Injectable } from '@nestjs/common';
import { PrismaService, Prisma } from '@/prisma';
import { QueryBuilderService } from '@/common/services/query-builder.service';
import { BaseRepository, TranslationFields } from '@/common/repositories/base.repository';
import { MediaService } from '@/media/media.service';
import { IFaqsRepository } from '@/common/interfaces';
import { AdvancedQueryDto } from '@/common/dto/advanced-query.dto';
import type { ClientFaqView } from '@/common/interfaces/faqs.interface';

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

  constructor(prisma: PrismaService, queryBuilder: QueryBuilderService, mediaService: MediaService) {
    super(prisma, queryBuilder);
  }

  protected getModel() {
    return this.prisma.faq;
  }

  findClientList(query: AdvancedQueryDto, langId: string): Promise<ClientFaqView[]> {
    return this.findAll(query, langId, {
      select: {
        id: true,
        sortOrder: true,
        translations: {
          where: { langId },
          select: { question: true, answer: true, langId: true },
          take: 1,
        },
      },
    }) as unknown as Promise<ClientFaqView[]>;
  }

  async findByIdWithAllTranslations(id: number | bigint): Promise<FaqType | null> {
    return this.findById(id, {
      include: { translations: true },
    });
  }
}
