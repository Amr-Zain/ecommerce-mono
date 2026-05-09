/**
 * Translation utility functions
 * Helper functions for working with translated entities
 */

/**
 * Fields to exclude from translation objects when flattening
 */
const TRANSLATION_META_FIELDS = ['id', 'langId', 'createdAt', 'updatedAt'];

/**
 * Foreign key fields to exclude (pattern: ends with 'Id')
 */
const isForeignKeyField = (key: string): boolean => {
    return key.endsWith('Id') && key !== 'langId';
};

/**
 * Flatten translations into the main entity
 * Converts: { id: 1, translations: [{ name: 'Egypt', nationality: 'Egyptian' }] }
 * To: { id: 1, name: 'Egypt', nationality: 'Egyptian' }
 * 
 * @param entity - Entity with translations array
 * @param translationFields - Fields to extract from translation (default: all)
 * @param keepTranslations - Keep the translations array in the result (default: false)
 * @returns Entity with translation fields flattened
 */
export function flattenTranslations<T extends { translations?: any[] }>(
    entity: T,
    translationFields?: string[],
    keepTranslations: boolean = false,
): Omit<T, 'translations'> & Record<string, any> {
    if (!entity.translations || entity.translations.length === 0) {
        const { translations, ...rest } = entity as any;
        return rest;
    }

    const translation = entity.translations[0];
    const { translations, ...entityWithoutTranslations } = entity as any;

    // If specific fields are requested, only extract those
    if (translationFields) {
        const extractedFields: Record<string, any> = {};
        translationFields.forEach((field) => {
            if (translation[field] !== undefined) {
                extractedFields[field] = translation[field];
            }
        });

        const result = { ...entityWithoutTranslations, ...extractedFields };

        // Keep translations array if requested
        if (keepTranslations) {
            result.translations = entity.translations;
        }

        return result;
    }

    // Otherwise, extract all translation fields except meta fields and foreign keys
    const extractedFields: Record<string, any> = {};
    Object.keys(translation).forEach((key) => {
        // Skip meta fields and foreign key fields
        if (!TRANSLATION_META_FIELDS.includes(key) && !isForeignKeyField(key)) {
            extractedFields[key] = translation[key];
        }
    });

    const result = { ...entityWithoutTranslations, ...extractedFields };

    // Keep translations array if requested
    if (keepTranslations) {
        result.translations = entity.translations;
    }

    return result;
}

/**
 * Flatten translations for an array of entities
 * 
 * @param entities - Array of entities with translations
 * @param translationFields - Fields to extract from translation (default: all)
 * @param keepTranslations - Keep the translations array in the result (default: false)
 * @returns Array of entities with translation fields flattened
 */
export function flattenTranslationsArray<T extends { translations?: any[] }>(
    entities: T[],
    translationFields?: string[],
    keepTranslations: boolean = false,
): Array<Omit<T, 'translations'> & Record<string, any>> {
    return entities.map((entity) => flattenTranslations(entity, translationFields, keepTranslations));
}

/**
 * Get translation for specific language from translations array
 * 
 * @param translations - Array of translations
 * @param langId - Language ID (e.g., 'en', 'ar')
 * @param fallbackLangId - Fallback language if requested language not found
 * @returns Translation object or null
 */
export function getTranslation<T extends { langId: string }>(
    translations: T[],
    langId: string,
    fallbackLangId: string = 'en',
): T | null {
    if (!translations || translations.length === 0) {
        return null;
    }

    // Try to find requested language
    const translation = translations.find((t) => t.langId === langId);
    if (translation) {
        return translation;
    }

    // Fallback to fallback language
    const fallbackTranslation = translations.find((t) => t.langId === fallbackLangId);
    if (fallbackTranslation) {
        return fallbackTranslation;
    }

    // Return first available translation
    return translations[0];
}


export function hasTranslation(translations: any[], langId: string): boolean {
    return translations.some((t) => t.langId === langId);
}


export function getAvailableLanguages(translations: any[]): string[] {
    return translations.map((t) => t.langId);
}

/**
 * Flatten all translations into language-specific keys
 * For entities with 1 translation: flattens to top level WITHOUT language keys
 * For entities with 2+ translations: creates language keys (ar, en, etc.) with all translations
 * 
 * @param entity - Entity with translations array
 * @param requestedLangId - Language ID for top-level fields (e.g., 'en', 'ar')
 * @param translationFields - Fields to extract from translation (default: all)
 * @param keepTranslations - Keep the translations array in the result (default: false)
 * @returns Entity with all translations as language keys
 */
export function flattenAllTranslations<T extends { translations?: any[] }>(
    entity: T,
    requestedLangId: string,
    translationFields?: string[],
    keepTranslations: boolean = false,
): Omit<T, 'translations'> & Record<string, any> {
    if (!entity.translations || entity.translations.length === 0) {
        const { translations, ...rest } = entity as any;
        return rest;
    }

    // For single translation, use existing flattenTranslations logic (NO language keys)
    if (entity.translations.length === 1) {
        return flattenTranslations(entity, translationFields, keepTranslations);
    }

    // For multiple translations, create language-specific keys
    const { translations, ...entityWithoutTranslations } = entity as any;
    const result: any = { ...entityWithoutTranslations };

    // Helper to extract fields from a translation
    const extractTranslationFields = (translation: any): Record<string, any> => {
        const extractedFields: Record<string, any> = {};

        if (translationFields) {
            // Extract only specified fields
            translationFields.forEach((field) => {
                if (translation[field] !== undefined) {
                    extractedFields[field] = translation[field];
                }
            });
        } else {
            // Extract all fields except meta fields and foreign keys
            Object.keys(translation).forEach((key) => {
                if (!TRANSLATION_META_FIELDS.includes(key) && !isForeignKeyField(key)) {
                    extractedFields[key] = translation[key];
                }
            });
        }

        return extractedFields;
    };

    // Create language-specific keys for all translations
    entity.translations.forEach((translation) => {
        const langId = translation.langId;
        result[langId] = extractTranslationFields(translation);
    });

    // Add top-level translation fields using the requested language
    const requestedTranslation = entity.translations.find((t) => t.langId === requestedLangId);
    if (requestedTranslation) {
        const topLevelFields = extractTranslationFields(requestedTranslation);
        Object.assign(result, topLevelFields);
    } else {
        // Fallback to first translation if requested language not found
        const topLevelFields = extractTranslationFields(entity.translations[0]);
        Object.assign(result, topLevelFields);
    }

    // Keep translations array if requested
    if (keepTranslations) {
        result.translations = entity.translations;
    }

    return result;
}

/**
 * Flatten all translations for an array of entities
 * For entities with 1 translation: flattens to top level WITHOUT language keys
 * For entities with 2+ translations: creates language keys (ar, en, etc.) with all translations
 * 
 * @param entities - Array of entities with translations
 * @param requestedLangId - Language ID for top-level fields (e.g., 'en', 'ar')
 * @param translationFields - Fields to extract from translation (default: all)
 * @param keepTranslations - Keep the translations array in the result (default: false)
 * @returns Array of entities with all translations as language keys
 */
export function flattenAllTranslationsArray<T extends { translations?: any[] }>(
    entities: T[],
    requestedLangId: string,
    translationFields?: string[],
    keepTranslations: boolean = false,
): Array<Omit<T, 'translations'> & Record<string, any>> {
    return entities.map((entity) =>
        flattenAllTranslations(entity, requestedLangId, translationFields, keepTranslations)
    );
}
