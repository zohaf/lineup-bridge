import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';

import { useConfiguration } from '../../context/configurationContext';
import { useRouteConfiguration } from '../../context/routeConfigurationContext';

import { FormattedMessage, useIntl } from '../../util/reactIntl';
import { ensureCurrentUser } from '../../util/data';
import {
  showPaymentDetailsForUser,
  initialValuesForUserFields,
  pickUserFieldsData,
} from '../../util/userHelpers';
import { pathByRouteName } from '../../util/routes';
import { getPayoutSetupStatus } from '../../util/payout';

import { sendVerificationEmail } from '../../ducks/user.duck';
import { isScrollingDisabled, manageDisableScrolling } from '../../ducks/ui.duck';

import {
  Page,
  LayoutSplit,
  StepMenu,
  PageHeader,
  SectionCard,
  NoticeBanner,
} from '../../components';

import TopbarContainer from '../TopbarContainer/TopbarContainer';
import FooterContainer from '../FooterContainer/FooterContainer';

import ContactDetailsForm from '../ContactDetailsPage/ContactDetailsForm/ContactDetailsForm';
import {
  saveContactDetails,
  saveContactDetailsClear,
  resetPassword as resetPasswordFromContactDetails,
  uploadImage,
  updateProfileImage,
} from '../ContactDetailsPage/ContactDetailsPage.duck';
import PasswordChangeForm from '../PasswordChangePage/PasswordChangeForm/PasswordChangeForm';
import {
  changePassword,
  changePasswordClear,
  resetPassword as resetPasswordFromPasswordChange,
} from '../PasswordChangePage/PasswordChangePage.duck';
import DeleteAccountForm from '../ManageAccountPage/DeleteAccountForm/DeleteAccountForm';
import PrivateDetailsForm from '../ManageAccountPage/PrivateDetailsForm/PrivateDetailsForm';
import {
  deleteAccount,
  resetPassword as resetPasswordFromManageAccount,
  updateProfile,
} from '../ManageAccountPage/ManageAccountPage.duck';

import { accountSettingsMenuItems } from './accountSettingsMenu';
import css from './AccountSettingsPage.module.css';

/**
 * Account settings: profile picture, contact details, password and delete account on one page
 * (Split · nav). Spec: docs/3-journeys/account-and-profile-setup.md.
 *
 * @component
 * @param {Object} props
 * @returns {JSX.Element}
 */
export const AccountSettingsPageComponent = props => {
  const config = useConfiguration();
  const routeConfiguration = useRouteConfiguration();
  const intl = useIntl();
  const {
    currentUser,
    scrollingDisabled,
    stripeAccount,
    // Contact details
    saveEmailError,
    savePhoneNumberError,
    saveContactDetailsInProgress,
    contactDetailsChanged,
    contactResetPasswordInProgress,
    contactResetPasswordError,
    image,
    uploadInProgress,
    uploadImageError,
    updateProfileImageInProgress,
    updateProfileImageError,
    sendVerificationEmailInProgress = false,
    sendVerificationEmailError,
    onContactDetailsChange,
    onResendVerificationEmail,
    onSubmitContactDetails,
    onContactResetPassword,
    onImageUpload,
    onUpdateProfileImage,
    // Password
    changePasswordError,
    changePasswordInProgress,
    passwordChanged,
    passwordResetPasswordInProgress,
    passwordResetPasswordError,
    onPasswordChange,
    onSubmitChangePassword,
    onPasswordResetPassword,
    // Manage account
    deleteAccountError,
    deleteAccountInProgress,
    manageResetPasswordInProgress,
    updateProfileInProgress,
    updateProfileError,
    onSubmitDeleteAccount,
    onManageResetPassword,
    onUpdateProfile,
    onManageDisableScrolling,
  } = props;

  const user = ensureCurrentUser(currentUser);
  const { publicData = {}, protectedData = {}, privateData = {} } = user.attributes.profile || {};
  const userType = publicData?.userType;
  const { userTypes = [], userFields = [] } = config.user;
  const userTypeConfig = userType && userTypes.find(c => c.userType === userType);

  const { showPayoutDetails, showPaymentMethods } = showPaymentDetailsForUser(config, currentUser);

  // Payout banner (DJ): payout setup is complete only when Stripe verification is done. While the
  // Stripe data is still loading the status is 'unknown' and nothing is shown, so it never flashes.
  const showPayoutBanner =
    showPayoutDetails && getPayoutSetupStatus(currentUser, stripeAccount) === 'incomplete';

  // Contact details
  const currentEmail = user.attributes.email || '';
  const currentPhoneNumber = protectedData.phoneNumber || '';
  const isPhoneNumberIncluded = userTypeConfig?.defaultUserFields?.phoneNumber !== false;
  const phoneNumberMaybe =
    isPhoneNumberIncluded && currentPhoneNumber ? { phoneNumber: currentPhoneNumber } : {};
  const handleContactDetailsSubmit = values => {
    const phoneNumber = values.phoneNumber ? values.phoneNumber : null;
    return onSubmitContactDetails({ ...values, phoneNumber, currentEmail, currentPhoneNumber });
  };

  // Console user fields with private or protected scope (none today; kept from Manage account)
  const nonPublicUserFields = userFields.filter(uf => ['private', 'protected'].includes(uf.scope));
  const hasUserTypeFields =
    nonPublicUserFields.length > 0 &&
    !!nonPublicUserFields.find(
      uf =>
        !uf.userTypeConfig?.limitToUserTypeIds ||
        uf.userTypeConfig?.userTypeIds?.includes(userTypeConfig?.userType)
    );
  const handleUserFieldsSubmit = values => {
    onUpdateProfile({
      protectedData: { ...pickUserFieldsData(values, 'protected', userType, userFields) },
      privateData: { ...pickUserFieldsData(values, 'private', userType, userFields) },
    });
  };

  const handleDeleteSubmit = values => {
    const { currentPassword } = values;
    return onSubmitDeleteAccount(currentPassword).then(() => {
      const path = pathByRouteName('LandingPage', routeConfiguration);
      // Enforce full page load against LandingPage route
      if (typeof window !== 'undefined') {
        window.location = path;
      }
    });
  };

  const title = intl.formatMessage({ id: 'UserNav.accountSettings' });

  return (
    <Page title={title} scrollingDisabled={scrollingDisabled}>
      <LayoutSplit
        role="nav"
        topbar={<TopbarContainer />}
        footer={<FooterContainer />}
        side={
          <StepMenu
            variant="pages"
            ariaLabel={title}
            items={accountSettingsMenuItems(
              'AccountSettingsPage',
              showPayoutDetails,
              showPaymentMethods
            )}
          />
        }
        header={
          <div className={css.header}>
            {showPayoutBanner ? (
              <NoticeBanner
                title={<FormattedMessage id="Home.completePayoutTitleDj" />}
                message={<FormattedMessage id="Home.completePayoutMessageDj" />}
                actionLabel={<FormattedMessage id="Home.pendingApprovalCtaDj" />}
                actionLinkProps={{ name: 'StripePayoutPage' }}
              />
            ) : null}
            <PageHeader title={title} />
          </div>
        }
      >
        {user.id ? (
          <>
            <ContactDetailsForm
              initialValues={{ email: currentEmail, ...phoneNumberMaybe }}
              saveEmailError={saveEmailError}
              savePhoneNumberError={savePhoneNumberError}
              currentUser={currentUser}
              profileImage={image || { imageId: user.profileImage ? user.profileImage.id : null }}
              uploadInProgress={uploadInProgress}
              uploadImageError={uploadImageError}
              updateProfileImageInProgress={updateProfileImageInProgress}
              updateProfileImageError={updateProfileImageError}
              onImageUpload={onImageUpload}
              onUpdateProfileImage={onUpdateProfileImage}
              onResendVerificationEmail={onResendVerificationEmail}
              onResetPassword={onContactResetPassword}
              onSubmit={handleContactDetailsSubmit}
              onChange={onContactDetailsChange}
              inProgress={saveContactDetailsInProgress}
              ready={contactDetailsChanged}
              sendVerificationEmailInProgress={sendVerificationEmailInProgress}
              sendVerificationEmailError={sendVerificationEmailError}
              resetPasswordInProgress={contactResetPasswordInProgress}
              resetPasswordError={contactResetPasswordError}
              userTypeConfig={userTypeConfig}
            />

            <SectionCard
              title={<FormattedMessage id="LayoutWrapperAccountSettingsSideNav.passwordTabTitle" />}
            >
              <PasswordChangeForm
                changePasswordError={changePasswordError}
                currentUser={currentUser}
                onSubmit={onSubmitChangePassword}
                onChange={onPasswordChange}
                onResetPassword={onPasswordResetPassword}
                resetPasswordInProgress={passwordResetPasswordInProgress}
                resetPasswordError={passwordResetPasswordError}
                inProgress={changePasswordInProgress}
                ready={passwordChanged}
              />
            </SectionCard>

            {hasUserTypeFields ? (
              <SectionCard>
                <PrivateDetailsForm
                  currentUser={currentUser}
                  initialValues={{
                    ...initialValuesForUserFields(protectedData, 'protected', userType, userFields),
                    ...initialValuesForUserFields(privateData, 'private', userType, userFields),
                  }}
                  updateProfileError={updateProfileError}
                  updateInProgress={updateProfileInProgress}
                  onSubmit={handleUserFieldsSubmit}
                  marketplaceName={config.marketplaceName}
                  userFields={nonPublicUserFields}
                  userTypeConfig={userTypeConfig}
                  intl={intl}
                />
              </SectionCard>
            ) : null}

            <SectionCard title={<FormattedMessage id="ManageAccountPage.deleteAccountSubtitle" />}>
              <DeleteAccountForm
                intl={intl}
                marketplaceName={config.marketplaceName}
                currentUser={currentUser}
                deleteAccountError={deleteAccountError}
                deleteAccountInProgress={deleteAccountInProgress}
                onSubmitDeleteAccount={handleDeleteSubmit}
                onResetPassword={onManageResetPassword}
                resetPasswordInProgress={manageResetPasswordInProgress}
                onManageDisableScrolling={onManageDisableScrolling}
              />
            </SectionCard>
          </>
        ) : null}
      </LayoutSplit>
    </Page>
  );
};

const mapStateToProps = state => {
  const { currentUser, sendVerificationEmailInProgress, sendVerificationEmailError } = state.user;
  const { stripeAccount } = state.stripeConnectAccount;
  const contact = state.ContactDetailsPage;
  const password = state.PasswordChangePage;
  const manage = state.ManageAccountPage;
  return {
    currentUser,
    scrollingDisabled: isScrollingDisabled(state),
    stripeAccount,
    sendVerificationEmailInProgress,
    sendVerificationEmailError,
    saveEmailError: contact.saveEmailError,
    savePhoneNumberError: contact.savePhoneNumberError,
    saveContactDetailsInProgress: contact.saveContactDetailsInProgress,
    contactDetailsChanged: contact.contactDetailsChanged,
    contactResetPasswordInProgress: contact.resetPasswordInProgress,
    contactResetPasswordError: contact.resetPasswordError,
    image: contact.image,
    uploadInProgress: contact.uploadInProgress,
    uploadImageError: contact.uploadImageError,
    updateProfileImageInProgress: contact.updateProfileImageInProgress,
    updateProfileImageError: contact.updateProfileImageError,
    changePasswordError: password.changePasswordError,
    changePasswordInProgress: password.changePasswordInProgress,
    passwordChanged: password.passwordChanged,
    passwordResetPasswordInProgress: password.resetPasswordInProgress,
    passwordResetPasswordError: password.resetPasswordError,
    deleteAccountError: manage.deleteAccountError,
    deleteAccountInProgress: manage.deleteAccountInProgress,
    manageResetPasswordInProgress: manage.resetPasswordInProgress,
    updateProfileInProgress: manage.updateProfileInProgress,
    updateProfileError: manage.updateProfileError,
  };
};

const mapDispatchToProps = dispatch => ({
  onContactDetailsChange: () => dispatch(saveContactDetailsClear()),
  onResendVerificationEmail: () => dispatch(sendVerificationEmail()),
  onSubmitContactDetails: values => dispatch(saveContactDetails(values)),
  onContactResetPassword: values => dispatch(resetPasswordFromContactDetails(values)),
  onImageUpload: data => dispatch(uploadImage(data)),
  onUpdateProfileImage: data => dispatch(updateProfileImage(data)),
  onPasswordChange: () => dispatch(changePasswordClear()),
  onSubmitChangePassword: values => dispatch(changePassword(values)),
  onPasswordResetPassword: values => dispatch(resetPasswordFromPasswordChange(values)),
  onSubmitDeleteAccount: values => dispatch(deleteAccount(values)),
  onManageResetPassword: values => dispatch(resetPasswordFromManageAccount(values)),
  onUpdateProfile: values => dispatch(updateProfile(values)),
  onManageDisableScrolling: (componentId, disableScrolling) =>
    dispatch(manageDisableScrolling(componentId, disableScrolling)),
});

const AccountSettingsPage = compose(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
)(AccountSettingsPageComponent);

export default AccountSettingsPage;
