import { Injectable } from '@nestjs/common';
import { PrismaService, Prisma } from '@/prisma';
import { QueryBuilderService } from '@/common/services/query-builder.service';
import { BaseRepository, TranslationFields } from '@/common/repositories/base.repository';
import { MediaService } from '@/media/media.service';
import { MediaType } from '@/media/enums/media-type.enum';
import { ISlidersRepository } from '@/common/interfaces';

type SliderType = Prisma.SliderGetPayload<{ include: { translations: true } }>;

@Injectable()
export class SlidersRepository extends BaseRepository<SliderType> implements ISlidersRepository {
  protected readonly mediaConfig = {
    slide: { collection: 'slide', single: true, allowedTypes: [MediaType.IMAGE, MediaType.VIDEO] },
  };

  protected readonly searchConfig = {
    translationFields: ['title'] satisfies TranslationFields<SliderType>[],
  };

  protected readonly defaultListInclude = {
    translations: {
      where: { langId: '__langId__' },
      take: 1,
    },
  };

  protected readonly defaultDetailInclude = {
    translations: true,
  };

  protected readonly allowedIncludes = {
    translations: true,
  };

  constructor(prisma: PrismaService, queryBuilder: QueryBuilderService, mediaService: MediaService) {
    super(prisma, mediaService, queryBuilder);
  }

  protected getModel() {
    return this.prisma.slider;
  }

  async findByIdWithAllTranslations(id: number | bigint): Promise<SliderType | null> {
    return this.findById(id, {
      include: { translations: true },
    });
  }
}
