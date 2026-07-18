import { Injectable, Inject } from '@nestjs/common';
import { SHOW_ROOMS_REPOSITORY, IShowRoomsRepository } from '@/common/interfaces';
import { AdvancedQueryDto } from '@/common/dto/advanced-query.dto';

@Injectable()
export class ClientShowRoomsService {
  constructor(@Inject(SHOW_ROOMS_REPOSITORY) private readonly showRoomsRepo: IShowRoomsRepository) {}

  async findAll(langId: string = 'en', query: AdvancedQueryDto = {}) {
    const queryOptions: AdvancedQueryDto = {
      ...query,
      paginate: query.paginate ?? true,
      filters: { ...query.filters, isActive: true },
      sort: query.sort ?? { createdAt: 'desc' },
    };
    return this.showRoomsRepo.findClientList(queryOptions, langId);
  }
}
