import React from 'react';
import classNames from 'classnames';

import { StatusChip } from '../../../components';

import css from './StageCard.module.css';

/**
 * White card for one stage of a booking: number, status chip, title and text.
 *
 * @component
 * @param {Object} props
 * @param {string?} props.className
 * @param {string} props.number e.g. '01'
 * @param {string} props.chip status label
 * @param {'neutral'|'active'|'success'} props.tone
 * @param {string} props.title
 * @param {string} props.text
 * @returns {JSX.Element}
 */
const StageCard = props => {
  const { className, number, chip, tone, title, text } = props;

  return (
    <div className={classNames(css.root, className)}>
      <div className={css.top}>
        <span className={css.number}>{number}</span>
        <StatusChip tone={tone}>{chip}</StatusChip>
      </div>
      <div className={css.copy}>
        <h3 className={css.title}>{title}</h3>
        <p className={css.text}>{text}</p>
      </div>
    </div>
  );
};

export default StageCard;
