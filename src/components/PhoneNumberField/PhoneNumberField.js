import React, { useState } from 'react';
import { Field } from 'react-final-form';
import classNames from 'classnames';
import { ChevronDown } from 'lucide-react';

import { useIntl } from '../../util/reactIntl';
import getCountryCodes from '../../translations/countryCodes';
import countryDialCodes from '../../translations/countryDialCodes';

import formCss from '../../styles/lineupForm.module.css';
import css from './PhoneNumberField.module.css';

const DEFAULT_COUNTRY = 'NL';

const onlyDigits = str => (str || '').replace(/\D/g, '');

// Digits of the saved value ("+31612345678") without the dial code of the chosen country
const getNumberDigits = (value, country) => {
  const dial = countryDialCodes[country];
  if (value && value.startsWith(dial)) {
    return onlyDigits(value.slice(dial.length));
  }
  return onlyDigits(value);
};

// Country of a saved value: the longest dial code the value starts with
const getCountryOfValue = value => {
  if (!value || !value.startsWith('+')) {
    return DEFAULT_COUNTRY;
  }
  const matches = Object.keys(countryDialCodes)
    .filter(code => value.startsWith(countryDialCodes[code]))
    .sort((a, b) => countryDialCodes[b].length - countryDialCodes[a].length);
  const longest = matches[0] ? countryDialCodes[matches[0]].length : 0;
  const best = matches.filter(code => countryDialCodes[code].length === longest);
  return best.includes(DEFAULT_COUNTRY) ? DEFAULT_COUNTRY : best[0] || DEFAULT_COUNTRY;
};

const PhoneNumberFieldComponent = props => {
  const { className, id, label, input, meta } = props;
  const intl = useIntl();
  const [country, setCountry] = useState(() => getCountryOfValue(input.value));

  const dial = countryDialCodes[country];
  const digits = getNumberDigits(input.value, country);
  const showError = (meta.touched || meta.submitFailed) && !!meta.error;
  const errorClass = { [formCss.inputError]: showError };
  const countries = getCountryCodes(intl.locale);

  // Saved value stays empty until digits are typed, so the required validator works
  // and a leading 0 (national format, 0612...) is dropped because the dial code replaces it
  const save = (nextCountry, nextDigits) => {
    const national = nextDigits.replace(/^0+/, '');
    input.onChange(national ? `${countryDialCodes[nextCountry]}${national}` : '');
  };

  return (
    <fieldset className={classNames(formCss.field, className)}>
      <legend className={formCss.legend}>{label}</legend>
      <div className={css.row}>
        <div className={css.countryBox}>
          <div
            className={classNames(formCss.select, css.dialCode, errorClass)}
            aria-hidden="true"
          >
            {dial}
          </div>
          <select
            id={`${id}.country`}
            className={css.countrySelect}
            aria-label={label}
            value={country}
            onChange={e => {
              setCountry(e.target.value);
              save(e.target.value, digits);
            }}
            onBlur={input.onBlur}
          >
            {countries.map(c => (
              <option key={c.code} value={c.code}>
                {c.name} {countryDialCodes[c.code]}
              </option>
            ))}
          </select>
          <ChevronDown className={formCss.chevron} size={16} strokeWidth={2} absoluteStrokeWidth />
        </div>
        <input
          id={id}
          className={classNames(formCss.input, errorClass)}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          aria-label={label}
          aria-invalid={showError}
          value={digits}
          onChange={e => save(country, onlyDigits(e.target.value))}
          onBlur={input.onBlur}
          onFocus={input.onFocus}
        />
      </div>
      {showError ? <div className={formCss.error}>{meta.error}</div> : null}
    </fieldset>
  );
};

/**
 * Final Form field for a phone number with a country select. The closed select shows only the
 * dial code; the saved value is one string, "+" dial code and digits (for example "+31612345678").
 *
 * @component
 * @param {Object} props
 * @param {string?} props.className add more style rules to the fieldset
 * @param {string} props.name Name of the field in Final Form
 * @param {string} props.id id of the number input
 * @param {ReactNode} props.label legend of the field, also the accessible name of both controls
 * @param {Function?} props.validate Final Form validator
 * @returns {JSX.Element} Final Form Field containing the country select and number input
 */
const PhoneNumberField = props => <Field component={PhoneNumberFieldComponent} {...props} />;

export default PhoneNumberField;
