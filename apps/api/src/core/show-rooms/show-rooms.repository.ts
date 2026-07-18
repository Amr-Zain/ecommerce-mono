import { Injectable } from '@nestjs/common';
import { PrismaService, Prisma } from '@/prisma';
import { QueryBuilderService } from '@/common/services/query-builder.service';
import { TranslationFields } from '@/common/repositories/base.repository';
import { MediaAwareRepository } from '@/common/repositories/media-aware.repository';
import { MediaService } from '@/media/media.service';
import { MediaType } from '@/media/enums/media-type.enum';
import { IShowRoomsRepository } from '@/common/interfaces';
import { AdvancedQueryDto } from '@/common/dto/advanced-query.dto';
import { PaginatedResult } from '@/common/dto/pagination.dto';
import type { ClientShowRoomView } from '@/common/interfaces/show-rooms.interface';

type ShowRoomType = Prisma.ShowRoomGetPayload<{
  include: { translations: true; country: { include: { translations: true } } };
}>;

@Injectable()
export class ShowRoomsRepository extends MediaAwareRepository<ShowRoomType> implements IShowRoomsRepository {
  protected readonly mediaModel = 'showroom';
  protected mediaConfig = {
    image: { collection: 'show-rooms', single: true, allowedTypes: [MediaType.IMAGE] },
  };

  protected readonly searchConfig = {
    translationFields: ['name', 'address', 'city'] satisfies TranslationFields<ShowRoomType>[],
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
    country: {
      include: { translations: true },
    },
    translations: true,
  };

  protected readonly allowedIncludes = {
    country: { include: { translations: { where: { langId: '__langId__' } } } },
    translations: true,
  };

  constructor(prisma: PrismaService, queryBuilder: QueryBuilderService, mediaService: MediaService) {
    super(prisma, mediaService, queryBuilder);
  }

  protected getModel() {
    return this.prisma.showRoom;
  }

  findClientList(
    query: AdvancedQueryDto,
    langId: string,
  ): Promise<PaginatedResult<ClientShowRoomView> | ClientShowRoomView[]> {
    return this.findAll(query, langId, {
      select: {
        id: true,
        countryId: true,
        phoneCode: true,
        phone: true,
        email: true,
        url: true,
        lat: true,
        lng: true,
        isActive: true,
        createdAt: true,
        country: {
          select: {
            id: true,
            translations: { where: { langId }, select: { name: true }, take: 1 },
          },
        },
        translations: {
          where: { langId },
          select: { name: true, address: true, city: true, langId: true },
          take: 1,
        },
      },
    }) as unknown as Promise<PaginatedResult<ClientShowRoomView> | ClientShowRoomView[]>;
  }

  async findByIdWithAllTranslations(id: number | bigint): Promise<ShowRoomType | null> {
    return this.findById(id, {
      include: {
        country: { include: { translations: true } },
        translations: true,
      },
    });
  }
}
