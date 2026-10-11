import React from 'react';
import classNames from 'classnames';

import css from './CheckList.module.css';

/**
 * Ruled list where every row starts with a tick mark.
 *
 * @component
 * @param {Object} props
 * @param {string?} props.className
 * @param {Array<string>} props.items
 * @returns {JSX.Element}
 */
const CheckList = props => {
  const { className, items = [] } = props;

  return (
    <ul className={classNames(css.root, className)}>
      {items.map(item => (
        <li key={item} className={css.item}>
          {item}
        </li>
      ))}
    </ul>
  );
};

export default CheckList;
