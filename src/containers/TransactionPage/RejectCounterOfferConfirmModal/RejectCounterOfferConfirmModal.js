import React from 'react';
import classNames from 'classnames';

import { FormattedMessage } from '../../../util/reactIntl';

import { Modal, PrimaryButton, SecondaryButton } from '../../../components';

import css from './RejectCounterOfferConfirmModal.module.css';

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

  const classes = classNames(rootClassName || css.root, className);

  return (
    <Modal
      id={id}
      containerClassName={classes}
      contentClassName={css.modalContent}
      isOpen={isOpen}
      onClose={onCloseModal}
      onManageDisableScrolling={onManageDisableScrolling}
      focusElementId={focusElementId}
      usePortal
    >
      <p className={css.body}>
        <FormattedMessage id="RejectCounterOfferConfirmModal.body" />
      </p>
      <div className={css.actions}>
        <SecondaryButton onClick={onCloseModal} disabled={inProgress}>
          <FormattedMessage id="RejectCounterOfferConfirmModal.cancel" />
        </SecondaryButton>
        <PrimaryButton onClick={onConfirmReject} inProgress={inProgress} disabled={inProgress}>
          <FormattedMessage id="RejectCounterOfferConfirmModal.confirm" />
        </PrimaryButton>
      </div>
    </Modal>
  );
};

export default RejectCounterOfferConfirmModal;
