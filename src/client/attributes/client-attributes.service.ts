import { Injectable, Inject } from '@nestjs/common';
import { ATTRIBUTES_REPOSITORY } from '@/common/interfaces';
import { AttributesRepository } from '@/core/attributes/attributes.repository';
import { AttributeQueryDto } from '@/admin/attributes/dto/attribute.dto';

@Injectable()
export class ClientAttributesService {
  constructor(@Inject(ATTRIBUTES_REPOSITORY) private readonly attributesRepo: AttributesRepository) {}

  async findAll() {
    const query: AttributeQueryDto = {
      paginate: false,
      filters: { isActive: true },
    };
    return this.attributesRepo.findAll(query);
  }

  async findOne(id: number) {
    return this.attributesRepo.findByIdWithValues(id);
  }
}