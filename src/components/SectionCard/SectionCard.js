import React from 'react';
import classNames from 'classnames';

import css from './SectionCard.module.css';

/**
 * White card for a form section: optional number in a black circle, title, rule and content.
 *
 * @component
 * @param {Object} props
 * @param {string?} props.className add more style rules in addition to components own css.root
 * @param {number?} props.number step number, only when sections are a real sequence
 * @param {ReactNode?} props.title section title (h2); without it there is no title row and no rule
 * @param {ReactNode} props.children section content
 * @returns {JSX.Element} section card
 */
const SectionCard = props => {
  const { className, number, title, children } = props;
  const hasTitle = title != null && title !== '';

  return (
    <section className={classNames(css.root, className)}>
      {hasTitle ? (
        <div className={css.titleRow}>
          {number != null ? <span className={css.number}>{number}</span> : null}
          <h2 className={css.title}>{title}</h2>
        </div>
      ) : null}
      <div className={css.content}>{children}</div>
    </section>
  );
};

export default SectionCard;
