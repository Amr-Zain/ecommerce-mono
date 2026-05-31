import { Injectable, Inject } from '@nestjs/common';
import { SHOW_ROOMS_REPOSITORY, IShowRoomsRepository } from '@/common/interfaces';
import { AdvancedQueryDto } from '@/common/dto/advanced-query.dto';

@Injectable()
export class ClientShowRoomsService {
  constructor(@Inject(SHOW_ROOMS_REPOSITORY) private readonly showRoomsRepo: IShowRoomsRepository) {}

  async findAll(langId: string = 'en') {
    const query: AdvancedQueryDto = {
      paginate: false,
      filters: { isActive: true },
      sort: { createdAt: 'desc' },
    };
    return this.showRoomsRepo.findAll(query, langId, {
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
            translations: {
              where: { langId },
              select: { name: true },
              take: 1,
            },
          },
        },
        translations: {
          where: { langId },
          select: { name: true, address: true, city: true, langId: true },
          take: 1,
        },
      },
    });
  }
}
