import { Body } from '@nestjs/common';
import { OmitUndefinedPipe } from '../pipes/omit-undefined.pipe';

/**
 * Binds the request body and strips top-level `undefined` keys (shallow) before the handler runs.
 * Nested objects / array elements are not modified; use {@link omitUndefined} in services when mapping to Prisma.
 */
export function BodyOmitUndefined(): ParameterDecorator {
  return Body(new OmitUndefinedPipe());
}
