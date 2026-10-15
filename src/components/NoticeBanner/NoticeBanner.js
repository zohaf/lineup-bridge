import React from 'react';
import classNames from 'classnames';
import { CircleAlert } from 'lucide-react';

import { NamedLink } from '../../components';

import css from './NoticeBanner.module.css';

/**
 * Notice banner: a persistent message about something that blocks the user's business (payout
 * setup today). Not dismissible; the page stops rendering it once the problem is solved. One per
 * page, first in the page column. Renders no text of its own. See the UI library (Notice banner).
 *
 * @component
 * @param {Object} props
 * @param {string?} props.className
 * @param {ReactNode} props.title
 * @param {ReactNode} props.message
 * @param {ReactNode?} props.actionLabel text of the secondary button
 * @param {Object?} props.actionLinkProps NamedLink props for the button ({ name, params, to })
 * @returns {JSX.Element}
 */
const NoticeBanner = props => {
  const { className, title, message, actionLabel, actionLinkProps } = props;
  return (
    <div className={classNames(css.root, className)} role="status">
      <CircleAlert className={css.icon} size={20} strokeWidth={2} aria-hidden="true" />
      <p className={css.title}>{title}</p>
      <p className={css.message}>{message}</p>
      {actionLabel && actionLinkProps ? (
        <NamedLink {...actionLinkProps} className={css.action}>
          {actionLabel}
        </NamedLink>
      ) : null}
    </div>
  );
};

export default NoticeBanner;
