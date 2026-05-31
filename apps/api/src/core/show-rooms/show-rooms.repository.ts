import { Injectable } from '@nestjs/common';
import { PrismaService, Prisma } from '@/prisma';
import { QueryBuilderService } from '@/common/services/query-builder.service';
import { BaseRepository, QueryOptions } from '@/common/repositories/base.repository';
import { AdvancedQueryDto } from '@/common/dto/advanced-query.dto';
import { PaginatedResult } from '@/common/dto/pagination.dto';
import { MediaService } from '@/media/media.service';
import { MediaType } from '@/media/enums/media-type.enum';
import { SHOW_ROOMS_REPOSITORY, IShowRoomsRepository } from '@/common/interfaces';

type ShowRoomType = Prisma.ShowRoomGetPayload<{ include: { translations: true; country: { include: { translations: true } } } }>;

@Injectable()
export class ShowRoomsRepository extends BaseRepository<ShowRoomType> implements IShowRoomsRepository {
  protected mediaConfig = {
    image: { collection: 'show-rooms', single: true, allowedTypes: [MediaType.IMAGE] },
  };

  constructor(
    prisma: PrismaService,
    private readonly queryBuilder: QueryBuilderService,
    mediaService: MediaService,
  ) {
    super(prisma, mediaService);
  }

  protected getModel() {
    return this.prisma.showRoom;
  }

  async findAll(query: AdvancedQueryDto, langId: string = 'en', options?: QueryOptions): Promise<PaginatedResult<ShowRoomType> | ShowRoomType[]> {
    const where = this.buildWhereClause(query, langId);
    if (options?.select) {
      return this.paginate(query, where, { select: options.select });
    }
    return this.paginate(query, where, {
      include: {
        country: {
          include: {
            translations: {
              where: { langId },
            },
          },
        },
        translations: {
          where: { langId },
          take: 1,
        },
      },
    });
  }

  async findByIdWithAllTranslations(id: number | bigint): Promise<ShowRoomType | null> {
    return this.findById(id, {
      include: {
        country: {
          include: {
            translations: true,
          },
        },
        translations: true,
      },
    });
  }

  private buildWhereClause(query: AdvancedQueryDto, langId?: string): Prisma.ShowRoomWhereInput {
    const conditions: Prisma.ShowRoomWhereInput[] = [];
    const filters = query.filters ?? {};

    if (Object.keys(filters).length > 0) {
      conditions.push(this.queryBuilder.buildFiltersCondition<Prisma.ShowRoomWhereInput>(filters));
    }

    if (query.search && langId) {
      conditions.push({
        translations: {
          some: {
            langId,
            OR: [
              { name: { contains: query.search, mode: 'insensitive' } },
              { address: { contains: query.search, mode: 'insensitive' } },
              { city: { contains: query.search, mode: 'insensitive' } },
            ],
          },
        },
      });
    }

    return this.queryBuilder.combineWhereConditions(...conditions);
  }
}
