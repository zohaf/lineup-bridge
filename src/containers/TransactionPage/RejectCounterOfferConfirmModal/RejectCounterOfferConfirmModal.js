import React from 'react';
import classNames from 'classnames';

import { FormattedMessage } from '../../../util/reactIntl';

import { Modal, PrimaryButton, SecondaryButton } from '../../../components';

import buttonCss from '../../../styles/lineupButtons.module.css';
import modalCss from '../../../styles/lineupModal.module.css';

/**
 * Confirms rejecting the organizer's counter-offer (provider negotiation).
 *
 * @param {Object} props
 * @param {string} props.id - Modal id
 * @param {boolean} props.isOpen
 * @param {Function} props.onCloseModal
 * @param {Function} props.onManageDisableScrolling
 * @param {Function} props.onConfirmReject
 * @param {boolean} props.inProgress
 * @param {string} [props.focusElementId]
 * @param {string} [props.className]
 * @param {string} [props.rootClassName]
 */
const RejectCounterOfferConfirmModal = props => {
  const {
    id,
    isOpen,
    onCloseModal,
    onManageDisableScrolling,
    onConfirmReject,
    inProgress,
    focusElementId,
    className,
    rootClassName,
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
      <div className={modalCss.head}>
        <h2 className={modalCss.title}>
          <FormattedMessage id="TransactionPage.default-negotiation.provider.finalOffer.reject" />
        </h2>
        <p className={modalCss.description}>
          <FormattedMessage id="RejectCounterOfferConfirmModal.body" />
        </p>
      </div>
      <div className={modalCss.footer}>
        <SecondaryButton
          rootClassName={buttonCss.secondary}
          onClick={onCloseModal}
          disabled={inProgress}
        >
          <FormattedMessage id="RejectCounterOfferConfirmModal.cancel" />
        </SecondaryButton>
        <PrimaryButton
          rootClassName={buttonCss.primary}
          onClick={onConfirmReject}
          inProgress={inProgress}
          disabled={inProgress}
        >
          <FormattedMessage id="RejectCounterOfferConfirmModal.confirm" />
        </PrimaryButton>
      </div>
    </Modal>
  );
};

export default RejectCounterOfferConfirmModal;
