import React from 'react';
import { Field } from 'react-final-form';
import classNames from 'classnames';
import { ChevronDown, ChevronsUpDown } from 'lucide-react';

import { ValidationError, HelpText } from '../../components';

import formCss from '../../styles/lineupForm.module.css';

const SelectFieldComponent = props => {
  const {
    rootClassName,
    className,
    selectClassName,
    labelClassName,
    id,
    label,
    helpText,
    input,
    meta,
    children,
    longList,
    ...rest
  } = props;

  if (label && !id) {
    throw new Error('id required when a label is given');
  }

  const Chevron = longList ? ChevronsUpDown : ChevronDown;

  return (
    <div className={classNames(rootClassName, className)}>
      {label ? (
        <label htmlFor={id} className={labelClassName}>
          {label}
        </label>
      ) : null}
      <div className={formCss.selectBox}>
        <select className={selectClassName} id={id} {...input} {...rest}>
          {children}
        </select>
        <Chevron className={formCss.chevron} size={16} strokeWidth={2} absoluteStrokeWidth />
      </div>
      <HelpText helpText={helpText} />
      <ValidationError rootClassName={formCss.error} fieldMeta={meta} />
    </div>
  );
};

/**
 * Final Form Field wrapping a <select> with a lucide-react chevron. Same props as `FieldSelect`.
 * Used where the LineupBridge select style applies (see lineupForm.module.css).
 *
 * @component
 * @param {Object} props
 * @param {string?} props.className add more style rules in addition to rootClassName
 * @param {string?} props.rootClassName class for the field wrapper
 * @param {string?} props.selectClassName class for the <select>
 * @param {string?} props.labelClassName class for the <label>
 * @param {string} props.name Name of the input in Final Form
 * @param {string} props.id required if a label is given
 * @param {ReactNode} props.label
 * @param {ReactNode} props.helpText
 * @param {boolean?} props.longList many options: show up/down chevrons instead of one chevron down
 * @param {ReactNode} props.children <option> elements
 * @returns {JSX.Element} Final Form Field containing <select> input
 */
const SelectField = props => {
  return <Field component={SelectFieldComponent} {...props} />;
};

export default SelectField;
