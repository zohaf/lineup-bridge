import React from 'react';
import classNames from 'classnames';
import { FieldArray } from 'react-final-form-arrays';
import { Field } from 'react-final-form';
import { Check } from 'lucide-react';

import formCss from '../../styles/lineupForm.module.css';
import css from './CheckboxTileGroup.module.css';

const CheckboxTilesRenderer = props => {
  const { className, label, hideLabel, id, fields, options, meta } = props;
  const { touched, submitFailed, error } = meta;
  const hasError = (touched || submitFailed) && !!error;

  return (
    <fieldset className={classNames(formCss.field, className)}>
      {label ? (
        <legend className={hideLabel ? formCss.visuallyHidden : formCss.legend}>{label}</legend>
      ) : null}
      <ul className={css.list}>
        {options.map(option => {
          const fieldId = `${id}.${option.key}`;
          return (
            <li key={fieldId}>
              <label
                htmlFor={fieldId}
                className={classNames(css.tile, { [css.tileError]: hasError })}
              >
                <span className={css.box}>
                  <Field
                    id={fieldId}
                    name={fields.name}
                    component="input"
                    type="checkbox"
                    value={option.key}
                    className={css.checkbox}
                  />
                  <Check className={css.tick} size={14} strokeWidth={2} absoluteStrokeWidth />
                </span>
                <span className={css.text}>{option.label}</span>
              </label>
            </li>
          );
        })}
      </ul>
      {hasError ? <div className={formCss.error}>{error}</div> : null}
    </fieldset>
  );
};

/**
 * Final Form checkbox group drawn as tiles. Same props and validation as FieldCheckboxGroup.
 *
 * @component
 * @param {Object} props
 * @param {string?} props.className add more style rules to the fieldset
 * @param {string} props.name Name of the array field in Final Form
 * @param {string} props.id
 * @param {ReactNode?} props.label group label, rendered as a legend
 * @param {boolean?} props.hideLabel keep the legend for screen readers only (the card title says it)
 * @param {Array<{key: string, label: ReactNode}>} props.options
 * @param {Function?} props.validate Final Form validator for the array
 * @returns {JSX.Element} Final Form FieldArray with checkbox tiles
 */
const CheckboxTileGroup = props => <FieldArray component={CheckboxTilesRenderer} {...props} />;

export default CheckboxTileGroup;
