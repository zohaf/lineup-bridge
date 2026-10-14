import React from 'react';
import classNames from 'classnames';

import css from './StatusChip.module.css';

/**
 * Small status pill.
 *
 * @component
 * @param {Object} props
 * @param {string?} props.className
 * @param {'neutral'|'active'|'success'} props.tone
 * @param {ReactNode} props.children
 * @returns {JSX.Element}
 */
const StatusChip = props => {
  const { className, tone = 'neutral', children } = props;
  const classes = classNames(css.root, css[tone], className);

  return <span className={classes}>{children}</span>;
};

export default StatusChip;
