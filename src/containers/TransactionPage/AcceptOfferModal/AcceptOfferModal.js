import React, { useState } from 'react';
import classNames from 'classnames';

import { FormattedMessage, useIntl } from '../../../util/reactIntl';
import { Modal, PrimaryButton } from '../../../components';

import formCss from '../../../styles/lineupForm.module.css';
import buttonCss from '../../../styles/lineupButtons.module.css';
import modalCss from '../../../styles/lineupModal.module.css';
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

  const classes = classNames(rootClassName || modalCss.container, className);

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
      scrollLayerClassName={modalCss.scrollLayer}
      containerClassName={classes}
      contentClassName={modalCss.content}
      isOpen={isOpen}
      onClose={handleClose}
      onManageDisableScrolling={onManageDisableScrolling}
      usePortal
    >
      <div className={modalCss.head}>
        <h2 className={modalCss.title}>
          <FormattedMessage id="AcceptOfferModal.title" />
        </h2>
      </div>

      <div className={formCss.field}>
        <label className={css.visuallyHidden} htmlFor="acceptOffer-message">
          {intl.formatMessage({ id: 'AcceptOfferModal.title' })}
        </label>
        <textarea
          id="acceptOffer-message"
          className={formCss.textarea}
          rows={4}
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder={intl.formatMessage({ id: 'AcceptOfferModal.messagePlaceholder' })}
        />
      </div>

      <div className={modalCss.footer}>
        <PrimaryButton
          rootClassName={buttonCss.primary}
          onClick={handleConfirm}
          inProgress={inProgress}
        >
          <FormattedMessage id="AcceptOfferModal.confirm" />
        </PrimaryButton>
      </div>
    </Modal>
  );
};

export default AcceptOfferModal;
