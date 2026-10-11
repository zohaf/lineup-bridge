import React from 'react';
import classNames from 'classnames';

import { NamedLink } from '../../../components';

import CheckList from './CheckList';

import css from './AudienceCard.module.css';

/**
 * White card for one audience: eyebrow, title, text, check list and a signup button.
 *
 * @component
 * @param {Object} props
 * @param {string?} props.className
 * @param {string} props.eyebrow
 * @param {string} props.title
 * @param {string} props.text
 * @param {Array<string>} props.items
 * @param {string} props.ctaLabel
 * @param {string} props.userType signup user type, e.g. 'dj'
 * @param {'filled'|'outlined'} props.buttonVariant
 * @returns {JSX.Element}
 */
const AudienceCard = props => {
  const {
    className,
    eyebrow,
    title,
    text,
    items,
    ctaLabel,
    userType,
    buttonVariant = 'filled',
  } = props;
  const buttonClasses = classNames(css.button, {
    [css.filled]: buttonVariant === 'filled',
    [css.outlined]: buttonVariant === 'outlined',
  });

  return (
    <div className={classNames(css.root, className)}>
      <div className={css.intro}>
        <p className={css.eyebrow}>{eyebrow}</p>
        <div className={css.copy}>
          <h3 className={css.title}>{title}</h3>
          <p className={css.text}>{text}</p>
        </div>
      </div>
      <CheckList className={css.list} items={items} />
      <div className={css.actions}>
        <NamedLink
          className={buttonClasses}
          name="SignupForUserTypePage"
          params={{ userType }}
        >
          {ctaLabel}
        </NamedLink>
      </div>
    </div>
  );
};

export default AudienceCard;
