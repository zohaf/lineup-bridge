import React from 'react';
import classNames from 'classnames';

import css from './PageHeader.module.css';

/**
 * Page header: optional image, optional eyebrow, title and optional lead.
 * Sits on the page background. All content comes in as props.
 *
 * @component
 * @param {Object} props
 * @param {string?} props.className add more style rules in addition to components own css.root
 * @param {ReactNode?} props.image image element, shown as a 64px square
 * @param {ReactNode?} props.eyebrow small label above the title
 * @param {ReactNode} props.title page title (h1)
 * @param {ReactNode?} props.lead text under the title
 * @returns {JSX.Element} page header
 */
const PageHeader = props => {
  const { className, image, eyebrow, title, lead } = props;

  return (
    <header className={classNames(css.root, className)}>
      <div className={css.identity}>
        {image ? <div className={css.image}>{image}</div> : null}
        <div className={css.titles}>
          {eyebrow ? <p className={css.eyebrow}>{eyebrow}</p> : null}
          <h1 className={css.title}>{title}</h1>
        </div>
      </div>
      {lead ? <p className={css.lead}>{lead}</p> : null}
    </header>
  );
};

export default PageHeader;
