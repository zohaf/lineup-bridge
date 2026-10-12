import React from 'react';
import classNames from 'classnames';
import { ChevronDown, ChevronsUpDown } from 'lucide-react';

import formCss from '../../styles/lineupForm.module.css';
import css from './TimeSelect.module.css';

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = ['00', '30'];
const DURATION_HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1));

const DEFAULT_MINUTE = '00';

const splitTime = value => {
  if (!value || typeof value !== 'string') return { h: '', m: '' };
  const [h, m] = value.split(':');
  return { h: h || '', m: m || '' };
};

const joinTime = (h, m, defaultHour, allowEmpty) => {
  if (allowEmpty && !h) return '';
  return `${h || defaultHour}:${m || DEFAULT_MINUTE}`;
};

/**
 * Hour and minute selects for a time of day (value "HH:MM"), or, with variant="duration",
 * a select for whole hours with the unit inside the box.
 *
 * @component
 * @param {Object} props
 * @param {Object} props.input Final Form field input
 * @param {Object} props.meta Final Form field meta
 * @param {Function} props.fid builds the element id from a name
 * @param {string} props.name field name, used for the element ids
 * @param {ReactNode} props.label legend for the pair
 * @param {string?} props.defaultHour hour shown when the value is empty (time variant)
 * @param {boolean?} props.allowEmpty time variant: leave the hour empty until chosen
 * @param {'time'|'duration'} [props.variant]
 * @param {string?} props.placeholder duration variant: text of the empty option
 * @param {ReactNode?} props.unit duration variant: unit text inside the box
 * @param {string?} props.hourPlaceholder time variant with allowEmpty: text of the empty hour option
 * @returns {JSX.Element} time select
 */
const TimeSelect = props => {
  const {
    className,
    input,
    meta,
    fid,
    name,
    label,
    defaultHour,
    allowEmpty = false,
    variant = 'time',
    placeholder,
    unit,
    hourPlaceholder,
  } = props;

  const showError = (meta.touched || meta.submitFailed) && !!meta.error;
  const selectClasses = classNames(formCss.select, { [formCss.inputError]: showError });
  const errorMessage = showError ? <div className={formCss.error}>{meta.error}</div> : null;

  if (variant === 'duration') {
    const hoursId = fid(name);
    const value = input.value == null ? '' : String(input.value);
    return (
      <fieldset className={classNames(formCss.field, className)}>
        <legend className={formCss.legend}>{label}</legend>
        <div className={css.unitBox}>
          <select
            id={hoursId}
            className={classNames(selectClasses, css.unitSelect, {
              [formCss.selectEmpty]: value === '',
            })}
            value={value}
            onChange={e => input.onChange(e.target.value)}
            onBlur={input.onBlur}
          >
            {placeholder ? (
              <option value="" disabled>
                {placeholder}
              </option>
            ) : null}
            {DURATION_HOURS.map(v => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
          <ChevronsUpDown
            className={formCss.chevron}
            size={16}
            strokeWidth={2}
            absoluteStrokeWidth
          />
          {unit ? (
            <span className={formCss.unit} aria-hidden="true">
              {unit}
            </span>
          ) : null}
        </div>
        {errorMessage}
      </fieldset>
    );
  }

  const { h, m } = splitTime(input.value);
  const hour = allowEmpty ? h : h || defaultHour;
  const minute = m || DEFAULT_MINUTE;
  const hourId = fid(`${name}H`);
  const minuteId = fid(`${name}M`);

  return (
    <fieldset className={classNames(formCss.field, className)}>
      <legend className={formCss.legend}>{label}</legend>
      <div className={css.pair}>
        <div className={formCss.selectBox}>
          <select
            id={hourId}
            className={selectClasses}
            value={allowEmpty ? h : hour}
            onChange={e =>
              input.onChange(joinTime(e.target.value, minute, defaultHour, allowEmpty))
            }
            onBlur={input.onBlur}
          >
            {allowEmpty ? (
              <option value="" disabled>
                {hourPlaceholder}
              </option>
            ) : null}
            {HOURS.map(v => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
          <ChevronsUpDown
            className={formCss.chevron}
            size={16}
            strokeWidth={2}
            absoluteStrokeWidth
          />
        </div>
        <span className={css.separator} aria-hidden="true">
          :
        </span>
        <div className={formCss.selectBox}>
          <select
            id={minuteId}
            className={selectClasses}
            value={minute}
            onChange={e => input.onChange(joinTime(hour, e.target.value, defaultHour, allowEmpty))}
            onBlur={input.onBlur}
          >
            {MINUTES.map(v => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
          <ChevronDown className={formCss.chevron} size={16} strokeWidth={2} absoluteStrokeWidth />
        </div>
      </div>
      {errorMessage}
    </fieldset>
  );
};

export default TimeSelect;
