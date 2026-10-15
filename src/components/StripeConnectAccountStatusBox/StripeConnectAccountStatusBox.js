import React from 'react';
import classNames from 'classnames';
import { FormattedMessage } from '../../util/reactIntl';
import { CircleCheck } from 'lucide-react';
import {
  IconEdit,
  IconSuccess,
  PrimaryButton,
  SecondaryButton,
  InlineTextButton,
  SectionCard,
} from '../../components';
import buttonCss from '../../styles/lineupButtons.module.css';
import css from './StripeConnectAccountStatusBox.module.css';

// Library look (lineupStyle): a SectionCard without title. Needs verification / failed: title,
// text and a primary "Get verified". Verified: CircleCheck and title in the success color and a
// secondary "Edit Stripe account". See the UI library (Stripe status).
const LineupStatusCard = props => {
  const { type, onGetStripeConnectAccountLink, inProgress, disabled, buttonTitle } = props;
  const buttonClasses = classNames(buttonCss.formButton, {
    [buttonCss.primary]: type !== STATUS_VERIFICATION_SUCCESS,
    [buttonCss.secondary]: type === STATUS_VERIFICATION_SUCCESS,
  });
  const button = {
    type: 'button',
    rootClassName: buttonClasses,
    inProgress,
    disabled,
    onClick: onGetStripeConnectAccountLink,
    title: buttonTitle,
  };

  if (type === STATUS_VERIFICATION_SUCCESS) {
    return (
      <SectionCard>
        <h2 className={css.lineupSuccessTitle}>
          <CircleCheck size={20} strokeWidth={2} aria-hidden="true" />
          <FormattedMessage id="StripeConnectAccountStatusBox.verificationSuccessTitle" />
        </h2>
        <SecondaryButton {...button}>
          <FormattedMessage id="StripeConnectAccountStatusBox.editAccountButton" />
        </SecondaryButton>
      </SectionCard>
    );
  }

  const isNeeded = type === STATUS_VERIFICATION_NEEDED;
  return (
    <SectionCard>
      <div className={css.lineupText}>
        <h2 className={css.lineupTitle}>
          <FormattedMessage
            id={
              isNeeded
                ? 'StripeConnectAccountStatusBox.verificationNeededTitle'
                : 'StripeConnectAccountStatusBox.verificationFailedTitle'
            }
          />
        </h2>
        <p className={css.lineupMessage}>
          <FormattedMessage
            id={
              isNeeded
                ? 'StripeConnectAccountStatusBox.verificationNeededText'
                : 'StripeConnectAccountStatusBox.verificationFailedText'
            }
          />
        </p>
      </div>
      <PrimaryButton {...button}>
        <FormattedMessage id="StripeConnectAccountStatusBox.getVerifiedButton" />
      </PrimaryButton>
    </SectionCard>
  );
};

const STATUS_VERIFICATION_NEEDED = 'verificationNeeded';
const STATUS_VERIFICATION_SUCCESS = 'verificationSuccess';
const STATUS_VERIFICATION_ERROR = 'verificationError';

const StripeConnectAccountStatusBox = props => {
  const { type, onGetStripeConnectAccountLink, inProgress, disabled, buttonTitle } = props;

  if (
    props.lineupStyle &&
    [STATUS_VERIFICATION_NEEDED, STATUS_VERIFICATION_SUCCESS, STATUS_VERIFICATION_ERROR].includes(
      type
    )
  ) {
    return <LineupStatusCard {...props} />;
  }

  if (type === STATUS_VERIFICATION_NEEDED) {
    return (
      <div className={classNames(css.verificiationBox, css.verficiationNeededBox)}>
        <div className={css.verificiationBoxTextWrapper}>
          <div className={css.verificationBoxTitle}>
            <FormattedMessage id="StripeConnectAccountStatusBox.verificationNeededTitle" />
          </div>
          <div className={css.verificationBoxText}>
            <FormattedMessage id="StripeConnectAccountStatusBox.verificationNeededText" />
          </div>
        </div>

        <PrimaryButton
          className={css.getVerifiedButton}
          spinnerClassName={css.spinner}
          type="button"
          inProgress={inProgress}
          disabled={disabled}
          onClick={onGetStripeConnectAccountLink}
          title={buttonTitle}
        >
          <FormattedMessage id="StripeConnectAccountStatusBox.getVerifiedButton" />
        </PrimaryButton>
      </div>
    );
  } else if (type === STATUS_VERIFICATION_SUCCESS) {
    return (
      <div className={classNames(css.verificiationBox, css.verficiationSuccessBox)}>
        <div
          className={classNames(
            css.verificiationBoxTextWrapper,
            css.verificationBoxSuccessTextWrapper
          )}
        >
          <div className={css.verificationBoxTitle}>
            <IconSuccess className={css.icon} />
            <FormattedMessage id="StripeConnectAccountStatusBox.verificationSuccessTitle" />
          </div>
        </div>

        <InlineTextButton
          className={css.editVerificationButton}
          spinnerClassName={css.spinner}
          type="button"
          inProgress={inProgress}
          disabled={disabled}
          onClick={onGetStripeConnectAccountLink}
          title={buttonTitle}
        >
          <IconEdit className={css.icon} pencilClassName={css.iconEditPencil} />
          <FormattedMessage id="StripeConnectAccountStatusBox.editAccountButton" />
        </InlineTextButton>
      </div>
    );
  } else if (type === STATUS_VERIFICATION_ERROR) {
    return (
      <div className={classNames(css.verificiationBox, css.verficiationErrorBox)}>
        <div className={css.verificiationBoxTextWrapper}>
          <div className={css.verificationBoxTitle}>
            <FormattedMessage id="StripeConnectAccountStatusBox.verificationFailedTitle" />
          </div>
          <div className={css.verificationBoxText}>
            <FormattedMessage id="StripeConnectAccountStatusBox.verificationFailedText" />
          </div>
        </div>

        <PrimaryButton
          className={css.getVerifiedButton}
          spinnerClassName={css.spinner}
          type="button"
          inProgress={inProgress}
          disabled={disabled}
          title={buttonTitle}
          onClick={onGetStripeConnectAccountLink}
        >
          <FormattedMessage id="StripeConnectAccountStatusBox.getVerifiedButton" />
        </PrimaryButton>
      </div>
    );
  } else {
    throw new Error(`Unknown type ${type} for StripeConnectAccountStatusBox`);
  }
};

export default StripeConnectAccountStatusBox;
