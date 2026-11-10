import React from 'react';
import '@testing-library/jest-dom';

import { renderWithProviders as render, testingLibrary } from '../../util/testHelpers';
import { createCurrentUser } from '../../util/testData';

import { EmailVerificationPageComponent } from './EmailVerificationPage';

const { screen } = testingLibrary;

const unverifiedUser = createCurrentUser('user1', { emailVerified: false, pendingEmail: null });
const verifiedUser = createCurrentUser('user1', { emailVerified: true, pendingEmail: null });

const renderPage = props =>
  render(
    <EmailVerificationPageComponent
      scrollingDisabled={false}
      isVerified={false}
      emailVerificationInProgress={false}
      verificationError={null}
      {...props}
    />
  );

const failedText = 'EmailVerificationForm.verificationFailed';
const oldFormTexts = [
  'EmailVerificationForm.verify',
  'EmailVerificationForm.verifyEmailAddress',
  'EmailVerificationPage.loadingUserInformation',
];

describe('EmailVerificationPage', () => {
  it('shows nothing of the old form while the link is checked', () => {
    renderPage({ currentUser: unverifiedUser, emailVerificationInProgress: true });
    oldFormTexts.forEach(t => expect(screen.queryByText(t)).not.toBeInTheDocument());
    expect(screen.queryByText(failedText)).not.toBeInTheDocument();
  });

  it('shows nothing while the user is loading', () => {
    renderPage({ currentUser: null });
    oldFormTexts.forEach(t => expect(screen.queryByText(t)).not.toBeInTheDocument());
    expect(screen.queryByText(failedText)).not.toBeInTheDocument();
  });

  it('redirects to home when the email is verified', () => {
    const { container } = renderPage({ currentUser: verifiedUser, isVerified: true });
    expect(container).toBeEmptyDOMElement();
  });

  it('redirects to home as soon as the link is verified, before the user is refetched', () => {
    const { container } = renderPage({ currentUser: unverifiedUser, isVerified: true });
    expect(container).toBeEmptyDOMElement();
  });

  it('redirects to home when the link is opened again after verifying', () => {
    const { container } = renderPage({
      currentUser: verifiedUser,
      verificationError: { status: 409 },
    });
    expect(container).toBeEmptyDOMElement();
  });

  it('shows the failed message and a link to home when the link fails', () => {
    renderPage({ currentUser: unverifiedUser, verificationError: { status: 403 } });
    expect(screen.getByText(failedText)).toBeInTheDocument();
    expect(screen.getByText('EmailVerificationPage.title')).toBeInTheDocument();
    expect(
      screen.getByText('EmailVerificationForm.successButtonText').closest('a')
    ).toHaveAttribute('href', '/p/home');
    oldFormTexts.forEach(t => expect(screen.queryByText(t)).not.toBeInTheDocument());
  });
});
