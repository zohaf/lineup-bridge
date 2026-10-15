import React, { useEffect } from 'react';
import { Field, Form as FinalForm } from 'react-final-form';
import arrayMutators from 'final-form-arrays';
import classNames from 'classnames';

import { useConfiguration } from '../../context/configurationContext';
import { FormattedMessage, useIntl } from '../../util/reactIntl';
import { useRouteConfiguration } from '../../context/routeConfigurationContext';
import { createResourceLocatorString } from '../../util/routes';
import { isStripeError } from '../../util/errors';
import * as validators from '../../util/validators';
import { propTypes } from '../../util/types';

import {
  H4,
  Button,
  PrimaryButton,
  ExternalLink,
  FieldSelect,
  FieldRadioButton,
  Form,
  SectionCard,
  SelectField,
} from '../../components';

import formCss from '../../styles/lineupForm.module.css';
import buttonCss from '../../styles/lineupButtons.module.css';
import css from './StripeConnectAccountForm.module.css';

const getSupportedCountryCodes = supportedCountries => supportedCountries.map(c => c.code);

// Hidden input field
const FieldHidden = props => {
  const { name } = props;
  return (
    <Field id={name} name={name} type="hidden" className={css.unitTypeHidden}>
      {fieldRenderProps => <input {...fieldRenderProps?.input} />}
    </Field>
  );
};

const CreateStripeAccountFields = props => {
  const routeConfiguration = useRouteConfiguration();
  const {
    disabled,
    countryLabel,
    showAsRequired,
    formApi,
    values,
    intl,
    currentUserId,
    marketplaceRootURL,
    supportedCountries,
    defaultMCC,
    lineupStyle,
  } = props;

  /*
  We pass some default values to Stripe when creating a new Stripe account in order to reduce couple of steps from Connect Onboarding form.
  - businessProfileURL: user's profile URL
  - businessProfileMCC: default MCC code from stripe-config.js
  - accountToken (https://stripe.com/docs/connect/account-tokens) with following information:
    * accountType: individual or business
    * tos_shown_and_accepted: true
  Only country and bank account token are mandatory values. If you decide to remove the additional default values listed here, remember to update the `createStripeAccount` function in `ducks/stripeConnectAccount.duck.js`.
  */

  useEffect(() => {
    // Use user profile page as business_url on this marketplace
    // or just fake it if it's dev environment using Stripe test endpoints
    // because Stripe will not allow passing a localhost URL
    const hasBusinessURL = values?.businessProfileURL;
    if (!hasBusinessURL && currentUserId) {
      const pathToProfilePage = uuid =>
        createResourceLocatorString('ProfilePage', routeConfiguration, { id: uuid }, {});
      const hasMarketplaceRootURL = !!marketplaceRootURL;
      const rootUrl = hasMarketplaceRootURL ? marketplaceRootURL.replace(/\/$/, '') : null;
      const profilePageURL =
        hasMarketplaceRootURL && !rootUrl.includes('localhost')
          ? `${rootUrl}${pathToProfilePage(currentUserId.uuid)}`
          : `https://test-marketplace.com${pathToProfilePage(currentUserId.uuid)}`;
      const defaultBusinessURL = `${profilePageURL}?mode=storefront`;
      formApi.change('businessProfileURL', defaultBusinessURL);
    }

    const hasMCC = values?.businessProfileMCC;
    // Use default merchant category code (MCC) from stripe-config.js
    if (!hasMCC && defaultMCC) {
      formApi.change('businessProfileMCC', defaultMCC);
    }
  }, []);

  const countryOptions = [
    <option key="placeholder" disabled value="">
      {intl.formatMessage({ id: 'StripeConnectAccountForm.countryPlaceholder' })}
    </option>,
    ...getSupportedCountryCodes(supportedCountries).map(c => (
      <option key={c} value={c}>
        {intl.formatMessage({ id: `StripeConnectAccountForm.countryNames.${c}` })}
      </option>
    )),
  ];
  const countryValidate = validators.required(
    intl.formatMessage({ id: 'StripeConnectAccountForm.countryRequired' })
  );

  if (lineupStyle) {
    // Library look: account type as choice tiles, the library select for country
    const accountTypes = [
      { value: 'individual', labelId: 'StripeConnectAccountForm.individualAccount' },
      { value: 'company', labelId: 'StripeConnectAccountForm.companyAccount' },
    ];
    const countryState = formApi.getFieldState('country');
    const countryHasError = !!(countryState?.touched && countryState?.invalid);
    return (
      <>
        <FieldHidden name="businessProfileURL" />
        <FieldHidden name="businessProfileMCC" />
        <Field name="accountType" subscription={{ value: true }}>
          {() => null}
        </Field>
        <div className={formCss.field} role="group" aria-labelledby="accountTypeLabel">
          <p id="accountTypeLabel" className={formCss.label}>
            <FormattedMessage id="StripeConnectAccountForm.accountTypeTitle" />
          </p>
          <div className={formCss.choiceTiles}>
            {accountTypes.map(type => {
              const isSelected = values?.accountType === type.value;
              return (
                <button
                  key={type.value}
                  type="button"
                  className={classNames(formCss.choiceTile, {
                    [formCss.choiceTileSelected]: isSelected,
                  })}
                  aria-pressed={isSelected}
                  disabled={disabled}
                  onClick={() => formApi.change('accountType', type.value)}
                >
                  <FormattedMessage id={type.labelId} />
                </button>
              );
            })}
          </div>
        </div>
        <SelectField
          id="country"
          name="country"
          disabled={disabled}
          autoComplete="country"
          label={countryLabel}
          rootClassName={formCss.field}
          labelClassName={formCss.label}
          selectClassName={classNames(formCss.select, { [formCss.inputError]: countryHasError })}
          longList
          validate={countryValidate}
        >
          {countryOptions}
        </SelectField>
      </>
    );
  }

  return (
    <div className={css.sectionContainer}>
      <H4 as="h3">
        <FormattedMessage id="StripeConnectAccountForm.accountTypeTitle" />
      </H4>
      <div className={css.radioButtonRow}>
        <FieldRadioButton
          id="individual"
          name="accountType"
          label={intl.formatMessage({
            id: 'StripeConnectAccountForm.individualAccount',
          })}
          value="individual"
          showAsRequired={showAsRequired}
        />
        <FieldRadioButton
          id="company"
          name="accountType"
          label={intl.formatMessage({ id: 'StripeConnectAccountForm.companyAccount' })}
          value="company"
          showAsRequired={showAsRequired}
        />
      </div>

      <FieldHidden name="businessProfileURL" />
      <FieldHidden name="businessProfileMCC" />

      <FieldSelect
        id="country"
        name="country"
        disabled={disabled}
        className={css.selectCountry}
        autoComplete="country"
        label={countryLabel}
        validate={validators.required(
          intl.formatMessage({
            id: 'StripeConnectAccountForm.countryRequired',
          })
        )}
      >
        <option disabled value="">
          {intl.formatMessage({ id: 'StripeConnectAccountForm.countryPlaceholder' })}
        </option>
        {getSupportedCountryCodes(supportedCountries).map(c => (
          <option key={c} value={c}>
            {intl.formatMessage({ id: `StripeConnectAccountForm.countryNames.${c}` })}
          </option>
        ))}
      </FieldSelect>
    </div>
  );
};

const UpdateStripeAccountFields = props => {
  const {
    countryLabel,
    savedCountry,
    accountTypeLabel,
    savedAccountType,
    submitInProgress,
    stripeBankAccountLastDigits,
    lineupStyle,
  } = props;

  if (lineupStyle) {
    // Library look: saved details as read-only label / value rows
    return (
      <dl className={css.savedList}>
        <div>
          <dt>{accountTypeLabel}</dt>
          <dd>
            <FormattedMessage id={`StripeConnectAccountForm.accountTypes.${savedAccountType}`} />
          </dd>
        </div>
        <div>
          <dt>{countryLabel}</dt>
          <dd>
            <FormattedMessage id={`StripeConnectAccountForm.countryNames.${savedCountry}`} />
          </dd>
        </div>
        {!submitInProgress && !!stripeBankAccountLastDigits ? (
          <div>
            <dt>
              <FormattedMessage id="StripeConnectAccountForm.bankAccountLabel" />
            </dt>
            <dd>•••• {stripeBankAccountLastDigits}</dd>
          </div>
        ) : null}
      </dl>
    );
  }

  return (
    <div className={css.savedInformation}>
      <label className={css.accountInformationTitle}>{accountTypeLabel}</label>
      <div className={css.savedCountry}>
        <FormattedMessage id={`StripeConnectAccountForm.accountTypes.${savedAccountType}`} />
      </div>
      <label className={css.accountInformationTitle}>{countryLabel}</label>
      <div className={css.savedCountry}>
        <FormattedMessage id={`StripeConnectAccountForm.countryNames.${savedCountry}`} />
      </div>

      {!submitInProgress && !!stripeBankAccountLastDigits ? (
        <>
          <label className={css.accountInformationTitle}>
            <FormattedMessage id="StripeConnectAccountForm.bankAccountLabel" />
          </label>

          <div className={css.savedBankAccount}>
            •••••••••••••••••••••••• {stripeBankAccountLastDigits}
          </div>
        </>
      ) : null}
    </div>
  );
};

const ErrorsMaybe = props => {
  const { stripeAccountError, stripeAccountLinkError, lineupStyle } = props;

  const errorMessage = isStripeError(stripeAccountError) ? (
    <FormattedMessage
      id="StripeConnectAccountForm.createStripeAccountFailedWithStripeError"
      values={{ stripeMessage: stripeAccountError.apiErrors[0].meta.stripeMessage }}
    />
  ) : stripeAccountError ? (
    <FormattedMessage id="StripeConnectAccountForm.createStripeAccountFailed" />
  ) : isStripeError(stripeAccountLinkError) ? (
    <FormattedMessage
      id="StripeConnectAccountForm.createStripeAccountLinkFailedWithStripeError"
      values={{ stripeMessage: stripeAccountLinkError.apiErrors[0].meta.stripeMessage }}
    />
  ) : stripeAccountLinkError ? (
    <FormattedMessage id="StripeConnectAccountForm.createStripeAccountLinkFailed" />
  ) : null;

  return errorMessage ? (
    <div className={lineupStyle ? formCss.formError : css.error} role="alert">
      {errorMessage}
    </div>
  ) : null;
};

/**
 * A component that renders a Stripe connect account form.
 *
 * @component
 * @param {Object} props
 * @param {string} [props.className] - Custom class that extends the default class for the root element
 * @param {function} props.onSubmit - The function to call when the form is submitted
 * @param {Object} props.fieldRenderProps - The field render props
 * @param {propTypes.currentUser} props.currentUser - The current user
 * @param {Object} props.stripeAccountError - The Stripe account error
 * @param {boolean} props.disabled - Whether the form is disabled
 * @param {boolean} props.inProgress - Whether the form is in progress
 * @param {boolean} props.ready - Whether the form is ready
 * @param {string} props.savedCountry - The saved country
 * @param {string} props.stripeBankAccountLastDigits - The last digits of the Stripe bank account
 * @param {boolean} props.stripeAccountFetched - Whether the Stripe account data is fetched
 * @param {string} props.submitButtonText - The text for the submit button
 * @param {boolean} [props.lineupStyle] - Opt-in library look (design-system-rules.md): fields, terms,
 *   errors and button in one SectionCard, account type as choice tiles. Without it the form renders
 *   as before.
 * @param {Object} props.fieldRenderProps - The field render props
 * @returns {JSX.Element}
 */
const StripeConnectAccountForm = props => {
  const config = useConfiguration();
  const intl = useIntl();
  const { onSubmit, ...restOfProps } = props;
  const isUpdate = props.stripeConnected;
  const stripePublishableKey = config.stripe.publishableKey;
  const supportedCountries = config.stripe.supportedCountries;

  return (
    <FinalForm
      {...restOfProps}
      onSubmit={values => onSubmit({ ...values, stripePublishableKey }, isUpdate)}
      mutators={{
        ...arrayMutators,
      }}
      render={fieldRenderProps => {
        const {
          rootClassName,
          className,
          children,
          stripeAccountError,
          stripeAccountLinkError,
          disabled,
          handleSubmit,
          inProgress,
          invalid,
          pristine,
          ready,
          savedCountry,
          savedAccountType,
          stripeAccountFetched,
          stripeBankAccountLastDigits,
          submitButtonText,
          form: formApi,
          values,
          stripeConnected,
          currentUser,
          authScopes,
          lineupStyle,
        } = fieldRenderProps;

        // Check if current user has limited rights in order to disable the submit button
        const limitedRights = authScopes?.indexOf('user:limited') >= 0;

        const accountDataLoaded = stripeConnected && stripeAccountFetched && savedCountry;
        const submitInProgress = inProgress;
        const submitDisabled =
          pristine ||
          invalid ||
          disabled ||
          submitInProgress ||
          limitedRights ||
          (!stripeConnected && !values?.accountType);

        const countryLabel = intl.formatMessage({ id: 'StripeConnectAccountForm.countryLabel' });
        const accountTypeLabel = intl.formatMessage({
          id: 'StripeConnectAccountForm.accountTypeTitle',
        });
        const classes = classNames(rootClassName || css.root, className, {
          [css.disabled]: disabled,
        });

        const showAsRequired = pristine;

        const currentUserId = currentUser ? currentUser.id : null;

        // If the user doesn't have Stripe connected account,
        // show fields for country and bank account.
        // Otherwise, show only possibility the edit bank account
        // because Stripe doesn't allow user to change the country
        const stripeAccountFields = !stripeConnected ? (
          <CreateStripeAccountFields
            disabled={disabled}
            showAsRequired={showAsRequired}
            countryLabel={countryLabel}
            supportedCountries={supportedCountries}
            marketplaceRootURL={config.marketplaceRootURL}
            defaultMCC={config.stripe.defaultMCC}
            currentUserId={currentUserId}
            formApi={formApi}
            values={values}
            intl={intl}
            lineupStyle={lineupStyle}
          />
        ) : (
          <UpdateStripeAccountFields
            countryLabel={countryLabel}
            savedCountry={savedCountry}
            accountTypeLabel={accountTypeLabel}
            savedAccountType={savedAccountType}
            stripeBankAccountLastDigits={stripeBankAccountLastDigits}
            submitInProgress={submitInProgress}
            formApi={formApi}
            values={values}
            lineupStyle={lineupStyle}
          />
        );

        const stripeConnectedAccountTermsLink = (
          <ExternalLink href="https://stripe.com/connect-account/legal" className={css.termsLink}>
            <FormattedMessage id="StripeConnectAccountForm.stripeConnectedAccountTermsLink" />
          </ExternalLink>
        );

        // Add button title for hovering to explain why the button is disabled when user has limited rights
        const submitButtonTitle = limitedRights
          ? intl.formatMessage({ id: 'StripeConnectAccountForm.buttonTitleLimitedAccess' })
          : null;

        // Don't show the submit button while fetching the Stripe account data
        const submitButtonMaybe =
          !stripeConnected || accountDataLoaded ? (
            <>
              <p className={css.termsText}>
                <FormattedMessage
                  id="StripeConnectAccountForm.stripeToSText"
                  values={{ stripeConnectedAccountTermsLink }}
                />
              </p>

              <Button
                type="submit"
                inProgress={submitInProgress}
                disabled={submitDisabled}
                ready={ready}
                title={submitButtonTitle}
              >
                {submitButtonText || (
                  <FormattedMessage id="StripeConnectAccountForm.submitButtonText" />
                )}
              </Button>
            </>
          ) : null;

        // Library look (lineupStyle): the fields, errors, terms and button in one SectionCard; the
        // children (Stripe status card) follow as their own card
        if (lineupStyle) {
          return config.stripe.publishableKey ? (
            <Form className={classNames(css.lineupRoot, className)} onSubmit={handleSubmit}>
              <SectionCard>
                {!stripeConnected || accountDataLoaded ? (
                  stripeAccountFields
                ) : (
                  <p className={formCss.helper}>
                    <FormattedMessage id="StripeConnectAccountForm.loadingStripeAccountData" />
                  </p>
                )}
                {!stripeConnected || accountDataLoaded ? (
                  <p className={css.lineupTerms}>
                    <FormattedMessage
                      id="StripeConnectAccountForm.stripeToSText"
                      values={{ stripeConnectedAccountTermsLink }}
                    />
                  </p>
                ) : null}
                <ErrorsMaybe
                  stripeAccountError={stripeAccountError}
                  stripeAccountLinkError={stripeAccountLinkError}
                  lineupStyle
                />
                {!stripeConnected || accountDataLoaded ? (
                  <PrimaryButton
                    rootClassName={classNames(buttonCss.primary, buttonCss.formButton)}
                    type="submit"
                    inProgress={submitInProgress}
                    disabled={submitDisabled}
                    ready={ready}
                    title={submitButtonTitle}
                  >
                    {submitButtonText || (
                      <FormattedMessage id="StripeConnectAccountForm.submitButtonText" />
                    )}
                  </PrimaryButton>
                ) : null}
              </SectionCard>
              {children}
            </Form>
          ) : (
            <p className={formCss.formError}>
              <FormattedMessage id="StripeConnectAccountForm.missingStripeKey" />
            </p>
          );
        }

        // If the Stripe publishable key is not set up, don't show the form
        return config.stripe.publishableKey ? (
          <Form className={classes} onSubmit={handleSubmit}>
            {!stripeConnected || accountDataLoaded ? (
              stripeAccountFields
            ) : (
              <div className={css.savedInformation}>
                <FormattedMessage id="StripeConnectAccountForm.loadingStripeAccountData" />
              </div>
            )}

            <ErrorsMaybe
              stripeAccountError={stripeAccountError}
              stripeAccountLinkError={stripeAccountLinkError}
            />

            {children}

            {submitButtonMaybe}
          </Form>
        ) : (
          <div className={css.missingStripeKey}>
            <FormattedMessage id="StripeConnectAccountForm.missingStripeKey" />
          </div>
        );
      }}
    />
  );
};

export default StripeConnectAccountForm;
