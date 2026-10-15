import React, { useState } from 'react';
import { Field } from 'react-final-form';
import classNames from 'classnames';

import { useIntl } from '../../util/reactIntl';

import formCss from '../../styles/lineupForm.module.css';

const FieldPasswordInputComponent = props => {
  const { className, id, label, placeholder, input, meta, autoComplete, customErrorText } = props;
  const intl = useIntl();
  const [isShown, setIsShown] = useState(false);
  const { touched, invalid, error } = meta;
  const errorText = customErrorText || error;
  const hasError = !!customErrorText || !!(touched && invalid && error);
  const errorId = `${id}-error`;

  return (
    <div className={classNames(formCss.field, className)}>
      {label ? (
        <label className={formCss.label} htmlFor={id}>
          {label}
        </label>
      ) : null}
      <div
        className={classNames(formCss.inputWithUnit, { [formCss.inputWithUnitError]: hasError })}
      >
        <input
          {...input}
          id={id}
          type={isShown ? 'text' : 'password'}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={hasError || undefined}
          aria-describedby={hasError ? errorId : undefined}
        />
        <button
          type="button"
          className={formCss.inputToggle}
          aria-pressed={isShown}
          aria-controls={id}
          onClick={() => setIsShown(shown => !shown)}
        >
          {intl.formatMessage({ id: isShown ? 'FieldPasswordInput.hide' : 'FieldPasswordInput.show' })}
        </button>
      </div>
      {hasError ? (
        <div id={errorId} className={formCss.error}>
          {errorText}
        </div>
      ) : null}
    </div>
  );
};

/**
 * Password field: the library text input with a "Show" / "Hide" text button inside the box.
 * Final Form field with the same validation props as FieldTextInput (validate, customErrorText).
 * See the UI library (Password).
 *
 * @component
 * @param {Object} props
 * @param {string?} props.className
 * @param {string} props.id
 * @param {string} props.name
 * @param {ReactNode?} props.label
 * @param {string?} props.placeholder
 * @param {string?} props.autoComplete 'current-password' or 'new-password'
 * @param {ReactNode?} props.customErrorText error shown regardless of validation (server errors)
 * @param {Function?} props.validate Final Form validator
 * @returns {JSX.Element}
 */
const FieldPasswordInput = props => <Field component={FieldPasswordInputComponent} {...props} />;

export default FieldPasswordInput;
