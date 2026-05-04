import React, { useState, useEffect, useRef } from 'react';
import loadable from '@loadable/component';
import classNames from 'classnames';
import { Field } from 'react-final-form';

import { useIntl } from '../../../../../util/reactIntl';

import { OutsideClickHandler, IconDate } from '../../../../../components';

import css from './FilterDateRange.module.css';

const DatePicker = loadable(() =>
  import(/* webpackChunkName: "SingleDatePickerDropdown" */ '../../../../../components/DatePicker/DatePickers/DatePicker')
);

const handleKeyDown = (isOpen, setIsOpen) => e => {
  const toggleButton = e.currentTarget.getElementsByClassName(css.toggleButton)[0];
  if ((e.target === toggleButton && e.key === 'Enter') || e.key === ' ') {
    e.preventDefault();
    setIsOpen(prevState => !prevState);
    return;
  } else if (!isOpen && e.key === 'ArrowDown') {
    e.preventDefault();
    setIsOpen(true);
    return;
  } else if (isOpen && e.key === 'Escape') {
    e.preventDefault();
    toggleButton.focus();
    setIsOpen(false);
    return;
  }
};
const FilterDateRange = props => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDates, setSelectedDates] = useState(null);
  const toggleButtonRef = useRef(null);
  const { className, rootClassName, config, alignLeft } = props;
  const intl = useIntl();

  useEffect(() => {
    if (DatePicker.preload) DatePicker.preload();
  }, []);

  const classes = classNames(rootClassName || css.root, className);

  const formatSingleDate = date =>
    intl.formatDate(date, {
      day: 'numeric',
      month: 'short',
    });

  const formatRangeLabel = (startDate, endDate) => {
    if (startDate && endDate) {
      return `${formatSingleDate(startDate)} – ${formatSingleDate(endDate)}`;
    }
    if (startDate) {
      return formatSingleDate(startDate);
    }
    return null;
  };

  const handleClick = event => {
    const el = event.currentTarget;
    const dropdownHeight = 350; // approximately
    const toBottom = window.innerHeight - el.getBoundingClientRect().bottom;
    // If there's not enough space under the toggle button, scroll down to make space for the dropdown.
    if (!isOpen && toBottom < dropdownHeight) {
      const topbarOffset = 72;
      const toTop = el.getBoundingClientRect().top - topbarOffset;
      const scrollDownNeed = dropdownHeight - toBottom;
      // Scroll page as little down as possible to get toggle button more space below it - or move it just under the topbar.
      // This mitigates browsers' own accessibility features that autoscrolls too much.
      const top = toTop < scrollDownNeed ? toTop : scrollDownNeed;
      window.scrollBy({ top });
    }
    setIsOpen(prevState => !prevState);
  };

  // Compute the CSS class for the label with an "active" modifier if there is a selection or if the picker is open.
  const labelClasses = classNames(css.label, {
    [css.active]: selectedDates || isOpen,
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isDayBlocked = day => {
    if (!(day instanceof Date) || isNaN(day)) return true;
    const d = new Date(day);
    d.setHours(0, 0, 0, 0);
    return d < today;
  };

  return (
    <OutsideClickHandler
      className={classes}
      onOutsideClick={() => setIsOpen(false)}
      onKeyDown={handleKeyDown(isOpen, setIsOpen)}
    >
      <div
        role="button"
        ref={toggleButtonRef}
        className={css.toggleButton}
        onClick={handleClick}
        tabIndex={0}
        aria-controls={isOpen ? 'dateRange' : ''}
        aria-expanded={isOpen}
      >
        <IconDate rootClassName={css.iconDate} />
        <span className={labelClasses}>
          {selectedDates
            ? selectedDates
            : intl.formatMessage({ id: 'PageBuilder.SearchCTA.dateFilterPlaceholder' })}
        </span>
      </div>
      {isOpen ? (
        <div
          className={classNames(css.datePicker, {
            [css.alignLeft]: alignLeft,
          })}
        >
          <Field
            name="dateRange"
            render={({ input }) => {
              // Keep SearchCTA value shape `{ startDate, endDate }` while using the DatePicker range UI.
              const startDate = input.value?.startDate || null;
              const endDate = input.value?.endDate || null;
              const value =
                startDate instanceof Date
                  ? endDate instanceof Date
                    ? [startDate, endDate]
                    : [startDate]
                  : null;

              const onChange = nextValue => {
                // DatePicker emits arrays in range mode: [] | [start] | [start, end]
                if (!Array.isArray(nextValue) || nextValue.length === 0) {
                  setSelectedDates(null);
                  input.onChange(null);
                  toggleButtonRef.current?.focus();
                  setIsOpen(false);
                  return;
                }

                const [nextStart, nextEnd] = nextValue;
                const cleanedStart =
                  nextStart instanceof Date && !isNaN(nextStart) ? nextStart : null;
                const cleanedEnd = nextEnd instanceof Date && !isNaN(nextEnd) ? nextEnd : null;

                setSelectedDates(formatRangeLabel(cleanedStart, cleanedEnd));
                input.onChange(cleanedStart ? { startDate: cleanedStart, endDate: cleanedEnd } : null);

                // Close when the range is complete, keep open after choosing only start date.
                if (cleanedStart && cleanedEnd) {
                  toggleButtonRef.current?.focus();
                  setIsOpen(false);
                }
              };

              return (
                <DatePicker
                  range={true}
                  value={value}
                  onChange={onChange}
                  isDayBlocked={isDayBlocked}
                  showClearButton
                  showMonthStepper
                  rangeStartHasValue={!!startDate}
                  rangeEndHasValue={!!endDate}
                  rootClassName={css.pickerRoot}
                />
              );
            }}
          />
        </div>
      ) : null}
    </OutsideClickHandler>
  );
};
export default FilterDateRange;
