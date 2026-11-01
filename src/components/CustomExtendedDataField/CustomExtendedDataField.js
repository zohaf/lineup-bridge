import React from 'react';
import classNames from 'classnames';
import { useField } from 'react-final-form';

// Import config and utils
import { useIntl } from '../../util/reactIntl';
import {
  SCHEMA_TYPE_ENUM,
  SCHEMA_TYPE_MULTI_ENUM,
  SCHEMA_TYPE_TEXT,
  SCHEMA_TYPE_LONG,
  SCHEMA_TYPE_BOOLEAN,
  SCHEMA_TYPE_YOUTUBE,
} from '../../util/types';
import {
  required,
  nonEmptyArray,
  validateInteger,
  validateYoutubeURL,
} from '../../util/validators';
// Import shared components
import {
  FieldCheckboxGroup,
  FieldSelect,
  FieldTextInput,
  FieldBoolean,
  CheckboxTileGroup,
} from '../../components';

import formCss from '../../styles/lineupForm.module.css';
// Import modules from this directory
import css from './CustomExtendedDataField.module.css';

const createFilterOptions = options => options.map(o => ({ key: `${o.option}`, label: o.label }));

const getLabel = fieldConfig => fieldConfig?.saveConfig?.label || fieldConfig?.label;

// Library look (lineupStyle): a trailing "(optional)" in a config label is shown in the muted style
const OPTIONAL_SUFFIX = /^(.*\S)\s+(\(optional\))$/;
const getLineupLabel = fieldConfig => {
  const label = getLabel(fieldConfig);
  const match = typeof label === 'string' ? label.match(OPTIONAL_SUFFIX) : null;
  return match ? (
    <>
      {match[1]} <span className={formCss.optional}>{match[2]}</span>
    </>
  ) : (
    label
  );
};

// FieldTextInput in the library look: label, box and error classes. The error look on the box needs
// the field's meta, which FieldTextInput does not pass out when inputRootClass is given.
const LineupTextInput = props => {
  const { name, type } = props;
  const { meta } = useField(name, { subscription: { touched: true, invalid: true } });
  const hasError = meta.touched && meta.invalid;
  const boxClass = type === 'textarea' ? formCss.textarea : formCss.input;
  return (
    <FieldTextInput
      {...props}
      rootClassName={formCss.field}
      labelClassName={formCss.label}
      inputRootClass={classNames(boxClass, { [formCss.inputError]: hasError })}
    />
  );
};

const TextInput = props => {
  const { lineupStyle, ...rest } = props;
  return lineupStyle ? <LineupTextInput {...rest} /> : <FieldTextInput {...rest} />;
};

const CustomFieldEnum = props => {
  const { name, fieldConfig, defaultRequiredMessage, formId, intl } = props;
  const { enumOptions = [], saveConfig } = fieldConfig || {};
  const { placeholderMessage, isRequired, requiredMessage } = saveConfig || {};
  const validateMaybe = isRequired
    ? { validate: required(requiredMessage || defaultRequiredMessage) }
    : {};
  const placeholder =
    placeholderMessage ||
    intl.formatMessage({ id: 'CustomExtendedDataField.placeholderSingleSelect' });
  const filterOptions = createFilterOptions(enumOptions);

  const label = getLabel(fieldConfig);

  return filterOptions ? (
    <FieldSelect
      className={css.customField}
      name={name}
      id={formId ? `${formId}.${name}` : name}
      label={label}
      helpText={fieldConfig?.helpText}
      {...validateMaybe}
    >
      <option disabled value="">
        {placeholder}
      </option>
      {filterOptions.map(optionConfig => {
        const key = optionConfig.key;
        return (
          <option key={key} value={key}>
            {optionConfig.label}
          </option>
        );
      })}
    </FieldSelect>
  ) : null;
};

const CustomFieldMultiEnum = props => {
  const { name, fieldConfig, defaultRequiredMessage, formId, lineupStyle, hideLabel } = props;
  const { enumOptions = [], saveConfig, key: fieldKey } = fieldConfig || {};
  const { isRequired, requiredMessage } = saveConfig || {};
  const label = getLabel(fieldConfig);
  const validateMaybe = isRequired
    ? { validate: nonEmptyArray(requiredMessage || defaultRequiredMessage) }
    : {};
  const isGenre = fieldKey === 'genre';

  if (enumOptions && lineupStyle) {
    return (
      <CheckboxTileGroup
        id={formId ? `${formId}.${name}` : name}
        name={name}
        label={label}
        hideLabel={hideLabel}
        options={createFilterOptions(enumOptions)}
        {...validateMaybe}
      />
    );
  }

  return enumOptions ? (
    <FieldCheckboxGroup
      className={classNames(css.customField, isGenre && css.genreField)}
      id={formId ? `${formId}.${name}` : name}
      name={name}
      label={label}
      helpText={fieldConfig?.helpText}
      options={createFilterOptions(enumOptions)}
      threeColumns={isGenre}
      checkboxVariant={isGenre ? 'minimal' : 'default'}
      {...validateMaybe}
    />
  ) : null;
};

const CustomFieldText = props => {
  const { name, fieldConfig, defaultRequiredMessage, formId, intl, lineupStyle } = props;
  const { placeholderMessage, isRequired, requiredMessage, multiline = true } =
    fieldConfig?.saveConfig || {};
  const label = lineupStyle ? getLineupLabel(fieldConfig) : getLabel(fieldConfig);
  const validateMaybe = isRequired
    ? { validate: required(requiredMessage || defaultRequiredMessage) }
    : {};
  const placeholder =
    placeholderMessage || intl.formatMessage({ id: 'CustomExtendedDataField.placeholderText' });

  return (
    <TextInput
      lineupStyle={lineupStyle}
      className={lineupStyle ? null : css.customField}
      id={formId ? `${formId}.${name}` : name}
      name={name}
      type={multiline ? 'textarea' : 'text'}
      label={label}
      helpText={fieldConfig?.helpText}
      placeholder={placeholder}
      {...validateMaybe}
    />
  );
};

const CustomFieldLong = props => {
  const { name, fieldConfig, defaultRequiredMessage, formId, intl, lineupStyle } = props;
  const { minimum, maximum, saveConfig } = fieldConfig;
  const { placeholderMessage, isRequired, requiredMessage } = saveConfig || {};
  const label = lineupStyle ? getLineupLabel(fieldConfig) : getLabel(fieldConfig);
  const placeholder =
    placeholderMessage || intl.formatMessage({ id: 'CustomExtendedDataField.placeholderLong' });
  const numberTooSmallMessage = intl.formatMessage(
    { id: 'CustomExtendedDataField.numberTooSmall' },
    { min: minimum }
  );
  const numberTooBigMessage = intl.formatMessage(
    { id: 'CustomExtendedDataField.numberTooBig' },
    { max: maximum }
  );

  // Field with schema type 'long' will always be validated against min & max
  const validate = (value, min, max) => {
    const requiredMsg = requiredMessage || defaultRequiredMessage;
    return isRequired && value == null
      ? requiredMsg
      : validateInteger(value, max, min, numberTooSmallMessage, numberTooBigMessage);
  };

  return (
    <TextInput
      lineupStyle={lineupStyle}
      className={lineupStyle ? null : css.customField}
      id={formId ? `${formId}.${name}` : name}
      name={name}
      type="number"
      step="1"
      helpText={fieldConfig?.helpText}
      parse={value => {
        const parsed = Number.parseInt(value, 10);
        return Number.isNaN(parsed) ? null : parsed;
      }}
      label={label}
      placeholder={placeholder}
      validate={value => validate(value, minimum, maximum)}
      onWheel={e => {
        // fix: number input should not change value on scroll
        if (e.target === document.activeElement) {
          // Prevent the input value change, because we prefer page scrolling
          e.target.blur();

          // Refocus immediately, on the next tick (after the current function is done)
          setTimeout(() => {
            e.target.focus();
          }, 0);
        }
      }}
    />
  );
};

const CustomFieldBoolean = props => {
  const { name, fieldConfig, defaultRequiredMessage, formId, intl } = props;
  const { placeholderMessage, isRequired, requiredMessage } = fieldConfig?.saveConfig || {};
  const label = getLabel(fieldConfig);
  const validateMaybe = isRequired
    ? { validate: required(requiredMessage || defaultRequiredMessage) }
    : {};
  const placeholder =
    placeholderMessage || intl.formatMessage({ id: 'CustomExtendedDataField.placeholderBoolean' });

  return (
    <FieldBoolean
      className={css.customField}
      id={formId ? `${formId}.${name}` : name}
      name={name}
      label={label}
      helpText={fieldConfig?.helpText}
      placeholder={placeholder}
      {...validateMaybe}
    />
  );
};

const CustomFieldYoutube = props => {
  const { name, fieldConfig, defaultRequiredMessage, formId, intl, lineupStyle } = props;
  const { placeholderMessage, isRequired, requiredMessage } = fieldConfig?.saveConfig || {};
  const label = lineupStyle ? getLineupLabel(fieldConfig) : getLabel(fieldConfig);
  const placeholder =
    placeholderMessage ||
    intl.formatMessage({ id: 'CustomExtendedDataField.placeholderYoutubeVideoURL' });

  const notValidUrlMessage = intl.formatMessage({
    id: 'CustomExtendedDataField.notValidYoutubeVideoURL',
  });

  const validate = value => {
    const requiredMsg = requiredMessage || defaultRequiredMessage;
    return isRequired && value == null
      ? requiredMsg
      : validateYoutubeURL(value, notValidUrlMessage);
  };

  return (
    <TextInput
      lineupStyle={lineupStyle}
      className={lineupStyle ? null : css.customField}
      id={formId ? `${formId}.${name}` : name}
      name={name}
      type="text"
      label={label}
      helpText={fieldConfig?.helpText}
      placeholder={placeholder}
      validate={value => validate(value)}
    />
  );
};

/**
 * Return Final Form field for each configuration according to schema type.
 *
 * These custom extended data fields are for generating input fields from configuration defined
 * in marketplace-custom-config.js. Other panels in EditListingWizard might add more extended data
 * fields (e.g. shipping fee), but these are independently customizable.
 *
 * @param {Object} props should contain fieldConfig that defines schemaType, enumOptions?, and
 * saveConfig for the field.
 * @param {boolean?} props.lineupStyle opt-in library look (docs/4-design-system/rules.md): text, number and
 *   YouTube fields use the shared form classes, multi-enum fields use CheckboxTileGroup. Enum and
 *   boolean fields keep the template look. Without it every field renders exactly as before.
 * @param {boolean?} props.hideLabel with lineupStyle, multi-enum only: the legend is kept for screen
 *   readers only (when a card title already says it)
 */
const CustomExtendedDataField = props => {
  const intl = useIntl();
  const { enumOptions = [], schemaType } = props?.fieldConfig || {};
  const defaultRequiredMessage = intl.formatMessage({
    id: 'CustomExtendedDataField.required',
  });
  const renderFieldComponent = (FieldComponent, props) => (
    <FieldComponent {...props} defaultRequiredMessage={defaultRequiredMessage} intl={intl} />
  );

  return schemaType === SCHEMA_TYPE_ENUM && enumOptions
    ? renderFieldComponent(CustomFieldEnum, props)
    : schemaType === SCHEMA_TYPE_MULTI_ENUM && enumOptions
    ? renderFieldComponent(CustomFieldMultiEnum, props)
    : schemaType === SCHEMA_TYPE_TEXT
    ? renderFieldComponent(CustomFieldText, props)
    : schemaType === SCHEMA_TYPE_LONG
    ? renderFieldComponent(CustomFieldLong, props)
    : schemaType === SCHEMA_TYPE_BOOLEAN
    ? renderFieldComponent(CustomFieldBoolean, props)
    : schemaType === SCHEMA_TYPE_YOUTUBE
    ? renderFieldComponent(CustomFieldYoutube, props)
    : null;
};

export default CustomExtendedDataField;
