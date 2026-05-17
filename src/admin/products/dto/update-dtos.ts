import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateProductDto, CreateVariantDto } from './product.dto';

export class UpdateProductDto extends PartialType(CreateProductDto) {}
export class UpdateVariantDto extends PartialType(OmitType(CreateVariantDto, ['stockQuantity'])) {}
