import {
  EXTENDED_DATA_SCHEMA_TYPES,
  SCHEMA_TYPE_ENUM,
} from '../../../util/types';
import { isFieldForCategory, isFieldForListingType } from '../../../util/fieldHelpers';

/**
 * Pick extended data fields from given form data (namespaced pub_/priv_ keys).
 *
 * @param {Object} data form values
 * @param {string} targetScope 'public' | 'private'
 * @param {string} targetListingType
 * @param {Object} targetCategories category id map from pickCategoryFields
 * @param {Array} listingFieldConfigs field configs to consider (may be a subset)
 */
export const pickListingFieldsData = (
  data,
  targetScope,
  targetListingType,
  targetCategories,
  listingFieldConfigs
) => {
  const targetCategoryIds = Object.values(targetCategories);

  return listingFieldConfigs.reduce((fields, fieldConfig) => {
    const { key, scope = 'public', schemaType } = fieldConfig || {};
    const namespacePrefix = scope === 'public' ? `pub_` : `priv_`;
    const namespacedKey = `${namespacePrefix}${key}`;

    const isKnownSchemaType = EXTENDED_DATA_SCHEMA_TYPES.includes(schemaType);
    const isTargetScope = scope === targetScope;
    const isTargetListingType = isFieldForListingType(targetListingType, fieldConfig);
    const isTargetCategory = isFieldForCategory(targetCategoryIds, fieldConfig);

    if (isKnownSchemaType && isTargetScope && isTargetListingType && isTargetCategory) {
      const fieldValue = data[namespacedKey] != null ? data[namespacedKey] : null;
      return { ...fields, [key]: fieldValue };
    } else if (isKnownSchemaType && isTargetScope) {
      return { ...fields, [key]: null };
    }
    return fields;
  }, {});
};

/**
 * Initial form values (namespaced) for listing fields from listing entity extended data.
 */
export const initialValuesForListingFields = (
  data,
  targetScope,
  targetListingType,
  targetCategories,
  listingFieldConfigs
) => {
  const targetCategoryIds = Object.values(targetCategories);

  return listingFieldConfigs.reduce((fields, fieldConfig) => {
    const { key, scope = 'public', schemaType, enumOptions } = fieldConfig || {};
    const namespacePrefix = scope === 'public' ? `pub_` : `priv_`;
    const namespacedKey = `${namespacePrefix}${key}`;

    const isKnownSchemaType = EXTENDED_DATA_SCHEMA_TYPES.includes(schemaType);
    const isEnumSchemaType = schemaType === SCHEMA_TYPE_ENUM;
    const shouldHaveValidEnumOptions =
      !isEnumSchemaType ||
      (isEnumSchemaType && !!enumOptions?.find(conf => conf.option === data?.[key]));
    const isTargetScope = scope === targetScope;
    const isTargetListingType = isFieldForListingType(targetListingType, fieldConfig);
    const isTargetCategory = isFieldForCategory(targetCategoryIds, fieldConfig);

    if (
      isKnownSchemaType &&
      isTargetScope &&
      isTargetListingType &&
      isTargetCategory &&
      shouldHaveValidEnumOptions
    ) {
      const fieldValue = data?.[key] != null ? data[key] : null;
      return { ...fields, [namespacedKey]: fieldValue };
    }
    return fields;
  }, {});
};

/**
 * Listing fields that apply to the current listing type and category selection.
 */
export const getApplicableListingFieldConfigs = (
  listingFieldsConfig,
  listingType,
  selectedCategories
) => {
  const targetCategoryIds = Object.values(selectedCategories);

  return listingFieldsConfig.filter(fieldConfig => {
    const { schemaType, scope } = fieldConfig || {};
    const isKnownSchemaType = EXTENDED_DATA_SCHEMA_TYPES.includes(schemaType);
    const isProviderScope = ['public', 'private'].includes(scope);
    const isTargetListingType = isFieldForListingType(listingType, fieldConfig);
    const isTargetCategory = isFieldForCategory(targetCategoryIds, fieldConfig);

    return (
      isKnownSchemaType &&
      isProviderScope &&
      isTargetListingType &&
      isTargetCategory
    );
  });
};
