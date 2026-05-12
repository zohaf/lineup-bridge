import React, { useState } from 'react';
import classNames from 'classnames';

import { FormattedMessage, useIntl } from '../../../util/reactIntl';
import { Modal, Button } from '../../../components';

import css from './DeclineOfferModal.module.css';

/**
 * Confirmation modal before the DJ declines a customer's offer.
 * Includes an optional message field for the rejection reason.
 *
 * @param {Object} props
 * @param {string} props.id - Modal id.
 * @param {boolean} props.isOpen
 * @param {Function} props.onClose
 * @param {Function} props.onConfirm - Called with { message } when DJ confirms decline.
 * @param {Function} props.onManageDisableScrolling
 * @param {boolean} [props.inProgress]
 */
const DeclineOfferModal = props => {
  const {
    className,
    rootClassName,
    id,
    isOpen = false,
    onClose,
    onConfirm,
    onManageDisableScrolling,
    inProgress = false,
  } = props;

  const intl = useIntl();
  const [message, setMessage] = useState('');

  const classes = classNames(rootClassName || css.root, className);

  const handleConfirm = () => {
    onConfirm({ message: message.trim() });
  };

  const handleClose = () => {
    setMessage('');
    onClose();
  };

  return (
    <Modal
      id={id}
      containerClassName={classes}
      contentClassName={css.modalContent}
      isOpen={isOpen}
      onClose={handleClose}
      onManageDisableScrolling={onManageDisableScrolling}
      usePortal
    >
      <h2 className={css.title}>
        <FormattedMessage id="DeclineOfferModal.title" />
      </h2>
      <p className={css.description}>
        <FormattedMessage id="DeclineOfferModal.description" />
      </p>

      <div className={css.field}>
        <label className={css.label} htmlFor="declineOffer-message">
          {intl.formatMessage({ id: 'DeclineOfferModal.messageLabel' })}
        </label>
        <textarea
          id="declineOffer-message"
          className={css.textarea}
          rows={4}
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder={intl.formatMessage({ id: 'DeclineOfferModal.messagePlaceholder' })}
        />
      </div>

      <div className={css.actions}>
        <Button className={css.confirmButton} onClick={handleConfirm} inProgress={inProgress}>
          <FormattedMessage id="DeclineOfferModal.confirm" />
        </Button>
      </div>
    </Modal>
  );
};

export default DeclineOfferModal;
