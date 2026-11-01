import React, { useEffect } from 'react';
import { Form as FinalForm } from 'react-final-form';
import { Field } from 'react-final-form';
import arrayMutators from 'final-form-arrays';
import classNames from 'classnames';

import { FormattedMessage, useIntl } from '../../../util/reactIntl';
import { propTypes } from '../../../util/types';
import * as validators from '../../../util/validators';
import { getPropsForCustomUserFieldInputs } from '../../../util/userHelpers';

import {
  Form,
  PrimaryButton,
  FieldTextInput,
  FieldCheckbox,
  CustomExtendedDataField,
  ValidationError,
} from '../../../components';

import UserFieldDisplayName from '../UserFieldDisplayName';
import UserFieldPhoneNumber from '../UserFieldPhoneNumber';

import formCss from '../../../styles/lineupForm.module.css';
import buttonCss from '../../../styles/lineupButtons.module.css';
import css from './SignupForm.module.css';

const getSoleUserTypeMaybe = userTypes =>
  Array.isArray(userTypes) && userTypes.length === 1 ? userTypes[0].userType : null;

const isPasswordUsedMoreThanOnce = formValues => {
  const pw = formValues.password;
  const hasPasswordString = pw != null && pw.length >= validators.PASSWORD_MIN_LENGTH;

  if (hasPasswordString) {
    // Avoid matching against dedicated confirmation field(s).
    const { passwordConfirm, ...rest } = formValues || {};
    const isPasswordRepeated = Object.values(rest).filter(v => v === pw).length > 1;
    return isPasswordRepeated;
  }
  return false;
};

// Instagram: letters, numbers, periods and underscores, max 30, no leading, trailing or double period.
// SoundCloud: lowercase letters, numbers, underscores and hyphens (3–25 for new accounts; older
// profile URLs can be longer, so the upper limit is loose).
const INSTAGRAM_HANDLE = /^(?!\.)(?!.*\.\.)(?!.*\.$)[a-z0-9._]{1,30}$/;
const SOUNDCLOUD_HANDLE = /^[a-z0-9_-]{3,50}$/;

// Reduces a pasted profile URL or "@handle" to the bare handle, e.g.
// "https://www.instagram.com/dj.name/?hl=en" -> "dj.name"
export const extractSocialHandle = (value, domain) => {
  if (typeof value !== 'string') return value;
  let handle = value
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/^(www\.|m\.)/i, '');
  if (handle.toLowerCase().startsWith(`${domain}/`)) {
    handle = handle.slice(domain.length + 1);
  }
  return handle
    .replace(/^@/, '')
    .split(/[/?#\s]/)[0]
    .toLowerCase();
};

// Text input with the profile URL's domain shown in front of the handle
const FieldSocialHandle = props => {
  const { name, id, label, domain, validate, submitFailed } = props;
  return (
    <Field name={name} validate={validate}>
      {({ input, meta }) => {
        const hasError = !!(meta.touched || submitFailed) && !!meta.error;
        // Normalised on blur, not per keystroke, so a URL typed letter by letter is not cut short
        const onBlur = event => {
          input.onChange(extractSocialHandle(input.value, domain));
          input.onBlur(event);
        };
        return (
          <div className={formCss.field}>
            <label className={formCss.label} htmlFor={id}>
              {label}
            </label>
            <div
              className={classNames(formCss.inputWithUnit, css.socialHandle, {
                [formCss.inputWithUnitError]: hasError,
              })}
            >
              <span className={formCss.unit} aria-hidden="true">
                {domain}/
              </span>
              <input
                {...input}
                onBlur={onBlur}
                id={id}
                type="text"
                autoComplete="off"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
              />
            </div>
            {hasError ? (
              <ValidationError
                rootClassName={formCss.error}
                fieldMeta={{ touched: true, error: meta.error }}
              />
            ) : null}
          </div>
        );
      }}
    </Field>
  );
};

// Keeps the API-required first and last name in sync with the business name (event organizers)
// and the full name (DJs). Done in an effect: changing form state while rendering warns in React.
const NameSync = props => {
  const { formApi, values, isEventOrganizer, isDj } = props;
  const businessName = values?.businessName;
  const djFullName = values?.djFullName;
  const fname = values?.fname;
  const lname = values?.lname;

  useEffect(() => {
    if (isEventOrganizer && businessName && (fname !== businessName || lname !== businessName)) {
      formApi.change('fname', businessName);
      formApi.change('lname', businessName);
    }
    if (isDj && djFullName) {
      const trimmed = `${djFullName}`.trim().replace(/\s+/g, ' ');
      const [first, ...rest] = trimmed.split(' ').filter(Boolean);
      const last = rest.length > 0 ? rest.join(' ') : first;
      if (first && last && (fname !== first || lname !== last)) {
        formApi.change('fname', first);
        formApi.change('lname', last);
      }
    }
  }, [formApi, isEventOrganizer, isDj, businessName, djFullName, fname, lname]);

  return null;
};

const SignupFormComponent = props => (
  <FinalForm
    {...props}
    mutators={{ ...arrayMutators }}
    initialValues={{ userType: props.preselectedUserType || getSoleUserTypeMaybe(props.userTypes) }}
    render={formRenderProps => {
      const {
        rootClassName,
        className,
        formId,
        form: formApi,
        handleSubmit,
        inProgress,
        invalid,
        intl,
        termsAndConditions,
        preselectedUserType,
        userTypes,
        userFields,
        values,
        errors,
        touched,
        submitFailed,
      } = formRenderProps;

      const hasError = name => !!(touched?.[name] || submitFailed) && !!errors?.[name];
      // Shared field classes for every text input of this form
      const fieldProps = name => ({
        rootClassName: formCss.field,
        labelClassName: formCss.label,
        inputRootClass: classNames(formCss.input, { [formCss.inputError]: hasError(name) }),
      });

      const { userType } = values || {};

      // email
      const emailRequired = validators.required(
        intl.formatMessage({
          id: 'SignupForm.emailRequired',
        })
      );
      const emailValid = validators.emailFormatValid(
        intl.formatMessage({
          id: 'SignupForm.emailInvalid',
        })
      );

      // password
      const passwordRequiredMessage = intl.formatMessage({
        id: 'SignupForm.passwordRequired',
      });
      const passwordMinLengthMessage = intl.formatMessage(
        {
          id: 'SignupForm.passwordTooShort',
        },
        {
          minLength: validators.PASSWORD_MIN_LENGTH,
        }
      );
      const passwordMaxLengthMessage = intl.formatMessage(
        {
          id: 'SignupForm.passwordTooLong',
        },
        {
          maxLength: validators.PASSWORD_MAX_LENGTH,
        }
      );
      const passwordMinLength = validators.minLength(
        passwordMinLengthMessage,
        validators.PASSWORD_MIN_LENGTH
      );
      const passwordMaxLength = validators.maxLength(
        passwordMaxLengthMessage,
        validators.PASSWORD_MAX_LENGTH
      );
      const passwordRequired = validators.requiredStringNoTrim(passwordRequiredMessage);
      const passwordValidators = validators.composeValidators(
        passwordRequired,
        passwordMinLength,
        passwordMaxLength
      );

      // Custom user fields. Since user types are not supported here,
      // only fields with no user type id limitation are selected.
      const userFieldProps = getPropsForCustomUserFieldInputs(userFields, userType);

      const noUserTypes = !userType && !(userTypes?.length > 0);
      const userTypeConfig = userTypes.find(config => config.userType === userType);
      const showDefaultUserFields = userType || noUserTypes;
      const showCustomUserFields = (userType || noUserTypes) && userFieldProps?.length > 0;
      const showUserTypeSelector = !preselectedUserType && (userTypes?.length || 0) > 1;
      const showTermsAndConditions = showDefaultUserFields || showCustomUserFields;

      const getUserTypeOption = (configs, matcher) =>
        (configs || []).find(conf => matcher((conf?.label || '').toLowerCase()));
      const djUserType = getUserTypeOption(userTypes, l => l.includes('dj'));
      const eventOrganizerUserType = getUserTypeOption(
        userTypes,
        l => l.includes('event') || l.includes('organizer') || l.includes('organiser')
      );

      // Fallback to first two user types if labels don't match.
      const userTypeOptions = [
        eventOrganizerUserType || userTypes?.[0],
        djUserType || userTypes?.[1],
      ].filter(Boolean);
      const eventOrganizerType = userTypeOptions?.[0]?.userType;
      const isEventOrganizer = !!eventOrganizerType && userType === eventOrganizerType;
      const djType = userTypeOptions?.[1]?.userType;
      const isDj = !!djType && userType === djType;

      const classes = classNames(rootClassName || css.root, className);
      const submitInProgress = inProgress;
      const submitDisabled = invalid || submitInProgress || isPasswordUsedMoreThanOnce(values);

      const businessNameRequired = validators.required(
        intl.formatMessage({ id: 'SignupForm.businessNameRequired' })
      );
      const passwordConfirmRequired = validators.required(
        intl.formatMessage({ id: 'SignupForm.passwordConfirmRequired' })
      );
      const passwordConfirmMatches = value => {
        const pw = values?.password;
        return value === pw
          ? undefined
          : intl.formatMessage({ id: 'SignupForm.passwordConfirmDoesNotMatch' });
      };

      const fullNameRequired = validators.required(
        intl.formatMessage({ id: 'SignupForm.fullNameRequired' })
      );

      const authorizationConfirmationRequired = validators.required(
        intl.formatMessage({ id: 'SignupForm.authorizationConfirmationRequired' })
      );

      const artistNameRequired = validators.required(
        intl.formatMessage({ id: 'SignupForm.artistNameRequired' })
      );
      const handleFormatValid = (pattern, domain, message) => value =>
        !value || pattern.test(extractSocialHandle(value, domain)) ? undefined : message;
      const instagramValidators = validators.composeValidators(
        validators.required(intl.formatMessage({ id: 'SignupForm.instagramRequired' })),
        handleFormatValid(
          INSTAGRAM_HANDLE,
          'instagram.com',
          intl.formatMessage({ id: 'SignupForm.instagramInvalid' })
        )
      );
      const soundcloudValidators = validators.composeValidators(
        validators.required(intl.formatMessage({ id: 'SignupForm.soundcloudRequired' })),
        handleFormatValid(
          SOUNDCLOUD_HANDLE,
          'soundcloud.com',
          intl.formatMessage({ id: 'SignupForm.soundcloudInvalid' })
        )
      );
      const djFullNameRequired = validators.required(
        intl.formatMessage({ id: 'SignupForm.djFullNameRequired' })
      );
      const contactPersonFullNameRequired = validators.required(
        intl.formatMessage({ id: 'SignupForm.contactPersonFullNameRequired' })
      );

      return (
        <Form className={classes} onSubmit={handleSubmit}>
          <NameSync
            formApi={formApi}
            values={values}
            isEventOrganizer={isEventOrganizer}
            isDj={isDj}
          />
          {showUserTypeSelector ? (
            <div className={css.userTypeSelector}>
              <p className={formCss.label}>
                <FormattedMessage id="SignupForm.userTypePrompt" />
              </p>
              <div className={formCss.choiceTiles}>
                {userTypeOptions.map(opt => {
                  const type = opt.userType;
                  const isSelected = type === userType;
                  const buttonClasses = classNames(formCss.choiceTile, {
                    [formCss.choiceTileSelected]: isSelected,
                  });
                  const labelId =
                    opt === userTypeOptions[0]
                      ? 'SignupForm.userTypeOptionEventOrganizer'
                      : 'SignupForm.userTypeOptionDj';
                  return (
                    <button
                      key={type}
                      type="button"
                      className={buttonClasses}
                      aria-pressed={isSelected}
                      onClick={() => formApi.change('userType', type)}
                    >
                      <FormattedMessage id={labelId} />
                    </button>
                  );
                })}
              </div>

              {/* Keep userType in form state for submit */}
              <Field name="userType" type="hidden">
                {fieldRenderProps => <input {...fieldRenderProps.input} />}
              </Field>
            </div>
          ) : (
            <Field name="userType" type="hidden">
              {fieldRenderProps => <input {...fieldRenderProps.input} />}
            </Field>
          )}

          {showDefaultUserFields ? (
            <div className={css.defaultUserFields}>
              {isEventOrganizer ? (
                <>
                  <FieldTextInput
                    {...fieldProps('businessName')}
                    type="text"
                    id={formId ? `${formId}.businessName` : 'businessName'}
                    name="businessName"
                    autoComplete="organization"
                    label={intl.formatMessage({ id: 'SignupForm.businessNameLabel' })}
                    placeholder={intl.formatMessage({ id: 'SignupForm.businessNamePlaceholder' })}
                    validate={businessNameRequired}
                  />

                  <FieldTextInput
                    {...fieldProps('contactPersonFullName')}
                    type="text"
                    id={formId ? `${formId}.contactPersonFullName` : 'contactPersonFullName'}
                    name="contactPersonFullName"
                    autoComplete="name"
                    label={intl.formatMessage({ id: 'SignupForm.contactPersonFullNameLabel' })}
                    placeholder={intl.formatMessage({
                      id: 'SignupForm.contactPersonFullNamePlaceholder',
                    })}
                    validate={contactPersonFullNameRequired}
                  />

                  <FieldTextInput
                    {...fieldProps('email')}
                    type="email"
                    id={formId ? `${formId}.email` : 'email'}
                    name="email"
                    autoComplete="email"
                    label={intl.formatMessage({ id: 'SignupForm.businessEmailLabel' })}
                    placeholder={intl.formatMessage({ id: 'SignupForm.businessEmailPlaceholder' })}
                    validate={validators.composeValidators(emailRequired, emailValid)}
                  />

                  <UserFieldPhoneNumber
                    formName="SignupForm"
                    className={css.row}
                    userTypeConfig={userTypeConfig}
                    intl={intl}
                  />

                  <FieldTextInput
                    {...fieldProps('password')}
                    type="password"
                    id={formId ? `${formId}.password` : 'password'}
                    name="password"
                    autoComplete="new-password"
                    label={intl.formatMessage({
                      id: 'SignupForm.passwordLabel',
                    })}
                    placeholder={intl.formatMessage({
                      id: 'SignupForm.passwordPlaceholder',
                    })}
                    validate={passwordValidators}
                  />

                  <FieldTextInput
                    {...fieldProps('passwordConfirm')}
                    type="password"
                    id={formId ? `${formId}.passwordConfirm` : 'passwordConfirm'}
                    name="passwordConfirm"
                    autoComplete="new-password"
                    label={intl.formatMessage({ id: 'SignupForm.passwordConfirmLabel' })}
                    placeholder={intl.formatMessage({
                      id: 'SignupForm.passwordConfirmPlaceholder',
                    })}
                    validate={validators.composeValidators(
                      passwordConfirmRequired,
                      passwordConfirmMatches
                    )}
                  />

                  {/* Hidden first/last name to satisfy submit mapping */}
                  <Field name="fname" type="hidden">
                    {fieldRenderProps => <input {...fieldRenderProps.input} />}
                  </Field>
                  <Field name="lname" type="hidden">
                    {fieldRenderProps => <input {...fieldRenderProps.input} />}
                  </Field>
                </>
              ) : isDj ? (
                <>
                  <FieldTextInput
                    {...fieldProps('artistName')}
                    type="text"
                    id={formId ? `${formId}.artistName` : 'artistName'}
                    name="artistName"
                    autoComplete="nickname"
                    label={intl.formatMessage({ id: 'SignupForm.artistNameLabel' })}
                    placeholder={intl.formatMessage({ id: 'SignupForm.artistNamePlaceholder' })}
                    validate={artistNameRequired}
                  />

                  <FieldSocialHandle
                    name="instagram"
                    id={formId ? `${formId}.instagram` : 'instagram'}
                    label={intl.formatMessage({ id: 'SignupForm.instagramLabel' })}
                    domain="instagram.com"
                    validate={instagramValidators}
                    submitFailed={submitFailed}
                  />

                  <FieldSocialHandle
                    name="soundcloud"
                    id={formId ? `${formId}.soundcloud` : 'soundcloud'}
                    label={intl.formatMessage({ id: 'SignupForm.soundcloudLabel' })}
                    domain="soundcloud.com"
                    validate={soundcloudValidators}
                    submitFailed={submitFailed}
                  />

                  <FieldTextInput
                    {...fieldProps('djFullName')}
                    type="text"
                    id={formId ? `${formId}.djFullName` : 'djFullName'}
                    name="djFullName"
                    autoComplete="name"
                    label={intl.formatMessage({ id: 'SignupForm.djFullNameLabel' })}
                    placeholder={intl.formatMessage({ id: 'SignupForm.djFullNamePlaceholder' })}
                    validate={djFullNameRequired}
                  />

                  <FieldTextInput
                    {...fieldProps('email')}
                    type="email"
                    id={formId ? `${formId}.email` : 'email'}
                    name="email"
                    autoComplete="email"
                    label={intl.formatMessage({
                      id: 'SignupForm.emailLabel',
                    })}
                    placeholder={intl.formatMessage({
                      id: 'SignupForm.emailPlaceholder',
                    })}
                    validate={validators.composeValidators(emailRequired, emailValid)}
                  />

                  <UserFieldPhoneNumber
                    formName="SignupForm"
                    className={css.row}
                    userTypeConfig={userTypeConfig}
                    intl={intl}
                  />

                  <FieldTextInput
                    {...fieldProps('password')}
                    type="password"
                    id={formId ? `${formId}.password` : 'password'}
                    name="password"
                    autoComplete="new-password"
                    label={intl.formatMessage({
                      id: 'SignupForm.passwordLabel',
                    })}
                    placeholder={intl.formatMessage({
                      id: 'SignupForm.passwordPlaceholder',
                    })}
                    validate={passwordValidators}
                  />

                  <FieldTextInput
                    {...fieldProps('passwordConfirm')}
                    type="password"
                    id={formId ? `${formId}.passwordConfirm` : 'passwordConfirm'}
                    name="passwordConfirm"
                    autoComplete="new-password"
                    label={intl.formatMessage({ id: 'SignupForm.passwordConfirmLabel' })}
                    placeholder={intl.formatMessage({
                      id: 'SignupForm.passwordConfirmPlaceholder',
                    })}
                    validate={validators.composeValidators(
                      passwordConfirmRequired,
                      passwordConfirmMatches
                    )}
                  />

                  {/* Hidden first/last name to satisfy submit mapping */}
                  <Field name="fname" type="hidden">
                    {fieldRenderProps => <input {...fieldRenderProps.input} />}
                  </Field>
                  <Field name="lname" type="hidden">
                    {fieldRenderProps => <input {...fieldRenderProps.input} />}
                  </Field>
                </>
              ) : (
                <>
                  <FieldTextInput
                    {...fieldProps('email')}
                    type="email"
                    id={formId ? `${formId}.email` : 'email'}
                    name="email"
                    autoComplete="email"
                    label={intl.formatMessage({
                      id: 'SignupForm.emailLabel',
                    })}
                    placeholder={intl.formatMessage({
                      id: 'SignupForm.emailPlaceholder',
                    })}
                    validate={validators.composeValidators(emailRequired, emailValid)}
                  />
                  <div className={css.name}>
                    <FieldTextInput
                      {...fieldProps('fname')}
                      type="text"
                      id={formId ? `${formId}.fname` : 'fname'}
                      name="fname"
                      autoComplete="given-name"
                      label={intl.formatMessage({
                        id: 'SignupForm.firstNameLabel',
                      })}
                      placeholder={intl.formatMessage({
                        id: 'SignupForm.firstNamePlaceholder',
                      })}
                      validate={validators.required(
                        intl.formatMessage({
                          id: 'SignupForm.firstNameRequired',
                        })
                      )}
                    />
                    <FieldTextInput
                      {...fieldProps('lname')}
                      type="text"
                      id={formId ? `${formId}.lname` : 'lname'}
                      name="lname"
                      autoComplete="family-name"
                      label={intl.formatMessage({
                        id: 'SignupForm.lastNameLabel',
                      })}
                      placeholder={intl.formatMessage({
                        id: 'SignupForm.lastNamePlaceholder',
                      })}
                      validate={validators.required(
                        intl.formatMessage({
                          id: 'SignupForm.lastNameRequired',
                        })
                      )}
                    />
                  </div>

                  <UserFieldDisplayName
                    formName="SignupForm"
                    fieldProps={fieldProps('displayName')}
                    className={css.row}
                    userTypeConfig={userTypeConfig}
                    intl={intl}
                  />

                  <FieldTextInput
                    {...fieldProps('password')}
                    type="password"
                    id={formId ? `${formId}.password` : 'password'}
                    name="password"
                    autoComplete="new-password"
                    label={intl.formatMessage({
                      id: 'SignupForm.passwordLabel',
                    })}
                    placeholder={intl.formatMessage({
                      id: 'SignupForm.passwordPlaceholder',
                    })}
                    validate={passwordValidators}
                  />

                  <UserFieldPhoneNumber
                    formName="SignupForm"
                    className={css.row}
                    userTypeConfig={userTypeConfig}
                    intl={intl}
                  />
                </>
              )}
            </div>
          ) : null}

          {showCustomUserFields ? (
            <div className={css.customFields}>
              {userFieldProps.map(({ key, ...fieldProps }) => (
                <CustomExtendedDataField key={key} {...fieldProps} formId={formId} />
              ))}
            </div>
          ) : null}

          <div className={css.bottomWrapper}>
            <div className={css.consent}>
              {showTermsAndConditions ? (
                <div className={css.confirmationRow}>
                  <FieldCheckbox
                    id={
                      formId ? `${formId}.authorizationConfirmation` : 'authorizationConfirmation'
                    }
                    name="authorizationConfirmation"
                    label={intl.formatMessage({ id: 'SignupForm.authorizationConfirmationLabel' })}
                    value="confirmed"
                    validate={authorizationConfirmationRequired}
                    className={classNames(formCss.consentTile, {
                      [formCss.consentTileError]: hasError('authorizationConfirmation'),
                    })}
                    textClassName={formCss.consentText}
                  />
                </div>
              ) : null}
              {showTermsAndConditions ? (
                <div className={css.termsRow}>{termsAndConditions}</div>
              ) : null}
            </div>
            {isPasswordUsedMoreThanOnce(values) ? (
              <div className={formCss.error}>
                <FormattedMessage id="SignupForm.passwordRepeatedOnOtherFields" />
              </div>
            ) : null}
            <PrimaryButton
              type="submit"
              rootClassName={buttonCss.primary}
              className={css.submitButton}
              inProgress={submitInProgress}
              disabled={submitDisabled}
            >
              <FormattedMessage id="SignupForm.signUp" />
            </PrimaryButton>
          </div>
        </Form>
      );
    }}
  />
);

/**
 * A component that renders the signup form.
 *
 * @component
 * @param {Object} props
 * @param {string} props.rootClassName - The root class name that overrides the default class css.root
 * @param {string} props.className - The class that extends the root class
 * @param {string} props.formId - The form id
 * @param {boolean} props.inProgress - Whether the form is in progress
 * @param {ReactNode} props.termsAndConditions - The terms and conditions
 * @param {string} props.preselectedUserType - The preselected user type
 * @param {propTypes.userTypes} props.userTypes - The user types
 * @param {propTypes.listingFields} props.userFields - The user fields
 * @returns {JSX.Element}
 */
const SignupForm = props => {
  const intl = useIntl();
  return <SignupFormComponent {...props} intl={intl} />;
};

export default SignupForm;
