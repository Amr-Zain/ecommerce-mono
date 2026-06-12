import { Injectable } from '@nestjs/common';
import { PrismaService, Prisma } from '@/prisma';
import { QueryBuilderService } from '@/common/services/query-builder.service';
import { BaseRepository, TranslationFields } from '@/common/repositories/base.repository';
import { MediaService } from '@/media/media.service';
import { MediaType } from '@/media/enums/media-type.enum';
import { IShowRoomsRepository } from '@/common/interfaces';

type ShowRoomType = Prisma.ShowRoomGetPayload<{
  include: { translations: true; country: { include: { translations: true } } };
}>;

@Injectable()
export class ShowRoomsRepository extends BaseRepository<ShowRoomType> implements IShowRoomsRepository {
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

  async findByIdWithAllTranslations(id: number | bigint): Promise<ShowRoomType | null> {
    return this.findById(id, {
      include: {
        country: { include: { translations: true } },
        translations: true,
      },
    });
  }
}
