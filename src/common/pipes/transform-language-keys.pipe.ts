import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { omitUndefined } from '../utils/omit-undefined.util';

export interface TransformLanguageKeysOptions {
  /**
   * The property name that should contain the translations array
   * @default 'translations'
   */
  translationsProperty?: string;

  /**
   * The property name within each translation that should contain the language code
   * @default 'langId'
   */
  languageIdProperty?: string;

  /**
   * Additional language codes to recognize (besides common ones)
   */
  additionalLanguageCodes?: string[];

  /**
   * Whether to also remove undefined values from the transformed object
   * @default true
   */
  removeUndefined?: boolean;
}

type TranslationData = Record<string, unknown>;

@Injectable()
export class TransformLanguageKeysPipe implements PipeTransform {
  private readonly defaultLanguageCodes = ['en', 'ar', 'fr', 'es', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ko'];

  private options: Required<Omit<TransformLanguageKeysOptions, 'additionalLanguageCodes'>> & {
    additionalLanguageCodes: string[];
  };

  constructor(options: TransformLanguageKeysOptions = {}) {
    this.options = {
      translationsProperty: 'translations',
      languageIdProperty: 'langId',
      removeUndefined: true,
      additionalLanguageCodes: [],
      ...options,
    };
  }

  transform(value: unknown, metadata: ArgumentMetadata): unknown {
    if (metadata.type !== 'body') {
      return value;
    }

    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return value;
    }

    // Step 1: Transform language keys to translations array
    const transformedValue = this.transformLanguageKeys(value as Record<string, unknown>);

    // Step 2: Remove undefined values if enabled
    if (this.options.removeUndefined) {
      return omitUndefined(transformedValue);
    }

    return transformedValue;
  }

  private transformLanguageKeys(value: Record<string, unknown>): Record<string, unknown> {
    const translationsProperty = this.options.translationsProperty;
    const languageIdProperty = this.options.languageIdProperty;

    // All language codes to check
    const languageCodes = [...this.defaultLanguageCodes, ...this.options.additionalLanguageCodes];

    // Check if value has language keys (en, ar, etc.) instead of translations array
    const hasLanguageKeys = Object.keys(value).some((key) => languageCodes.includes(key.toLowerCase()));

    // If we have language keys but no translations array, transform
    if (hasLanguageKeys && !value[translationsProperty]) {
      const translations: Array<Record<string, unknown>> = [];
      const cleanedValue: Record<string, unknown> = { ...value };

      // Process known language codes
      for (const langCode of languageCodes) {
        const translationData = value[langCode];
        if (translationData && typeof translationData === 'object' && !Array.isArray(translationData)) {
          translations.push({
            [languageIdProperty]: langCode,
            ...omitUndefined(translationData as TranslationData),
          });
          delete cleanedValue[langCode];
        }
      }

      // Also check for any other 2-letter codes that might be languages
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
            ...omitUndefined(translationData as TranslationData),
          });
          delete cleanedValue[key];
        }
      }

      return {
        ...cleanedValue,
        [translationsProperty]: translations,
      };
    }

    // If translations array already exists, clean its items
    if (Array.isArray(value[translationsProperty])) {
      return {
        ...value,
        [translationsProperty]: (value[translationsProperty] as Array<Record<string, unknown>>).map((item) =>
          omitUndefined(item),
        ),
      };
    }

    return value;
  }
}
