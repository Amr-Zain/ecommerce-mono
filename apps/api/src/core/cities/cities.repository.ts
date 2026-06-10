import { Injectable } from '@nestjs/common';
import { BaseRepository, TranslationFields } from '@/common/repositories/base.repository';
import { PrismaService, Prisma } from '@/prisma';
import { QueryBuilderService } from '@/common/services/query-builder.service';
import { MediaService } from '@/media/media.service';
import { ICitiesRepository } from '@/common/interfaces';

type City = Prisma.CityGetPayload<{ include: { translations: true } }>;

@Injectable()
export class CitiesRepository extends BaseRepository<City> implements ICitiesRepository {
  protected readonly searchConfig = {
    translationFields: ['name'] satisfies TranslationFields<City>[],
  };

  protected readonly defaultListInclude = {
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

  constructor(
    prisma: PrismaService,
    queryBuilder: QueryBuilderService,
    mediaService: MediaService,
  ) {
    super(prisma, mediaService, queryBuilder);
  }

  getModel() {
    return this.prisma.city;
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
