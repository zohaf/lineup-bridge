import React, { useState } from 'react';
import { Form as FinalForm } from 'react-final-form';
import classNames from 'classnames';

import { FormattedMessage } from '../../../util/reactIntl';
import * as validators from '../../../util/validators';
import {
  isChangeEmailWrongPassword,
  isErrorUserHasUnfinishedTransactions,
  isStripeDeletionFailedNonZeroBalance,
} from '../../../util/errors';

import {
  Form,
  Modal,
  PrimaryButton,
  SecondaryButton,
  FieldPasswordInput,
} from '../../../components';

import formCss from '../../../styles/lineupForm.module.css';
import buttonCss from '../../../styles/lineupButtons.module.css';
import modalCss from '../../../styles/lineupModal.module.css';
import css from './DeleteAccountForm.module.css';

const ErrorMessage = props => {
  const { error } = props;

  // Account deletion fails if there are transactions on states that include payment processing.
  // Check server/api/README.md for more information
  const unfinishedTransactionsError = isErrorUserHasUnfinishedTransactions(error);

  // Checks for forbidden error - the password is incorrect and this is handled in
  // the customErrorText of the FieldTextInput
  const incorrectPasswordError = isChangeEmailWrongPassword(error);

  // Account deletion fails if the user's Stripe Connect account
  // has a non-zero balance.
  const stripeDeletionFailedError = isStripeDeletionFailedNonZeroBalance(error);

  return error && !incorrectPasswordError ? (
    <p className={formCss.formError} role="alert">
      {unfinishedTransactionsError ? (
        <FormattedMessage id="DeleteAccountForm.ongoingTransactionsError" />
      ) : stripeDeletionFailedError ? (
        <FormattedMessage id="DeleteAccountForm.stripeDeletionFailedError" />
      ) : (
        <FormattedMessage id="DeleteAccountForm.deleteAccountError" />
      )}
    </p>
  ) : null;
};

/**
 * Delete account: the warning text and a secondary "Delete account" button in the page card. The
 * button opens the library Modal, which asks for the current password and deletes the account.
 *
 * @component
 * @param {Object} props
 * @param {Function} props.onSubmitDeleteAccount called with the current password
 * @param {Function} props.onResetPassword
 * @param {Function} props.onManageDisableScrolling
 * @param {Object} props.intl
 * @param {string} props.marketplaceName
 * @param {propTypes.currentUser} props.currentUser
 * @param {propTypes.error?} props.deleteAccountError
 * @param {boolean?} props.deleteAccountInProgress
 * @param {boolean?} props.resetPasswordInProgress
 * @returns {JSX.Element}
 */
const DeleteAccountForm = props => {
  const {
    onSubmitDeleteAccount,
    onResetPassword,
    onManageDisableScrolling,
    intl,
    marketplaceName,
    currentUser,
    deleteAccountError,
    deleteAccountInProgress = false,
    resetPasswordInProgress = false,
  } = props;
  const [isModalOpen, setIsModalOpen] = useState(false);
  // showResetPasswordMessage: dictates if the reset password text should be shown
  const [showResetPasswordMessage, setShowResetPasswordMessage] = useState(false);

  const handleResetPassword = () => {
    setShowResetPasswordMessage(true);
    onResetPassword(currentUser.attributes.email);
  };

  const { email } = currentUser.attributes;

  const passwordRequired = validators.requiredStringNoTrim(
    intl.formatMessage({ id: 'DeleteAccountForm.passwordRequired' })
  );
  const passwordMinLength = validators.minLength(
    intl.formatMessage(
      { id: 'DeleteAccountForm.passwordTooShort' },
      { minLength: validators.PASSWORD_MIN_LENGTH }
    ),
    validators.PASSWORD_MIN_LENGTH
  );
  const passwordErrorText = isChangeEmailWrongPassword(deleteAccountError)
    ? intl.formatMessage({ id: 'DeleteAccountForm.passwordFailed' })
    : null;

  const resetPasswordLink =
    showResetPasswordMessage || resetPasswordInProgress ? (
      <FormattedMessage
        id="DeleteAccountForm.resetPasswordLinkSent"
        values={{
          email: <span className={css.emailStyle}>{email}</span>,
          resendPasswordLink: (
            <span className={buttonCss.link} onClick={handleResetPassword} role="button">
              <FormattedMessage id="DeleteAccountForm.resendPasswordLinkText" />
            </span>
          ),
        }}
      />
    ) : (
      <span className={buttonCss.link} onClick={handleResetPassword} role="button">
        <FormattedMessage id="DeleteAccountForm.resetPasswordLinkText" />
      </span>
    );

  return (
    <div className={css.root}>
      <p className={css.info}>
        <FormattedMessage id="DeleteAccountForm.confirmDeleteInfo" values={{ marketplaceName }} />
      </p>
      <SecondaryButton
        rootClassName={classNames(buttonCss.secondary, buttonCss.formButton)}
        type="button"
        onClick={() => setIsModalOpen(true)}
      >
        <FormattedMessage id="DeleteAccountForm.deleteAccount" />
      </SecondaryButton>

      <Modal
        id="DeleteAccountForm.confirmModal"
        scrollLayerClassName={modalCss.scrollLayer}
        containerClassName={modalCss.container}
        contentClassName={modalCss.content}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onManageDisableScrolling={onManageDisableScrolling}
        usePortal
      >
        <FinalForm
          onSubmit={values => onSubmitDeleteAccount(values)}
          render={fieldRenderProps => {
            const { handleSubmit, invalid, values } = fieldRenderProps;
            const submitDisabled = invalid || deleteAccountInProgress || !values.currentPassword;
            return (
              <Form className={modalCss.form} onSubmit={handleSubmit}>
                <div className={modalCss.head}>
                  <h2 className={modalCss.title}>
                    <FormattedMessage id="DeleteAccountForm.confirmDeleteTitle" />
                  </h2>
                  <p className={modalCss.description}>
                    <FormattedMessage id="DeleteAccountForm.deleteAccountInfo" values={{ email }} />
                  </p>
                </div>
                <FieldPasswordInput
                  name="currentPassword"
                  id="DeleteAccountForm.currentPassword"
                  autoComplete="current-password"
                  label={intl.formatMessage({ id: 'DeleteAccountForm.passwordLabel' })}
                  placeholder={intl.formatMessage({ id: 'DeleteAccountForm.passwordPlaceholder' })}
                  validate={validators.composeValidators(passwordRequired, passwordMinLength)}
                  customErrorText={passwordErrorText}
                />
                <p className={css.info}>
                  <FormattedMessage
                    id="DeleteAccountForm.resetPasswordInfo"
                    values={{ resetPasswordLink }}
                  />
                </p>
                <ErrorMessage error={deleteAccountError} />
                <div className={modalCss.footer}>
                  <PrimaryButton
                    rootClassName={buttonCss.primary}
                    type="submit"
                    inProgress={deleteAccountInProgress}
                    disabled={submitDisabled}
                  >
                    <FormattedMessage id="DeleteAccountForm.deleteAccount" />
                  </PrimaryButton>
                </div>
              </Form>
            );
          }}
        />
      </Modal>
    </div>
  );
};

export default DeleteAccountForm;
