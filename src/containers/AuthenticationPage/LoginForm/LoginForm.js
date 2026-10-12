import React from 'react';
import { Form as FinalForm } from 'react-final-form';
import classNames from 'classnames';

import { FormattedMessage, useIntl } from '../../../util/reactIntl';
import * as validators from '../../../util/validators';
import { Form, PrimaryButton, FieldTextInput, NamedLink } from '../../../components';

import formCss from '../../../styles/lineupForm.module.css';
import buttonCss from '../../../styles/lineupButtons.module.css';
import css from './LoginForm.module.css';

const LoginFormComponent = props => (
  <FinalForm
    {...props}
    render={fieldRenderProps => {
      const {
        rootClassName,
        className,
        formId,
        handleSubmit,
        inProgress,
        intl,
        invalid,
        values,
        errors,
        touched,
        submitFailed,
      } = fieldRenderProps;

      const inputClass = name =>
        classNames(formCss.input, {
          [formCss.inputError]: !!(touched?.[name] || submitFailed) && !!errors?.[name],
        });

      // email
      const emailLabel = intl.formatMessage({
        id: 'LoginForm.emailLabel',
      });
      const emailPlaceholder = intl.formatMessage({
        id: 'LoginForm.emailPlaceholder',
      });
      const emailRequiredMessage = intl.formatMessage({
        id: 'LoginForm.emailRequired',
      });
      const emailRequired = validators.required(emailRequiredMessage);
      const emailInvalidMessage = intl.formatMessage({
        id: 'LoginForm.emailInvalid',
      });
      const emailValid = validators.emailFormatValid(emailInvalidMessage);

      // password
      const passwordLabel = intl.formatMessage({
        id: 'LoginForm.passwordLabel',
      });
      const passwordPlaceholder = intl.formatMessage({
        id: 'LoginForm.passwordPlaceholder',
      });
      const passwordRequiredMessage = intl.formatMessage({
        id: 'LoginForm.passwordRequired',
      });
      const passwordRequired = validators.requiredStringNoTrim(passwordRequiredMessage);

      const classes = classNames(rootClassName || css.root, className);
      const submitInProgress = inProgress;
      const submitDisabled = invalid || submitInProgress;

      const passwordRecoveryLink = (
        <NamedLink
          name="PasswordRecoveryPage"
          className={css.recoveryLink}
          to={{
            search:
              values?.email && !errors?.email ? `email=${encodeURIComponent(values.email)}` : '',
          }}
        >
          <FormattedMessage id="LoginForm.forgotPassword" />
        </NamedLink>
      );

      return (
        <Form className={classes} onSubmit={handleSubmit}>
          <div className={css.fields}>
            <FieldTextInput
              rootClassName={formCss.field}
              labelClassName={formCss.label}
              inputRootClass={inputClass('email')}
              type="email"
              id={formId ? `${formId}.email` : 'email'}
              name="email"
              autoComplete="email"
              label={emailLabel}
              placeholder={emailPlaceholder}
              validate={validators.composeValidators(emailRequired, emailValid)}
            />
            <div className={css.passwordBlock}>
              <FieldTextInput
                rootClassName={formCss.field}
                labelClassName={formCss.label}
                inputRootClass={inputClass('password')}
                type="password"
                id={formId ? `${formId}.password` : 'password'}
                name="password"
                autoComplete="current-password"
                label={passwordLabel}
                placeholder={passwordPlaceholder}
                validate={passwordRequired}
              />
              <p className={css.helper}>
                <FormattedMessage
                  id="LoginForm.forgotPasswordInfo"
                  values={{ passwordRecoveryLink }}
                />
              </p>
            </div>
          </div>
          <PrimaryButton
            type="submit"
            rootClassName={buttonCss.primary}
            className={css.submitButton}
            inProgress={submitInProgress}
            disabled={submitDisabled}
          >
            <FormattedMessage id="LoginForm.logIn" />
          </PrimaryButton>
        </Form>
      );
    }}
  />
);

/**
 * A component that renders the login form.
 *
 * @component
 * @param {Object} props
 * @param {string} props.rootClassName - The root class name that overrides the default class css.root
 * @param {string} props.className - The class that extends the root class
 * @param {string} props.formId - The form id
 * @param {boolean} props.inProgress - Whether the form is in progress
 * @returns {JSX.Element}
 */
const LoginForm = props => {
  const intl = useIntl();
  return <LoginFormComponent {...props} intl={intl} />;
};

export default LoginForm;
