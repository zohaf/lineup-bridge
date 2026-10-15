import React, { useState } from 'react';
import classNames from 'classnames';
import { Check, ChevronDown } from 'lucide-react';
import { useIntl } from '../../util/reactIntl';
import {
  IconClose,
  IconCheckmark,
  Button,
  InlineTextButton,
  Menu,
  MenuLabel,
  MenuItem,
  MenuContent,
  Modal,
  PrimaryButton,
  SecondaryButton,
} from '../../components';

import formCss from '../../styles/lineupForm.module.css';
import buttonCss from '../../styles/lineupButtons.module.css';
import modalCss from '../../styles/lineupModal.module.css';
import IconCard from './IconCard/IconCard';
import css from './SavedCardDetails.module.css';

const DEFAULT_CARD = 'defaultCard';
const REPLACE_CARD = 'replaceCard';
const DELETE_CARD_BUTTON_ID = 'deleteCardButton';

/**
 * A component that renders a saved card details.
 *
 * @component
 * @param {Object} props
 * @param {string} [props.rootClassName] - Custom class that overrides the default class for the root element
 * @param {string} [props.className] - Custom class that extends the default class for the root element
 * @param {Object} props.card - The card to render
 * @param {string} props.card.brand - The brand of the card
 * @param {number} props.card.expirationMonth - The expiration month of the card
 * @param {number} props.card.expirationYear - The expiration year of the card
 * @param {string} props.card.last4Digits - The last 4 digits of the card
 * @param {function} [props.onChange] - The function to call when the card is changed
 * @param {function} [props.onDeleteCard] - The function to call when the card is deleted
 * @param {function} [props.onManageDisableScrolling] - The function to call when the modal is opened
 * @param {boolean} [props.deletePaymentMethodInProgress] - Whether the delete payment method is in progress
 * @returns {JSX.Element}
 */
const SavedCardDetails = props => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState(DEFAULT_CARD);
  const [hasBeenOpened, setHasBeenOpened] = useState(false);
  const intl = useIntl();

  const {
    rootClassName,
    className,
    card,
    onChange,
    onDeleteCard,
    onManageDisableScrolling,
    deletePaymentMethodInProgress,
    lineupStyle,
  } = props;

  const { last4Digits, expirationMonth, expirationYear, brand } = card || {};
  const classes = classNames(rootClassName || css.root, className, {
    [css.lineup]: lineupStyle,
  });

  const paymentMethodPlaceholderDesktop = intl.formatMessage(
    { id: 'SavedCardDetails.savedPaymentMethodPlaceholderDesktop' },
    { last4Digits }
  );

  const paymentMethodPlaceholderMobile = intl.formatMessage(
    { id: 'SavedCardDetails.savedPaymentMethodPlaceholderMobile' },
    { last4Digits }
  );

  const paymentMethodPlaceholder = (
    <>
      <span className={css.paymentMethodPlaceholderDesktop}>{paymentMethodPlaceholderDesktop}</span>
      <span className={css.paymentMethodPlaceholderMobile}>{paymentMethodPlaceholderMobile}</span>
    </>
  );

  const replaceCardText = intl.formatMessage({
    id: 'SavedCardDetails.replaceCardText',
  });
  const replaceCard = (
    <span>
      <IconCard brand="none" className={css.cardIcon} /> {replaceCardText}
    </span>
  );

  const expiredCardText = intl.formatMessage(
    { id: 'SavedCardDetails.expiredCardText' },
    { last4Digits }
  );
  const expiredText = (
    <div className={lineupStyle ? formCss.error : css.cardExpiredText}>{expiredCardText}</div>
  );

  const isExpired = (expirationMonth, expirationYear) => {
    const currentTime = new Date();
    const currentYear = currentTime.getFullYear();
    const currentMonth = currentTime.getMonth() + 1; //getMonth() method returns the month (from 0 to 11)

    if (expirationYear < currentYear) {
      return true;
    } else if (expirationYear === currentYear && expirationMonth < currentMonth) {
      return true;
    }

    return false;
  };

  const isCardExpired =
    expirationMonth && expirationYear && isExpired(expirationMonth, expirationYear);

  const defaultCard = (
    <div className={css.savedPaymentMethod}>
      <IconCard brand={brand} className={css.cardIcon} />
      {paymentMethodPlaceholder}
      <span className={isCardExpired ? css.expirationDateExpired : css.expirationDate}>
        {expirationMonth}/{expirationYear.toString().substring(2)}
      </span>
    </div>
  );

  const handleClick = item => e => {
    // Clicking buttons inside a form will call submit
    e.preventDefault();
    e.stopPropagation();

    setActive(item);
    setMenuOpen(false);
    if (onChange) {
      onChange(item);
    }
  };

  const onToggleActive = isOpen => {
    setMenuOpen(isOpen);
    if (!hasBeenOpened && !isOpen) {
      setHasBeenOpened(true);
    }
  };

  const handleDeleteCard = () => {
    setIsModalOpen(true);
  };

  const replaceCardTitle = intl.formatMessage({
    id: 'SavedCardDetails.replaceCardTitle',
  });
  const removeCardModalTitle = intl.formatMessage({ id: 'SavedCardDetails.removeCardModalTitle' });
  const removeCardModalContent = intl.formatMessage(
    { id: 'SavedCardDetails.removeCardModalContent' },
    { last4Digits }
  );
  const cancel = intl.formatMessage({ id: 'SavedCardDetails.cancel' });
  const removeCard = intl.formatMessage({ id: 'SavedCardDetails.removeCard' });
  const deletePaymentMethod = intl.formatMessage({ id: 'SavedCardDetails.deletePaymentMethod' });

  const showExpired = isCardExpired && active === DEFAULT_CARD;

  // Library look (lineupStyle): the card in a select-style box with a chevron, the menu in the
  // header menu panel look, a text link to remove, and the library Modal. See the UI library
  // (Saved card). Without it the component renders as before.
  if (lineupStyle) {
    const checkMaybe = item =>
      active === item ? (
        <Check className={css.lineupCheck} size={16} strokeWidth={2} absoluteStrokeWidth />
      ) : null;
    return (
      <div className={classes}>
        <Menu
          className={css.lineupMenu}
          isOpen={menuOpen}
          onToggleActive={onToggleActive}
          useArrow={false}
        >
          <MenuLabel className={css.lineupLabel}>
            <span
              className={classNames(css.lineupBox, {
                [css.lineupBoxExpired]: showExpired,
              })}
            >
              {active === DEFAULT_CARD ? defaultCard : replaceCard}
              <ChevronDown
                className={css.lineupChevron}
                size={16}
                strokeWidth={2}
                absoluteStrokeWidth
              />
            </span>
          </MenuLabel>
          <MenuContent rootClassName={css.lineupPanel}>
            <MenuItem key="first item" className={css.lineupItem}>
              <InlineTextButton
                className={classNames(css.lineupItemButton, {
                  [css.lineupItemCurrent]: active === DEFAULT_CARD,
                })}
                onClick={handleClick(DEFAULT_CARD)}
              >
                {defaultCard}
                {checkMaybe(DEFAULT_CARD)}
              </InlineTextButton>
            </MenuItem>
            <MenuItem key="second item" className={css.lineupItem}>
              <InlineTextButton
                className={classNames(css.lineupItemButton, {
                  [css.lineupItemCurrent]: active === REPLACE_CARD,
                })}
                onClick={handleClick(REPLACE_CARD)}
              >
                <span>{replaceCardTitle}</span>
                {checkMaybe(REPLACE_CARD)}
              </InlineTextButton>
            </MenuItem>
          </MenuContent>
        </Menu>
        {showExpired && !menuOpen ? expiredText : null}

        {onDeleteCard && active !== REPLACE_CARD ? (
          <InlineTextButton
            id={DELETE_CARD_BUTTON_ID}
            onClick={handleDeleteCard}
            className={css.lineupDelete}
          >
            {deletePaymentMethod}
          </InlineTextButton>
        ) : null}

        {onManageDisableScrolling ? (
          <Modal
            id="VerifyDeletingPaymentMethod"
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
            }}
            usePortal
            scrollLayerClassName={modalCss.scrollLayer}
            containerClassName={modalCss.container}
            contentClassName={modalCss.content}
            onManageDisableScrolling={onManageDisableScrolling}
            focusElementId={DELETE_CARD_BUTTON_ID}
          >
            <div className={modalCss.head}>
              <h2 className={modalCss.title}>{removeCardModalTitle}</h2>
              <p className={modalCss.description}>{removeCardModalContent}</p>
            </div>
            <div className={modalCss.footer}>
              <SecondaryButton
                rootClassName={buttonCss.secondary}
                type="button"
                onClick={() => setIsModalOpen(false)}
              >
                {cancel}
              </SecondaryButton>
              <PrimaryButton
                rootClassName={buttonCss.primary}
                type="button"
                onClick={onDeleteCard}
                inProgress={deletePaymentMethodInProgress}
              >
                {removeCard}
              </PrimaryButton>
            </div>
          </Modal>
        ) : null}
      </div>
    );
  }

  return (
    <div className={classes}>
      <Menu className={css.menu} isOpen={menuOpen} onToggleActive={onToggleActive} useArrow={false}>
        <MenuLabel className={css.menuLabel}>
          <div className={showExpired ? css.menuLabelWrapperExpired : css.menuLabelWrapper}>
            {active === DEFAULT_CARD ? defaultCard : replaceCard}
          </div>
        </MenuLabel>

        <MenuContent
          rootClassName={classNames(css.menuContent, {
            [css.menuContentTransition]: hasBeenOpened,
          })}
        >
          <MenuItem key="first item" className={css.menuItem}>
            <IconCheckmark
              className={active === DEFAULT_CARD ? css.iconCheckmark : css.iconCheckmarkHidden}
              size="small"
            />
            <InlineTextButton className={css.menuText} onClick={handleClick(DEFAULT_CARD)}>
              {defaultCard}
            </InlineTextButton>
          </MenuItem>
          <MenuItem key="divider" className={css.menuDivider}>
            {replaceCardTitle}
          </MenuItem>
          <MenuItem key="second item" className={css.menuItem}>
            <IconCheckmark
              className={active === REPLACE_CARD ? css.iconCheckmark : css.iconCheckmarkHidden}
              size="small"
            />
            <InlineTextButton
              className={css.menuTextReplaceCard}
              onClick={handleClick(REPLACE_CARD)}
            >
              {replaceCard}
            </InlineTextButton>
          </MenuItem>
        </MenuContent>
      </Menu>
      {showExpired && !menuOpen ? expiredText : null}

      {onDeleteCard && active !== REPLACE_CARD ? (
        <InlineTextButton
          id={DELETE_CARD_BUTTON_ID}
          onClick={handleDeleteCard}
          className={css.savedPaymentMethodDelete}
        >
          <IconClose rootClassName={css.closeIcon} size="small" ariaLabel={deletePaymentMethod} />
          {deletePaymentMethod}
        </InlineTextButton>
      ) : null}

      {onManageDisableScrolling ? (
        <Modal
          id="VerifyDeletingPaymentMethod"
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
          }}
          usePortal
          contentClassName={css.modalContent}
          onManageDisableScrolling={onManageDisableScrolling}
          focusElementId={DELETE_CARD_BUTTON_ID}
        >
          <div>
            <div className={css.modalTitle}>{removeCardModalTitle}</div>
            <p className={css.modalMessage}>{removeCardModalContent}</p>
            <div className={css.modalButtonsWrapper}>
              <button
                onClick={() => setIsModalOpen(false)}
                className={css.cancelCardDelete}
                tabIndex="0"
              >
                {cancel}
              </button>
              <Button onClick={onDeleteCard} inProgress={deletePaymentMethodInProgress}>
                {removeCard}
              </Button>
            </div>
          </div>
        </Modal>
      ) : null}
    </div>
  );
};

export default SavedCardDetails;
