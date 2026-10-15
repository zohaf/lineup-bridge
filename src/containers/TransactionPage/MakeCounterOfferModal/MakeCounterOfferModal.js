import React from 'react';
import classNames from 'classnames';
import { Form as FinalForm } from 'react-final-form';

import { useConfiguration } from '../../../context/configurationContext';
import { FormattedMessage, useIntl } from '../../../util/reactIntl';
import { propTypes } from '../../../util/types';
import { formatMoney } from '../../../util/currency';
import { required } from '../../../util/validators';

import {
  FieldCurrencyInput,
  FieldTextInput,
  Form,
  Modal,
  PrimaryButton,
} from '../../../components';

import formCss from '../../../styles/lineupForm.module.css';
import buttonCss from '../../../styles/lineupButtons.module.css';
import modalCss from '../../../styles/lineupModal.module.css';
import css from './MakeCounterOfferModal.module.css';

const MakeCounterOfferForm = props => (
  <FinalForm
    {...props}
    render={fieldRenderProps => {
      const {
        className,
        rootClassName,
        disabled,
        handleSubmit,
        intl,
        formId,
        invalid,
        counterOfferSubmitted,
        counterOfferError,
        counterOfferInProgress,
        currencyConfig,
        currentOffer,
        isFinalOffer,
      } = fieldRenderProps;

      const errorMessageMaybe = counterOfferError ? (
        <FormattedMessage id="MakeCounterOfferForm.submitFailed" />
      ) : null;

      const classes = classNames(rootClassName || modalCss.form, className);
      const submitInProgress = counterOfferInProgress;
      const submitDisabled = invalid || disabled || submitInProgress;
      const currentOfferFormatted = currentOffer ? formatMoney(intl, currentOffer) : '$10.00';

      return (
        <Form className={classes} onSubmit={handleSubmit}>
          <FieldCurrencyInput
            className={css.currencyField}
            id={formId ? `${formId}.counterOffer` : 'counterOffer'}
            name="counterOffer"
            label={intl.formatMessage({
              id: isFinalOffer
                ? 'MakeCounterOfferForm.performanceFeeLabel'
                : 'MakeCounterOfferForm.offerLabel',
            })}
            placeholder={intl.formatMessage(
              { id: 'MakeCounterOfferForm.offerPlaceholder' },
              { currentOffer: currentOfferFormatted }
            )}
            currencyConfig={currencyConfig}
            validate={required(intl.formatMessage({ id: 'MakeCounterOfferForm.offerRequired' }))}
          />
          <FieldTextInput
            className={formCss.field}
            labelClassName={formCss.label}
            inputRootClass={formCss.textarea}
            id={formId ? `${formId}.counterOfferMessage` : 'counterOfferMessage'}
            name="counterOfferMessage"
            type="textarea"
            label={intl.formatMessage({ id: 'MakeCounterOfferForm.messageLabel' })}
            placeholder={intl.formatMessage({ id: 'MakeCounterOfferForm.messagePlaceholder' })}
          />
          {errorMessageMaybe ? <p className={modalCss.submitError}>{errorMessageMaybe}</p> : null}
          <div className={modalCss.footer}>
            <PrimaryButton
              rootClassName={buttonCss.primary}
              type="submit"
              inProgress={counterOfferInProgress}
              disabled={submitDisabled}
              ready={counterOfferSubmitted}
            >
              {intl.formatMessage({
                id: isFinalOffer
                  ? 'MakeCounterOfferForm.submitFinal'
                  : 'MakeCounterOfferForm.submitCounter',
              })}
            </PrimaryButton>
          </div>
        </Form>
      );
    }}
  />
);

// Show counter offer form
const CounterOfferInfo = props => {
  const config = useConfiguration();
  const marketplaceName = config.marketplaceName;
  const { onMakeCounterOffer, initialValues, isFinalOffer, ...restOfProps } = props;

  return (
    <>
      <div className={modalCss.head}>
        <h2 className={modalCss.title}>
          <FormattedMessage
            id={
              isFinalOffer
                ? 'MakeCounterOfferModal.titleFinal'
                : 'MakeCounterOfferModal.titleCounter'
            }
          />
        </h2>
        <p className={modalCss.description}>
          <FormattedMessage id="MakeCounterOfferModal.description" values={{ marketplaceName }} />
        </p>
      </div>
      <MakeCounterOfferForm
        onSubmit={onMakeCounterOffer}
        initialValues={initialValues}
        {...restOfProps}
      />
    </>
  );
};

/**
 * Make counter offer modal
 *
 * @component
 * @param {Object} props - The props
 * @param {string} [props.className] - Custom class that extends the default class for the root element
 * @param {string} [props.rootClassName] - Custom class that extends the default class for the root element
 * @param {string} props.id - The id
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onCloseModal - The on close modal function
 * @param {Function} props.onManageDisableScrolling - The on manage disable scrolling function
 * @param {Function} props.onMakeCounterOffer - The on make counter offer function
 * @param {Object} props.currentOffer - The current offer
 * @param {boolean} props.counterOfferSubmitted - Whether the counter offer is submitted
 * @param {boolean} props.counterOfferInProgress - Whether the counter offer is in progress
 * @param {propTypes.error} props.counterOfferError - The counter offer error
 * @param {Object} props.currencyConfig - The currency configuration
 * @returns {JSX.Element} The MakeCounterOfferModal component
 */
const MakeCounterOfferModal = props => {
  const intl = useIntl();
  const {
    className,
    rootClassName,
    id,
    isOpen = false,
    onCloseModal,
    focusElementId,
    onManageDisableScrolling,
    onMakeCounterOffer,
    counterOfferSubmitted = false,
    counterOfferInProgress = false,
    counterOfferError,
    currencyConfig,
    currentOffer,
    isFinalOffer = false,
  } = props;
  const classes = classNames(rootClassName || modalCss.container, className);

  return (
    <Modal
      id={id}
      scrollLayerClassName={modalCss.scrollLayer}
      containerClassName={classes}
      contentClassName={modalCss.content}
      isOpen={isOpen}
      onClose={onCloseModal}
      onManageDisableScrolling={onManageDisableScrolling}
      focusElementId={focusElementId}
      usePortal
    >
      <CounterOfferInfo
        currentOffer={currentOffer}
        onMakeCounterOffer={onMakeCounterOffer}
        counterOfferInProgress={counterOfferInProgress}
        counterOfferError={counterOfferError}
        counterOfferSubmitted={counterOfferSubmitted}
        isFinalOffer={isFinalOffer}
        intl={intl}
        currencyConfig={currencyConfig}
        initialValues={{
          counterOffer: currentOffer,
          counterOfferMessage: '',
        }}
        isFinalOffer={isFinalOffer}
      />
    </Modal>
  );
};

export default MakeCounterOfferModal;
