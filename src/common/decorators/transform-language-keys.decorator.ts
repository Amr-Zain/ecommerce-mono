import { UseInterceptors, applyDecorators, SetMetadata } from '@nestjs/common';
import { TransformLanguageKeysOptions } from '../pipes/transform-language-keys.pipe';
import {
  TransformLanguageKeysInterceptor,
  TRANSFORM_LANGUAGE_OPTIONS,
} from '../interceptors/transform-language-keys.interceptor';

/**
 * Transforms language keys (en, ar, etc.) in the request body into a translations array.
 * This happens BEFORE validation, so your DTOs can stay strict.
 *
 * @param options Transformation options including 'recursive' flag
 */
export function UseLanguageTransform(options?: TransformLanguageKeysOptions) {
  return applyDecorators(
    SetMetadata(TRANSFORM_LANGUAGE_OPTIONS, options || {}),
    UseInterceptors(TransformLanguageKeysInterceptor),
  );
}
