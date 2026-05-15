import { Injectable } from '@nestjs/common';
import { PrismaService, Prisma } from '../../prisma';
import { QueryBuilderService } from 'src/common/services/query-builder.service';
import { BaseRepository } from 'src/common/repositories/base.repository';
import { AdvancedQueryDto } from 'src/common/dto/advanced-query.dto';
import { PaginatedResult } from 'src/common/dto/pagination.dto';
import { MediaService } from 'src/media/media.service';

export type CountryType = Prisma.CountryGetPayload<{ include: { translations: true } }>;
@Injectable()
export class CountriesRepository extends BaseRepository<CountryType> {
  protected readonly modelName = Prisma.ModelName.Country;
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
    return this.prisma.country;
  }
  async findAll(query: AdvancedQueryDto, langId: string = 'en'): Promise<PaginatedResult<CountryType> | CountryType[]> {
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

  async createCountry(country: Prisma.CountryCreateInput): Promise<CountryType> {
    return this.create(country);
  }

  async updateCountry(country: Prisma.CountryUpdateInput, id: number): Promise<CountryType> {
    return this.update(id, country);
  }

  async findByIdWithRelations(id: number | bigint, langId: string = 'en'): Promise<CountryType | null> {
    return this.findById(id, {
      include: {
        translations: {
          where: { langId },
          take: 1,
        },
      },
    });
  }

  async findByIdWithAllTranslations(id: number | bigint): Promise<CountryType | null> {
    return this.findById(id, {
      include: {
        translations: true,
      },
    });
  }
  async deleteCountry(id: number | bigint): Promise<CountryType> {
    return this.delete(id);
  }
  private buildWhereClause(query: AdvancedQueryDto, langId?: string): Prisma.CountryWhereInput {
    const conditions: Prisma.CountryWhereInput[] = [];
    const filters = query.filters ?? {};
    if (Object.keys(filters).length > 0) {
      conditions.push(this.queryBuilder.buildFiltersCondition<Prisma.CountryWhereInput>(filters));
    }

    if (query.search && langId) {
      // Search in translations for the specific language
      const searchCondition: Prisma.CountryWhereInput = {
        translations: {
          some: {
            langId,
            OR: [
              { name: { contains: query.search, mode: 'insensitive' } },
              { nationality: { contains: query.search, mode: 'insensitive' } },
              { shortName: { contains: query.search, mode: 'insensitive' } },
            ],
          },
        },
      };
      conditions.push(searchCondition);
    }

    return this.queryBuilder.combineWhereConditions(...conditions);
  }
}
