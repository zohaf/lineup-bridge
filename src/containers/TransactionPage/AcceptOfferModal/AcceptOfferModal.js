import React, { useState } from 'react';
import classNames from 'classnames';

import { FormattedMessage, useIntl } from '../../../util/reactIntl';
import { Modal, Button } from '../../../components';

import css from './AcceptOfferModal.module.css';

/**
 * Modal shown before a DJ accepts a customer's offer.
 * Optional note is sent to the customer after acceptance.
 *
 * @param {Object} props
 * @param {string} props.id - Modal id.
 * @param {boolean} props.isOpen
 * @param {Function} props.onClose
 * @param {Function} props.onConfirm - Called with { message } when DJ confirms accept.
 * @param {Function} props.onManageDisableScrolling
 * @param {boolean} [props.inProgress]
 */
const AcceptOfferModal = props => {
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
        <FormattedMessage id="AcceptOfferModal.title" />
      </h2>

      <div className={css.field}>
        <label className={css.visuallyHidden} htmlFor="acceptOffer-message">
          {intl.formatMessage({ id: 'AcceptOfferModal.title' })}
        </label>
        <textarea
          id="acceptOffer-message"
          className={css.textarea}
          rows={4}
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder={intl.formatMessage({ id: 'AcceptOfferModal.messagePlaceholder' })}
        />
      </div>

      <div className={css.actions}>
        <Button className={css.confirmButton} onClick={handleConfirm} inProgress={inProgress}>
          <FormattedMessage id="AcceptOfferModal.confirm" />
        </Button>
      </div>
    </Modal>
  );
};

export default AcceptOfferModal;
