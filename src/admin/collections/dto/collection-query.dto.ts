import { IsOptional, IsString, IsIn } from 'class-validator';
import { AdvancedQueryDto } from '@/common/dto/advanced-query.dto';

export class CollectionQueryDto extends AdvancedQueryDto {
  @IsOptional()
  @IsString()
  @IsIn(['collection', 'sub_collection', 'sub_sub_collection'], {
    message: 'customFilter must be one of: collection, sub_collection, sub_sub_collection',
  })
  customFilter?: string;
}
