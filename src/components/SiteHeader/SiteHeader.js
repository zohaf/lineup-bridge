import React from 'react';
import classNames from 'classnames';

import { LinkedLogo } from '../../components';

import css from './SiteHeader.module.css';

/**
 * Header bar for logged-out visitors and the simplified header: logo on the left,
 * optional items on the right. It only displays; the page decides what goes in it.
 *
 * @component
 * @param {Object} props
 * @param {string?} props.className add more style rules in addition to components own css.root
 * @param {string?} props.rootClassName overwrite components own css.root
 * @param {string} props.ariaLabel accessible name of the nav
 * @param {string} props.logoAlt alt text of the logo
 * @param {Object?} props.linkToExternalSite passed to LinkedLogo
 * @param {Object?} props.logoLinkProps route name and params that replace the logo's default target (landing page)
 * @param {ReactNode?} props.children items on the right
 * @returns {JSX.Element} site header
 */
const SiteHeader = props => {
  const {
    className,
    rootClassName,
    ariaLabel,
    logoAlt,
    linkToExternalSite,
    logoLinkProps,
    children,
  } = props;
  const classes = classNames(rootClassName || css.root, className);

  return (
    <nav className={classes} aria-label={ariaLabel}>
      <LinkedLogo
        rootClassName={css.logoLink}
        logoClassName={css.logoWrapper}
        logoImageClassName={css.logoImage}
        layout="desktop"
        alt={logoAlt}
        linkToExternalSite={linkToExternalSite}
        {...logoLinkProps}
      />
      {children ? <div className={css.actions}>{children}</div> : null}
    </nav>
  );
};

export default SiteHeader;
