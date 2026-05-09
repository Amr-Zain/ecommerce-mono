import { EntityWithTranslations, TranslationRecord } from '../types/i18n/translation.types';

/**
 * Translation utility functions
 * Helper functions for working with translated entities
 */

const TRANSLATION_META_FIELDS = ['id', 'langId', 'createdAt', 'updatedAt'];

const isForeignKeyField = (key: string): boolean => key.endsWith('Id') && key !== 'langId';

function extractTranslationFields(
  translation: TranslationRecord,
  translationFields?: string[],
): Record<string, unknown> {
  const extracted: Record<string, unknown> = {};

  if (translationFields) {
    for (const field of translationFields) {
      if (translation[field] !== undefined) {
        extracted[field] = translation[field];
      }
    }
  } else {
    for (const key of Object.keys(translation)) {
      if (!TRANSLATION_META_FIELDS.includes(key) && !isForeignKeyField(key)) {
        extracted[key] = translation[key];
      }
    }
  }

  return extracted;
}

/**
 * Flatten translations into the main entity
 */
export function flattenTranslations<T extends EntityWithTranslations>(
  entity: T,
  translationFields?: string[],
  keepTranslations = false,
): Omit<T, 'translations'> & Record<string, unknown> {
  if (!entity.translations || entity.translations.length === 0) {
    const { translations: _t, ...rest } = entity;
    return rest as Omit<T, 'translations'> & Record<string, unknown>;
  }

  const translation = entity.translations[0];
  const { translations: _t, ...entityWithoutTranslations } = entity;

  const extracted = extractTranslationFields(translation, translationFields);
  const result: Record<string, unknown> = { ...entityWithoutTranslations, ...extracted };

  if (keepTranslations) {
    result['translations'] = entity.translations;
  }

  return result as Omit<T, 'translations'> & Record<string, unknown>;
}

/**
 * Flatten translations for an array of entities
 */
export function flattenTranslationsArray<T extends EntityWithTranslations>(
  entities: T[],
  translationFields?: string[],
  keepTranslations = false,
): Array<Omit<T, 'translations'> & Record<string, unknown>> {
  return entities.map((entity) => flattenTranslations(entity, translationFields, keepTranslations));
}

/**
 * Get translation for specific language from translations array
 */
export function getTranslation<T extends { langId: string }>(
  translations: T[],
  langId: string,
  fallbackLangId = 'en',
): T | null {
  if (!translations || translations.length === 0) {
    return null;
  }

  return (
    translations.find((t) => t.langId === langId) ??
    translations.find((t) => t.langId === fallbackLangId) ??
    translations[0]
  );
}

export function hasTranslation(translations: TranslationRecord[], langId: string): boolean {
  return translations.some((t) => t.langId === langId);
}

export function getAvailableLanguages(translations: TranslationRecord[]): string[] {
  return translations.map((t) => t.langId ?? '').filter(Boolean);
}

/**
 * Flatten all translations into language-specific keys
 */
export function flattenAllTranslations<T extends EntityWithTranslations>(
  entity: T,
  requestedLangId: string,
  translationFields?: string[],
  keepTranslations = false,
): Omit<T, 'translations'> & Record<string, unknown> {
  if (!entity.translations || entity.translations.length === 0) {
    const { translations: _t, ...rest } = entity;
    return rest as Omit<T, 'translations'> & Record<string, unknown>;
  }

  if (entity.translations.length === 1) {
    return flattenTranslations(entity, translationFields, keepTranslations);
  }

  const { translations, ...entityWithoutTranslations } = entity;
  const result: Record<string, unknown> = { ...entityWithoutTranslations };

  for (const translation of translations) {
    const langId = translation.langId;
    if (langId) {
      result[langId] = extractTranslationFields(translation, translationFields);
    }
  }

  const requestedTranslation = translations.find((t) => t.langId === requestedLangId) ?? translations[0];

  Object.assign(result, extractTranslationFields(requestedTranslation, translationFields));

  if (keepTranslations) {
    result['translations'] = translations;
  }

  return result as Omit<T, 'translations'> & Record<string, unknown>;
}

/**
 * Flatten all translations for an array of entities
 */
export function flattenAllTranslationsArray<T extends EntityWithTranslations>(
  entities: T[],
  requestedLangId: string,
  translationFields?: string[],
  keepTranslations = false,
): Array<Omit<T, 'translations'> & Record<string, unknown>> {
  return entities.map((entity) => flattenAllTranslations(entity, requestedLangId, translationFields, keepTranslations));
}
