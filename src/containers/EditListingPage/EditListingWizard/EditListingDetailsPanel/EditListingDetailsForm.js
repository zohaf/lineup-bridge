import React, { useState, useEffect } from 'react';
import { Field, Form as FinalForm } from 'react-final-form';
import arrayMutators from 'final-form-arrays';
import classNames from 'classnames';

// Import util modules
import { FormattedMessage, useIntl } from '../../../../util/reactIntl';
import { displayDescription, displayLocation } from '../../../../util/configHelpers.js';
import { useConfiguration } from '../../../../context/configurationContext.js';
import { propTypes } from '../../../../util/types';
import { isValidCurrencyForTransactionProcess } from '../../../../util/fieldHelpers';
import {
  isGenreField,
  isLinkField,
} from '../../../../util/listingFieldWizardSections';
import { getApplicableListingFieldConfigs } from '../editListingFieldHelpers';
import {
  maxLength,
  required,
  composeValidators,
  autocompleteSearchRequired,
  autocompletePlaceSelected,
} from '../../../../util/validators';

// Import shared components
import {
  Form,
  Button,
  FieldSelect,
  FieldTextInput,
  FieldLocationAutocompleteInput,
  CustomExtendedDataField,
  H4,
} from '../../../../components';
// Import modules from this directory
import css from './EditListingDetailsForm.module.css';

const TITLE_MAX_LENGTH = 60;

const identity = v => v;

const renderListingField = (fieldConfig, formId, intl) => {
  const { key, scope } = fieldConfig || {};
  const namespacedKey = scope === 'public' ? `pub_${key}` : `priv_${key}`;
  return (
    <CustomExtendedDataField
      key={namespacedKey}
      name={namespacedKey}
      fieldConfig={fieldConfig}
      defaultRequiredMessage={intl.formatMessage({
        id: 'EditListingDetailsForm.defaultRequiredMessage',
      })}
      formId={formId}
    />
  );
};

/**
 * Custom extended data fields grouped into Genre, Links, and any remaining fields.
 */
const GroupedListingFields = props => {
  const {
    listingType,
    listingFieldsConfig,
    selectedCategories,
    formId,
    intl,
    additionalListingFieldsOnly,
  } = props;

  const applicable = getApplicableListingFieldConfigs(
    listingFieldsConfig,
    listingType,
    selectedCategories
  );

  const genreFieldConfigs = applicable.filter(isGenreField);
  const linkFieldConfigs = applicable.filter(isLinkField);
  const otherFieldConfigs = applicable.filter(f => !isGenreField(f) && !isLinkField(f));

  if (additionalListingFieldsOnly) {
    if (otherFieldConfigs.length === 0) {
      return null;
    }
    return (
      <div className={css.listingFieldsGrouped}>
        <div className={css.fieldSection}>
          <H4 as="h2" className={css.fieldSectionTitle}>
            <FormattedMessage id="EditListingDetailsForm.sectionAdditional" />
          </H4>
          {otherFieldConfigs.map(fc => renderListingField(fc, formId, intl))}
        </div>
      </div>
    );
  }

  const hasAnySection =
    genreFieldConfigs.length > 0 ||
    linkFieldConfigs.length > 0 ||
    otherFieldConfigs.length > 0;

  if (!hasAnySection) {
    return null;
  }

  return (
    <div className={css.listingFieldsGrouped}>
      {genreFieldConfigs.length > 0 ? (
        <div className={css.fieldSection}>
          <H4 as="h2" className={css.fieldSectionTitle}>
            <FormattedMessage id="EditListingDetailsForm.sectionGenre" />
          </H4>
          {genreFieldConfigs.map(fc => renderListingField(fc, formId, intl))}
        </div>
      ) : null}

      {linkFieldConfigs.length > 0 ? (
        <div className={css.fieldSection}>
          <H4 as="h2" className={css.fieldSectionTitle}>
            <FormattedMessage id="EditListingDetailsForm.sectionLinks" />
          </H4>
          {linkFieldConfigs.map(fc => renderListingField(fc, formId, intl))}
        </div>
      ) : null}

      {otherFieldConfigs.length > 0 ? (
        <div className={css.fieldSection}>
          <H4 as="h2" className={css.fieldSectionTitle}>
            <FormattedMessage id="EditListingDetailsForm.sectionAdditional" />
          </H4>
          {otherFieldConfigs.map(fc => renderListingField(fc, formId, intl))}
        </div>
      ) : null}
    </div>
  );
};

// Show various error messages
const ErrorMessage = props => {
  const { fetchErrors } = props;
  const { updateListingError, createListingDraftError, showListingsError } = fetchErrors || {};
  const errorMessage = updateListingError ? (
    <FormattedMessage id="EditListingDetailsForm.updateFailed" />
  ) : createListingDraftError ? (
    <FormattedMessage id="EditListingDetailsForm.createListingDraftError" />
  ) : showListingsError ? (
    <FormattedMessage id="EditListingDetailsForm.showListingFailed" />
  ) : null;

  if (errorMessage) {
    return <p className={css.error}>{errorMessage}</p>;
  }
  return null;
};

// Hidden input field
const FieldHidden = props => {
  const { name } = props;
  return (
    <Field id={name} name={name} type="hidden" className={css.unitTypeHidden}>
      {fieldRenderProps => <input {...fieldRenderProps?.input} />}
    </Field>
  );
};

// Field component that either allows selecting listing type (if multiple types are available)
// or just renders hidden fields:
// - listingType              Set of predefined configurations for each listing type
// - transactionProcessAlias  Initiate correct transaction against Marketplace API
// - unitType                 Main use case: pricing unit
const FieldSelectListingType = props => {
  const { name } = props;

  // Listing type is always set from config / URL (see EditListingDetailsPanel getTransactionInfo).
  // Do not show the listing type control in the UI.
  return (
    <>
      <FieldHidden name={name} />
      <FieldHidden name="transactionProcessAlias" />
      <FieldHidden name="unitType" />
    </>
  );
};

// Finds the correct subcategory within the given categories array based on the provided categoryIdToFind.
const findCategoryConfig = (categories, categoryIdToFind) => {
  return categories?.find(category => category.id === categoryIdToFind);
};

/**
 * Recursively render subcategory field inputs if there are subcategories available.
 * This function calls itself with updated props to render nested category fields.
 * The select field is used for choosing a category or subcategory.
 */
const CategoryField = props => {
  const { currentCategoryOptions, level, values, prefix, handleCategoryChange, intl } = props;

  const currentCategoryKey = `${prefix}${level}`;

  const categoryConfig = findCategoryConfig(currentCategoryOptions, values[`${prefix}${level}`]);

  return (
    <>
      {currentCategoryOptions ? (
        <FieldSelect
          key={currentCategoryKey}
          id={currentCategoryKey}
          name={currentCategoryKey}
          className={css.listingTypeSelect}
          onChange={event => handleCategoryChange(event, level, currentCategoryOptions)}
          label={intl.formatMessage(
            { id: 'EditListingDetailsForm.categoryLabel' },
            { categoryLevel: currentCategoryKey }
          )}
          validate={required(
            intl.formatMessage(
              { id: 'EditListingDetailsForm.categoryRequired' },
              { categoryLevel: currentCategoryKey }
            )
          )}
        >
          <option disabled value="">
            {intl.formatMessage(
              { id: 'EditListingDetailsForm.categoryPlaceholder' },
              { categoryLevel: currentCategoryKey }
            )}
          </option>

          {currentCategoryOptions.map(option => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </FieldSelect>
      ) : null}

      {categoryConfig?.subcategories?.length > 0 ? (
        <CategoryField
          currentCategoryOptions={categoryConfig.subcategories}
          level={level + 1}
          values={values}
          prefix={prefix}
          handleCategoryChange={handleCategoryChange}
          intl={intl}
        />
      ) : null}
    </>
  );
};

const FieldSelectCategory = props => {
  useEffect(() => {
    checkIfInitialValuesExist();
  }, []);

  const { prefix, listingCategories, formApi, intl, setAllCategoriesChosen, values } = props;

  // Counts the number of selected categories in the form values based on the given prefix.
  const countSelectedCategories = () => {
    return Object.keys(values).filter(key => key.startsWith(prefix)).length;
  };

  // Checks if initial values exist for categories and sets the state accordingly.
  // If initial values exist, it sets `allCategoriesChosen` state to true; otherwise, it sets it to false
  const checkIfInitialValuesExist = () => {
    const count = countSelectedCategories(values, prefix);
    setAllCategoriesChosen(count > 0);
  };

  // If a parent category changes, clear all child category values
  const handleCategoryChange = (category, level, currentCategoryOptions) => {
    const selectedCatLenght = countSelectedCategories();
    if (level < selectedCatLenght) {
      for (let i = selectedCatLenght; i > level; i--) {
        formApi.change(`${prefix}${i}`, null);
      }
    }
    const categoryConfig = findCategoryConfig(currentCategoryOptions, category).subcategories;
    setAllCategoriesChosen(!categoryConfig || categoryConfig.length === 0);
  };

  return (
    <CategoryField
      currentCategoryOptions={listingCategories}
      level={1}
      values={values}
      prefix={prefix}
      handleCategoryChange={handleCategoryChange}
      intl={intl}
    />
  );
};

// Return configuration for given listingType
const getListingTypeConfig = (config, listingType) => {
  return config.listing.listingTypes?.find(config => config.listingType === listingType);
};

/**
 * Form that asks title, description, transaction process and unit type for pricing
 * In addition, it asks about custom fields according to marketplace-custom-config.js
 *
 * @component
 * @param {Object} props
 * @param {string} [props.className] - Custom class that extends the default class for the root element
 * @param {string} [props.formId] - The form id
 * @param {boolean} props.disabled - Whether the form is disabled
 * @param {boolean} props.ready - Whether the form is ready
 * @param {boolean} props.updated - Whether the form is updated
 * @param {boolean} props.updateInProgress - Whether the update is in progress
 * @param {Object} props.fetchErrors - The fetch errors object
 * @param {propTypes.error} [props.fetchErrors.createListingDraftError] - The create listing draft error
 * @param {propTypes.error} [props.fetchErrors.showListingsError] - The show listings error
 * @param {propTypes.error} [props.fetchErrors.updateListingError] - The update listing error
 * @param {Function} props.pickSelectedCategories - The pick selected categories function
 * @param {Array<Object>} props.selectableListingTypes - The selectable listing types
 * @param {boolean} props.hasPredefinedListingType - Whether the listing type is already saved or predefined through URL
 * @param {propTypes.listingFields} props.listingFieldsConfig - The listing fields config
 * @param {string} props.listingCurrency - The listing currency
 * @param {string} props.saveActionMsg - The save action message
 * @param {boolean} [props.autoFocus] - Whether the form should autofocus
 * @param {Function} props.onListingTypeChange - The listing type change function
 * @param {Function} props.onSubmit - The submit function
 * @returns {JSX.Element}
 */
const EditListingDetailsForm = props => (
  <FinalForm
    {...props}
    mutators={{ ...arrayMutators }}
    render={formRenderProps => {
      const {
        autoFocus,
        className,
        disabled,
        ready,
        formId = 'EditListingDetailsForm',
        form: formApi,
        handleSubmit,
        onListingTypeChange,
        invalid,
        pristine,
        marketplaceCurrency,
        marketplaceName,
        selectableListingTypes,
        selectableCategories,
        hasPredefinedListingType = false,
        pickSelectedCategories,
        categoryPrefix,
        saveActionMsg,
        updated,
        updateInProgress,
        fetchErrors,
        listingFieldsConfig = [],
        listingCurrency,
        values,
        hideGenreAndLinksInProfileForm = false,
      } = formRenderProps;

      const intl = useIntl();
      const { listingType, transactionProcessAlias, unitType } = values;
      const [allCategoriesChosen, setAllCategoriesChosen] = useState(false);

      const titleRequiredMessage = intl.formatMessage({
        id: 'EditListingDetailsForm.djTitleRequired',
      });
      const maxLengthMessage = intl.formatMessage(
        { id: 'EditListingDetailsForm.djMaxLength' },
        {
          maxLength: TITLE_MAX_LENGTH,
        }
      );

      // Determine the currency to validate:
      // - If editing an existing listing, use the listing's currency.
      // - If creating a new listing, fall back to the default marketplace currency.
      const currencyToCheck = listingCurrency || marketplaceCurrency;

      // Verify if the selected listing type's transaction process supports the chosen currency.
      // This checks compatibility between the transaction process
      // and the marketplace or listing currency.
      const isCompatibleCurrency = isValidCurrencyForTransactionProcess(
        transactionProcessAlias,
        currencyToCheck
      );

      const maxLength60Message = maxLength(maxLengthMessage, TITLE_MAX_LENGTH);

      const hasCategories = selectableCategories && selectableCategories.length > 0;
      const showCategories = listingType && hasCategories;

      const showTitle = hasCategories ? allCategoriesChosen : listingType;

      const config = useConfiguration();
      const listingTypeConfig = getListingTypeConfig(config, listingType);
      const showDescriptionMaybe = displayDescription(listingTypeConfig);
      const showDescription = hasCategories
        ? allCategoriesChosen && showDescriptionMaybe
        : showDescriptionMaybe;

      const showCityMaybe = listingTypeConfig && displayLocation(listingTypeConfig);
      const showCity = hasCategories
        ? allCategoriesChosen && showCityMaybe
        : showCityMaybe;

      const showListingFields = hasCategories ? allCategoriesChosen : listingType;

      const cityRequiredMessage = intl.formatMessage({
        id: 'EditListingDetailsForm.cityRequired',
      });
      const cityNotRecognizedMessage = intl.formatMessage({
        id: 'EditListingDetailsForm.cityNotRecognized',
      });

      const classes = classNames(css.root, className);
      const submitReady = (updated && pristine) || ready;
      const submitInProgress = updateInProgress;
      const hasMandatoryListingTypeData = listingType && transactionProcessAlias && unitType;
      const submitDisabled =
        invalid ||
        disabled ||
        submitInProgress ||
        !hasMandatoryListingTypeData ||
        !isCompatibleCurrency;

      return (
        <Form className={classes} onSubmit={handleSubmit}>
          <ErrorMessage fetchErrors={fetchErrors} />

          <FieldSelectListingType
            name="listingType"
            listingTypes={selectableListingTypes}
            hasPredefinedListingType={hasPredefinedListingType}
            onListingTypeChange={onListingTypeChange}
            formApi={formApi}
            formId={formId}
            intl={intl}
          />

          {showCategories && isCompatibleCurrency && (
            <FieldSelectCategory
              values={values}
              prefix={categoryPrefix}
              listingCategories={selectableCategories}
              formApi={formApi}
              intl={intl}
              allCategoriesChosen={allCategoriesChosen}
              setAllCategoriesChosen={setAllCategoriesChosen}
            />
          )}

          {showTitle && isCompatibleCurrency && (
            <FieldTextInput
              id={`${formId}title`}
              name="title"
              className={css.title}
              type="text"
              label={intl.formatMessage({ id: 'EditListingDetailsForm.djTitle' })}
              placeholder={intl.formatMessage({
                id: 'EditListingDetailsForm.djTitlePlaceholder',
              })}
              maxLength={TITLE_MAX_LENGTH}
              validate={composeValidators(required(titleRequiredMessage), maxLength60Message)}
              autoFocus={autoFocus}
            />
          )}

          {showDescription && isCompatibleCurrency && (
            <FieldTextInput
              id={`${formId}description`}
              name="description"
              className={css.description}
              type="textarea"
              label={intl.formatMessage({ id: 'EditListingDetailsForm.djDescription' })}
              placeholder={intl.formatMessage({
                id: 'EditListingDetailsForm.djDescriptionPlaceholder',
              })}
              validate={required(
                intl.formatMessage({
                  id: 'EditListingDetailsForm.djDescriptionRequired',
                })
              )}
            />
          )}

          {showCity && isCompatibleCurrency && (
            <FieldLocationAutocompleteInput
              rootClassName={css.locationCity}
              inputClassName={css.locationAutocompleteInput}
              iconClassName={css.locationAutocompleteInputIcon}
              predictionsClassName={css.predictionsRoot}
              validClassName={css.validLocation}
              name="location"
              id={`${formId}location`}
              label={intl.formatMessage({ id: 'EditListingDetailsForm.city' })}
              placeholder={intl.formatMessage({
                id: 'EditListingDetailsForm.cityPlaceholder',
              })}
              useDefaultPredictions={false}
              format={identity}
              valueFromForm={values.location}
              restrictAutocompleteToCities
              validate={composeValidators(
                autocompleteSearchRequired(cityRequiredMessage),
                autocompletePlaceSelected(cityNotRecognizedMessage)
              )}
            />
          )}

          {showListingFields && isCompatibleCurrency && (
            <GroupedListingFields
              listingType={listingType}
              listingFieldsConfig={listingFieldsConfig}
              selectedCategories={pickSelectedCategories(values)}
              formId={formId}
              intl={intl}
              additionalListingFieldsOnly={hideGenreAndLinksInProfileForm}
            />
          )}

          {!isCompatibleCurrency && listingType && (
            <p className={css.error}>
              <FormattedMessage
                id="EditListingDetailsForm.incompatibleCurrency"
                values={{ marketplaceName, marketplaceCurrency }}
              />
            </p>
          )}

          <Button
            className={css.submitButton}
            type="submit"
            inProgress={submitInProgress}
            disabled={submitDisabled}
            ready={submitReady}
          >
            {saveActionMsg}
          </Button>
        </Form>
      );
    }}
  />
);

export default EditListingDetailsForm;
