import { SCHEMA_TYPE_YOUTUBE } from './types';
import { isFieldForListingType } from './fieldHelpers';

/** Extended-data key for the genre field (multi-enum). */
export const GENRE_FIELD_KEY = 'genre';

/** URL / social text fields grouped under the Links wizard step. */
export const LINK_FIELD_KEYS = new Set([
  'website',
  'spotify',
  'residentAdvisorProfile',
  'soundcloud',
  'instagram',
]);

export const isGenreField = fieldConfig => fieldConfig?.key === GENRE_FIELD_KEY;

export const isLinkField = fieldConfig => {
  if (!fieldConfig) {
    return false;
  }
  if (isGenreField(fieldConfig)) {
    return false;
  }
  if (fieldConfig.schemaType === SCHEMA_TYPE_YOUTUBE) {
    return true;
  }
  return LINK_FIELD_KEYS.has(fieldConfig.key);
};

export const isGenreOrLinkField = fieldConfig =>
  isGenreField(fieldConfig) || isLinkField(fieldConfig);

/**
 * Whether the listing type has at least one configured field matching `predicate`
 * (e.g. genre or links), regardless of category.
 */
export const listingTypeHasWizardSectionField = (config, listingType, predicate) => {
  if (!listingType || !config?.listing?.listingFields) {
    return false;
  }
  return config.listing.listingFields.some(
    f => predicate(f) && isFieldForListingType(listingType, f)
  );
};
