import { Injectable, Inject, NotFoundException } from '@nestjs/common';
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
    return this.attributesRepo.findClientList(query, langId);
  }

  async findOne(id: number) {
    const attribute = await this.attributesRepo.findByIdWithValues(id);
    if (!attribute) throw new NotFoundException('Attribute not found');
    return attribute;
  }
}
