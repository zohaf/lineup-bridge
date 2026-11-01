import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';

import { NamedLink } from '../../components';

import css from './HeaderMenu.module.css';

/**
 * Header menu: one trigger and one panel. From 768px the panel is a dropdown under the trigger,
 * below 768px it is a full-width panel under the bar with a scrim. It only displays; the header
 * decides what goes in it. Closes on Esc, outside click or choosing an item, and returns focus to
 * the trigger on Esc. See docs/4-design-system/rules.md (Header menu).
 *
 * @component
 * @param {Object} props
 * @param {string?} props.className
 * @param {string} props.id used for aria-controls
 * @param {string} props.ariaLabel accessible name of the trigger
 * @param {ReactNode} props.trigger what the trigger shows (avatar or icon)
 * @param {boolean?} props.showDot red unread dot on the trigger (phones only)
 * @param {boolean?} props.phoneOnly hide the whole menu from 768px (guest: links are in the bar)
 * @param {ReactNode} props.children HeaderMenuItem elements
 * @returns {JSX.Element}
 */
const HeaderMenu = props => {
  const { className, id, ariaLabel, trigger, showDot = false, phoneOnly = false, children } = props;
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const panelId = `${id}-panel`;

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }
    const onKeyDown = e => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };
    const onPointerDown = e => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('mousedown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mousedown', onPointerDown);
    };
  }, [isOpen]);

  // Choosing a link or button inside the panel closes it
  const handlePanelClick = e => {
    if (e.target.closest('a, button')) {
      setIsOpen(false);
    }
  };

  return (
    <div ref={rootRef} className={classNames(css.root, { [css.phoneOnly]: phoneOnly }, className)}>
      <button
        ref={triggerRef}
        type="button"
        id={id}
        className={css.trigger}
        aria-label={ariaLabel}
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => setIsOpen(open => !open)}
      >
        {trigger}
        {showDot ? <span className={css.dot} aria-hidden="true" /> : null}
      </button>
      {isOpen ? (
        <div className={css.scrim} aria-hidden="true" onClick={() => setIsOpen(false)} />
      ) : null}
      <div
        id={panelId}
        className={classNames(css.panel, { [css.panelOpen]: isOpen })}
        onClick={handlePanelClick}
      >
        {children}
      </div>
    </div>
  );
};

/**
 * One row in the HeaderMenu panel: a link (give `name`) or a button (give `onClick`).
 *
 * @component
 * @param {Object} props
 * @param {string?} props.name route name for a link
 * @param {Object?} props.params route params
 * @param {Object?} props.to extra location (search, hash)
 * @param {Function?} props.onClick for a button row
 * @param {boolean?} props.current current page: 600 weight and aria-current
 * @param {boolean?} props.phoneOnly hide from 768px (the item is in the bar instead)
 * @param {string?} props.className
 * @param {ReactNode} props.children
 * @returns {JSX.Element}
 */
export const HeaderMenuItem = props => {
  const {
    name,
    params,
    to,
    onClick,
    current = false,
    phoneOnly = false,
    className,
    children,
  } = props;
  const classes = classNames(
    css.item,
    { [css.current]: current, [css.phoneOnlyItem]: phoneOnly },
    className
  );
  const ariaCurrent = current ? { 'aria-current': 'page' } : {};

  return name ? (
    <NamedLink name={name} params={params} to={to} className={classes} {...ariaCurrent}>
      {children}
    </NamedLink>
  ) : (
    <button type="button" className={classes} onClick={onClick} {...ariaCurrent}>
      {children}
    </button>
  );
};

/**
 * Greeting line at the top of the panel ("Hello {name}"). Not interactive.
 *
 * @component
 * @param {Object} props
 * @param {ReactNode} props.children
 * @returns {JSX.Element}
 */
export const HeaderMenuGreeting = props => <p className={css.greeting}>{props.children}</p>;

export default HeaderMenu;
