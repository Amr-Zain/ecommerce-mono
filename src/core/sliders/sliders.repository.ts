import { Injectable } from '@nestjs/common';
import { PrismaService, Prisma } from '@/prisma';
import { QueryBuilderService } from '@/common/services/query-builder.service';
import { BaseRepository, QueryOptions } from '@/common/repositories/base.repository';
import { AdvancedQueryDto } from '@/common/dto/advanced-query.dto';
import { PaginatedResult } from '@/common/dto/pagination.dto';
import { MediaService } from '@/media/media.service';
import { MediaType } from '@/media/enums/media-type.enum';
import { SLIDERS_REPOSITORY, ISlidersRepository } from '@/common/interfaces';

type SliderType = Prisma.SliderGetPayload<{ include: { translations: true } }>;

@Injectable()
export class SlidersRepository extends BaseRepository<SliderType> implements ISlidersRepository {
  protected readonly mediaConfig = {
    slide: { collection: 'slide', single: true, allowedTypes: [MediaType.IMAGE, MediaType.VIDEO] },
  };

  constructor(
    prisma: PrismaService,
    private readonly queryBuilder: QueryBuilderService,
    mediaService: MediaService,
  ) {
    super(prisma, mediaService);
  }

  protected getModel() {
    return this.prisma.slider;
  }

  async findAll(query: AdvancedQueryDto, langId: string = 'en', options?: QueryOptions): Promise<PaginatedResult<SliderType> | SliderType[]> {
    const where = this.buildWhereClause(query, langId);
    if (options?.select) {
      return this.paginate(query, where, { select: options.select });
    }
    return this.paginate(query, where, {
      include: {
        translations: {
          where: { langId },
          take: 1,
        },
      },
    });
  }

  async findByIdWithAllTranslations(id: number | bigint): Promise<SliderType | null> {
    return this.findById(id, {
      include: {
        translations: true,
      },
    });
  }

  private buildWhereClause(query: AdvancedQueryDto, langId?: string): Prisma.SliderWhereInput {
    const conditions: Prisma.SliderWhereInput[] = [];
    const filters = query.filters ?? {};

    if (Object.keys(filters).length > 0) {
      conditions.push(this.queryBuilder.buildFiltersCondition<Prisma.SliderWhereInput>(filters));
    }

    if (query.search && langId) {
      conditions.push({
        translations: {
          some: {
            langId,
            title: { contains: query.search, mode: 'insensitive' },
          },
        },
      });
    }

    return this.queryBuilder.combineWhereConditions(...conditions);
  }
}