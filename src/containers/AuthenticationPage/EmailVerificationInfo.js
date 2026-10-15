import React from 'react';

import { FormattedMessage } from '../../util/reactIntl';

import { NamedLink, InlineTextButton, SectionCard } from '../../components';

import buttonCss from '../../styles/lineupButtons.module.css';
import css from './AuthenticationPage.module.css';

const EmailVerificationInfo = props => {
  const {
    name,
    email,
    onResendVerificationEmail,
    resendErrorMessage,
    sendVerificationEmailInProgress,
  } = props;

  const resendEmailLink = (
    <InlineTextButton rootClassName={buttonCss.link} onClick={onResendVerificationEmail}>
      <FormattedMessage id="AuthenticationPage.resendEmailLinkText" />
    </InlineTextButton>
  );

  const fixEmailLink = (
    <NamedLink className={buttonCss.link} name="AccountSettingsPage">
      <FormattedMessage id="AuthenticationPage.fixEmailLinkText" />
    </NamedLink>
  );

  return (
    <div className={css.content}>
      <h1 className={css.verifyTitle}>
        <FormattedMessage id="AuthenticationPage.verifyEmailTitle" values={{ name }} />
      </h1>
      <SectionCard>
        <p className={css.verifyMessage}>
          <FormattedMessage id="AuthenticationPage.verifyEmailText" values={{ email }} />
        </p>
        {resendErrorMessage}

        <div className={css.verifyHelp}>
          <p className={css.verifyHelperText}>
            {sendVerificationEmailInProgress ? (
              <FormattedMessage id="AuthenticationPage.sendingEmail" />
            ) : (
              <FormattedMessage id="AuthenticationPage.resendEmail" values={{ resendEmailLink }} />
            )}
          </p>
          <p className={css.verifyHelperText}>
            <FormattedMessage id="AuthenticationPage.fixEmail" values={{ fixEmailLink }} />
          </p>
        </div>

        <NamedLink className={css.verifyLater} name="AccountSettingsPage">
          <span className={css.verifyLaterText}>
            <FormattedMessage id="AuthenticationPage.verifyEmailClose" />
          </span>
        </NamedLink>
      </SectionCard>
    </div>
  );
};

export default EmailVerificationInfo;
