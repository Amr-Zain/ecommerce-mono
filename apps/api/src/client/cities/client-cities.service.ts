import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { CITIES_REPOSITORY, ICitiesRepository } from '@/common/interfaces';
import { AdvancedQueryDto } from '@/common/dto/advanced-query.dto';

@Injectable()
export class ClientCitiesService {
  constructor(@Inject(CITIES_REPOSITORY) private readonly citiesRepo: ICitiesRepository) {}

  async findAll(langId: string = 'en', countryId?: string) {
    const filters: Record<string, string | number | boolean> = { isActive: true };
    if (countryId) {
      filters.countryId = countryId;
    }
    const query: AdvancedQueryDto = {
      paginate: false,
      filters,
    };
    return this.citiesRepo.findAll(query, langId, {
      select: {
        id: true,
        translations: {
          where: { langId },
          select: { name: true, langId: true },
        },
        country: {
          select: {
            id: true,
            phoneCode: true,
            translations: {
              where: { langId },
              select: { name: true, langId: true },
            },
          },
        },
      },
    });
  }

  async findOne(id: bigint, langId: string = 'en') {
    const city = await this.citiesRepo.findByIdWithRelations(id, langId);
    if (!city) throw new NotFoundException('City not found');
    return city;
  }
}