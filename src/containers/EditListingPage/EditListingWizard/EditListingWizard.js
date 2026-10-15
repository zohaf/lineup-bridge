import React, { Component } from 'react';

// Import configs and util modules
import { useConfiguration } from '../../../context/configurationContext';
import { useRouteConfiguration } from '../../../context/routeConfigurationContext';
import { intlShape, useIntl } from '../../../util/reactIntl';
import { displayDescription } from '../../../util/configHelpers.js';
import {
  displayDeliveryPickup,
  displayDeliveryShipping,
  displayLocation,
  displayPrice,
  requireListingImage,
} from '../../../util/configHelpers';
import {
  LISTING_PAGE_PARAM_TYPE_DRAFT,
  LISTING_PAGE_PARAM_TYPE_NEW,
} from '../../../util/urlHelpers';
import {
  SCHEMA_TYPE_ENUM,
  SCHEMA_TYPE_MULTI_ENUM,
  SCHEMA_TYPE_TEXT,
  SCHEMA_TYPE_LONG,
  SCHEMA_TYPE_BOOLEAN,
  SCHEMA_TYPE_YOUTUBE,
  propTypes,
} from '../../../util/types';
import {
  isFieldForCategory,
  isFieldForListingType,
  pickCategoryFields,
} from '../../../util/fieldHelpers';
import { ensureListing } from '../../../util/data';
import { INQUIRY_PROCESS_NAME, resolveLatestProcessName } from '../../../transactions/transaction';
import { isListingPriceOptionalUnitType } from './EditListingPricingPanel/pricingFormValidators';
import { MIN_PHOTOS } from './EditListingPhotosPanel/EditListingPhotosForm';

// Import shared components
import { NamedRedirect, LayoutSplit, StepMenu } from '../../../components';

// Import modules from this directory
import EditListingWizardTab, {
  DETAILS,
  GENRE,
  LINKS,
  PRICING,
  PRICING_AND_STOCK,
  DELIVERY,
  LOCATION,
  AVAILABILITY,
  PHOTOS,
  STYLE,
} from './EditListingWizardTab';
import {
  isGenreField,
  isLinkField,
  isFieldOnOwnStep,
  listingTypeHasWizardSectionField,
} from '../../../util/listingFieldWizardSections';

// This is the initial tab on editlisting wizard.
// When listing type is known, other tabs are checked from _tabsForListingType_ function.
const TABS_DETAILS_ONLY = [DETAILS];

/**
 * Pick only allowed tabs for the given process and listing type configuration.
 * - The location tab could be omitted for booking process
 * - The delivery tab could be omitted for purchase process
 * - The location and pricing tabs could be omitted for negotiation process
 * - The location and pricing tabs could be omitted for inquiry process
 *
 * @param {string} processName - The name of the process
 * @param {Object} listingTypeConfig - The listing type configuration
 * @param {Object} config - App config (listing fields).
 * @returns {Array<string>} - The allowed tabs for the given process and listing type configuration
 */
const tabsForListingType = (processName, listingTypeConfig, config) => {
  // Location is collected on the Profile (details) tab; no separate Location step.
  const locationMaybe = [];
  const listingType = listingTypeConfig?.listingType;
  const isDefaultBookingLayout = processName === 'default-booking';
  const genreTabMaybe =
    isDefaultBookingLayout && listingTypeHasWizardSectionField(config, listingType, isGenreField)
      ? [GENRE]
      : [];
  const isNegotiation = processName === 'default-negotiation';
  // Links get their own step for booking and negotiation (LineupBridge public profile: Profile,
  // Links, Photos). Genre has its own step only for booking; for negotiation it stays in Profile.
  const linksTabMaybe =
    (isDefaultBookingLayout || isNegotiation) &&
    listingTypeHasWizardSectionField(config, listingType, isLinkField)
      ? [LINKS]
      : [];
  const pricingMaybe = displayPrice(listingTypeConfig) ? [PRICING] : [];
  const deliveryMaybe =
    displayDeliveryPickup(listingTypeConfig) || displayDeliveryShipping(listingTypeConfig)
      ? [DELIVERY]
      : [];
  const styleOrPhotosTab = requireListingImage(listingTypeConfig) ? [PHOTOS] : [STYLE];

  // You can reorder these panels.
  // Note 1: You need to change save button translations for new listing flow
  // Note 2: Ensure that draft listing is created after the first panel
  //         and listing publishing happens after last panel.
  // Note 3: The first tab creates a draft listing and title is mandatory attribute for it.
  //         Details tab asks for "title" and is therefore the first tab in the wizard flow.
  const tabs = {
    ['default-booking']: [
      DETAILS,
      ...genreTabMaybe,
      ...linksTabMaybe,
      ...locationMaybe,
      PRICING,
      AVAILABILITY,
      ...styleOrPhotosTab,
    ],
    ['default-purchase']: [DETAILS, PRICING_AND_STOCK, ...deliveryMaybe, ...styleOrPhotosTab],
    ['default-negotiation']: [
      DETAILS,
      ...linksTabMaybe,
      ...locationMaybe,
      ...pricingMaybe,
      ...styleOrPhotosTab,
    ],
    ['default-inquiry']: [DETAILS, ...locationMaybe, ...pricingMaybe, ...styleOrPhotosTab],
  };

  return tabs[processName] || tabs['default-inquiry'];
};

/**
 * Return translations for wizard tab: label and submit button.
 *
 * @param {Object} intl
 * @param {string} tab name of the tab/panel in the wizard
 * @param {boolean} isNewListingFlow
 * @param {string} processName
 */
const tabLabelAndSubmit = (intl, tab, isNewListingFlow, isPriceDisabled, processName) => {
  const wizardTranslationProcess = processName;
  const processNameString = isNewListingFlow ? `${wizardTranslationProcess}.` : '';
  const newOrEdit = isNewListingFlow ? 'new' : 'edit';

  let labelKey = null;
  let submitButtonKey = null;
  if (tab === DETAILS) {
    labelKey = 'EditListingWizard.tabLabelDetailsDj';
    submitButtonKey = `EditListingWizard.${processNameString}${newOrEdit}.saveDetails`;
  } else if (tab === PRICING) {
    labelKey = 'EditListingWizard.tabLabelPricingDj';
    submitButtonKey = `EditListingWizard.${processNameString}${newOrEdit}.savePricing`;
  } else if (tab === PRICING_AND_STOCK) {
    labelKey = 'EditListingWizard.tabLabelPricingAndStock';
    submitButtonKey = `EditListingWizard.${processNameString}${newOrEdit}.savePricingAndStock`;
  } else if (tab === DELIVERY) {
    labelKey = 'EditListingWizard.tabLabelDelivery';
    submitButtonKey = `EditListingWizard.${processNameString}${newOrEdit}.saveDelivery`;
  } else if (tab === LOCATION) {
    labelKey = 'EditListingWizard.tabLabelLocation';
    submitButtonKey =
      isPriceDisabled && isNewListingFlow
        ? `EditListingWizard.${processNameString}${newOrEdit}.saveLocationNoPricingTab`
        : `EditListingWizard.${processNameString}${newOrEdit}.saveLocation`;
  } else if (tab === GENRE) {
    labelKey = 'EditListingWizard.tabLabelGenre';
    submitButtonKey = `EditListingWizard.${processNameString}${newOrEdit}.saveGenre`;
  } else if (tab === LINKS) {
    labelKey = 'EditListingWizard.tabLabelLinks';
    submitButtonKey = `EditListingWizard.${processNameString}${newOrEdit}.saveLinks`;
  } else if (tab === AVAILABILITY) {
    labelKey = 'EditListingWizard.tabLabelAvailability';
    submitButtonKey = `EditListingWizard.${processNameString}${newOrEdit}.saveAvailability`;
  } else if (tab === PHOTOS) {
    labelKey = 'EditListingWizard.tabLabelPhotos';
    submitButtonKey = `EditListingWizard.${processNameString}${newOrEdit}.savePhotos`;
  } else if (tab === STYLE) {
    labelKey = 'EditListingWizard.tabLabelStyle';
    submitButtonKey = `EditListingWizard.${processNameString}${newOrEdit}.saveStyle`;
  }

  return {
    label: intl.formatMessage({ id: labelKey }),
    submitButton: intl.formatMessage({ id: submitButtonKey }),
  };
};

/**
 * Validate listing fields (in extended data) that are included through configListing.js
 * This is used to check if listing creation flow can show the "next" tab as active.
 *
 * @param {Object} publicData
 * @param {Object} privateData
 */
const hasValidListingFieldsInExtendedData = (publicData, privateData, config, fieldFilter) => {
  const listingFieldConfigs = fieldFilter
    ? config.listing.listingFields.filter(fieldFilter)
    : config.listing.listingFields;

  const isValidField = (fieldConfig, fieldData) => {
    const { key, schemaType, enumOptions = [], saveConfig = {} } = fieldConfig;

    const schemaOptionKeys = enumOptions.map(o => `${o.option}`);
    const hasValidEnumValue = optionData => {
      return schemaOptionKeys.includes(optionData);
    };
    const hasValidMultiEnumValues = savedOptions => {
      return savedOptions.every(optionData => schemaOptionKeys.includes(optionData));
    };

    const categoryKey = config.categoryConfiguration.key;
    const categoryOptions = config.categoryConfiguration.categories;
    const categoriesObj = pickCategoryFields(publicData, categoryKey, 1, categoryOptions);
    const currentCategories = Object.values(categoriesObj);

    const isTargetListingType = isFieldForListingType(publicData?.listingType, fieldConfig);
    const isTargetCategory = isFieldForCategory(currentCategories, fieldConfig);
    const isRequired = !!saveConfig.isRequired && isTargetListingType && isTargetCategory;

    if (isRequired) {
      const savedListingField = fieldData[key];
      return schemaType === SCHEMA_TYPE_ENUM
        ? typeof savedListingField === 'string' && hasValidEnumValue(savedListingField)
        : schemaType === SCHEMA_TYPE_MULTI_ENUM
        ? Array.isArray(savedListingField) && hasValidMultiEnumValues(savedListingField)
        : schemaType === SCHEMA_TYPE_TEXT
        ? typeof savedListingField === 'string'
        : schemaType === SCHEMA_TYPE_LONG
        ? typeof savedListingField === 'number' && Number.isInteger(savedListingField)
        : schemaType === SCHEMA_TYPE_BOOLEAN
        ? savedListingField === true || savedListingField === false
        : schemaType === SCHEMA_TYPE_YOUTUBE
        ? typeof savedListingField === 'string'
        : false;
    }
    return true;
  };
  return listingFieldConfigs.reduce((isValid, fieldConfig) => {
    const data = fieldConfig.scope === 'private' ? privateData : publicData;
    return isValid && isValidField(fieldConfig, data);
  }, true);
};

/**
 * Check if a wizard tab is completed.
 *
 * @param tab wizard's tab
 * @param listing is contains some specific data if tab is completed
 *
 * @return true if tab / step is completed.
 */
const tabCompleted = (tab, listing, config, tabs) => {
  const {
    availabilityPlan,
    description,
    geolocation,
    price,
    title,
    publicData,
    privateData,
  } = listing.attributes;
  const images = listing.images;
  const {
    listingType,
    transactionProcessAlias,
    unitType,
    shippingEnabled,
    pickupEnabled,
    cardStyle,
  } = publicData || {};
  const listingTypeConfig = config.listing.listingTypes.find(
    config => config.listingType === listingType
  );

  const descriptionRequired = displayDescription(listingTypeConfig);
  const hasValidDescription = descriptionRequired ? description : true;

  const deliveryOptionPicked = publicData && (shippingEnabled || pickupEnabled);

  // Profile leaves out only the fields that have their own step (Genre and/or Links)
  const profileExtendedFieldFilter =
    tabs && (tabs.includes(GENRE) || tabs.includes(LINKS))
      ? f => !isFieldOnOwnStep(tabs)(f)
      : undefined;

  switch (tab) {
    case DETAILS: {
      const locationRequired = listingTypeConfig && displayLocation(listingTypeConfig);
      const hasLocationIfRequired =
        !locationRequired || !!(geolocation && publicData?.location?.address);
      return !!(
        (!descriptionRequired || hasValidDescription) &&
        title &&
        listingType &&
        transactionProcessAlias &&
        unitType &&
        hasValidListingFieldsInExtendedData(
          publicData,
          privateData,
          config,
          profileExtendedFieldFilter
        ) &&
        hasLocationIfRequired
      );
    }
    case GENRE:
      return hasValidListingFieldsInExtendedData(publicData, privateData, config, isGenreField);
    case LINKS:
      return hasValidListingFieldsInExtendedData(publicData, privateData, config, isLinkField);
    case PRICING:
      return isListingPriceOptionalUnitType(unitType) || !!price;
    case PRICING_AND_STOCK:
      return !!price;
    case DELIVERY:
      return !!deliveryOptionPicked;
    case LOCATION:
      return !!(geolocation && publicData?.location?.address);
    case AVAILABILITY:
      return !!availabilityPlan;
    case PHOTOS:
      // Two photos are required (business-rules.md), same as EditListingPhotosForm's validation
      return images && images.length >= MIN_PHOTOS;
    case STYLE:
      return !!cardStyle;
    default:
      return false;
  }
};

/**
 * Check which wizard tabs are active and which are not yet available. Tab is active if previous
 * tab is completed. In edit mode all tabs are active.
 *
 * @param isNew flag if a new listing is being created or an old one being edited
 * @param listing data to be checked
 * @param tabs array of tabs used for this listing. These depend on transaction process.
 *
 * @return object containing activity / editability of different tabs of this wizard
 */
const tabsActive = (isNew, listing, tabs, config) => {
  return tabs.reduce((acc, tab) => {
    const previousTabIndex = tabs.findIndex(t => t === tab) - 1;
    const validTab = previousTabIndex >= 0;
    const hasListingType = !!listing?.attributes?.publicData?.listingType;
    const prevTabComletedInNewFlow = tabCompleted(tabs[previousTabIndex], listing, config, tabs);
    const isActive =
      validTab && !isNew ? hasListingType : validTab && isNew ? prevTabComletedInNewFlow : true;
    return { ...acc, [tab]: isActive };
  }, {});
};

const getListingTypeConfig = (listing, selectedListingType, config) => {
  const existingListingType = listing?.attributes?.publicData?.listingType;
  const validListingTypes = config.listing.listingTypes;
  const hasOnlyOneListingType = validListingTypes?.length === 1;

  const listingTypeConfig = existingListingType
    ? validListingTypes.find(conf => conf.listingType === existingListingType)
    : selectedListingType
    ? validListingTypes.find(conf => conf.listingType === selectedListingType.listingType)
    : hasOnlyOneListingType
    ? validListingTypes[0]
    : null;
  return listingTypeConfig;
};

/**
 * EditListingWizard is a component that renders the tabs that update the different parts of the listing.
 * It also handles the payout details modal and the Stripe onboarding form if the listing is a new one.
 * TODO: turn this into a functional component
 *
 * @component
 * @param {Object} props - The props object
 * @param {string} props.id - The id of the listing
 * @param {string} [props.className] - Custom class that extends the default class for the root element
 * @param {string} [props.rootClassName] - Custom class that overrides the default class for the root element
 * @param {Object} props.config - The config object
 * @param {Object} props.routeConfiguration - The route configuration object
 * @param {Object} props.params - The params object
 * @param {string} props.params.id - The id of the listing
 * @param {string} props.params.slug - The slug of the listing
 * @param {'new'|'draft'|'edit'} props.params.type - The type of the listing
 * @param {DETAILS | PRICING | PRICING_AND_STOCK | DELIVERY | LOCATION | AVAILABILITY | PHOTOS} props.params.tab - The name of the tab
 * @param {propTypes.ownListing} props.listing - The listing object
 * @param {propTypes.error} [props.errors.createListingDraftError] - The error object for createListingDraft
 * @param {propTypes.error} [props.errors.publishListingError] - The error object for publishListing
 * @param {propTypes.error} [props.errors.updateListingError] - The error object for updateListing
 * @param {propTypes.error} [props.errors.showListingsError] - The error object for showListings
 * @param {propTypes.error} [props.errors.uploadImageError] - The upload image error object
 * @param {propTypes.error} [props.errors.createStripeAccountError] - The error object for createStripeAccount
 * @param {propTypes.error} [props.errors.addExceptionError] - The error object for addException
 * @param {propTypes.error} [props.errors.deleteExceptionError] - The error object for deleteException
 * @param {propTypes.error} [props.errors.setStockError] - The error object for setStock
 * @param {boolean} props.fetchInProgress - Whether the fetch is in progress
 * @param {boolean} props.getAccountLinkInProgress - Whether the get account link is in progress
 * @param {boolean} props.payoutDetailsSaveInProgress - Whether the payout details save is in progress
 * @param {boolean} props.payoutDetailsSaved - Whether the payout details saved is in progress
 * @param {Function} props.onPayoutDetailsChange - The on payout details change function
 * @param {Function} props.onPayoutDetailsSubmit - The on payout details submit function
 * @param {Function} props.onGetStripeConnectAccountLink - The get StripeConnectAccountLink function
 * @param {propTypes.error} [props.createStripeAccountError] - The error object for createStripeAccount (TODO: errors object contains this)
 * @param {propTypes.error} [props.updateStripeAccountError] - The error object for updateStripeAccount (TODO: errors object contains this)
 * @param {propTypes.error} [props.fetchStripeAccountError] - The error object for fetchStripeAccount
 * @param {propTypes.error} [props.stripeAccountError] - The error object for stripeAccount (TODO: errors object contains this)
 * @param {propTypes.error} [props.stripeAccountLinkError] - The error object for stripeAccountLink
 * @param {Function} props.onManageDisableScrolling - The on manage disable scrolling function
 * @param {intlShape} props.intl - The intl object
 * @returns {JSX.Element} EditListingWizard component
 */
class EditListingWizard extends Component {
  constructor(props) {
    super(props);

    // Having this info in state would trigger unnecessary rerendering
    this.hasScrolledToTab = false;

    this.state = {
      draftId: null,
      selectedListingType: null,
      mounted: false,
    };
    this.handleCreateFlowTabScrolling = this.handleCreateFlowTabScrolling.bind(this);
    this.handlePublishListing = this.handlePublishListing.bind(this);
  }

  componentDidMount() {
    if (!this.mounted) {
      this.mounted = true;
    }
  }

  handleCreateFlowTabScrolling(shouldScroll) {
    this.hasScrolledToTab = shouldScroll;
  }

  // Payout details belong to the account (business-rules.md): publishing does not stop for them.
  // The payout notice banner on Home and Account settings asks for them instead (approved Oct 15).
  handlePublishListing(id) {
    this.props.onPublishListingDraft(id);
  }

  render() {
    const {
      id,
      className,
      rootClassName,
      params,
      listing,
      intl,
      errors,
      fetchInProgress,
      payoutDetailsSaveInProgress,
      payoutDetailsSaved,
      onManageDisableScrolling,
      onPayoutDetailsChange,
      onGetStripeConnectAccountLink,
      getAccountLinkInProgress,
      createStripeAccountError,
      updateStripeAccountError,
      fetchStripeAccountError,
      stripeAccountFetched,
      stripeAccount,
      stripeAccountError,
      stripeAccountLinkError,
      currentUser,
      config,
      routeConfiguration,
      authScopes,
      topbar,
      ...rest
    } = this.props;

    const selectedTab = params.tab;
    const isNewListingFlow = [LISTING_PAGE_PARAM_TYPE_NEW, LISTING_PAGE_PARAM_TYPE_DRAFT].includes(
      params.type
    );
    const currentListing = ensureListing(listing);
    const savedProcessAlias = currentListing.attributes?.publicData?.transactionProcessAlias;
    const transactionProcessAlias =
      savedProcessAlias || this.state.selectedListingType?.transactionProcessAlias;

    // NOTE: If the listing has invalid configuration in place,
    // the listing is considered deprecated and we don't allow user to modify the listing anymore.
    // Instead, operator should do that through Console or Integration API.
    const validListingTypes = config.listing.listingTypes;
    const listingTypeConfig = getListingTypeConfig(
      currentListing,
      this.state.selectedListingType,
      config
    );
    const existingListingType = currentListing.attributes?.publicData?.listingType;
    const invalidExistingListingType = existingListingType && !listingTypeConfig;
    // TODO: displayPrice aka config.defaultListingFields?.price with false value is only available with inquiry process
    //       if it's enabled with other processes, translations for "new" flow needs to be updated.
    const isPriceDisabled = !displayPrice(listingTypeConfig);

    // Transaction process alias is used here, because the process defineds whether the listing is supported
    // I.e. old listings might not be supported through listing types, but client app might still support those processes.
    const processName = transactionProcessAlias
      ? transactionProcessAlias.split('/')[0]
      : validListingTypes.length === 1
      ? validListingTypes[0].transactionType.process
      : INQUIRY_PROCESS_NAME;

    const hasListingTypeSelected =
      existingListingType || this.state.selectedListingType || validListingTypes.length === 1;

    // For oudated draft listing, we don't show other tabs but the "details"
    const tabs =
      isNewListingFlow && (invalidExistingListingType || !hasListingTypeSelected)
        ? TABS_DETAILS_ONLY
        : tabsForListingType(processName, listingTypeConfig, config);

    // Location is collected on Profile (details); redirect legacy ?tab=location URLs.
    if (selectedTab === LOCATION) {
      return <NamedRedirect name="EditListingPage" params={{ ...params, tab: DETAILS }} />;
    }

    // Check if wizard tab is active / linkable.
    // When creating a new listing, we don't allow users to access next tab until the current one is completed.
    const tabsStatus = tabsActive(isNewListingFlow, currentListing, tabs, config);

    // Redirect user to first tab when encoutering outdated draft listings.
    if (invalidExistingListingType && isNewListingFlow && selectedTab !== tabs[0]) {
      return <NamedRedirect name="EditListingPage" params={{ ...params, tab: tabs[0] }} />;
    }

    // If selectedTab is not active for listing with valid listing type,
    // redirect to the beginning of wizard
    if (!invalidExistingListingType && !tabsStatus[selectedTab]) {
      const currentTabIndex = tabs.indexOf(selectedTab);
      const nearestActiveTab = tabs
        .slice(0, currentTabIndex)
        .reverse()
        .find(t => tabsStatus[t]);

      console.log(
        `You tried to access an EditListingWizard tab (${selectedTab}), which was not yet activated.`
      );
      return <NamedRedirect name="EditListingPage" params={{ ...params, tab: nearestActiveTab }} />;
    }

    const tabLink = tab => {
      return { name: 'EditListingPage', params: { ...params, tab } };
    };
    const latestProcessName = resolveLatestProcessName(processName);

    // Step menu: done = tick (new profile: step completed; editing: every other step), current =
    // outline, not reachable yet (new profile) = grey
    const stepItems = tabs.map(tab => {
      const isCurrent = selectedTab === tab;
      const isDisabled = isNewListingFlow && !tabsStatus[tab];
      const isDone =
        !isCurrent &&
        !isDisabled &&
        (!isNewListingFlow || tabCompleted(tab, currentListing, config, tabs));
      return {
        key: tab,
        label: tabLabelAndSubmit(intl, tab, isNewListingFlow, isPriceDisabled, latestProcessName)
          .label,
        linkProps: tabLink(tab),
        current: isCurrent,
        done: isDone,
        disabled: isDisabled,
      };
    });
    const selectedTabTranslations = tabLabelAndSubmit(
      intl,
      selectedTab,
      isNewListingFlow,
      isPriceDisabled,
      latestProcessName
    );

    return (
      <LayoutSplit
        role="nav"
        className={className}
        topbar={topbar}
        side={
          <StepMenu
            variant="steps"
            ariaLabel={intl.formatMessage({ id: 'EditListingWizard.screenreader.tabNavigation' })}
            items={stepItems}
          />
        }
      >
        <EditListingWizardTab
          {...rest}
          key={selectedTab}
          tabId={`${id}_${selectedTab}`}
          tabLabel={selectedTabTranslations.label}
          tabSubmitButtonText={selectedTabTranslations.submitButton}
          tabLinkProps={tabLink(selectedTab)}
          selected
          disabled={isNewListingFlow && !tabsStatus[selectedTab]}
          tab={selectedTab}
          params={params}
          listing={listing}
          marketplaceTabs={tabs}
          errors={errors}
          handleCreateFlowTabScrolling={this.handleCreateFlowTabScrolling}
          handlePublishListing={this.handlePublishListing}
          fetchInProgress={fetchInProgress}
          onListingTypeChange={selectedListingType => this.setState({ selectedListingType })}
          onManageDisableScrolling={onManageDisableScrolling}
          config={config}
          routeConfiguration={routeConfiguration}
          intl={intl}
        />
      </LayoutSplit>
    );
  }
}

const EnhancedEditListingWizard = props => {
  const config = useConfiguration();
  const routeConfiguration = useRouteConfiguration();
  const intl = useIntl();
  return (
    <EditListingWizard
      config={config}
      routeConfiguration={routeConfiguration}
      intl={intl}
      {...props}
    />
  );
};

export default EnhancedEditListingWizard;
