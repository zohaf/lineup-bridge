import React, { useMemo } from 'react';
import classNames from 'classnames';

import { FormattedMessage } from '../../../../util/reactIntl';
import { LISTING_STATE_DRAFT } from '../../../../util/types';
import { pickCategoryFields } from '../../../../util/fieldHelpers';
import { H3, ListingLink } from '../../../../components';
import {
  pickListingFieldsData,
  initialValuesForListingFields,
  getApplicableListingFieldConfigs,
} from '../editListingFieldHelpers';
import { isGenreField, isLinkField } from '../../../../util/listingFieldWizardSections';
import EditListingListingFieldsStepForm from './EditListingListingFieldsStepForm';
import css from './EditListingListingFieldsStepPanel.module.css';

const sectionPredicate = section => (section === 'genre' ? isGenreField : isLinkField);

const buildInitialValues = (props, section) => {
  const { listing, config } = props;
  const { publicData, privateData } = listing?.attributes || {};
  const listingType = publicData?.listingType;
  const categoryKey = config.categoryConfiguration.key;
  const listingCategories = config.categoryConfiguration.categories;
  const listingFields = config.listing.listingFields;
  const nestedCategories = pickCategoryFields(publicData, categoryKey, 1, listingCategories);

  const applicable = getApplicableListingFieldConfigs(
    listingFields,
    listingType,
    nestedCategories
  );
  const sectionFields = applicable.filter(sectionPredicate(section));

  return {
    ...initialValuesForListingFields(
      publicData,
      'public',
      listingType,
      nestedCategories,
      sectionFields
    ),
    ...initialValuesForListingFields(
      privateData,
      'private',
      listingType,
      nestedCategories,
      sectionFields
    ),
  };
};

/**
 * Wizard step for Genre or Links custom fields (extended data).
 *
 * @param {'genre'|'links'} props.section
 */
const EditListingListingFieldsStepPanel = props => {
  const {
    className,
    rootClassName,
    section,
    listing,
    config,
    disabled,
    ready,
    onSubmit,
    submitButtonText,
    panelUpdated,
    updateInProgress,
    errors,
    updatePageTitle: UpdatePageTitle,
    intl,
  } = props;

  const initialValues = useMemo(() => buildInitialValues(props, section), [
    listing?.id?.uuid,
    listing?.attributes?.publicData,
    listing?.attributes?.privateData,
    section,
    config?.listing?.listingFields,
  ]);

  const classes = classNames(rootClassName || css.root, className);
  const isPublished = listing?.id && listing?.attributes.state !== LISTING_STATE_DRAFT;

  const titleIdCreate =
    section === 'genre'
      ? 'EditListingListingFieldsStepPanel.createGenreTitle'
      : 'EditListingListingFieldsStepPanel.createLinksTitle';
  const titleIdEdit =
    section === 'genre'
      ? 'EditListingListingFieldsStepPanel.editGenreTitle'
      : 'EditListingListingFieldsStepPanel.editLinksTitle';

  const panelHeadingProps = isPublished
    ? {
        id: titleIdEdit,
        values: { listingTitle: <ListingLink listing={listing} />, lineBreak: <br /> },
        messageProps: { listingTitle: listing.attributes.title },
      }
    : {
        id: titleIdCreate,
        values: { lineBreak: <br /> },
        messageProps: {},
      };

  const { publicData } = listing?.attributes || {};
  const listingType = publicData?.listingType;
  const categoryKey = config.categoryConfiguration.key;
  const listingCategories = config.categoryConfiguration.categories;
  const nestedCategories = pickCategoryFields(publicData, categoryKey, 1, listingCategories);
  const listingFieldsConfig = config.listing.listingFields;

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

      <EditListingListingFieldsStepForm
        className={css.formRoot}
        initialValues={initialValues}
        section={section}
        listingType={listingType}
        listingFieldsConfig={listingFieldsConfig}
        selectedCategories={nestedCategories}
        formId={`EditListing${section}StepForm`}
        onSubmit={values => {
          const sectionFields = getApplicableListingFieldConfigs(
            listingFieldsConfig,
            listingType,
            nestedCategories
          ).filter(sectionPredicate(section));

          const publicListingFields = pickListingFieldsData(
            values,
            'public',
            listingType,
            nestedCategories,
            sectionFields
          );
          const privateListingFields = pickListingFieldsData(
            values,
            'private',
            listingType,
            nestedCategories,
            sectionFields
          );

          onSubmit({
            publicData: publicListingFields,
            privateData: privateListingFields,
          });
        }}
        saveActionMsg={submitButtonText}
        disabled={disabled}
        ready={ready}
        updated={panelUpdated}
        updateInProgress={updateInProgress}
        fetchErrors={errors}
      />
    </main>
  );
};

export default EditListingListingFieldsStepPanel;
