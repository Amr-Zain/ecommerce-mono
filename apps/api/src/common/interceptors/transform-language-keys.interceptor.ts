import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { TransformLanguageKeysOptions } from '../pipes/transform-language-keys.pipe';
import { omitUndefined } from '../utils/omit-undefined.util';

export const TRANSFORM_LANGUAGE_OPTIONS = 'transformLanguageOptions';

@Injectable()
export class TransformLanguageKeysInterceptor implements NestInterceptor {
  private readonly defaultLanguageCodes = ['en', 'ar', 'fr', 'es', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ko'];

  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const body = request.body as unknown;

    const options =
      this.reflector.getAllAndOverride<TransformLanguageKeysOptions>(TRANSFORM_LANGUAGE_OPTIONS, [
        context.getHandler(),
        context.getClass(),
      ]) || {};

    const config: Required<TransformLanguageKeysOptions> = {
      translationsProperty: 'translations',
      languageIdProperty: 'langId',
      removeUndefined: true,
      additionalLanguageCodes: [],
      recursive: false,
      ...options,
    };

    if (body && typeof body === 'object' && !Array.isArray(body)) {
      if (config.recursive) {
        request.body = this.deepTransform(body as Record<string, unknown>, config);
      } else {
        request.body = this.transformLanguageKeys(body as Record<string, unknown>, config);
      }
    }

    return next.handle();
  }

  private deepTransform(value: unknown, config: Required<TransformLanguageKeysOptions>): unknown {
    if (!value || typeof value !== 'object') {
      return value;
    }

    if (Array.isArray(value)) {
      return value.map((item) => this.deepTransform(item, config));
    }

    const obj = value as Record<string, unknown>;
    const result: Record<string, unknown> = { ...obj };

    for (const key in result) {
      result[key] = this.deepTransform(result[key], config);
    }

    return this.transformLanguageKeys(result, config);
  }

  private transformLanguageKeys(
    value: Record<string, unknown>,
    config: Required<TransformLanguageKeysOptions>,
  ): Record<string, unknown> {
    const translationsProperty = config.translationsProperty;
    const languageIdProperty = config.languageIdProperty;
    const languageCodes = [...this.defaultLanguageCodes, ...(config.additionalLanguageCodes || [])];

    const hasLanguageKeys = Object.keys(value).some((key) => languageCodes.includes(key.toLowerCase()));

    if (hasLanguageKeys && !value[translationsProperty]) {
      const translations: Record<string, unknown>[] = [];
      const cleanedValue: Record<string, unknown> = { ...value };

      for (const langCode of languageCodes) {
        const translationData = value[langCode];
        if (translationData && typeof translationData === 'object' && !Array.isArray(translationData)) {
          translations.push({
            [languageIdProperty]: langCode,
            ...omitUndefined(translationData as Record<string, unknown>),
          });
          delete cleanedValue[langCode];
        }
      }

      // Check for other 2-letter codes
      for (const [key, translationData] of Object.entries(value)) {
        if (
          key.length === 2 &&
          /^[a-z]{2}$/i.test(key) &&
          !languageCodes.includes(key.toLowerCase()) &&
          translationData &&
          typeof translationData === 'object' &&
          !Array.isArray(translationData)
        ) {
          translations.push({
            [languageIdProperty]: key.toLowerCase(),
            ...omitUndefined(translationData as Record<string, unknown>),
          });
          delete cleanedValue[key];
        }
      }

      return {
        ...cleanedValue,
        [translationsProperty]: translations,
      };
    }

    if (Array.isArray(value[translationsProperty])) {
      return {
        ...value,
        [translationsProperty]: (value[translationsProperty] as Record<string, unknown>[]).map((item) =>
          omitUndefined(item),
        ),
      };
    }

    return value;
  }
}
