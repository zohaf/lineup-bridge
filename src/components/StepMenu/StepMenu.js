import React from 'react';
import classNames from 'classnames';
import { Check } from 'lucide-react';

import { NamedLink } from '../../components';

import css from './StepMenu.module.css';

/**
 * Step menu: the side column of LayoutSplit role "nav". Renders no text of its own; items come
 * from the page. See .claude/layouts.md (Step menu) and the UI library (Step menu).
 * - variant "steps": a real sequence (public profile builder). Numbered circles; a done step shows a
 *   tick, the current step a 2px outline, a step not reached yet is grey and not a link. Below
 *   1024px only the circles show (labels stay for screen readers).
 * - variant "pages": not a sequence (account settings). No numbers; the current page gets a 2px bar.
 *   Below 1024px the labels sit in a row that scrolls sideways.
 *
 * @component
 * @param {Object} props
 * @param {string?} props.className
 * @param {'steps'|'pages'} [props.variant] default 'steps'
 * @param {string} props.ariaLabel accessible name of the nav
 * @param {Array<{ key: string, label: ReactNode, linkProps: Object, current?: boolean, done?: boolean, disabled?: boolean }>} props.items
 *   linkProps are NamedLink props ({ name, params, to })
 * @returns {JSX.Element}
 */
const StepMenu = props => {
  const { className, variant = 'steps', ariaLabel, items = [] } = props;
  const isSteps = variant === 'steps';

  return (
    <nav
      className={classNames(css.root, isSteps ? css.steps : css.pages, className)}
      aria-label={ariaLabel}
    >
      <ol className={css.list}>
        {items.map((item, index) => {
          const { key, label, linkProps, current, done, disabled } = item;
          const number = isSteps ? (
            <span className={css.number} aria-hidden="true">
              {done ? (
                <Check size={14} strokeWidth={2} absoluteStrokeWidth />
              ) : (
                index + 1
              )}
            </span>
          ) : null;
          const content = (
            <>
              {number}
              <span className={css.label}>{label}</span>
            </>
          );
          const itemClasses = classNames(css.item, {
            [css.current]: current,
            [css.disabled]: disabled,
          });

          return (
            <li key={key}>
              {disabled ? (
                <span className={itemClasses} aria-disabled="true">
                  {content}
                </span>
              ) : (
                <NamedLink
                  {...linkProps}
                  className={itemClasses}
                  activeClassName=""
                  aria-current={current ? (isSteps ? 'step' : 'page') : undefined}
                >
                  {content}
                </NamedLink>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default StepMenu;
