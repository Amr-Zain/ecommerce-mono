import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { STATIC_PAGES_REPOSITORY, IStaticPagesRepository } from '@/common/interfaces';
import { AdvancedQueryDto } from '@/common/dto/advanced-query.dto';

@Injectable()
export class ClientStaticPagesService {
  constructor(@Inject(STATIC_PAGES_REPOSITORY) private readonly staticPagesRepo: IStaticPagesRepository) {}

  async findAll(langId: string = 'en') {
    const query: AdvancedQueryDto = {
      paginate: false,
      filters: { isActive: true },
    };
    return this.staticPagesRepo.findClientList(query, langId);
  }

  async findBySlug(slug: string, langId: string = 'en') {
    const page = await this.staticPagesRepo.findActiveBySlugWithSections(slug, langId);
    if (!page) throw new NotFoundException('Static page not found');
    return page;
  }
}
