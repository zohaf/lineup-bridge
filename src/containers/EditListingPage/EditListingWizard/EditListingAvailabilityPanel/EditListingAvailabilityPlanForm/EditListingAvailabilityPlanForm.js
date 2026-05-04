import React from 'react';
import { Form as FinalForm } from 'react-final-form';
import arrayMutators from 'final-form-arrays';
import classNames from 'classnames';

import { FormattedMessage, useIntl } from '../../../../../util/reactIntl';
import { Form, Heading, H3, PrimaryButton, SecondaryButton } from '../../../../../components';
import FieldTimeZoneSelect from '../FieldTimeZoneSelect';
import AvailabilityPlanEntries from './AvailabilityPlanEntries';

import css from './EditListingAvailabilityPlanForm.module.css';

/**
 * Fixed UTC dates (Jan 7–13, 2024) so each maps to sun…sat for localized short weekday labels.
 */
const WEEKDAY_UTC_REFERENCE = {
  sun: [2024, 0, 7],
  mon: [2024, 0, 8],
  tue: [2024, 0, 9],
  wed: [2024, 0, 10],
  thu: [2024, 0, 11],
  fri: [2024, 0, 12],
  sat: [2024, 0, 13],
};

const weekdayUtcDate = day => {
  const parts = WEEKDAY_UTC_REFERENCE[day];
  return new Date(Date.UTC(parts[0], parts[1], parts[2], 12, 0, 0, 0));
};

/**
 * Ensure one schedule entry exists for this day and the day is listed in activePlanDays.
 * Mirrors AvailabilityPlanEntries checkbox onChange when turning a day on.
 *
 * @param {string} day
 * @param {Object} values form values
 * @param {*} formApi React Final Form api
 * @param {boolean} useFullDays
 */
const isDayScheduled = (day, values) => {
  const active = values.activePlanDays || [];
  const entries = values[day] || [];
  return active.includes(day) && !!(entries && entries.length > 0 && entries[0]);
};

const enableDayInPlan = (day, values, formApi, useFullDays) => {
  const active = values.activePlanDays || [];
  const entries = values[day] || [];
  const hasEntries = !!(entries && entries.length > 0 && entries[0]);

  if (!active.includes(day)) {
    formApi.change('activePlanDays', [...active, day]);
  }

  if (!hasEntries) {
    const seats = { seats: 1 };
    if (useFullDays) {
      formApi.mutators.push(day, {
        startTime: '00:00',
        endTime: '24:00',
        ...seats,
      });
    } else {
      formApi.mutators.push(day, { startTime: null, endTime: null, ...seats });
    }
  }
};

/**
 * Remove all entries for one day and drop it from activePlanDays.
 *
 * @param {string} day
 * @param {Object} values
 * @param {*} formApi
 */
const removeDayFromPlan = (day, values, formApi) => {
  const dayEntries = values[day] || [];
  for (let i = dayEntries.length - 1; i >= 0; i -= 1) {
    formApi.mutators.remove(day, i);
  }
  const activeDays = values.activePlanDays || [];
  formApi.change(
    'activePlanDays',
    activeDays.filter(d => d !== day)
  );
};

/**
 * First click adds the day; second click (when already on) removes it.
 *
 * @param {string} day
 * @param {Object} values
 * @param {*} formApi
 * @param {boolean} useFullDays
 */
const toggleDayInPlan = (day, values, formApi, useFullDays) => {
  if (isDayScheduled(day, values)) {
    removeDayFromPlan(day, values, formApi);
  } else {
    enableDayInPlan(day, values, formApi, useFullDays);
  }
};

/**
 * Enable every weekday that is not yet scheduled.
 *
 * @param {Array<string>} weekdays
 * @param {Object} values
 * @param {*} formApi
 * @param {boolean} useFullDays
 */
const enableAllDaysInPlan = (weekdays, values, formApi, useFullDays) => {
  const active = values.activePlanDays || [];
  const mergedActive = [...new Set([...active, ...weekdays])];
  formApi.change('activePlanDays', mergedActive);

  weekdays.forEach(day => {
    const entries = values[day] || [];
    const hasEntries = !!(entries && entries.length > 0 && entries[0]);
    if (!hasEntries) {
      const seats = { seats: 1 };
      if (useFullDays) {
        formApi.mutators.push(day, {
          startTime: '00:00',
          endTime: '24:00',
          ...seats,
        });
      } else {
        formApi.mutators.push(day, { startTime: null, endTime: null, ...seats });
      }
    }
  });
};

/**
 * Remove every weekday's entries and clear activePlanDays (uses initial values snapshot).
 *
 * @param {Array<string>} weekdays
 * @param {Object} values
 * @param {*} formApi
 */
const removeAllDaysFromPlan = (weekdays, values, formApi) => {
  weekdays.forEach(day => {
    const dayEntries = values[day] || [];
    for (let i = dayEntries.length - 1; i >= 0; i -= 1) {
      formApi.mutators.remove(day, i);
    }
  });
  formApi.change('activePlanDays', []);
};

/**
 * If every weekday is scheduled, clear the whole week; otherwise enable all days.
 *
 * @param {Array<string>} weekdays
 * @param {Object} values
 * @param {*} formApi
 * @param {boolean} useFullDays
 */
const toggleAllDaysInPlan = (weekdays, values, formApi, useFullDays) => {
  const allOn = weekdays.every(d => isDayScheduled(d, values));
  if (allOn) {
    removeAllDaysFromPlan(weekdays, values, formApi);
  } else {
    enableAllDaysInPlan(weekdays, values, formApi, useFullDays);
  }
};

/**
 * User might create entries inside the day of week in what ever order.
 * We sort them before submitting to Marketplace API
 */
const sortEntries = () => (a, b) => {
  if (a.startTime && b.startTime) {
    const aStart = Number.parseInt(a.startTime.split(':')[0]);
    const bStart = Number.parseInt(b.startTime.split(':')[0]);
    return aStart - bStart;
  }
  return 0;
};

/**
 * Handle submitted values: sort entries within the day of week
 * @param {Redux Thunk} onSubmit promise fn.
 * @param {Array<string>} weekdays ['mon', 'tue', etc.]
 */
const submit = (onSubmit, weekdays) => values => {
  const sortedValues = weekdays.reduce(
    (submitValues, day) => {
      return submitValues[day]
        ? {
            ...submitValues,
            [day]: submitValues[day].sort(sortEntries()),
          }
        : submitValues;
    },
    { ...values }
  );

  onSubmit(sortedValues);
};

/**
 * @typedef {'sun'|'mon'|'tue'|'wed'|'thu'|'fri'|'sat'} Weekday
 */

/**
 * Create and edit availability plan of the listing.
 * This is essentially the weekly schedule.
 *
 * @component
 * @param {Object} props
 * @param {string?} props.className
 * @param {string?} props.rootClassName
 * @param {string?} props.formId
 * @param {Object} props.form form API from React Final Form
 * @param {Function} props.handleSubmit
 * @param {boolean} props.inProgress
 * @param {string} props.listingTitle
 * @param {Array<Weekday>} props.weekdays
 * @param {boolean} props.useFullDays
 * @param {boolean} props.useMultipleSeats
 * @param {'hour'|'day'|'night'} props.unitType
 * @param {boolean} props.fetchErrors
 * @param {Object|null} props.fetchErrors.updateListingError
 * @param {Object} props.values form's values
 * @returns {JSX.Element} containing form that allows adding availability exceptions
 */
const EditListingAvailabilityPlanForm = props => {
  const intl = useIntl();
  const { onSubmit, ...restOfprops } = props;
  return (
    <FinalForm
      {...restOfprops}
      onSubmit={submit(onSubmit, props.weekdays)}
      mutators={{
        ...arrayMutators,
      }}
      render={fieldRenderProps => {
        const {
          rootClassName,
          className,
          formId,
          form: formApi,
          handleSubmit,
          inProgress,
          listingTitle,
          weekdays,
          useFullDays,
          useMultipleSeats,
          unitType,
          fetchErrors,
          values,
        } = fieldRenderProps;

        const classes = classNames(rootClassName || css.root, className);
        const submitInProgress = inProgress;

        const concatDayEntriesReducer = (entries, day) =>
          values[day] ? entries.concat(values[day]) : entries;
        const hasUnfinishedEntries = !!weekdays
          .reduce(concatDayEntriesReducer, [])
          .find(e => !e.startTime || !e.endTime);

        const { updateListingError } = fetchErrors || {};

        const submitDisabled = submitInProgress || hasUnfinishedEntries;

        // Full-day + one seat: only hidden time fields — hide the week block from layout (fields stay in DOM).
        const hideWeekInLayout = useFullDays && !useMultipleSeats;

        return (
          <Form id={formId} className={classes} onSubmit={handleSubmit}>
            <H3 as="h2" className={css.heading}>
              <FormattedMessage
                id="EditListingAvailabilityPlanForm.title"
                values={{ listingTitle }}
              />
            </H3>
            <Heading as="h3" rootClassName={css.subheading}>
              <FormattedMessage id="EditListingAvailabilityPlanForm.timezonePickerTitle" />
            </Heading>
            <div className={css.timezonePicker}>
              <FieldTimeZoneSelect
                id="timezone"
                name="timezone"
                currentTimeZone={values?.timezone}
                selectClassName={css.timeZoneSelect}
                rootClassName={css.timeZoneField}
              />
            </div>
            <Heading as="h3" rootClassName={css.subheading}>
              <FormattedMessage id="EditListingAvailabilityPlanForm.hoursOfOperationTitle" />
            </Heading>
            <div
              className={css.quickSelect}
              role="group"
              aria-label={intl.formatMessage({
                id: 'EditListingAvailabilityPlanForm.quickSelectAriaLabel',
              })}
            >
              <div className={css.quickSelectRow}>
                {weekdays.map(day => {
                  const isOn = isDayScheduled(day, values);
                  const dayTitle = intl.formatMessage({
                    id: `EditListingAvailabilityPlanForm.dayOfWeek.${day}`,
                  });
                  return (
                    <SecondaryButton
                      key={day}
                      type="button"
                      data-testid={`quick-select-day-${day}`}
                      className={classNames(css.quickSelectDayButton, {
                        [css.quickSelectDayButtonActive]: isOn,
                      })}
                      aria-pressed={isOn}
                      onClick={() => toggleDayInPlan(day, values, formApi, useFullDays)}
                      aria-label={
                        isOn
                          ? intl.formatMessage(
                              { id: 'EditListingAvailabilityPlanForm.toggleDayRemoveAriaLabel' },
                              { day: dayTitle }
                            )
                          : intl.formatMessage(
                              { id: 'EditListingAvailabilityPlanForm.toggleDayAddAriaLabel' },
                              { day: dayTitle }
                            )
                      }
                    >
                      {intl.formatDate(weekdayUtcDate(day), { weekday: 'short' })}
                    </SecondaryButton>
                  );
                })}
                <SecondaryButton
                  type="button"
                  className={css.quickSelectAllButton}
                  aria-pressed={weekdays.every(d => isDayScheduled(d, values))}
                  onClick={() => toggleAllDaysInPlan(weekdays, values, formApi, useFullDays)}
                >
                  {weekdays.every(d => isDayScheduled(d, values)) ? (
                    <FormattedMessage id="EditListingAvailabilityPlanForm.clearAllDays" />
                  ) : (
                    <FormattedMessage id="EditListingAvailabilityPlanForm.selectAllDays" />
                  )}
                </SecondaryButton>
              </div>
            </div>
            <div
              className={classNames(css.week, {
                [css.weekVisuallyHidden]: hideWeekInLayout,
              })}
              aria-hidden={hideWeekInLayout || undefined}
            >
              {weekdays
                .filter(w => {
                  const dayVals = values[w];
                  return dayVals && dayVals.length > 0 && dayVals[0];
                })
                .map(w => (
                  <AvailabilityPlanEntries
                    dayOfWeek={w}
                    useFullDays={useFullDays}
                    useMultipleSeats={useMultipleSeats}
                    unitType={unitType}
                    key={w}
                    values={values}
                    formApi={formApi}
                    intl={intl}
                  />
                ))}
            </div>

            <div className={css.submitButton}>
              {updateListingError ? (
                <p className={css.error}>
                  <FormattedMessage id="EditListingAvailabilityPlanForm.updateFailed" />
                </p>
              ) : null}
              <PrimaryButton type="submit" inProgress={submitInProgress} disabled={submitDisabled}>
                <FormattedMessage id="EditListingAvailabilityPlanForm.saveSchedule" />
              </PrimaryButton>
            </div>
          </Form>
        );
      }}
    />
  );
};

export default EditListingAvailabilityPlanForm;
