import React from 'react';
import classNames from 'classnames';

import { StatusChip } from '../../../components';

import css from './StepList.module.css';

/**
 * Numbered list with ruled rows. Each row has a title, a role chip and a text.
 *
 * @component
 * @param {Object} props
 * @param {string?} props.className
 * @param {Array<{key: string, title: string, text: string, role: string}>} props.items
 * @returns {JSX.Element}
 */
const StepList = props => {
  const { className, items = [] } = props;

  return (
    <ol className={classNames(css.root, className)}>
      {items.map((item, index) => (
        <li key={item.key} className={css.item}>
          <span className={css.number}>{`0${index + 1}`}</span>
          <div className={css.content}>
            <div className={css.titleRow}>
              <h3 className={css.title}>{item.title}</h3>
              <StatusChip>{item.role}</StatusChip>
            </div>
            <p className={css.text}>{item.text}</p>
          </div>
        </li>
      ))}
    </ol>
  );
};

export default StepList;
