import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { CaseTransformer } from '../utils/case-transformer.util';

@Injectable()
export class SnakeToCamelPipe implements PipeTransform {
  transform(value: unknown, metadata: ArgumentMetadata): unknown {
    if (value && typeof value === 'object' && (metadata.type === 'body' || metadata.type === 'query')) {
      return CaseTransformer.transformToCamel(value);
    }
    return value;
  }
}
