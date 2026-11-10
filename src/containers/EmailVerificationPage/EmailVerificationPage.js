import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { FormattedMessage, useIntl } from '../../util/reactIntl';
import { propTypes } from '../../util/types';
import { ensureCurrentUser } from '../../util/data';
import { isScrollingDisabled } from '../../ducks/ui.duck';
import { Page, NamedRedirect, NamedLink, LayoutCentered, SectionCard } from '../../components';
import TopbarContainer from '../../containers/TopbarContainer/TopbarContainer';
import FooterContainer from '../../containers/FooterContainer/FooterContainer';

import css from './EmailVerificationPage.module.css';

/**
 * The page the "Verify email" link in the email opens (`/verify-email?t=…`). Its `loadData` sends
 * the token to Sharetribe, which marks the email address as verified, so the page must stay.
 *
 * LineupBridge: the stock form (background image, envelope icon, "Verify my email address" button)
 * is removed. While the link is checked the page is empty; when the email address is verified the
 * user goes to home; only a failed link shows a message.
 *
 * @component
 * @param {Object} props
 * @param {propTypes.currentUser} props.currentUser - The current user
 * @param {boolean} props.scrollingDisabled - Whether scrolling is disabled
 * @param {boolean} props.isVerified - Whether the verify call succeeded
 * @param {boolean} props.emailVerificationInProgress - Whether the verify call is in progress
 * @param {propTypes.error} props.verificationError - The verification error
 * @returns {JSX.Element} email verification page component
 */
export const EmailVerificationPageComponent = props => {
  const intl = useIntl();
  const {
    currentUser,
    scrollingDisabled,
    isVerified,
    emailVerificationInProgress,
    verificationError,
  } = props;

  const user = ensureCurrentUser(currentUser);
  const { emailVerified, pendingEmail } = user.attributes;
  const hasVerifiedEmail = !!user.id && emailVerified && pendingEmail == null;

  // Verified now, or verified earlier and the link was opened again: go to home. `isVerified` alone
  // is enough: the user refetch after verifying is not awaited, so waiting for it would render this
  // page first. On the server this becomes an HTTP redirect, so the email link opens home directly.
  if (isVerified || (hasVerifiedEmail && verificationError)) {
    return <NamedRedirect name="CMSPage" params={{ pageId: 'home' }} />;
  }

  const showError = !!user.id && !!verificationError && !emailVerificationInProgress;

  return (
    <Page
      title={intl.formatMessage({ id: 'EmailVerificationPage.title' })}
      scrollingDisabled={scrollingDisabled}
      referrer="origin"
    >
      <LayoutCentered variant="narrow" topbar={<TopbarContainer />} footer={<FooterContainer />}>
        {showError ? (
          <div className={css.content}>
            <h1 className={css.title}>
              <FormattedMessage id="EmailVerificationPage.title" />
            </h1>
            <SectionCard>
              <p className={css.message}>
                <FormattedMessage id="EmailVerificationForm.verificationFailed" />
              </p>
              <NamedLink className={css.homeLink} name="CMSPage" params={{ pageId: 'home' }}>
                <FormattedMessage id="EmailVerificationForm.successButtonText" />
              </NamedLink>
            </SectionCard>
          </div>
        ) : null}
      </LayoutCentered>
    </Page>
  );
};

const mapStateToProps = state => {
  const { currentUser } = state.user;
  const { isVerified, verificationError, verificationInProgress } = state.emailVerification;
  return {
    isVerified,
    verificationError,
    emailVerificationInProgress: verificationInProgress,
    currentUser,
    scrollingDisabled: isScrollingDisabled(state),
  };
};

// Note: it is important that the withRouter HOC is **outside** the
// connect HOC, otherwise React Router won't rerender any Route
// components since connect implements a shouldComponentUpdate
// lifecycle hook.
//
// See: https://github.com/ReactTraining/react-router/issues/4671
const EmailVerificationPage = compose(
  withRouter,
  connect(mapStateToProps)
)(EmailVerificationPageComponent);

export default EmailVerificationPage;
