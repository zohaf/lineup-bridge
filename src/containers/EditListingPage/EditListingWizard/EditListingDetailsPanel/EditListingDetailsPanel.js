import React, { useEffect } from 'react';
import classNames from 'classnames';

// Import util modules
import { FormattedMessage } from '../../../../util/reactIntl';
import { LISTING_STATE_DRAFT } from '../../../../util/types';
import { LISTING_PAGE_PARAM_TYPE_NEW } from '../../../../util/urlHelpers';
import {
  isFieldForCategory,
  isFieldForListingType,
  pickCategoryFields,
} from '../../../../util/fieldHelpers';
import { isBookingProcessAlias } from '../../../../transactions/transaction';
import { displayLocation } from '../../../../util/configHelpers';
import { isGenreOrLinkField } from '../../../../util/listingFieldWizardSections';

// Import shared components
import { H3, ListingLink } from '../../../../components';

// Import modules from this directory
import ErrorMessage from './ErrorMessage';
import EditListingDetailsForm from './EditListingDetailsForm';
import {
  pickListingFieldsData,
  initialValuesForListingFields,
} from '../editListingFieldHelpers';
import css from './EditListingDetailsPanel.module.css';

const stripGenreAndLinksFromInitialValues = (initialValues, listingFields, hide) => {
  if (!hide) {
    return initialValues;
  }
  const drop = new Set();
  listingFields.forEach(f => {
    if (isGenreOrLinkField(f)) {
      drop.add(f.scope === 'public' ? `pub_${f.key}` : `priv_${f.key}`);
    }
  });
  const next = { ...initialValues };
  drop.forEach(k => delete next[k]);
  return next;
};

/**
 * Get listing configuration. For existing listings, it is stored to publicData.
 * For new listings, the data needs to be figured out from listingTypes configuration.
 *
 * In the latter case, we select first type in the array. However, EditListingDetailsForm component
 * gets 'selectableListingTypes' prop, which it uses to provide a way to make selection,
 * if multiple listing types are available.
 *
 * @param {Array} listingTypes
 * @param {Object} existingListingTypeInfo
 * @returns an object containing mainly information that can be stored to publicData.
 */
const getTransactionInfo = props => {
  const {
    listingTypes = [],
    existingListingTypeInfo = {},
    includeLabel = false,
    preselectedListingType = null,
  } = props;
  const { listingType, transactionProcessAlias, unitType } = existingListingTypeInfo;

  if (listingType && transactionProcessAlias && unitType) {
    // If listing type has already been set, return the existing listing type info.
    return { listingType, transactionProcessAlias, unitType };
  } else if (listingTypes.length >= 1) {
    // Default to URL preselection, otherwise first configured type (listing type UI is hidden).
    let listingTypeConfig = null;
    if (preselectedListingType) {
      listingTypeConfig = listingTypes.find(conf => conf.listingType === preselectedListingType);
    }
    if (!listingTypeConfig) {
      listingTypeConfig = listingTypes[0];
    }
    const { listingType: type, label, transactionType } = listingTypeConfig || {};
    if (!type) {
      // If listing type is not found (e.g. preselected listing type is not found among listingTypes),
      // return empty object.
      return {};
    }
    const { alias, unitType: configUnitType } = transactionType;
    const labelMaybe = includeLabel ? { label: label || type } : {};
    return {
      listingType: type,
      transactionProcessAlias: alias,
      unitType: configUnitType,
      ...labelMaybe,
    };
  }
  return {};
};

/**
 * Check if listingType has already been set.
 *
 * If listing type (incl. process & unitType) has been set, we won't allow change to it.
 * It's possible to make it editable, but it becomes somewhat complex to modify following panels,
 * for the different process. (E.g. adjusting stock vs booking availability settings,
 * if process has been changed for existing listing.)
 *
 * @param {Object} publicData JSON-like data stored to listing entity.
 * @returns object literal with to keys: { hasExistingListingType, existingListingTypeInfo }
 */
const hasSetListingType = publicData => {
  const { listingType, transactionProcessAlias, unitType } = publicData;
  const existingListingTypeInfo = { listingType, transactionProcessAlias, unitType };

  return {
    hasExistingListingType: !!listingType && !!transactionProcessAlias && !!unitType,
    existingListingTypeInfo,
  };
};

/**
 * If listing represents something else than a bookable listing, we set availability-plan to seats=0.
 * Note: this is a performance improvement since the API is backwards compatible.
 *
 * @param {string} processAlias selected for this listing
 * @returns availabilityPlan without any seats available for the listing
 */
const setNoAvailabilityForUnbookableListings = processAlias => {
  return isBookingProcessAlias(processAlias)
    ? {}
    : {
        availabilityPlan: {
          type: 'availability-plan/time',
          timezone: 'Etc/UTC',
          entries: [
            // Note: "no entries" is the same as seats=0 for every entry.
            // { dayOfWeek: 'mon', startTime: '00:00', endTime: '00:00', seats: 0 },
            // { dayOfWeek: 'tue', startTime: '00:00', endTime: '00:00', seats: 0 },
            // { dayOfWeek: 'wed', startTime: '00:00', endTime: '00:00', seats: 0 },
            // { dayOfWeek: 'thu', startTime: '00:00', endTime: '00:00', seats: 0 },
            // { dayOfWeek: 'fri', startTime: '00:00', endTime: '00:00', seats: 0 },
            // { dayOfWeek: 'sat', startTime: '00:00', endTime: '00:00', seats: 0 },
            // { dayOfWeek: 'sun', startTime: '00:00', endTime: '00:00', seats: 0 },
          ],
        },
      };
};

/**
 * Get initialValues for the form. This function includes
 * title, description, listingType, transactionProcessAlias, unitType,
 * and those publicData & privateData fields that are configured through
 * config.listing.listingFields.
 *
 * @param {object} props
 * @param {object} existingListingTypeInfo info saved to listing's publicData
 * @param {object} listingTypes app's configured types (presets for listings)
 * @param {object} listingFields those extended data fields that are part of configurations
 * @returns initialValues object for the form
 */
const getInitialValues = (
  props,
  existingListingTypeInfo,
  listingTypes,
  listingFields,
  listingCategories,
  categoryKey
) => {
  const { description, title, publicData, privateData, geolocation } =
    props?.listing?.attributes || {};
  // If details panel is accessed via URL like my.domain.com/l/draft/00000000-0000-0000-0000-000000000000/new/details?listingType=sell-bicycles,
  // we'll pick the preselected listing type from the URL.
  const preselectedListingType = props.locationSearch?.listingType;
  // If listing type has already been set, use it.
  // Otherwise, check if there's a preselected listing type in the URL.
  const listingType = publicData?.listingType || preselectedListingType;

  const nestedCategories = pickCategoryFields(publicData, categoryKey, 1, listingCategories);
  const listingTypeConfigForLocation = listingTypes.find(
    conf => conf.listingType === listingType
  );
  const showLocationField =
    listingTypeConfigForLocation && displayLocation(listingTypeConfigForLocation);
  const { address } = publicData?.location || {};
  const locationFieldsPresent = !!(publicData?.location?.address && geolocation);

  // Initial values for the form
  return {
    title,
    description,
    ...(showLocationField
      ? {
          location: locationFieldsPresent
            ? {
                search: address,
                selectedPlace: { address, origin: geolocation },
              }
            : null,
        }
      : {}),
    ...nestedCategories,
    // Transaction type info: listingType, transactionProcessAlias, unitType
    ...getTransactionInfo({ listingTypes, existingListingTypeInfo, preselectedListingType }),
    ...initialValuesForListingFields(
      publicData,
      'public',
      listingType,
      nestedCategories,
      listingFields
    ),
    ...initialValuesForListingFields(
      privateData,
      'private',
      listingType,
      nestedCategories,
      listingFields
    ),
  };
};

/**
 * The EditListingDetailsPanel component.
 *
 * @component
 * @param {Object} props
 * @param {string} [props.className] - Custom class that extends the default class for the root element
 * @param {string} [props.rootClassName] - Custom class that overrides the default class for the root element
 * @param {propTypes.ownListing} props.listing - The listing object
 * @param {boolean} props.disabled - Whether the form is disabled
 * @param {boolean} props.ready - Whether the form is ready
 * @param {Function} props.onSubmit - The submit function
 * @param {Function} props.onListingTypeChange - The listing type change function
 * @param {string} props.submitButtonText - The submit button text
 * @param {boolean} props.panelUpdated - Whether the panel is updated
 * @param {boolean} props.updateInProgress - Whether the update is in progress
 * @param {Object} props.errors - The errors object
 * @param {Object} props.config - The config object
 * @returns {JSX.Element}
 */
const EditListingDetailsPanel = props => {
  const {
    className,
    rootClassName,
    params: pathParams,
    locationSearch,
    listing,
    disabled,
    ready,
    onSubmit,
    onListingTypeChange,
    submitButtonText,
    panelUpdated,
    updateInProgress,
    errors,
    config,
    updatePageTitle: UpdatePageTitle,
    intl,
    hideGenreAndLinksInProfileForm = false,
  } = props;

  const classes = classNames(rootClassName || css.root, className);
  const { publicData, state } = listing?.attributes || {};
  const listingTypes = config.listing.listingTypes;
  const listingFields = config.listing.listingFields;
  const listingCategories = config.categoryConfiguration.categories;
  const categoryKey = config.categoryConfiguration.key;

  const { hasExistingListingType, existingListingTypeInfo } = hasSetListingType(publicData);
  const hasValidExistingListingType =
    hasExistingListingType &&
    !!listingTypes.find(conf => {
      const listinTypesMatch = conf.listingType === existingListingTypeInfo.listingType;
      const unitTypesMatch = conf.transactionType?.unitType === existingListingTypeInfo.unitType;
      return listinTypesMatch && unitTypesMatch;
    });

  const validPreselectedListingType =
    pathParams?.type === LISTING_PAGE_PARAM_TYPE_NEW && !!locationSearch?.listingType
      ? listingTypes.find(conf => conf.listingType === locationSearch.listingType)
      : null;

  // Call onListingTypeChange with validPreselectedListingType id-string on initialization.
  // The call selects the correct wizard tabs for the preselected listing type.
  // Note: it's only called if listing type is not already saved to publicData.
  useEffect(() => {
    if (!hasExistingListingType && validPreselectedListingType && onListingTypeChange) {
      onListingTypeChange(validPreselectedListingType);
    }
  }, []);

  // When multiple listing types exist but the picker is hidden, select the first type for the wizard.
  useEffect(() => {
    if (
      !hasExistingListingType &&
      listingTypes.length > 1 &&
      !locationSearch?.listingType &&
      onListingTypeChange
    ) {
      onListingTypeChange(listingTypes[0]);
    }
  }, []);

  const initialValues = stripGenreAndLinksFromInitialValues(
    getInitialValues(
      props,
      existingListingTypeInfo,
      listingTypes,
      listingFields,
      listingCategories,
      categoryKey
    ),
    listingFields,
    hideGenreAndLinksInProfileForm
  );

  const noListingTypesSet = listingTypes?.length === 0;
  const hasListingTypesSet = listingTypes?.length > 0;
  const canShowEditListingDetailsForm =
    hasListingTypesSet && (!hasExistingListingType || hasValidExistingListingType);
  const isPublished = listing?.id && state !== LISTING_STATE_DRAFT;

  const panelHeadingProps = isPublished
    ? {
        id: 'EditListingDetailsPanel.djEditTitle',
        values: { listingTitle: <ListingLink listing={listing} />, lineBreak: <br /> },
        messageProps: { listingTitle: listing.attributes.title },
      }
    : {
        id: 'EditListingDetailsPanel.djCreateListingTitle',
        values: { lineBreak: <br /> },
        messageProps: {},
      };

  return (
    <main className={classes}>
      <UpdatePageTitle
        panelHeading={intl.formatMessage(
          { id: panelHeadingProps.id },
          { ...panelHeadingProps.messageProps }
        )}
      />
      <H3 as="h1">
        <FormattedMessage id={panelHeadingProps.id} values={{ ...panelHeadingProps.values }} />
      </H3>

      {canShowEditListingDetailsForm ? (
        <EditListingDetailsForm
          className={css.form}
          initialValues={initialValues}
          saveActionMsg={submitButtonText}
          onSubmit={values => {
            const {
              title,
              description,
              listingType,
              transactionProcessAlias,
              unitType,
              location,
              ...rest
            } = values;

            const listingTypeConfigForSubmit = listingTypes.find(
              conf => conf.listingType === listingType
            );
            const includeLocationInSubmit =
              listingTypeConfigForSubmit && displayLocation(listingTypeConfigForSubmit);

            const nestedCategories = pickCategoryFields(rest, categoryKey, 1, listingCategories);
            // Remove old categories by explicitly saving null for them.
            const cleanedNestedCategories = {
              ...[1, 2, 3].reduce((a, i) => ({ ...a, [`${categoryKey}${i}`]: null }), {}),
              ...nestedCategories,
            };
            const listingFieldsForProfilePick = hideGenreAndLinksInProfileForm
              ? listingFields.filter(f => !isGenreOrLinkField(f))
              : listingFields;
            const publicListingFields = pickListingFieldsData(
              rest,
              'public',
              listingType,
              nestedCategories,
              listingFieldsForProfilePick
            );
            const privateListingFields = pickListingFieldsData(
              rest,
              'private',
              listingType,
              nestedCategories,
              listingFieldsForProfilePick
            );
            // New values for listing attributes
            const locationPublicData =
              includeLocationInSubmit && location?.selectedPlace
                ? {
                    location: {
                      address: location.selectedPlace.address,
                      building: '',
                    },
                  }
                : {};
            const locationGeolocation =
              includeLocationInSubmit && location?.selectedPlace
                ? { geolocation: location.selectedPlace.origin }
                : {};

            const updateValues = {
              title: title.trim(),
              description,
              publicData: {
                listingType,
                transactionProcessAlias,
                unitType,
                ...cleanedNestedCategories,
                ...publicListingFields,
                ...locationPublicData,
              },
              privateData: privateListingFields,
              ...setNoAvailabilityForUnbookableListings(transactionProcessAlias),
              ...locationGeolocation,
            };

            onSubmit(updateValues);
          }}
          selectableListingTypes={listingTypes.map(conf =>
            getTransactionInfo({
              listingTypes: [conf],
              existingListingTypeInfo: {},
              includeLabel: true,
            })
          )}
          hasPredefinedListingType={hasExistingListingType || !!validPreselectedListingType}
          selectableCategories={listingCategories}
          pickSelectedCategories={values =>
            pickCategoryFields(values, categoryKey, 1, listingCategories)
          }
          categoryPrefix={categoryKey}
          onListingTypeChange={onListingTypeChange}
          listingFieldsConfig={listingFields}
          listingCurrency={listing?.attributes?.price?.currency}
          marketplaceCurrency={config.currency}
          marketplaceName={config.marketplaceName}
          disabled={disabled}
          ready={ready}
          updated={panelUpdated}
          updateInProgress={updateInProgress}
          fetchErrors={errors}
          autoFocus
          hideGenreAndLinksInProfileForm={hideGenreAndLinksInProfileForm}
        />
      ) : (
        <ErrorMessage
          marketplaceName={config.marketplaceName}
          noListingTypesSet={noListingTypesSet}
          invalidExistingListingType={!hasValidExistingListingType}
        />
      )}
    </main>
  );
};

export default EditListingDetailsPanel;
