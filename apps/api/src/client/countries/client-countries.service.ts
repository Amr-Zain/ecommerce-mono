import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { COUNTRIES_REPOSITORY, ICountriesRepository } from '@/common/interfaces';
import { AdvancedQueryDto } from '@/common/dto/advanced-query.dto';

@Injectable()
export class ClientCountriesService {
  constructor(@Inject(COUNTRIES_REPOSITORY) private readonly countriesRepo: ICountriesRepository) {}

  async findAll(langId: string = 'en') {
    const query: AdvancedQueryDto = {
      paginate: false,
      filters: { isActive: true },
      sort: { createdAt: 'asc' },
    };
    return this.countriesRepo.findAll(query, langId, {
      select: {
        id: true,
        phoneCode: true,
        phoneLength: true,
        phoneStartWith: true,
        translations: {
          where: { langId },
          select: { name: true, langId: true },
          take: 1,
        },
      },
    });
  }

  async findOne(id: bigint, langId: string = 'en') {
    const country = await this.countriesRepo.findByIdWithAllTranslations(id);
    if (!country) throw new NotFoundException('Country not found');
    return country;
  }
}
