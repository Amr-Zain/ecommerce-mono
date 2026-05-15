import { Injectable } from '@nestjs/common';
import { PrismaService, Prisma } from '@/prisma';
import { QueryBuilderService } from '@/common/services/query-builder.service';
import { BaseRepository } from '@/common/repositories/base.repository';
import { AdvancedQueryDto } from '@/common/dto/advanced-query.dto';
import { PaginatedResult } from '@/common/dto/pagination.dto';
import { MediaService } from '@/media/media.service';

export type FaqType = Prisma.FaqGetPayload<{ include: { translations: true } }>;

@Injectable()
export class FaqsRepository extends BaseRepository<FaqType> {
  protected readonly modelName = Prisma.ModelName.Faq;
  protected readonly isSingleMedia = false; // FAQs usually don't have images, but if they do, we'll allow multiple or none

  constructor(
    prisma: PrismaService,
    private readonly queryBuilder: QueryBuilderService,
    private readonly mediaServiceInstance: MediaService,
  ) {
    super(prisma, mediaServiceInstance);
  }

  protected getModel() {
    return this.prisma.faq;
  }

  async findAll(query: AdvancedQueryDto, langId: string = 'en'): Promise<PaginatedResult<FaqType> | FaqType[]> {
    const where = this.buildWhereClause(query, langId);

    return this.paginate(query, where, {
      include: {
        translations: {
          where: { langId },
          take: 1,
        },
      },
    });
  }

  async findByIdWithAllTranslations(id: number | bigint): Promise<FaqType | null> {
    return this.findById(id, {
      include: {
        translations: true,
      },
    });
  }

  private buildWhereClause(query: AdvancedQueryDto, langId?: string): Prisma.FaqWhereInput {
    const conditions: Prisma.FaqWhereInput[] = [];
    const filters = query.filters ?? {};

    if (Object.keys(filters).length > 0) {
      conditions.push(this.queryBuilder.buildFiltersCondition<Prisma.FaqWhereInput>(filters));
    }

    if (query.search && langId) {
      conditions.push({
        translations: {
          some: {
            langId,
            OR: [
              { question: { contains: query.search, mode: 'insensitive' } },
              { answer: { contains: query.search, mode: 'insensitive' } },
            ],
          },
        },
      });
    }

    return this.queryBuilder.combineWhereConditions(...conditions);
  }
}
