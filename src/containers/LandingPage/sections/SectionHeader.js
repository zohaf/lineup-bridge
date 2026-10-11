import React from 'react';
import classNames from 'classnames';

import css from './SectionHeader.module.css';

/**
 * Eyebrow, heading and lede of a landing page section.
 * Owns the spacing between the three, so every section looks the same.
 *
 * @component
 * @param {Object} props
 * @param {string?} props.className
 * @param {string?} props.eyebrow
 * @param {string} props.heading
 * @param {string?} props.lede
 * @param {'center'|'left'} props.align
 * @param {boolean} props.inverse light text, for dark backgrounds
 * @returns {JSX.Element}
 */
const SectionHeader = props => {
  const { className, eyebrow, heading, lede, align = 'left', inverse = false } = props;
  const classes = classNames(css.root, className, {
    [css.center]: align === 'center',
    [css.inverse]: inverse,
  });

  return (
    <header className={classes}>
      {eyebrow ? <p className={css.eyebrow}>{eyebrow}</p> : null}
      <div className={css.copy}>
        <h2 className={css.heading}>{heading}</h2>
        {lede ? <p className={css.lede}>{lede}</p> : null}
      </div>
    </header>
  );
};

export default SectionHeader;
