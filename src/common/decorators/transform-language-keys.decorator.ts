import { Body } from '@nestjs/common';
import { TransformLanguageKeysPipe, TransformLanguageKeysOptions } from '../pipes/transform-language-keys.pipe';

/**
 * Binds the request body and transforms language keys (en, ar, etc.) into a translations array.
 * Also strips top-level `undefined` keys.
 */
export function BodyTransformLanguageKeys(options?: TransformLanguageKeysOptions): ParameterDecorator {
  return Body(new TransformLanguageKeysPipe(options));
}
