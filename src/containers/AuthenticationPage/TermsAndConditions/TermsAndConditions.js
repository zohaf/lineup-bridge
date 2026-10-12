import React from 'react';
import classNames from 'classnames';
import { useFormState } from 'react-final-form';

import { requiredFieldArrayCheckbox } from '../../../util/validators';
import { FieldCheckboxGroup } from '../../../components';

import { FormattedMessage, intlShape } from '../../../util/reactIntl';

import formCss from '../../../styles/lineupForm.module.css';
import css from './TermsAndConditions.module.css';

const KEY_CODE_ENTER = 13;

/**
 * A component that renders the terms and conditions.
 *
 * @component
 * @param {Object} props
 * @param {Function} props.onOpenTermsOfService - The function to open the terms of service modal
 * @param {Function} props.onOpenPrivacyPolicy - The function to open the privacy policy modal
 * @param {string} props.formId - The form id
 * @param {intlShape} props.intl - The intl object
 * @returns {JSX.Element}
 */
const TermsAndConditions = props => {
  const { onOpenTermsOfService, onOpenPrivacyPolicy, formId, intl } = props;
  const { errors, touched, submitFailed } = useFormState({
    subscription: { errors: true, touched: true, submitFailed: true },
  });
  const hasError = !!(touched?.terms || submitFailed) && !!errors?.terms;

  const handleClick = callback => e => {
    e.preventDefault();
    callback(e);
  };
  const handleKeyUp = callback => e => {
    // Allow click action with keyboard like with normal links
    if (e.keyCode === KEY_CODE_ENTER) {
      callback();
    }
  };

  const termsLink = (
    <span
      className={css.termsLink}
      onClick={handleClick(onOpenTermsOfService)}
      role="button"
      tabIndex="0"
      onKeyUp={handleKeyUp(onOpenTermsOfService)}
    >
      <FormattedMessage id="AuthenticationPage.termsAndConditionsTermsLinkText" />
    </span>
  );

  const privacyLink = (
    <span
      className={css.privacyLink}
      onClick={handleClick(onOpenPrivacyPolicy)}
      role="button"
      tabIndex="0"
      onKeyUp={handleKeyUp(onOpenPrivacyPolicy)}
    >
      <FormattedMessage id="AuthenticationPage.termsAndConditionsPrivacyLinkText" />
    </span>
  );

  return (
    <div
      className={classNames(formCss.consentTile, { [formCss.consentTileError]: hasError })}
    >
      <FieldCheckboxGroup
        name="terms"
        id={formId ? `${formId}.terms-accepted` : 'terms-accepted'}
        optionLabelClassName={formCss.consentText}
        options={[
          {
            key: 'tos-and-privacy',
            label: intl.formatMessage(
              { id: 'AuthenticationPage.termsAndConditionsAcceptText' },
              { termsLink, privacyLink }
            ),
          },
        ]}
        validate={requiredFieldArrayCheckbox(
          intl.formatMessage({ id: 'AuthenticationPage.termsAndConditionsAcceptRequired' })
        )}
      />
    </div>
  );
};

export default TermsAndConditions;
