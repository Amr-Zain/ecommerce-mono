import { Injectable } from '@nestjs/common';
import { PrismaService, Prisma } from '@/prisma';
import { QueryBuilderService } from '@/common/services/query-builder.service';
import { TranslationFields } from '@/common/repositories/base.repository';
import { MediaAwareRepository } from '@/common/repositories/media-aware.repository';
import { MediaService } from '@/media/media.service';
import { MediaType } from '@/media/enums/media-type.enum';
import { ISlidersRepository } from '@/common/interfaces';
import { AdvancedQueryDto } from '@/common/dto/advanced-query.dto';
import type { ClientSliderView } from '@/common/interfaces/sliders.interface';

type SliderType = Prisma.SliderGetPayload<{ include: { translations: true } }>;

@Injectable()
export class SlidersRepository extends MediaAwareRepository<SliderType> implements ISlidersRepository {
  protected readonly mediaModel = 'slider';
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

  findClientList(query: AdvancedQueryDto, langId: string): Promise<ClientSliderView[]> {
    return this.findAll(query, langId, {
      select: {
        id: true,
        sortOrder: true,
        startDate: true,
        endDate: true,
        translations: { where: { langId }, select: { title: true, langId: true } },
      },
    }) as unknown as Promise<ClientSliderView[]>;
  }

  async findByIdWithAllTranslations(id: number | bigint): Promise<SliderType | null> {
    return this.findById(id, {
      include: { translations: true },
    });
  }
}
