import { PipeTransform, Injectable } from '@nestjs/common';
import { omitUndefined } from '../utils/omit-undefined.util';

/**
 * Shallow-removes own keys whose value is `undefined` from a plain object body.
 */
@Injectable()
export class OmitUndefinedPipe implements PipeTransform<unknown, unknown> {
  transform(value: unknown): unknown {
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      return omitUndefined(value as Record<string, unknown>);
    }
    return value;
  }
}
