import React from 'react';
import { Form as FinalForm } from 'react-final-form';
import arrayMutators from 'final-form-arrays';
import classNames from 'classnames';

import { useIntl } from '../../../../util/reactIntl';
import { Form, Button, CustomExtendedDataField } from '../../../../components';
import { getApplicableListingFieldConfigs } from '../editListingFieldHelpers';
import { isGenreField, isLinkField } from '../../../../util/listingFieldWizardSections';
import css from './EditListingListingFieldsStepPanel.module.css';

const sectionPredicate = section => (section === 'genre' ? isGenreField : isLinkField);

const ListingFieldsStepFormFields = props => {
  const {
    formId = 'EditListingListingFieldsStepForm',
    className,
    section,
    listingType,
    listingFieldsConfig,
    selectedCategories,
    saveActionMsg,
    disabled,
    ready,
    updated,
    updateInProgress,
    fetchErrors,
    handleSubmit,
    invalid,
    pristine,
  } = props;

  const intl = useIntl();
  const applicable = getApplicableListingFieldConfigs(
    listingFieldsConfig,
    listingType,
    selectedCategories
  );
  const pred = sectionPredicate(section);
  const sectionFieldConfigs = applicable.filter(pred);

  const { updateListingError, showListingsError } = fetchErrors || {};
  const classes = classNames(css.formRoot, className);
  const submitReady = (updated && pristine) || ready;
  const submitInProgress = updateInProgress;
  const submitDisabled =
    invalid || disabled || submitInProgress || sectionFieldConfigs.length === 0;

  return (
    <Form className={classes} onSubmit={handleSubmit}>
      {updateListingError ? (
        <p className={css.error}>
          {intl.formatMessage({ id: 'EditListingDetailsForm.updateFailed' })}
        </p>
      ) : null}
      {showListingsError ? (
        <p className={css.error}>
          {intl.formatMessage({ id: 'EditListingDetailsForm.showListingFailed' })}
        </p>
      ) : null}

      {sectionFieldConfigs.map(fieldConfig => {
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
      })}

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
};

/**
 * @param {'genre'|'links'} props.section
 */
const EditListingListingFieldsStepForm = props => {
  const { initialValues, onSubmit } = props;
  return (
    <FinalForm
      key={JSON.stringify(initialValues)}
      initialValues={initialValues}
      mutators={{ ...arrayMutators }}
      onSubmit={onSubmit}
      render={formRenderProps => (
        <ListingFieldsStepFormFields {...props} {...formRenderProps} />
      )}
    />
  );
};

export default EditListingListingFieldsStepForm;
