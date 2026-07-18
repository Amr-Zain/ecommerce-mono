import { Injectable } from '@nestjs/common';
import { PrismaService, Prisma } from '@/prisma';
import { QueryBuilderService } from '@/common/services/query-builder.service';
import { TranslationFields } from '@/common/repositories/base.repository';
import { MediaAwareRepository } from '@/common/repositories/media-aware.repository';
import { MediaService } from '@/media/media.service';
import { MediaType } from '@/media/enums/media-type.enum';
import { ICountriesRepository } from '@/common/interfaces';
import { AdvancedQueryDto } from '@/common/dto/advanced-query.dto';
import type { ClientCountryView } from '@/common/interfaces/countries.interface';

type CountryType = Prisma.CountryGetPayload<{ include: { translations: true } }>;

@Injectable()
export class CountriesRepository extends MediaAwareRepository<CountryType> implements ICountriesRepository {
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

  getModel() {
    return this.prisma.country;
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

  async createCountry(country: Prisma.CountryCreateInput): Promise<CountryType> {
    return this.create(country);
  }

  async updateCountry(country: Prisma.CountryUpdateInput, id: number): Promise<CountryType> {
    return this.update(id, country);
  }

  async findByIdWithAllTranslations(id: number | bigint): Promise<CountryType | null> {
    return this.findById(id, {
      include: { translations: true },
    });
  }

  async deleteCountry(id: number | bigint): Promise<CountryType> {
    return this.delete(id);
  }
}
