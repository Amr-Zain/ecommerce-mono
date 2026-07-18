import { Injectable } from '@nestjs/common';
import { BaseRepository, TranslationFields } from '@/common/repositories/base.repository';
import { PrismaService, Prisma } from '@/prisma';
import { QueryBuilderService } from '@/common/services/query-builder.service';
import { MediaService } from '@/media/media.service';
import { ICitiesRepository } from '@/common/interfaces';
import { AdvancedQueryDto } from '@/common/dto/advanced-query.dto';
import type { ClientCityView } from '@/common/interfaces/cities.interface';

type City = Prisma.CityGetPayload<{ include: { translations: true } }>;

@Injectable()
export class CitiesRepository extends BaseRepository<City> implements ICitiesRepository {
  protected readonly searchConfig = {
    translationFields: ['name'] satisfies TranslationFields<City>[],
  };

  protected readonly filterConfig = {
    countryId: 'bigint' as const,
  };

  protected readonly allowedIncludes = {
    country: {
      include: {
        translations: {
          where: { langId: '__langId__' },
        },
      },
    },
    translations: {
      where: { langId: '__langId__' },
      take: 1,
    },
  };

  protected readonly defaultDetailInclude = {
    translations: true,
    country: {
      include: {
        translations: {
          where: { langId: '__langId__' },
        },
      },
    },
  };

  constructor(prisma: PrismaService, queryBuilder: QueryBuilderService, mediaService: MediaService) {
    super(prisma, queryBuilder);
  }

  getModel() {
    return this.prisma.city;
  }

  findClientList(query: AdvancedQueryDto, langId: string): Promise<ClientCityView[]> {
    return this.findAll(query, langId, {
      select: {
        id: true,
        translations: { where: { langId }, select: { name: true, langId: true } },
        country: {
          select: {
            id: true,
            phoneCode: true,
            translations: { where: { langId }, select: { name: true, langId: true } },
          },
        },
      },
    }) as unknown as Promise<ClientCityView[]>;
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
}
