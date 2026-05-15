import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@/common/repositories/base.repository';
import { PrismaService, Prisma } from '../../prisma';
import { AdvancedQueryDto } from '@/common/dto/advanced-query.dto';
import { QueryBuilderService } from 'src/common/services/query-builder.service';
import { MediaService } from 'src/media/media.service';

type City = Prisma.CityGetPayload<{ include: { translations: true } }>;

@Injectable()
export class CitiesRepository extends BaseRepository<City> {
  protected readonly modelName = Prisma.ModelName.City;
  protected readonly isSingleMedia = true;
  protected readonly allowedMediaTypes = ['image'];

  constructor(
    prisma: PrismaService,
    private readonly queryBuilder: QueryBuilderService,
    private readonly mediaServiceInstance: MediaService,
  ) {
    super(prisma, mediaServiceInstance);
  }
  getModel() {
    return this.prisma.city;
  }

  async findAll(query: AdvancedQueryDto, langId: string = 'en') {
    const where = this.buildWhereClause(query, langId);
    return this.paginate(query, where, {
      include: {
        country: {
          include: {
            translations: {
              where: {
                langId,
              },
            },
          },
        },
        translations: {
          where: {
            langId,
          },
          take: 1,
        },
      },
    });
  }
  async findByIdWithRelations(id: number | bigint, langId: string = 'en'): Promise<City | null> {
    return this.findById(id, {
      include: {
        translations: true,
        country: {
          include: {
            translations: {
              where: {
                langId,
              },
            },
          },
        },
      },
    });
  }
  async createCity(city: Prisma.CityCreateInput): Promise<City> {
    return this.create(city);
  }

  async updateCity(id: number | bigint, city: Prisma.CityUpdateInput): Promise<City> {
    return this.update(id, city);
  }

  async deleteCity(id: number | bigint): Promise<City> {
    return this.delete(id);
  }

  private buildWhereClause(query: AdvancedQueryDto, langId?: string): Prisma.CityWhereInput {
    const conditions: Prisma.CityWhereInput[] = [];
    const filters = query.filters ?? {};
    if (Object.keys(filters).length > 0) {
      conditions.push(this.queryBuilder.buildFiltersCondition<Prisma.CityWhereInput>(filters));
    }

    if (query.search && langId) {
      // Search in translations for the specific language
      const searchCondition: Prisma.CityWhereInput = {
        translations: {
          some: {
            langId,
            OR: [{ name: { contains: query.search, mode: 'insensitive' } }],
          },
        },
      };
      conditions.push(searchCondition);
    }

    return this.queryBuilder.combineWhereConditions(...conditions);
  }
}
