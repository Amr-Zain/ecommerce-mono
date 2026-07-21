import { Injectable } from '@nestjs/common';
import { PrismaService, Prisma } from '@/prisma';
import { QueryBuilderService } from '@/common/services/query-builder.service';
import { QueryOptions, TranslationFields } from '@/common/repositories/base.repository';
import { MediaAwareRepository } from '@/common/repositories/media-aware.repository';
import { MediaService } from '@/media/media.service';
import { MediaType } from '@/media/enums/media-type.enum';
import { AdvancedQueryDto } from '@/common/dto/advanced-query.dto';
import { PaginatedResult } from '@/common/dto/pagination.dto';
import { decimalToNumberOrZero } from '@/common/utils/decimal.util';
import type { Country, ClientCountryView } from '@/common/interfaces/countries.interface';

type CountryType = Prisma.CountryGetPayload<{ include: { translations: true } }>;

@Injectable()
export class CountriesRepository extends MediaAwareRepository<CountryType> {
  protected readonly mediaModel = 'country';
  protected readonly mediaConfig = {
    flag: { collection: 'flag', single: true, allowedTypes: [MediaType.IMAGE] },
  };

  protected readonly searchConfig = {
    translationFields: ['name', 'nationality', 'shortName'] satisfies TranslationFields<CountryType>[],
  };

  protected readonly defaultListInclude = {
    translations: {
      where: { langId: '__langId__' },
      take: 1,
    },
  };

  protected readonly allowedIncludes = {
    translations: true,
  };

  protected readonly defaultDetailInclude = {
    translations: true,
  };

  constructor(prisma: PrismaService, queryBuilder: QueryBuilderService, mediaService: MediaService) {
    super(prisma, mediaService, queryBuilder);
  }

  protected formatRecord<Out = CountryType>(record: CountryType): Out {
    return { ...record, shippingPrice: decimalToNumberOrZero(record.shippingPrice) } as unknown as Out;
  }

  getModel() {
    return this.prisma.country;
  }

  async findAll(query: AdvancedQueryDto, langId?: string, options?: QueryOptions): Promise<PaginatedResult<CountryType> | CountryType[]> {
    return super.findAll(query, langId, options) as unknown as Promise<PaginatedResult<CountryType> | CountryType[]>;
  }

  findClientList(query: AdvancedQueryDto, langId: string): Promise<ClientCountryView[]> {
    return this.findAll(query, langId, {
      select: {
        id: true,
        phoneCode: true,
        phoneLength: true,
        phoneStartWith: true,
        translations: { where: { langId }, select: { name: true, langId: true }, take: 1 },
      },
    }) as unknown as Promise<ClientCountryView[]>;
  }

  async createCountry(country: Prisma.CountryCreateInput): Promise<Country> {
    return this.create(country) as unknown as Country;
  }

  async updateCountry(country: Prisma.CountryUpdateInput, id: number): Promise<Country> {
    return this.update(id, country) as unknown as Country;
  }

  async findByIdWithAllTranslations(id: number | bigint): Promise<Country | null> {
    return this.findById(id, { include: { translations: true } }) as unknown as Country | null;
  }

  async deleteCountry(id: number | bigint): Promise<Country> {
    return this.delete(id) as unknown as Country;
  }
}
