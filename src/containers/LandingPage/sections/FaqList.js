import React from 'react';
import classNames from 'classnames';

import css from './FaqList.module.css';

/**
 * Accordion built on native <details>/<summary>, keyboard accessible without a library.
 *
 * @component
 * @param {Object} props
 * @param {string?} props.className
 * @param {Array<{key: string, question: string, answer: string}>} props.items
 * @param {boolean?} props.firstOpen open the first item by default
 * @returns {JSX.Element}
 */
const FaqList = props => {
  const { className, items = [], firstOpen = true } = props;

  return (
    <div className={classNames(css.root, className)}>
      {items.map((item, index) => (
        <details key={item.key} className={css.item} open={firstOpen && index === 0}>
          <summary className={css.question}>{item.question}</summary>
          <p className={css.answer}>{item.answer}</p>
        </details>
      ))}
    </div>
  );
};

export default FaqList;
