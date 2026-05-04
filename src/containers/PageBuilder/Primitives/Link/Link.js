import React from 'react';
import classNames from 'classnames';
import { useLocation } from 'react-router-dom';

import { useRouteConfiguration } from '../../../../context/routeConfigurationContext.js';
import { matchPathname } from '../../../../util/routes.js';

import { NamedLink, ExternalLink } from '../../../../components/index.js';
import css from './Link.module.css';

/**
 * Link element which internally uses NamedLink or ExternalLink
 *
 * @component
 * @param {Object} props
 * @param {string?} props.className add more style rules in addition to components own css.root
 * @param {string?} props.rootClassName overwrite components own css.root
 * @param {ReactNode} props.children
 * @param {string} props.href link destination. In-app links need to start with '/'.
 * @returns {JSX.Element} link element
 */
export const Link = React.forwardRef((props, ref) => {
  const location = useLocation();
  const routes = useRouteConfiguration();

  const { className, rootClassName, href, title, children } = props;
  const classes = classNames(rootClassName || css.link, className);
  const titleMaybe = title ? { title } : {};
  // Allow simple per-label CTA routing without needing Console edits.
  // E.g. two landing page CTAs can both use "/signup" but route to different preselected user types.
  const rewrittenHref = (() => {
    if (href !== '/signup' || typeof children !== 'string') {
      return href;
    }
    const label = children.toLowerCase();
    if (label.includes('dj')) {
      return '/signup/dj';
    }
    if (label.includes('organizer') || label.includes('organiser')) {
      return '/signup/organizer';
    }
    return href;
  })();
  const linkProps = { className: classes, href: rewrittenHref, children, ...titleMaybe };

  // Markdown parser (rehype-sanitize) might return undefined href
  if (!rewrittenHref || !children) {
    return null;
  }

  if (rewrittenHref.charAt(0) === '/') {
    // Internal link
    const testURL = new URL('http://my.marketplace.com' + rewrittenHref);
    const matchedRoutes = matchPathname(testURL.pathname, routes);
    if (matchedRoutes.length > 0) {
      const found = matchedRoutes[0];
      const to = { search: testURL.search, hash: testURL.hash };
      return (
        <NamedLink name={found.route.name} params={found.params} to={to} {...linkProps} ref={ref} />
      );
    }
  }

  if (href.charAt(0) === '#') {
    if (typeof window !== 'undefined') {
      const hash = href;
      let testURL = new URL(
        `http://my.marketplace.com${location.pathname}${location.hash}${location.search}`
      );
      testURL.hash = hash;
      const matchedRoutes = matchPathname(testURL.pathname, routes);
      if (matchedRoutes.length > 0) {
        const found = matchedRoutes[0];
        const to = { search: testURL.search, hash: testURL.hash };
        return (
          <NamedLink
            name={found.route.name}
            params={found.params}
            to={to}
            {...linkProps}
            ref={ref}
          />
        );
      }
    }
  }

  return <ExternalLink {...linkProps} ref={ref} />;
});

Link.displayName = 'Link';
