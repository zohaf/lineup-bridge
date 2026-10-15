import React, { Component } from 'react';
import { compose } from 'redux';
import isEqual from 'lodash/isEqual';
import classNames from 'classnames';
import { Form as FinalForm } from 'react-final-form';
import { Field } from 'react-final-form';

import { FormattedMessage, injectIntl, intlShape } from '../../../util/reactIntl';
import { propTypes } from '../../../util/types';
import * as validators from '../../../util/validators';
import { ensureCurrentUser } from '../../../util/data';
import {
  isChangeEmailTakenError,
  isChangeEmailWrongPassword,
  isTooManyEmailVerificationRequestsError,
  isUploadImageOverLimitError,
} from '../../../util/errors';

import { Check } from 'lucide-react';

import {
  AvatarLarge,
  Form,
  ImageFromFile,
  IconSpinner,
  PrimaryButton,
  FieldTextInput,
  FieldPasswordInput,
  PhoneNumberField,
  SectionCard,
} from '../../../components';

import formCss from '../../../styles/lineupForm.module.css';
import buttonCss from '../../../styles/lineupButtons.module.css';
import css from './ContactDetailsForm.module.css';

const SHOW_EMAIL_SENT_TIMEOUT = 2000;
const ACCEPT_IMAGES = 'image/*';

const PhoneNumberMaybe = props => {
  const { formId, userTypeConfig, intl } = props;

  const isDisabled = userTypeConfig?.defaultUserFields?.phoneNumber === false;
  if (isDisabled) {
    return null;
  }

  const { required } = userTypeConfig?.phoneNumberSettings || {};
  const isRequired = required === true;

  const validateMaybe = isRequired
    ? {
        validate: validators.required(
          intl.formatMessage({
            id: 'ContactDetailsForm.phoneRequired',
          })
        ),
      }
    : {};

  return (
    <PhoneNumberField
      name="phoneNumber"
      id={formId ? `${formId}.phoneNumber` : 'phoneNumber'}
      label={intl.formatMessage({ id: 'ContactDetailsForm.phoneLabel' })}
      {...validateMaybe}
    />
  );
};

/**
 * The ContactDetailsForm component.
 *
 * @component
 * @param {Object} props
 * @param {string} [props.rootClassName] - The root class name to be used instead of the default css.root.
 * @param {string} [props.className] - The class name
 * @param {string} [props.formId] - The form id
 * @param {propTypes.error} [props.saveEmailError] - The save email error
 * @param {propTypes.error} [props.savePhoneNumberError] - The save phone number error
 * @param {boolean} props.inProgress - Whether the form is in progress
 * @param {intlShape} props.intl - The intl object
 * @param {Function} props.onResendVerificationEmail - The resend verification email function
 * @param {boolean} props.ready - Whether the form is ready
 * @param {propTypes.error} props.sendVerificationEmailError - The send verification email error
 * @param {boolean} props.sendVerificationEmailInProgress - Whether the send verification email is in progress
 * @param {boolean} props.resetPasswordInProgress - Whether the reset password is in progress
 * @param {propTypes.error} props.resetPasswordError - The reset password error
 * @returns {JSX.Element}
 */
class ContactDetailsFormComponent extends Component {
  constructor(props) {
    super(props);
    this.state = { showVerificationEmailSentMessage: false, showResetPasswordMessage: false };
    this.emailSentTimeoutId = null;
    this.restartTimeoutId = null;
    this.lastProfileImageUpdateId = null;
    this.handleResendVerificationEmail = this.handleResendVerificationEmail.bind(this);
    this.handleResetPassword = this.handleResetPassword.bind(this);
    this.submittedValues = {};
  }

  componentWillUnmount() {
    window.clearTimeout(this.emailSentTimeoutId);
    window.clearTimeout(this.restartTimeoutId);
  }

  handleResendVerificationEmail() {
    this.setState({ showVerificationEmailSentMessage: true });

    this.props.onResendVerificationEmail().then(() => {
      // show "verification email sent" text for a bit longer.
      this.emailSentTimeoutId = window.setTimeout(() => {
        this.setState({ showVerificationEmailSentMessage: false });
      }, SHOW_EMAIL_SENT_TIMEOUT);
    });
  }

  handleResetPassword() {
    this.setState({ showResetPasswordMessage: true });
    const email = this.props.currentUser.attributes.email;
    this.props.onResetPassword(email);
  }

  render() {
    return (
      <FinalForm
        {...this.props}
        render={fieldRenderProps => {
          const {
            rootClassName,
            className,
            saveEmailError,
            savePhoneNumberError,
            currentUser,
            formId,
            handleSubmit,
            inProgress = false,
            intl,
            invalid,
            sendVerificationEmailError,
            sendVerificationEmailInProgress = false,
            resetPasswordInProgress = false,
            profileImage,
            uploadInProgress: uploadImageInProgress = false,
            uploadImageError,
            updateProfileImageInProgress = false,
            updateProfileImageError,
            onImageUpload,
            onUpdateProfileImage,
            values,
            userTypeConfig,
          } = fieldRenderProps;
          const { email, phoneNumber } = values;

          const user = ensureCurrentUser(currentUser);

          if (!user.id) {
            return null;
          }

          const { email: currentEmail, emailVerified, pendingEmail, profile } = user.attributes;

          const currentProfileImageId = user.profileImage ? user.profileImage.id : null;
          const transientUserProfileImage = profileImage?.uploadedImage || user.profileImage;
          const transientUser = { ...user, profileImage: transientUserProfileImage };
          const fileExists = !!profileImage?.file;
          const fileUploadInProgress = uploadImageInProgress && fileExists;

          // When image upload is done, immediately save it to profile.
          if (
            profileImage?.imageId &&
            profileImage.imageId !== currentProfileImageId &&
            profileImage.imageId !== this.lastProfileImageUpdateId &&
            !updateProfileImageInProgress
          ) {
            this.lastProfileImageUpdateId = profileImage.imageId;
            onUpdateProfileImage({ profileImageId: profileImage.imageId });
          }

          const chooseAvatarLabel = fileUploadInProgress ? (
            <span className={css.uploadingImage}>
              <IconSpinner className={css.spinner} />
              <FormattedMessage id="ContactDetailsForm.uploadingImage" />
            </span>
          ) : (
            <FormattedMessage id="ContactDetailsForm.changeAvatar" />
          );

          // email

          // has the email changed
          const emailChanged = currentEmail !== email;

          const emailLabel = intl.formatMessage({
            id: 'ContactDetailsForm.emailLabel',
          });

          const emailPlaceholder = currentEmail || '';

          const emailRequiredMessage = intl.formatMessage({
            id: 'ContactDetailsForm.emailRequired',
          });
          const emailRequired = validators.required(emailRequiredMessage);
          const emailInvalidMessage = intl.formatMessage({
            id: 'ContactDetailsForm.emailInvalid',
          });
          const emailValid = validators.emailFormatValid(emailInvalidMessage);

          const tooManyVerificationRequests = isTooManyEmailVerificationRequestsError(
            sendVerificationEmailError
          );

          const emailTouched = this.submittedValues.email !== values.email;
          const emailTakenErrorText = isChangeEmailTakenError(saveEmailError)
            ? intl.formatMessage({ id: 'ContactDetailsForm.emailTakenError' })
            : null;

          let resendEmailMessage = null;
          if (tooManyVerificationRequests) {
            resendEmailMessage = (
              <span className={css.tooMany}>
                <FormattedMessage id="ContactDetailsForm.tooManyVerificationRequests" />
              </span>
            );
          } else if (
            sendVerificationEmailInProgress ||
            this.state.showVerificationEmailSentMessage
          ) {
            resendEmailMessage = (
              <span className={css.emailSent}>
                <FormattedMessage id="ContactDetailsForm.emailSent" />
              </span>
            );
          } else {
            resendEmailMessage = (
              <span
                className={buttonCss.link}
                onClick={this.handleResendVerificationEmail}
                role="button"
              >
                <FormattedMessage id="ContactDetailsForm.resendEmailVerificationText" />
              </span>
            );
          }

          // Email status info: unverified, verified and pending email (aka changed unverified email)
          let emailVerifiedInfo = null;

          if (emailVerified && !pendingEmail && !emailChanged) {
            // Current email is verified and there's no pending unverified email
            emailVerifiedInfo = (
              <p className={formCss.helperSuccess}>
                <Check size={16} strokeWidth={2} absoluteStrokeWidth aria-hidden="true" />
                <FormattedMessage id="ContactDetailsForm.emailVerified" />
              </p>
            );
          } else if (!emailVerified && !pendingEmail) {
            // Current email is unverified. This is the email given in sign up form

            emailVerifiedInfo = (
              <p className={formCss.helper}>
                <FormattedMessage
                  id="ContactDetailsForm.emailUnverified"
                  values={{ resendEmailMessage }}
                />
              </p>
            );
          } else if (pendingEmail) {
            // Current email has been tried to change, but the new address is not yet verified

            const pendingEmailStyled = <span className={css.emailStyle}>{pendingEmail}</span>;
            const pendingEmailCheckInbox = (
              <span className={css.checkInbox}>
                <FormattedMessage
                  id="ContactDetailsForm.pendingEmailCheckInbox"
                  values={{ pendingEmail: pendingEmailStyled }}
                />
              </span>
            );

            emailVerifiedInfo = (
              <p className={formCss.error}>
                <FormattedMessage
                  id="ContactDetailsForm.pendingEmailUnverified"
                  values={{ pendingEmailCheckInbox, resendEmailMessage }}
                />
              </p>
            );
          }

          // phone
          const protectedData = profile.protectedData || {};
          const currentPhoneNumber = protectedData.phoneNumber;

          // has the phone number changed
          const phoneNumberChanged =
            currentPhoneNumber !== phoneNumber &&
            !(typeof currentPhoneNumber === 'undefined' && phoneNumber === '');

          // password
          const passwordLabel = intl.formatMessage({
            id: 'ContactDetailsForm.passwordLabel',
          });
          const passwordPlaceholder = intl.formatMessage({
            id: 'ContactDetailsForm.passwordPlaceholder',
          });
          const passwordRequiredMessage = intl.formatMessage({
            id: 'ContactDetailsForm.passwordRequired',
          });

          const passwordRequired = validators.requiredStringNoTrim(passwordRequiredMessage);

          const passwordMinLengthMessage = intl.formatMessage(
            {
              id: 'ContactDetailsForm.passwordTooShort',
            },
            {
              minLength: validators.PASSWORD_MIN_LENGTH,
            }
          );

          const passwordMinLength = validators.minLength(
            passwordMinLengthMessage,
            validators.PASSWORD_MIN_LENGTH
          );

          const passwordValidators = emailChanged
            ? validators.composeValidators(passwordRequired, passwordMinLength)
            : null;

          const passwordFailedMessage = intl.formatMessage({
            id: 'ContactDetailsForm.passwordFailed',
          });
          const passwordTouched = this.submittedValues.currentPassword !== values.currentPassword;
          const passwordErrorText = isChangeEmailWrongPassword(saveEmailError)
            ? passwordFailedMessage
            : null;

          // generic error
          const isGenericEmailError = saveEmailError && !(emailTakenErrorText || passwordErrorText);

          let genericError = null;

          if (isGenericEmailError && savePhoneNumberError) {
            genericError = (
              <span className={formCss.formError}>
                <FormattedMessage id="ContactDetailsForm.genericFailure" />
              </span>
            );
          } else if (isGenericEmailError) {
            genericError = (
              <span className={formCss.formError}>
                <FormattedMessage id="ContactDetailsForm.genericEmailFailure" />
              </span>
            );
          } else if (savePhoneNumberError) {
            genericError = (
              <span className={formCss.formError}>
                <FormattedMessage id="ContactDetailsForm.genericPhoneNumberFailure" />
              </span>
            );
          }

          const sendPasswordLink = (
            <span className={buttonCss.link} onClick={this.handleResetPassword} role="button">
              <FormattedMessage id="ContactDetailsForm.resetPasswordLinkText" />
            </span>
          );

          const resendPasswordLink = (
            <span className={buttonCss.link} onClick={this.handleResetPassword} role="button">
              <FormattedMessage id="ContactDetailsForm.resendPasswordLinkText" />
            </span>
          );

          const resetPasswordLink =
            this.state.showResetPasswordMessage || resetPasswordInProgress ? (
              <>
                <FormattedMessage
                  id="ContactDetailsForm.resetPasswordLinkSent"
                  values={{
                    email: <span className={css.emailStyle}>{currentUser.attributes.email}</span>,
                  }}
                />{' '}
                {resendPasswordLink}
              </>
            ) : (
              sendPasswordLink
            );

          const classes = classNames(rootClassName || css.root, className);
          const submittedOnce = Object.keys(this.submittedValues).length > 0;
          const pristineSinceLastSubmit = submittedOnce && isEqual(values, this.submittedValues);
          const submitDisabled =
            invalid ||
            pristineSinceLastSubmit ||
            inProgress ||
            !(emailChanged || phoneNumberChanged);

          // Error look on the email box (FieldTextInput does not pass it out with inputRootClass)
          const emailFieldState = fieldRenderProps.form.getFieldState('email');
          const emailHasError =
            (!emailTouched && !!emailTakenErrorText) ||
            !!(emailFieldState?.touched && emailFieldState?.invalid);

          return (
            <Form
              className={classes}
              onSubmit={e => {
                this.submittedValues = values;
                handleSubmit(e).then(() => {
                  this.restartTimeoutId = setTimeout(() => {
                    fieldRenderProps.form.restart({ email, phoneNumber });
                  }, 1000);
                });
              }}
            >
              <SectionCard
                title={<FormattedMessage id="ContactDetailsForm.yourProfilePicture" />}
              >
                <Field
                  accept={ACCEPT_IMAGES}
                  id="profileImage"
                  name="profileImage"
                  label={chooseAvatarLabel}
                  type="file"
                  form={null}
                  uploadImageError={uploadImageError}
                  disabled={uploadImageInProgress || updateProfileImageInProgress}
                >
                  {fieldProps => {
                    const { accept, id, input, label, disabled, uploadImageError } = fieldProps;
                    const { name, type } = input;
                    const onChange = e => {
                      const file = e.target.files[0];
                      if (file != null) {
                        const tempId = `${file.name}_${Date.now()}`;
                        onImageUpload({ id: tempId, file });
                      }
                    };

                    let error = null;
                    if (isUploadImageOverLimitError(uploadImageError)) {
                      error = (
                        <div className={formCss.error}>
                          <FormattedMessage id="ContactDetailsForm.imageUploadFailedFileTooLarge" />
                        </div>
                      );
                    } else if (uploadImageError) {
                      error = (
                        <div className={formCss.error}>
                          <FormattedMessage id="ContactDetailsForm.imageUploadFailed" />
                        </div>
                      );
                    } else if (updateProfileImageError) {
                      error = (
                        <div className={formCss.error}>
                          <FormattedMessage id="ContactDetailsForm.updateProfileImageFailed" />
                        </div>
                      );
                    }

                    return (
                      <div className={formCss.field}>
                        <div className={css.avatarRow}>
                          {fileUploadInProgress ? (
                            <ImageFromFile
                              id={profileImage.id}
                              className={css.avatar}
                              file={profileImage.file}
                              alt={intl.formatMessage({
                                id: 'ContactDetailsForm.profileImageAlt',
                              })}
                            />
                          ) : (
                            <AvatarLarge user={transientUser} disableProfileLink />
                          )}
                          <label
                            className={classNames(buttonCss.secondary, css.changePhoto, {
                              [css.changePhotoDisabled]: disabled,
                            })}
                            htmlFor={id}
                          >
                            {label}
                          </label>
                          <input
                            accept={accept}
                            id={id}
                            name={name}
                            className={css.uploadAvatarInput}
                            disabled={disabled}
                            onChange={onChange}
                            type={type}
                          />
                        </div>
                        {error}
                      </div>
                    );
                  }}
                </Field>
              </SectionCard>

              <SectionCard title={<FormattedMessage id="ContactDetailsPage.heading" />}>
                <div className={formCss.field}>
                  <FieldTextInput
                    rootClassName={formCss.field}
                    labelClassName={formCss.label}
                    inputRootClass={classNames(formCss.input, {
                      [formCss.inputError]: emailHasError,
                    })}
                    type="email"
                    name="email"
                    id={formId ? `${formId}.email` : 'email'}
                    label={emailLabel}
                    placeholder={emailPlaceholder}
                    validate={validators.composeValidators(emailRequired, emailValid)}
                    customErrorText={emailTouched ? null : emailTakenErrorText}
                  />
                  {emailVerifiedInfo}
                </div>

                <PhoneNumberMaybe formId={formId} userTypeConfig={userTypeConfig} intl={intl} />

                {emailChanged ? (
                  <div className={css.confirmChanges}>
                    <h3 className={css.confirmChangesTitle}>
                      <FormattedMessage id="ContactDetailsForm.confirmChangesTitle" />
                    </h3>
                    <p className={css.confirmChangesInfo}>
                      <FormattedMessage id="ContactDetailsForm.confirmChangesInfo" />
                      <br />
                      <FormattedMessage
                        id="ContactDetailsForm.resetPasswordInfo"
                        values={{ resetPasswordLink }}
                      />
                    </p>
                    <FieldPasswordInput
                      name="currentPassword"
                      id={formId ? `${formId}.currentPassword` : 'currentPassword'}
                      autoComplete="current-password"
                      label={passwordLabel}
                      placeholder={passwordPlaceholder}
                      validate={passwordValidators}
                      customErrorText={passwordTouched ? null : passwordErrorText}
                    />
                  </div>
                ) : null}

                <div className={css.bottomWrapper}>
                  {genericError}
                  <PrimaryButton
                    rootClassName={classNames(buttonCss.primary, buttonCss.formButton)}
                    type="submit"
                    inProgress={inProgress}
                    ready={pristineSinceLastSubmit}
                    disabled={submitDisabled}
                  >
                    <FormattedMessage id="ContactDetailsForm.saveChanges" />
                  </PrimaryButton>
                </div>
              </SectionCard>
            </Form>
          );
        }}
      />
    );
  }
}

const ContactDetailsForm = compose(injectIntl)(ContactDetailsFormComponent);

ContactDetailsForm.displayName = 'ContactDetailsForm';

export default ContactDetailsForm;
