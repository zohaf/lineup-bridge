import React from 'react';
import { Form as FinalForm, Field } from 'react-final-form';
import classNames from 'classnames';

// Import contexts and util modules
import { FormattedMessage, intlShape } from '../../../util/reactIntl.js';
import { propTypes } from '../../../util/types.js';
import * as validators from '../../../util/validators.js';

// Import shared components
import {
  Form,
  FieldTextInput,
  FieldSelect,
  PrimaryButton,
  ValidationError,
} from '../../../components/index.js';

import SingleDatePicker from '../../../components/DatePicker/DatePickers/SingleDatePicker';

import css from './RequestQuoteForm.module.css';

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = ['00', '15', '30', '45'];

const splitTime = value => {
  if (!value || typeof value !== 'string') return { h: '', m: '' };
  const [h, m] = value.split(':');
  return { h: h || '', m: m || '' };
};

const joinTime = (h, m) => {
  if (!h) return '';
  return `${h}:${m || '00'}`;
};

const durationHoursValidators = intl =>
  validators.composeValidators(
    validators.required(intl.formatMessage({ id: 'NegotiationRequestQuoteForm.durationRequired' })),
    value => {
      const trimmed = typeof value === 'string' ? value.trim() : `${value}`;
      const n = parseInt(trimmed, 10);
      if (Number.isNaN(n) || String(n) !== trimmed || n < 1) {
        return intl.formatMessage({ id: 'NegotiationRequestQuoteForm.durationInvalid' });
      }
      return undefined;
    }
  );

/**
 * Form for the customer to send an offer (quote request) to a DJ.
 * Structured in sections: Event details, Set details, Fee & logistics, Technical notes.
 *
 * @param {Object} props
 * @param {intlShape} props.intl
 * @param {Function} props.onSubmit
 * @param {propTypes.error} props.requestQuoteError
 */
export const RequestQuoteForm = props => {
  const {
    intl,
    errorMessageComponent: ErrorMessage,
    requestQuoteError,
    onSubmit,
    ...restProps
  } = props;

  return (
    <FinalForm
      initialValues={{}}
      onSubmit={onSubmit}
      {...restProps}
      render={formRenderProps => {
        const {
          rootClassName,
          className,
          submitButtonWrapperClassName,
          formId,
          handleSubmit,
          inProgress,
          invalid,
        } = formRenderProps;

        const classes = classNames(rootClassName || css.root, className);
        const submitInProgress = inProgress;
        const submitDisabled = invalid || submitInProgress;
        const fid = name => (formId ? `${formId}.${name}` : name);

        return (
          <Form className={classes} onSubmit={handleSubmit} enforcePagePreloadFor="SaleDetailsPage">
            {/* ── Event details ── */}
            <div className={css.section}>
              <h3 className={css.sectionTitle}>
                <FormattedMessage id="RequestQuoteForm.sectionEventDetails" />
              </h3>

              <FieldTextInput
                className={css.field}
                type="text"
                name="venueName"
                id={fid('venueName')}
                labelClassName={css.label}
                label={intl.formatMessage({ id: 'RequestQuoteForm.venueNameLabel' })}
                placeholder={intl.formatMessage({ id: 'RequestQuoteForm.venueNamePlaceholder' })}
                validate={validators.required(
                  intl.formatMessage({ id: 'RequestQuoteForm.venueNameRequired' })
                )}
              />

              <FieldTextInput
                className={css.field}
                type="text"
                name="eventLocation"
                id={fid('eventLocation')}
                labelClassName={css.label}
                label={intl.formatMessage({ id: 'RequestQuoteForm.eventLocationLabel' })}
                placeholder={intl.formatMessage({ id: 'RequestQuoteForm.eventLocationPlaceholder' })}
                validate={validators.required(
                  intl.formatMessage({ id: 'RequestQuoteForm.eventLocationRequired' })
                )}
              />

              <FieldTextInput
                className={css.field}
                type="text"
                name="eventName"
                id={fid('eventName')}
                labelClassName={css.label}
                label={intl.formatMessage({ id: 'RequestQuoteForm.eventNameLabel' })}
                placeholder={intl.formatMessage({ id: 'RequestQuoteForm.eventNamePlaceholder' })}
                validate={validators.required(
                  intl.formatMessage({ id: 'RequestQuoteForm.eventNameRequired' })
                )}
              />

              <FieldSelect
                className={css.field}
                name="eventType"
                id={fid('eventType')}
                label={intl.formatMessage({ id: 'RequestQuoteForm.eventTypeLabel' })}
                validate={validators.required(
                  intl.formatMessage({ id: 'RequestQuoteForm.eventTypeRequired' })
                )}
              >
                <option value="" disabled>
                  {intl.formatMessage({ id: 'RequestQuoteForm.selectPlaceholder' })}
                </option>
                <option value="club_night">
                  {intl.formatMessage({ id: 'RequestQuoteForm.eventType.clubNight' })}
                </option>
                <option value="day_party">
                  {intl.formatMessage({ id: 'RequestQuoteForm.eventType.dayParty' })}
                </option>
                <option value="afterparty">
                  {intl.formatMessage({ id: 'RequestQuoteForm.eventType.afterparty' })}
                </option>
                <option value="showcase">
                  {intl.formatMessage({ id: 'RequestQuoteForm.eventType.showcase' })}
                </option>
                <option value="open_air">
                  {intl.formatMessage({ id: 'RequestQuoteForm.eventType.openAir' })}
                </option>
                <option value="warehouse_event">
                  {intl.formatMessage({ id: 'RequestQuoteForm.eventType.warehouseEvent' })}
                </option>
                <option value="day_festival">
                  {intl.formatMessage({ id: 'RequestQuoteForm.eventType.dayFestival' })}
                </option>
                <option value="multi_day_festival">
                  {intl.formatMessage({ id: 'RequestQuoteForm.eventType.multiDayFestival' })}
                </option>
                <option value="boat_party">
                  {intl.formatMessage({ id: 'RequestQuoteForm.eventType.boatParty' })}
                </option>
              </FieldSelect>

              <FieldTextInput
                className={css.field}
                type="number"
                name="expectedAttendance"
                id={fid('expectedAttendance')}
                labelClassName={css.label}
                label={intl.formatMessage({ id: 'RequestQuoteForm.expectedAttendanceLabel' })}
                placeholder={intl.formatMessage({
                  id: 'RequestQuoteForm.expectedAttendancePlaceholder',
                })}
                validate={validators.required(
                  intl.formatMessage({ id: 'RequestQuoteForm.expectedAttendanceRequired' })
                )}
              />

              <FieldTextInput
                className={css.field}
                type="textarea"
                name="description"
                id={fid('description')}
                labelClassName={css.label}
                label={intl.formatMessage({ id: 'RequestQuoteForm.eventDescriptionLabel' })}
                placeholder={intl.formatMessage({
                  id: 'RequestQuoteForm.eventDescriptionPlaceholder',
                })}
                validate={validators.required(
                  intl.formatMessage({ id: 'RequestQuoteForm.eventDescriptionRequired' })
                )}
              />
            </div>

            {/* ── Set details ── */}
            <div className={css.section}>
              <h3 className={css.sectionTitle}>
                <FormattedMessage id="RequestQuoteForm.sectionSetDetails" />
              </h3>

              <Field
                name="bookingDate"
                validate={validators.required(
                  intl.formatMessage({ id: 'NegotiationRequestQuoteForm.dateRequired' })
                )}
              >
                {({ input, meta }) => (
                  <div className={css.field}>
                    <label className={css.label} htmlFor={fid('bookingDate')}>
                      <FormattedMessage id="NegotiationRequestQuoteForm.dateLabel" />
                    </label>
                    <SingleDatePicker
                      id={fid('bookingDate')}
                      value={input.value || null}
                      onChange={input.onChange}
                      placeholderText={intl.formatMessage({
                        id: 'NegotiationRequestQuoteForm.datePlaceholder',
                      })}
                      inputClassName={css.dateInputRightIcon}
                    />
                    <ValidationError fieldMeta={meta} />
                  </div>
                )}
              </Field>

              <Field
                name="bookingStartTime"
                validate={validators.required(
                  intl.formatMessage({ id: 'NegotiationRequestQuoteForm.timeRequired' })
                )}
              >
                {({ input, meta }) => {
                  const { h, m } = splitTime(input.value);
                  return (
                    <div className={css.field}>
                      <label className={css.label} htmlFor={fid('bookingStartTimeH')}>
                        <FormattedMessage id="NegotiationRequestQuoteForm.timeLabel" />
                      </label>
                      <div className={css.timePickerRow}>
                        <select
                          id={fid('bookingStartTimeH')}
                          className={css.timeSelect}
                          value={h}
                          onChange={e => input.onChange(joinTime(e.target.value, m))}
                          onBlur={input.onBlur}
                        >
                          <option value="" disabled>
                            HH
                          </option>
                          {HOURS.map(v => (
                            <option key={v} value={v}>
                              {v}
                            </option>
                          ))}
                        </select>
                        <select
                          id={fid('bookingStartTimeM')}
                          className={css.timeSelect}
                          value={m || '00'}
                          onChange={e => input.onChange(joinTime(h, e.target.value))}
                          onBlur={input.onBlur}
                        >
                          {MINUTES.map(v => (
                            <option key={v} value={v}>
                              {v}
                            </option>
                          ))}
                        </select>
                      </div>
                      <ValidationError fieldMeta={meta} />
                    </div>
                  );
                }}
              </Field>

              <Field name="durationHours" validate={durationHoursValidators(intl)}>
                {({ input, meta }) => {
                  const trimmed =
                    typeof input.value === 'string' ? input.value.trim() : `${input.value}`;
                  const n = parseInt(trimmed, 10);
                  const plural = Number.isInteger(n) && n === 1 ? 'hour' : 'hours';
                  return (
                    <div className={css.field}>
                      <label className={css.label} htmlFor={fid('durationHours')}>
                        <FormattedMessage id="NegotiationRequestQuoteForm.durationLabel" />
                      </label>
                      <div
                        className={classNames(css.durationInputShell, {
                          [css.durationInputShellError]: meta.touched && meta.invalid,
                        })}
                      >
                        <input
                          {...input}
                          id={fid('durationHours')}
                          className={css.durationInput}
                          type="number"
                          min={1}
                          step={1}
                          placeholder="2"
                          autoComplete="off"
                          required
                        />
                        <span className={css.durationSuffix} aria-hidden="true">
                          <FormattedMessage id={`NegotiationRequestQuoteForm.${plural}`} />
                        </span>
                      </div>
                      <ValidationError fieldMeta={meta} />
                    </div>
                  );
                }}
              </Field>
            </div>

            {/* ── Fee & logistics ── */}
            <div className={css.section}>
              <h3 className={css.sectionTitle}>
                <FormattedMessage id="RequestQuoteForm.sectionFeeLogistics" />
              </h3>

              <Field name="offerAmount" validate={composeOfferValidators(intl)}>
                {({ input, meta }) => {
                  const showError = meta.touched && (meta.error || meta.submitError);
                  return (
                    <div className={css.field}>
                      <label className={css.label} htmlFor={fid('offerAmount')}>
                        {intl.formatMessage({ id: 'RequestQuoteForm.feeLabel' })}
                      </label>
                      <div
                        className={classNames(css.offerInputShell, {
                          [css.offerInputShellError]: meta.touched && meta.invalid,
                        })}
                      >
                        <input
                          {...input}
                          id={fid('offerAmount')}
                          type="number"
                          min={1}
                          step={1}
                          placeholder="800"
                          className={css.offerInput}
                          autoComplete="off"
                        />
                        <span className={css.offerSuffix} aria-hidden="true">
                          €
                        </span>
                      </div>
                      <div className={css.offerUnderText}>
                        {showError ? (
                          <ValidationError fieldMeta={meta} />
                        ) : (
                          <span className={css.helper}>
                            <FormattedMessage id="RequestQuoteForm.feeHelper" />
                          </span>
                        )}
                      </div>
                    </div>
                  );
                }}
              </Field>

              <FieldSelect
                className={classNames(css.field, css.fieldCompact)}
                name="travelIncluded"
                id={fid('travelIncluded')}
                label={intl.formatMessage({ id: 'RequestQuoteForm.travelIncludedLabel' })}
                validate={validators.required(
                  intl.formatMessage({ id: 'RequestQuoteForm.travelIncludedRequired' })
                )}
              >
                <option value="" disabled>
                  {intl.formatMessage({ id: 'RequestQuoteForm.selectPlaceholder' })}
                </option>
                <option value="yes">
                  {intl.formatMessage({ id: 'RequestQuoteForm.yes' })}
                </option>
                <option value="no">
                  {intl.formatMessage({ id: 'RequestQuoteForm.no' })}
                </option>
              </FieldSelect>
              <div className={css.helper}>
                <FormattedMessage id="RequestQuoteForm.travelIncludedHelper" />
              </div>

              <FieldSelect
                className={classNames(css.field, css.fieldCompact)}
                name="accommodationIncluded"
                id={fid('accommodationIncluded')}
                label={intl.formatMessage({ id: 'RequestQuoteForm.accommodationIncludedLabel' })}
                validate={validators.required(
                  intl.formatMessage({ id: 'RequestQuoteForm.accommodationIncludedRequired' })
                )}
              >
                <option value="" disabled>
                  {intl.formatMessage({ id: 'RequestQuoteForm.selectPlaceholder' })}
                </option>
                <option value="yes">
                  {intl.formatMessage({ id: 'RequestQuoteForm.yes' })}
                </option>
                <option value="no">
                  {intl.formatMessage({ id: 'RequestQuoteForm.no' })}
                </option>
              </FieldSelect>
              <div className={css.helper}>
                <FormattedMessage id="RequestQuoteForm.accommodationIncludedHelper" />
              </div>

              <FieldTextInput
                className={css.field}
                type="textarea"
                name="includedDetails"
                id={fid('includedDetails')}
                labelClassName={css.label}
                label={
                  <>
                    {intl.formatMessage({ id: 'RequestQuoteForm.additionalInclusionsLabel' })}
                    {' '}<span className={css.optional}>(optional)</span>
                  </>
                }
                placeholder={intl.formatMessage({
                  id: 'RequestQuoteForm.additionalInclusionsPlaceholder',
                })}
              />
            </div>

            {/* ── Technical notes ── */}
            <div className={css.section}>
              <h3 className={css.sectionTitle}>
                <FormattedMessage id="RequestQuoteForm.sectionTechnicalNotes" />
              </h3>

              <FieldTextInput
                className={css.field}
                type="text"
                name="technicalSetup"
                id={fid('technicalSetup')}
                labelClassName={css.label}
                label={intl.formatMessage({ id: 'RequestQuoteForm.technicalSetupLabel' })}
                placeholder={intl.formatMessage({
                  id: 'RequestQuoteForm.technicalSetupPlaceholder',
                })}
                validate={validators.required(
                  intl.formatMessage({ id: 'RequestQuoteForm.technicalSetupRequired' })
                )}
              />

              <FieldTextInput
                className={css.field}
                type="textarea"
                name="additionalNotes"
                id={fid('additionalNotes')}
                labelClassName={css.label}
                label={
                  <>
                    {intl.formatMessage({ id: 'RequestQuoteForm.technicalNotesLabel' })}
                    {' '}<span className={css.optional}>(optional)</span>
                  </>
                }
                placeholder={intl.formatMessage({
                  id: 'RequestQuoteForm.technicalNotesPlaceholder',
                })}
              />
            </div>

            <div className={submitButtonWrapperClassName}>
              <ErrorMessage error={requestQuoteError} />
              <PrimaryButton type="submit" inProgress={submitInProgress} disabled={submitDisabled}>
                <FormattedMessage id="RequestQuotePage.submitButtonText" />
              </PrimaryButton>
            </div>
          </Form>
        );
      }}
    />
  );
};

export default RequestQuoteForm;

const composeOfferValidators = intl =>
  validators.composeValidators(
    validators.required(intl.formatMessage({ id: 'RequestQuoteForm.feeRequired' })),
    value => {
      const trimmed = typeof value === 'string' ? value.trim() : `${value}`;
      const n = Number.parseInt(trimmed, 10);
      if (Number.isNaN(n) || String(n) !== trimmed || n < 1) {
        return intl.formatMessage({ id: 'RequestQuoteForm.feeInvalid' });
      }
      return undefined;
    }
  );
