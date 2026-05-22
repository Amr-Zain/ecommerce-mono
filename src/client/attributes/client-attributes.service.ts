import { Injectable, Inject } from '@nestjs/common';
import { ATTRIBUTES_REPOSITORY, IAttributesRepository } from '@/common/interfaces';
import { AttributeQueryDto } from '@/common/dto/attribute-query.dto';

@Injectable()
export class ClientAttributesService {
  constructor(@Inject(ATTRIBUTES_REPOSITORY) private readonly attributesRepo: IAttributesRepository) {}

  async findAll(langId: string = 'en') {
    const query: AttributeQueryDto = {
      paginate: false,
      filters: { isActive: true },
    };
    return this.attributesRepo.findAll(query, langId, {
      select: {
        id: true,
        translations: {
          where: { langId },
          select: { name: true, langId: true },
          take: 1,
        },
        values: {
          select: {
            id: true,
            isActive: true,
            translations: {
              where: { langId },
              select: { name: true, langId: true },
              take: 1,
            },
          },
        },
      },
    });
  }

  async findOne(id: number) {
    return this.attributesRepo.findByIdWithValues(id);
  }
}