import React from 'react';
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
} from '../../../components';

import UserFieldDisplayName from '../UserFieldDisplayName';
import UserFieldPhoneNumber from '../UserFieldPhoneNumber';

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
      } = formRenderProps;

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
      const djFullNameRequired = validators.required(
        intl.formatMessage({ id: 'SignupForm.djFullNameRequired' })
      );
      const contactPersonFullNameRequired = validators.required(
        intl.formatMessage({ id: 'SignupForm.contactPersonFullNameRequired' })
      );

      // Keep API-required name fields in sync for event organizers.
      const businessName = values?.businessName;
      if (isEventOrganizer && businessName && (values?.fname !== businessName || values?.lname !== businessName)) {
        formApi.change('fname', businessName);
        formApi.change('lname', businessName);
      }

      // Keep API-required name fields in sync for DJs.
      const djFullName = values?.djFullName;
      if (isDj && djFullName) {
        const trimmed = `${djFullName}`.trim().replace(/\s+/g, ' ');
        const [first, ...rest] = trimmed.split(' ').filter(Boolean);
        const last = rest.length > 0 ? rest.join(' ') : first;
        if (first && last && (values?.fname !== first || values?.lname !== last)) {
          formApi.change('fname', first);
          formApi.change('lname', last);
        }
      }

      return (
        <Form className={classes} onSubmit={handleSubmit}>
          {showUserTypeSelector ? (
            <div className={css.userTypeSelector}>
              <p className={css.userTypeLabel}>
                <FormattedMessage id="SignupForm.userTypePrompt" />
              </p>
              <div className={css.userTypeButtons}>
                {userTypeOptions.map(opt => {
                  const type = opt.userType;
                  const isSelected = type === userType;
                  const buttonClasses = classNames(css.userTypeButton, {
                    [css.userTypeButtonSelected]: isSelected,
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
                    type="text"
                    id={formId ? `${formId}.businessName` : 'businessName'}
                    name="businessName"
                    autoComplete="organization"
                    label={intl.formatMessage({ id: 'SignupForm.businessNameLabel' })}
                    placeholder={intl.formatMessage({ id: 'SignupForm.businessNamePlaceholder' })}
                    validate={businessNameRequired}
                  />

                  <FieldTextInput
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
                    className={css.password}
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
                    type="password"
                    id={formId ? `${formId}.passwordConfirm` : 'passwordConfirm'}
                    name="passwordConfirm"
                    autoComplete="new-password"
                    label={intl.formatMessage({ id: 'SignupForm.passwordConfirmLabel' })}
                    placeholder={intl.formatMessage({ id: 'SignupForm.passwordConfirmPlaceholder' })}
                    validate={validators.composeValidators(passwordConfirmRequired, passwordConfirmMatches)}
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
                    type="text"
                    id={formId ? `${formId}.artistName` : 'artistName'}
                    name="artistName"
                    autoComplete="nickname"
                    label={intl.formatMessage({ id: 'SignupForm.artistNameLabel' })}
                    placeholder={intl.formatMessage({ id: 'SignupForm.artistNamePlaceholder' })}
                    validate={artistNameRequired}
                  />

                  <FieldTextInput
                    type="text"
                    id={formId ? `${formId}.djFullName` : 'djFullName'}
                    name="djFullName"
                    autoComplete="name"
                    label={intl.formatMessage({ id: 'SignupForm.djFullNameLabel' })}
                    placeholder={intl.formatMessage({ id: 'SignupForm.djFullNamePlaceholder' })}
                    validate={djFullNameRequired}
                  />

                  <FieldTextInput
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
                    className={css.password}
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
                    type="password"
                    id={formId ? `${formId}.passwordConfirm` : 'passwordConfirm'}
                    name="passwordConfirm"
                    autoComplete="new-password"
                    label={intl.formatMessage({ id: 'SignupForm.passwordConfirmLabel' })}
                    placeholder={intl.formatMessage({ id: 'SignupForm.passwordConfirmPlaceholder' })}
                    validate={validators.composeValidators(passwordConfirmRequired, passwordConfirmMatches)}
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
                      className={css.firstNameRoot}
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
                      className={css.lastNameRoot}
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
                    className={css.row}
                    userTypeConfig={userTypeConfig}
                    intl={intl}
                  />

                  <FieldTextInput
                    className={css.password}
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
            {showTermsAndConditions ? (
              <div className={css.confirmationRow}>
                <FieldCheckbox
                  id={formId ? `${formId}.authorizationConfirmation` : 'authorizationConfirmation'}
                  name="authorizationConfirmation"
                  label={intl.formatMessage({ id: 'SignupForm.authorizationConfirmationLabel' })}
                  value="confirmed"
                  validate={authorizationConfirmationRequired}
                  textClassName={css.confirmationFinePrint}
                />
              </div>
            ) : null}
            {showTermsAndConditions ? <div className={css.termsRow}>{termsAndConditions}</div> : null}
            {isPasswordUsedMoreThanOnce(values) ? (
              <div className={css.error}>
                <FormattedMessage id="SignupForm.passwordRepeatedOnOtherFields" />
              </div>
            ) : null}
            <PrimaryButton type="submit" inProgress={submitInProgress} disabled={submitDisabled}>
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
