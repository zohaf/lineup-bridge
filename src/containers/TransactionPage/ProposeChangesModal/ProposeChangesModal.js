import React from 'react';
import classNames from 'classnames';
import { Form as FinalForm, Field } from 'react-final-form';

import { FormattedMessage, useIntl } from '../../../util/reactIntl';
import * as validators from '../../../util/validators';

import { Form, Modal, Button, FieldTextInput, ValidationError } from '../../../components';

import css from './ProposeChangesModal.module.css';

const composeFeeValidators = intl =>
  validators.composeValidators(
    validators.required(intl.formatMessage({ id: 'ProposeChangesModal.feeRequired' })),
    value => {
      const trimmed = typeof value === 'string' ? value.trim() : `${value}`;
      const n = Number.parseInt(trimmed, 10);
      if (Number.isNaN(n) || String(n) !== trimmed || n < 1) {
        return intl.formatMessage({ id: 'ProposeChangesModal.feeInvalid' });
      }
      return undefined;
    }
  );

const ProposeChangesForm = props => {
  const intl = useIntl();

  return (
    <FinalForm
      {...props}
      render={fieldRenderProps => {
        const {
          handleSubmit,
          invalid,
          submitting,
          submitError,
          inProgress,
        } = fieldRenderProps;

        const submitDisabled = invalid || submitting || inProgress;

        return (
          <Form onSubmit={handleSubmit}>
            {/* Proposed fee */}
            <Field name="proposedFee" validate={composeFeeValidators(intl)}>
              {({ input, meta }) => {
                const showError = meta.touched && (meta.error || meta.submitError);
                return (
                  <div className={css.field}>
                    <label className={css.label} htmlFor="proposeChanges-fee">
                      {intl.formatMessage({ id: 'ProposeChangesModal.feeLabel' })}
                    </label>
                    <div className={css.feeInputShell}>
                      <input
                        {...input}
                        id="proposeChanges-fee"
                        type="number"
                        min={1}
                        step={1}
                        className={css.feeInput}
                        autoComplete="off"
                      />
                      <span className={css.feeSuffix} aria-hidden="true">€</span>
                    </div>
                    {showError ? <ValidationError fieldMeta={meta} /> : null}
                  </div>
                );
              }}
            </Field>

            {/* Proposed start time – two selects: hours + minutes */}
            <Field name="proposedStartTime">
              {({ input }) => {
                const curVal = input.value || '';
                const curH = curVal.includes(':') ? curVal.split(':')[0] : '';
                const curM = curVal.includes(':') ? curVal.split(':')[1] : '00';
                return (
                  <div className={css.field}>
                    <label className={css.label} htmlFor="proposeChanges-startTimeH">
                      {intl.formatMessage({ id: 'ProposeChangesModal.startTimeLabel' })}
                    </label>
                    <div className={css.timePickerRow}>
                      <select
                        id="proposeChanges-startTimeH"
                        className={css.timeSelect}
                        value={curH}
                        onChange={e => {
                          const h = e.target.value;
                          input.onChange(h ? `${h}:${curM || '00'}` : '');
                        }}
                        onBlur={input.onBlur}
                      >
                        <option value="">HH</option>
                        {Array.from({ length: 24 }, (_, i) => {
                          const v = String(i).padStart(2, '0');
                          return <option key={v} value={v}>{v}</option>;
                        })}
                      </select>
                      <select
                        id="proposeChanges-startTimeM"
                        className={css.timeSelect}
                        value={curM}
                        onChange={e => {
                          if (curH) {
                            input.onChange(`${curH}:${e.target.value}`);
                          }
                        }}
                        onBlur={input.onBlur}
                      >
                        {['00', '15', '30', '45'].map(v => (
                          <option key={v} value={v}>{v}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                );
              }}
            </Field>

            {/* Proposed set duration */}
            <Field name="proposedDuration">
              {({ input }) => {
                const val = input.value || '';
                const n = parseInt(val, 10);
                const plural = Number.isInteger(n) && n === 1 ? 'hour' : 'hours';
                return (
                  <div className={css.field}>
                    <label className={css.label} htmlFor="proposeChanges-duration">
                      {intl.formatMessage({ id: 'ProposeChangesModal.durationLabel' })}
                    </label>
                    <div className={css.durationInputShell}>
                      <input
                        {...input}
                        id="proposeChanges-duration"
                        type="number"
                        min={1}
                        step={1}
                        placeholder="2"
                        className={css.durationInput}
                        autoComplete="off"
                      />
                      <span className={css.durationSuffix} aria-hidden="true">
                        {intl.formatMessage({ id: `ProposeChangesModal.${plural}` })}
                      </span>
                    </div>
                  </div>
                );
              }}
            </Field>

            {/* Fees and logistic notes */}
            <FieldTextInput
              className={css.field}
              id="proposeChanges-feeNotes"
              name="proposedFeeNotes"
              type="textarea"
              label={
                <>
                  {intl.formatMessage({ id: 'ProposeChangesModal.feeNotesLabel' })}
                  {' '}<span className={css.optional}>(optional)</span>
                </>
              }
              placeholder={intl.formatMessage({ id: 'ProposeChangesModal.feeNotesPlaceholder' })}
            />

            {/* Technical notes */}
            <FieldTextInput
              className={css.field}
              id="proposeChanges-notes"
              name="proposedNotes"
              type="textarea"
              label={
                <>
                  {intl.formatMessage({ id: 'ProposeChangesModal.notesLabel' })}
                  {' '}<span className={css.optional}>(optional)</span>
                </>
              }
              placeholder={intl.formatMessage({ id: 'ProposeChangesModal.notesPlaceholder' })}
            />

            {submitError ? (
              <p className={css.errorPlaceholder}>{submitError}</p>
            ) : null}

            <Button
              className={css.submitButton}
              type="submit"
              inProgress={inProgress}
              disabled={submitDisabled}
            >
              <FormattedMessage id="ProposeChangesModal.submit" />
            </Button>
          </Form>
        );
      }}
    />
  );
};

/**
 * Modal for the DJ to propose changes to the customer's offer.
 * Fields: proposed fee, proposed start time, technical & booking notes.
 *
 * @param {Object} props
 * @param {string} props.id - Modal id.
 * @param {boolean} props.isOpen
 * @param {Function} props.onClose
 * @param {Function} props.onManageDisableScrolling
 * @param {Function} props.onSubmit - Called with { proposedFee, proposedStartTime, proposedDuration, proposedFeeNotes, proposedNotes }.
 * @param {number} [props.currentFee] - Pre-fill fee from customer's offer.
 * @param {string} [props.currentStartTime] - Pre-fill start time from customer's offer.
 * @param {number} [props.currentDuration] - Pre-fill duration from customer's offer.
 * @param {string} [props.currentFeeNotes] - Pre-fill fee/logistics notes.
 * @param {string} [props.currentNotes] - Pre-fill technical notes.
 * @param {boolean} [props.inProgress]
 */
const ProposeChangesModal = props => {
  const {
    className,
    rootClassName,
    id,
    isOpen = false,
    onClose,
    onManageDisableScrolling,
    onSubmit,
    currentFee,
    currentStartTime,
    currentDuration,
    currentFeeNotes,
    currentNotes,
    inProgress = false,
  } = props;

  const classes = classNames(rootClassName || css.root, className);

  const initialValues = {
    proposedFee: currentFee != null ? String(currentFee) : '',
    proposedStartTime: currentStartTime || '',
    proposedDuration: currentDuration != null ? String(currentDuration) : '',
    proposedFeeNotes: currentFeeNotes || '',
    proposedNotes: currentNotes || '',
  };

  return (
    <Modal
      id={id}
      containerClassName={classes}
      contentClassName={css.modalContent}
      isOpen={isOpen}
      onClose={onClose}
      onManageDisableScrolling={onManageDisableScrolling}
      usePortal
    >
      <h2 className={css.modalTitle}>
        <FormattedMessage id="ProposeChangesModal.title" />
      </h2>
      <ProposeChangesForm
        onSubmit={onSubmit}
        initialValues={initialValues}
        inProgress={inProgress}
      />
    </Modal>
  );
};

export default ProposeChangesModal;
