import React from 'react';
import { Form as FinalForm, Field } from 'react-final-form';
import arrayMutators from 'final-form-arrays';
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
  FieldCheckboxGroup,
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

const DEFAULT_START_HOUR = '23';
const DEFAULT_END_HOUR = '09';
const DEFAULT_MINUTE = '00';

const joinTime = (h, m, defaultHour = DEFAULT_START_HOUR) => {
  const hour = h || defaultHour;
  return `${hour}:${m || DEFAULT_MINUTE}`;
};

const joinTimeOptional = (h, m) => {
  if (!h) return '';
  return `${h}:${m || DEFAULT_MINUTE}`;
};

const durationHoursValidators = intl =>
  validators.composeValidators(
    validators.required(intl.formatMessage({ id: 'NegotiationRequestQuoteForm.durationRequired' })),
    value => {
      const trimmed = typeof value === 'string' ? value.trim() : `${value}`;
      const n = Number.parseInt(trimmed, 10);
      if (Number.isNaN(n) || String(n) !== trimmed || n < 1) {
        return intl.formatMessage({ id: 'NegotiationRequestQuoteForm.durationInvalid' });
      }
      return undefined;
    }
  );

const optionalLabel = (label, css) => (
  <>
    {label} <span className={css.optional}>(optional)</span>
  </>
);

const DECK_SETUP_OPTION_KEYS = [
  'cdj_2000',
  'cdj_3000',
  'vinyl_turntables',
  'pioneer_djm',
  'allen_heath',
  'other',
];

const getDeckSetupOptions = intl =>
  DECK_SETUP_OPTION_KEYS.map(key => ({
    key,
    label: intl.formatMessage({ id: `RequestQuoteForm.deckSetup.${key}` }),
  }));

/**
 * Hour + minute selects for start/end time fields.
 */
const TimeSelectField = props => {
  const {
    input,
    meta,
    fid,
    label,
    defaultHour = DEFAULT_START_HOUR,
    name,
    css: styles,
    allowEmpty = false,
  } = props;

  const { h, m } = splitTime(input.value);
  const hour = allowEmpty ? h : h || defaultHour;
  const minute = allowEmpty ? m || DEFAULT_MINUTE : m || DEFAULT_MINUTE;
  const hourId = fid(`${name}H`);
  const minuteId = fid(`${name}M`);

  const handleHourChange = e => {
    const nextHour = e.target.value;
    input.onChange(
      allowEmpty ? joinTimeOptional(nextHour, minute) : joinTime(nextHour, minute, defaultHour)
    );
  };

  const handleMinuteChange = e => {
    const nextMinute = e.target.value;
    const effectiveHour = hour || defaultHour;
    input.onChange(
      allowEmpty
        ? joinTimeOptional(effectiveHour, nextMinute)
        : joinTime(effectiveHour, nextMinute, defaultHour)
    );
  };

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={hourId}>
        {label}
      </label>
      <div className={styles.timePickerRow}>
        <select
          id={hourId}
          className={styles.timeSelect}
          value={allowEmpty ? h : hour}
          onChange={handleHourChange}
          onBlur={input.onBlur}
        >
          {allowEmpty ? (
            <option value="" disabled>
              HH
            </option>
          ) : null}
          {HOURS.map(v => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
        <select
          id={minuteId}
          className={styles.timeSelect}
          value={minute}
          onChange={handleMinuteChange}
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
};

/**
 * Form for the customer to send an offer (quote request) to a DJ.
 * Structured in sections: Event details, Set details, Fee & logistics, Technical setup.
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

  const deckSetupOptions = getDeckSetupOptions(intl);

  return (
    <FinalForm
      mutators={{ ...arrayMutators }}
      initialValues={{
        deckSetup: [],
        bookingStartTime: `${DEFAULT_START_HOUR}:${DEFAULT_MINUTE}`,
        bookingEndTime: `${DEFAULT_END_HOUR}:${DEFAULT_MINUTE}`,
        setStartTime: `${DEFAULT_START_HOUR}:${DEFAULT_MINUTE}`,
      }}
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
                label={optionalLabel(
                  intl.formatMessage({ id: 'RequestQuoteForm.eventNameLabel' }),
                  css
                )}
                placeholder={intl.formatMessage({ id: 'RequestQuoteForm.eventNamePlaceholder' })}
              />

              <Field
                name="bookingDate"
                validate={validators.required(
                  intl.formatMessage({ id: 'RequestQuoteForm.dateRequired' })
                )}
              >
                {({ input, meta }) => (
                  <div className={css.field}>
                    <label className={css.label} htmlFor={fid('bookingDate')}>
                      <FormattedMessage id="RequestQuoteForm.dateLabel" />
                    </label>
                    <SingleDatePicker
                      id={fid('bookingDate')}
                      value={input.value || null}
                      onChange={input.onChange}
                      placeholderText={intl.formatMessage({
                        id: 'RequestQuoteForm.datePlaceholder',
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
                  intl.formatMessage({ id: 'RequestQuoteForm.eventStartTimeRequired' })
                )}
              >
                {({ input, meta }) => (
                  <TimeSelectField
                    input={input}
                    meta={meta}
                    fid={fid}
                    name="bookingStartTime"
                    defaultHour={DEFAULT_START_HOUR}
                    label={intl.formatMessage({ id: 'RequestQuoteForm.eventStartTimeLabel' })}
                    css={css}
                  />
                )}
              </Field>

              <Field
                name="bookingEndTime"
                validate={validators.required(
                  intl.formatMessage({ id: 'RequestQuoteForm.eventEndTimeRequired' })
                )}
              >
                {({ input, meta }) => (
                  <TimeSelectField
                    input={input}
                    meta={meta}
                    fid={fid}
                    name="bookingEndTime"
                    defaultHour={DEFAULT_END_HOUR}
                    label={intl.formatMessage({ id: 'RequestQuoteForm.eventEndTimeLabel' })}
                    css={css}
                  />
                )}
              </Field>

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
                onWheel={e => {
                  if (e.target === document.activeElement) {
                    e.target.blur();
                    setTimeout(() => {
                      e.target.focus();
                    }, 0);
                  }
                }}
              />
            </div>

            {/* ── Set details ── */}
            <div className={css.section}>
              <h3 className={css.sectionTitle}>
                <FormattedMessage id="RequestQuoteForm.sectionSetDetails" />
              </h3>

              <FieldSelect
                className={css.field}
                name="setTimeNeeded"
                id={fid('setTimeNeeded')}
                label={intl.formatMessage({ id: 'RequestQuoteForm.setTimeNeededLabel' })}
                validate={validators.required(
                  intl.formatMessage({ id: 'RequestQuoteForm.setTimeNeededRequired' })
                )}
              >
                <option value="" disabled>
                  {intl.formatMessage({ id: 'RequestQuoteForm.selectPlaceholder' })}
                </option>
                <option value="opening">
                  {intl.formatMessage({ id: 'RequestQuoteForm.setTimeNeeded.opening' })}
                </option>
                <option value="supporting">
                  {intl.formatMessage({ id: 'RequestQuoteForm.setTimeNeeded.supporting' })}
                </option>
                <option value="peak_time">
                  {intl.formatMessage({ id: 'RequestQuoteForm.setTimeNeeded.peakTime' })}
                </option>
                <option value="closing">
                  {intl.formatMessage({ id: 'RequestQuoteForm.setTimeNeeded.closing' })}
                </option>
                <option value="all_night">
                  {intl.formatMessage({ id: 'RequestQuoteForm.setTimeNeeded.allNight' })}
                </option>
              </FieldSelect>

              <Field
                name="setStartTime"
                validate={validators.required(
                  intl.formatMessage({ id: 'RequestQuoteForm.setStartTimeRequired' })
                )}
              >
                {({ input, meta }) => (
                  <TimeSelectField
                    input={input}
                    meta={meta}
                    fid={fid}
                    name="setStartTime"
                    defaultHour={DEFAULT_START_HOUR}
                    label={intl.formatMessage({ id: 'RequestQuoteForm.setStartTimeLabel' })}
                    css={css}
                  />
                )}
              </Field>

              <Field name="durationHours" validate={durationHoursValidators(intl)}>
                {({ input, meta }) => {
                  const trimmed =
                    typeof input.value === 'string' ? input.value.trim() : `${input.value}`;
                  const n = Number.parseInt(trimmed, 10);
                  const plural = Number.isInteger(n) && n === 1 ? 'hour' : 'hours';
                  return (
                    <div className={css.field}>
                      <label className={css.label} htmlFor={fid('durationHours')}>
                        {intl.formatMessage({ id: 'RequestQuoteForm.setDurationLabel' })}
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

              <FieldTextInput
                className={classNames(css.field, css.fieldCompact)}
                type="text"
                name="previousDj"
                id={fid('previousDj')}
                labelClassName={css.label}
                label={optionalLabel(
                  intl.formatMessage({ id: 'RequestQuoteForm.previousDjLabel' }),
                  css
                )}
              />
              <div className={css.helper}>
                <FormattedMessage id="RequestQuoteForm.previousDjHelper" />
              </div>

              <FieldTextInput
                className={classNames(css.field, css.fieldCompact)}
                type="text"
                name="headliner"
                id={fid('headliner')}
                labelClassName={css.label}
                label={optionalLabel(
                  intl.formatMessage({ id: 'RequestQuoteForm.headlinerLabel' }),
                  css
                )}
              />
              <div className={css.helper}>
                <FormattedMessage id="RequestQuoteForm.headlinerHelper" />
              </div>
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
                          placeholder="1000"
                          className={css.offerInput}
                          autoComplete="off"
                          onWheel={e => {
                            if (e.target === document.activeElement) {
                              e.target.blur();
                              setTimeout(() => {
                                e.target.focus();
                              }, 0);
                            }
                          }}
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

            </div>

            {/* ── Technical setup ── */}
            <div className={css.section}>
              <h3 className={css.sectionTitle}>
                <FormattedMessage id="RequestQuoteForm.sectionTechnicalSetup" />
              </h3>

              <FieldCheckboxGroup
                className={classNames(css.field, css.deckSetupField)}
                id={fid('deckSetup')}
                name="deckSetup"
                label={intl.formatMessage({ id: 'RequestQuoteForm.deckSetupLabel' })}
                options={deckSetupOptions}
                twoColumns
                validate={validators.nonEmptyArray(
                  intl.formatMessage({ id: 'RequestQuoteForm.deckSetupRequired' })
                )}
              />

              <FieldSelect
                className={classNames(css.field, css.boothMonitorsField)}
                name="boothMonitorsAvailable"
                id={fid('boothMonitorsAvailable')}
                label={intl.formatMessage({ id: 'RequestQuoteForm.boothMonitorsLabel' })}
                validate={validators.required(
                  intl.formatMessage({ id: 'RequestQuoteForm.boothMonitorsRequired' })
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
            </div>

            <div className={css.section}>
              <FieldTextInput
                className={css.field}
                type="textarea"
                name="includedDetails"
                id={fid('includedDetails')}
                labelClassName={css.label}
                label={
                  <>
                    {intl.formatMessage({ id: 'RequestQuoteForm.additionalNotesLabel' })}
                    {' '}<span className={css.optional}>(optional)</span>
                  </>
                }
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
