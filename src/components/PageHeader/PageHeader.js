import React from 'react';
import classNames from 'classnames';

import css from './PageHeader.module.css';

/**
 * Page header: optional eyebrow, optional image, title and optional lead.
 * The eyebrow sits on its own line; the image sits beside the title and lead, centred on them
 * (from 768px). Phones: image, eyebrow, title, lead stacked. All content comes in as props.
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
    <header className={classNames(css.root, { [css.withImage]: !!image }, className)}>
      {image ? <div className={css.image}>{image}</div> : null}
      {eyebrow ? <p className={css.eyebrow}>{eyebrow}</p> : null}
      <div className={css.titles}>
        <h1 className={css.title}>{title}</h1>
        {lead ? <p className={css.lead}>{lead}</p> : null}
      </div>
    </header>
  );
};

export default PageHeader;
