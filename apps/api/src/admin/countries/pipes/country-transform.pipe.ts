import { TransformLanguageKeysPipe, TransformLanguageKeysOptions } from '@/common/pipes/transform-language-keys.pipe';

// Country-specific configuration
const countryOptions: TransformLanguageKeysOptions = {
  translationsProperty: 'translations',
  languageIdProperty: 'langId',
  removeUndefined: true,
  // Add any country-specific language codes if needed
};

export class CountryTransformPipe extends TransformLanguageKeysPipe {
  constructor() {
    super(countryOptions);
  }
}
