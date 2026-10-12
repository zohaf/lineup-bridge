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
  SelectField,
  PrimaryButton,
  ValidationError,
  SectionCard,
  CheckboxTileGroup,
  TimeSelect,
} from '../../../components/index.js';

import SingleDatePicker from '../../../components/DatePicker/DatePickers/SingleDatePicker';

import formCss from '../../../styles/lineupForm.module.css';
import buttonCss from '../../../styles/lineupButtons.module.css';
import css from './RequestQuoteForm.module.css';

const DEFAULT_START_HOUR = '23';
const DEFAULT_END_HOUR = '09';
const DEFAULT_MINUTE = '00';

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

const optionalLabel = label => (
  <>
    {label} <span className={formCss.optional}>(optional)</span>
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
          submitting,
          submitFailed,
          errors,
          touched,
        } = formRenderProps;

        const classes = classNames(rootClassName || css.root, className);
        const submitInProgress = inProgress || submitting;
        const submitDisabled = submitInProgress;
        const fid = name => (formId ? `${formId}.${name}` : name);

        // Same rule as the custom fields below: error look after touch or a failed submit
        const hasError = name => !!(touched?.[name] || submitFailed) && !!errors?.[name];
        const inputClass = name =>
          classNames(formCss.input, { [formCss.inputError]: hasError(name) });
        const selectClass = name =>
          classNames(formCss.select, { [formCss.inputError]: hasError(name) });

        const selectPlaceholder = intl.formatMessage({ id: 'RequestQuoteForm.selectPlaceholder' });
        const yesNoOptions = [
          <option key="empty" value="" disabled>
            {selectPlaceholder}
          </option>,
          <option key="yes" value="yes">
            {intl.formatMessage({ id: 'RequestQuoteForm.yes' })}
          </option>,
          <option key="no" value="no">
            {intl.formatMessage({ id: 'RequestQuoteForm.no' })}
          </option>,
        ];

        return (
          <Form className={classes} onSubmit={handleSubmit} enforcePagePreloadFor="SaleDetailsPage">
            {/* ── Event details ── */}
            <SectionCard
              number={1}
              title={<FormattedMessage id="RequestQuoteForm.sectionEventDetails" />}
            >
              <div className={formCss.row2}>
                <FieldTextInput
                  rootClassName={formCss.field}
                  type="text"
                  name="venueName"
                  id={fid('venueName')}
                  labelClassName={formCss.label}
                  inputRootClass={inputClass('venueName')}
                  label={intl.formatMessage({ id: 'RequestQuoteForm.venueNameLabel' })}
                  placeholder={intl.formatMessage({ id: 'RequestQuoteForm.venueNamePlaceholder' })}
                  validate={validators.required(
                    intl.formatMessage({ id: 'RequestQuoteForm.venueNameRequired' })
                  )}
                />

                <FieldTextInput
                  rootClassName={formCss.field}
                  type="text"
                  name="eventLocation"
                  id={fid('eventLocation')}
                  labelClassName={formCss.label}
                  inputRootClass={inputClass('eventLocation')}
                  label={intl.formatMessage({ id: 'RequestQuoteForm.eventLocationLabel' })}
                  placeholder={intl.formatMessage({
                    id: 'RequestQuoteForm.eventLocationPlaceholder',
                  })}
                  validate={validators.required(
                    intl.formatMessage({ id: 'RequestQuoteForm.eventLocationRequired' })
                  )}
                />
              </div>

              <FieldTextInput
                rootClassName={formCss.field}
                type="text"
                name="eventName"
                id={fid('eventName')}
                labelClassName={formCss.label}
                inputRootClass={inputClass('eventName')}
                label={optionalLabel(intl.formatMessage({ id: 'RequestQuoteForm.eventNameLabel' }))}
                placeholder={intl.formatMessage({ id: 'RequestQuoteForm.eventNamePlaceholder' })}
              />

              <div className={formCss.row2}>
                <Field
                  name="bookingDate"
                  validate={validators.required(
                    intl.formatMessage({ id: 'RequestQuoteForm.dateRequired' })
                  )}
                >
                  {({ input, meta }) => (
                    <div className={formCss.field}>
                      <label className={formCss.label} htmlFor={fid('bookingDate')}>
                        <FormattedMessage id="RequestQuoteForm.dateLabel" />
                      </label>
                      <SingleDatePicker
                        id={fid('bookingDate')}
                        value={input.value || null}
                        onChange={input.onChange}
                        placeholderText={intl.formatMessage({
                          id: 'RequestQuoteForm.datePlaceholder',
                        })}
                        inputClassName={classNames(css.dateInput, {
                          [css.dateInputError]: (meta.touched || submitFailed) && meta.invalid,
                        })}
                      />
                      <ValidationError rootClassName={formCss.error} fieldMeta={meta} />
                    </div>
                  )}
                </Field>
              </div>

              <div className={formCss.row2}>
                <Field
                  name="bookingStartTime"
                  validate={validators.required(
                    intl.formatMessage({ id: 'RequestQuoteForm.eventStartTimeRequired' })
                  )}
                >
                  {({ input, meta }) => (
                    <TimeSelect
                      input={input}
                      meta={meta}
                      fid={fid}
                      name="bookingStartTime"
                      defaultHour={DEFAULT_START_HOUR}
                      label={intl.formatMessage({ id: 'RequestQuoteForm.eventStartTimeLabel' })}
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
                    <TimeSelect
                      input={input}
                      meta={meta}
                      fid={fid}
                      name="bookingEndTime"
                      defaultHour={DEFAULT_END_HOUR}
                      label={intl.formatMessage({ id: 'RequestQuoteForm.eventEndTimeLabel' })}
                    />
                  )}
                </Field>
              </div>

              <div className={formCss.row2}>
                <FieldTextInput
                  rootClassName={formCss.field}
                  type="number"
                  name="expectedAttendance"
                  id={fid('expectedAttendance')}
                  labelClassName={formCss.label}
                  inputRootClass={inputClass('expectedAttendance')}
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
            </SectionCard>

            {/* ── Set details ── */}
            <SectionCard
              number={2}
              title={<FormattedMessage id="RequestQuoteForm.sectionSetDetails" />}
            >
              <div className={formCss.row2}>
                <SelectField
                  rootClassName={formCss.field}
                  labelClassName={formCss.label}
                  selectClassName={selectClass('setTimeNeeded')}
                  name="setTimeNeeded"
                  id={fid('setTimeNeeded')}
                  label={intl.formatMessage({ id: 'RequestQuoteForm.setTimeNeededLabel' })}
                  validate={validators.required(
                    intl.formatMessage({ id: 'RequestQuoteForm.setTimeNeededRequired' })
                  )}
                >
                  <option value="" disabled>
                    {selectPlaceholder}
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
                </SelectField>
              </div>

              <div className={formCss.row2}>
                <Field
                  name="setStartTime"
                  validate={validators.required(
                    intl.formatMessage({ id: 'RequestQuoteForm.setStartTimeRequired' })
                  )}
                >
                  {({ input, meta }) => (
                    <TimeSelect
                      input={input}
                      meta={meta}
                      fid={fid}
                      name="setStartTime"
                      defaultHour={DEFAULT_START_HOUR}
                      label={intl.formatMessage({ id: 'RequestQuoteForm.setStartTimeLabel' })}
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
                      <TimeSelect
                        variant="duration"
                        input={input}
                        meta={meta}
                        fid={fid}
                        name="durationHours"
                        label={intl.formatMessage({ id: 'RequestQuoteForm.setDurationLabel' })}
                        placeholder={selectPlaceholder}
                        unit={<FormattedMessage id={`NegotiationRequestQuoteForm.${plural}`} />}
                      />
                    );
                  }}
                </Field>
              </div>

              <div className={formCss.row2}>
                <div className={css.fieldWithHelper}>
                  <FieldTextInput
                    rootClassName={formCss.field}
                    type="text"
                    name="previousDj"
                    id={fid('previousDj')}
                    labelClassName={formCss.label}
                    inputRootClass={inputClass('previousDj')}
                    label={optionalLabel(
                      intl.formatMessage({ id: 'RequestQuoteForm.previousDjLabel' })
                    )}
                  />
                  <div className={formCss.helper}>
                    <FormattedMessage id="RequestQuoteForm.previousDjHelper" />
                  </div>
                </div>

                <div className={css.fieldWithHelper}>
                  <FieldTextInput
                    rootClassName={formCss.field}
                    type="text"
                    name="headliner"
                    id={fid('headliner')}
                    labelClassName={formCss.label}
                    inputRootClass={inputClass('headliner')}
                    label={optionalLabel(
                      intl.formatMessage({ id: 'RequestQuoteForm.headlinerLabel' })
                    )}
                  />
                  <div className={formCss.helper}>
                    <FormattedMessage id="RequestQuoteForm.headlinerHelper" />
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* ── Fee & logistics ── */}
            <SectionCard
              number={3}
              title={<FormattedMessage id="RequestQuoteForm.sectionFeeLogistics" />}
            >
              <Field name="offerAmount" validate={composeOfferValidators(intl)}>
                {({ input, meta }) => {
                  const showError =
                    (meta.touched || submitFailed) && (meta.error || meta.submitError);
                  return (
                    <div className={formCss.field}>
                      <label className={formCss.label} htmlFor={fid('offerAmount')}>
                        {intl.formatMessage({ id: 'RequestQuoteForm.feeLabel' })}
                      </label>
                      <div
                        className={classNames(formCss.inputWithUnit, {
                          [formCss.inputWithUnitError]:
                            (meta.touched || submitFailed) && meta.invalid,
                        })}
                      >
                        <input
                          {...input}
                          id={fid('offerAmount')}
                          type="number"
                          min={1}
                          step={1}
                          placeholder="1000"
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
                        <span className={formCss.unit} aria-hidden="true">
                          €
                        </span>
                      </div>
                      {showError ? (
                        <ValidationError rootClassName={formCss.error} fieldMeta={meta} />
                      ) : (
                        <div className={formCss.helper}>
                          <FormattedMessage id="RequestQuoteForm.feeHelper" />
                        </div>
                      )}
                    </div>
                  );
                }}
              </Field>

              <div className={formCss.row2}>
                <div className={css.fieldWithHelper}>
                  <SelectField
                    rootClassName={formCss.field}
                    labelClassName={formCss.label}
                    selectClassName={selectClass('travelIncluded')}
                    name="travelIncluded"
                    id={fid('travelIncluded')}
                    label={intl.formatMessage({ id: 'RequestQuoteForm.travelIncludedLabel' })}
                    validate={validators.required(
                      intl.formatMessage({ id: 'RequestQuoteForm.travelIncludedRequired' })
                    )}
                  >
                    {yesNoOptions}
                  </SelectField>
                  {hasError('travelIncluded') ? null : (
                    <div className={formCss.helper}>
                      <FormattedMessage id="RequestQuoteForm.travelIncludedHelper" />
                    </div>
                  )}
                </div>

                <div className={css.fieldWithHelper}>
                  <SelectField
                    rootClassName={formCss.field}
                    labelClassName={formCss.label}
                    selectClassName={selectClass('accommodationIncluded')}
                    name="accommodationIncluded"
                    id={fid('accommodationIncluded')}
                    label={intl.formatMessage({
                      id: 'RequestQuoteForm.accommodationIncludedLabel',
                    })}
                    validate={validators.required(
                      intl.formatMessage({ id: 'RequestQuoteForm.accommodationIncludedRequired' })
                    )}
                  >
                    {yesNoOptions}
                  </SelectField>
                  {hasError('accommodationIncluded') ? null : (
                    <div className={formCss.helper}>
                      <FormattedMessage id="RequestQuoteForm.accommodationIncludedHelper" />
                    </div>
                  )}
                </div>
              </div>
            </SectionCard>

            {/* ── Technical setup ── */}
            <SectionCard
              number={4}
              title={<FormattedMessage id="RequestQuoteForm.sectionTechnicalSetup" />}
            >
              <CheckboxTileGroup
                id={fid('deckSetup')}
                name="deckSetup"
                label={intl.formatMessage({ id: 'RequestQuoteForm.deckSetupLabel' })}
                options={deckSetupOptions}
                validate={validators.nonEmptyArray(
                  intl.formatMessage({ id: 'RequestQuoteForm.deckSetupRequired' })
                )}
              />

              <div className={formCss.row2}>
                <SelectField
                  rootClassName={formCss.field}
                  labelClassName={formCss.label}
                  selectClassName={selectClass('boothMonitorsAvailable')}
                  name="boothMonitorsAvailable"
                  id={fid('boothMonitorsAvailable')}
                  label={intl.formatMessage({ id: 'RequestQuoteForm.boothMonitorsLabel' })}
                  validate={validators.required(
                    intl.formatMessage({ id: 'RequestQuoteForm.boothMonitorsRequired' })
                  )}
                >
                  {yesNoOptions}
                </SelectField>
              </div>

              <FieldTextInput
                rootClassName={formCss.field}
                type="textarea"
                name="includedDetails"
                id={fid('includedDetails')}
                labelClassName={formCss.label}
                inputRootClass={classNames(formCss.textarea, {
                  [formCss.inputError]: hasError('includedDetails'),
                })}
                label={
                  <>
                    {intl.formatMessage({ id: 'RequestQuoteForm.additionalNotesLabel' })}{' '}
                    <span className={formCss.optional}>(optional)</span>
                  </>
                }
              />
            </SectionCard>

            <div className={classNames(css.submit, submitButtonWrapperClassName)}>
              <ErrorMessage error={requestQuoteError} />
              <PrimaryButton
                type="submit"
                rootClassName={buttonCss.primary}
                className={buttonCss.formButton}
                inProgress={submitInProgress}
                disabled={submitDisabled}
              >
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
