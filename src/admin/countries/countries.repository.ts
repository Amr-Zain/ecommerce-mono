import { Injectable } from '@nestjs/common';
import { PrismaService, Prisma } from '../../prisma';
import { QueryBuilderService } from 'src/common/services/query-builder.service';
import { BaseRepository } from 'src/common/repositories/base.repository';
import { AdvancedQueryDto } from 'src/common/dto/advanced-query.dto';

@Injectable()
export class CountriesRepository extends BaseRepository<Prisma.CountryGetPayload<never>> {
  constructor(
    prisma: PrismaService,
    private readonly queryBuilder: QueryBuilderService,
  ) {
    super(prisma);
  }

  getModel() {
    return this.prisma.country;
  }

  /**
   * Find all countries with translations for specific language
   * @param query - Query parameters
   * @param langId - Language ID (e.g., 'en', 'ar')
   * @returns Paginated countries with only the requested language translation
   */
  async findAll(query: AdvancedQueryDto, langId: string = 'en') {
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

  /**
   * Find country by ID with translations for specific language
   * @param id - Country ID
   * @param langId - Language ID (e.g., 'en', 'ar')
   * @returns Country with only the requested language translation
   */
  async createCountry(country: Prisma.CountryCreateInput) {
    return this.create(country);
  }

  async updateCountry(country: Prisma.CountryUpdateInput, id: number) {
    return this.update(id, country);
  }

  /**
   * Find country by ID with all translations (for admin editing)
   * @param id - Country ID
   * @returns Country with all translations
   */
  async findByIdWithRelations(id: number | bigint, langId: string = 'en') {
    return this.findById(id, {
      include: {
        translations: {
          where: { langId },
          take: 1,
        },
      },
    });
  }

  async findByIdWithAllTranslations(id: number | bigint) {
    return this.findById(id, {
      include: {
        translations: true,
      },
    });
  }

  private buildWhereClause(query: AdvancedQueryDto, langId?: string): Prisma.CountryWhereInput {
    const conditions = [];

    conditions.push(this.queryBuilder.buildFiltersCondition(query.filters!));

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
