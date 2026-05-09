export type TranslationRecord = Record<string, unknown> & { langId?: string };

export type EntityWithTranslations = Record<string, unknown> & {
  translations?: TranslationRecord[];
};
