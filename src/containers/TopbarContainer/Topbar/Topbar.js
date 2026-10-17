import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { Menu as MenuIcon } from 'lucide-react';

import appSettings from '../../../config/settings';
import { useConfiguration } from '../../../context/configurationContext';
import { useRouteConfiguration } from '../../../context/routeConfigurationContext';
import { ACCOUNT_SETTINGS_PAGES } from '../../../routing/routeConfiguration';

import { FormattedMessage, useIntl } from '../../../util/reactIntl';
import {
  LISTING_PAGE_DRAFT_VARIANT,
  LISTING_PAGE_PENDING_APPROVAL_VARIANT,
  createSlug,
} from '../../../util/urlHelpers';
import { createResourceLocatorString, matchPathname, pathByRouteName } from '../../../util/routes';
import {
  LISTING_STATE_DRAFT,
  LISTING_STATE_PENDING_APPROVAL,
  LISTING_STATE_PUBLISHED,
} from '../../../util/types';
import { getCurrentUserTypeRoles } from '../../../util/userHelpers';
import {
  Avatar,
  Button,
  HeaderMenu,
  HeaderMenuGreeting,
  HeaderMenuItem,
  IconArrowHead,
  LimitedAccessBanner,
  ModalMissingInformation,
  NamedLink,
  SiteHeader,
} from '../../../components';

import buttonCss from '../../../styles/lineupButtons.module.css';
import css from './Topbar.module.css';

const SEARCH_PAGES = ['SearchPage', 'SearchPageWithListingType'];

const getResolvedCustomLinks = (customLinks, routeConfiguration) => {
  const links = Array.isArray(customLinks) ? customLinks : [];
  return links.map(linkConfig => {
    const { type, href } = linkConfig;
    const isFullUrl = href && (href.startsWith('http://') || href.startsWith('https://'));
    // Hosted top-bar links often use "p/home" without a leading slash; that breaks URL parsing
    // and falls through to ExternalLink (new tab + relative URL → /inbox/p/home).
    const normalizedHref =
      href && !isFullUrl && !href.startsWith('/') && !href.startsWith('//') ? `/${href}` : href;

    const isInternalLink =
      type === 'internal' || (normalizedHref && normalizedHref.charAt(0) === '/');

    if (isInternalLink && normalizedHref) {
      try {
        const testURL = new URL(`http://my.marketplace.com${normalizedHref}`);
        const matchedRoutes = matchPathname(testURL.pathname, routeConfiguration);
        if (matchedRoutes.length > 0) {
          const found = matchedRoutes[0];
          const to = { search: testURL.search, hash: testURL.hash };
          return {
            ...linkConfig,
            href: normalizedHref,
            route: {
              name: found.route?.name,
              params: found.params,
              to,
            },
          };
        }
      } catch (e) {
        return { ...linkConfig, href: normalizedHref };
      }
    }
    return normalizedHref ? { ...linkConfig, href: normalizedHref } : linkConfig;
  });
};

/**
 * Top-bar link that goes to marketplace "home" (landing or CMS /p/home).
 * Shown only when logged in — hidden for guests (logo already goes to landing).
 */
// Landing page: the black area ends with this section (see LandingPage/landingSections.js)
const LANDING_DARK_END_ID = 'landing-value';

const isHomeTopbarLink = link => {
  if (link.route?.name === 'LandingPage') {
    return true;
  }
  const pageId = link.route?.params?.pageId;
  if (link.route?.name === 'CMSPage' && pageId != null && String(pageId).toLowerCase() === 'home') {
    return true;
  }
  const h = (link.href || '').trim();
  if (!h) {
    return false;
  }

  try {
    const normalizedHref =
      h.startsWith('http://') || h.startsWith('https://')
        ? h
        : `http://x${h.startsWith('/') ? h : `/${h}`}`;
    const parsed = new URL(normalizedHref);
    const normalizedPath = (parsed.pathname || '').replace(/\/+$/, '') || '/';
    return normalizedPath === '/p/home' || normalizedPath === '/';
  } catch (e) {
    return false;
  }
};

const isCMSPage = found =>
  found.route?.name === 'CMSPage' ? `CMSPage:${found.params?.pageId}` : null;
const isInboxPage = found =>
  found.route?.name === 'InboxPage' ? `InboxPage:${found.params?.tab}` : null;
// Find the name of the current route/pathname.
// It's used as handle for currentPage check.
const getResolvedCurrentPage = (location, routeConfiguration) => {
  const matchedRoutes = matchPathname(location.pathname, routeConfiguration);
  if (matchedRoutes.length > 0) {
    const found = matchedRoutes[0];
    const cmsPageName = isCMSPage(found);
    const inboxPageName = isInboxPage(found);
    return cmsPageName ? cmsPageName : inboxPageName ? inboxPageName : `${found.route?.name}`;
  }
};

const GenericError = props => {
  const { show } = props;
  const classes = classNames(css.genericError, {
    [css.genericErrorVisible]: show,
  });
  return show ? (
    <div className={classes} role="alert">
      <div className={css.genericErrorContent}>
        <p className={css.genericErrorText}>
          <FormattedMessage id="Topbar.genericError" />
        </p>
      </div>
    </div>
  ) : null;
};

const TopbarComponent = props => {
  const {
    className,
    rootClassName,
    isAuthenticated,
    isLoggedInAs,
    authScopes = [],
    logoutInProgress,
    currentUser,
    currentUserHasListings,
    currentUserHasOrders,
    currentPage,
    notificationCount = 0,
    intl,
    history,
    location,
    onManageDisableScrolling,
    onResendVerificationEmail,
    onQueryOwnListings,
    sendVerificationEmailInProgress,
    sendVerificationEmailError,
    showGenericError,
    config,
    routeConfiguration,
  } = props;

  const handleLogout = () => {
    const { onLogout, history, routeConfiguration } = props;
    onLogout().then(() => {
      const path = pathByRouteName('LandingPage', routeConfiguration);

      // In production we ensure that data is really lost,
      // but in development mode we use stored values for debugging
      if (appSettings.dev) {
        history.push(path);
      } else if (typeof window !== 'undefined') {
        window.location = path;
      }

      console.log('logged out'); // eslint-disable-line
    });
  };

  // Hide "Post a new listing" in the header (desktop and mobile).
  const { customer: isCustomer, provider: isProvider } = getCurrentUserTypeRoles(
    config,
    currentUser
  );

  const resolvedCurrentPage = currentPage || getResolvedCurrentPage(location, routeConfiguration);
  const isLoggedIn = isAuthenticated && !logoutInProgress;

  // Home: the Console custom link that points to the home page (label and target from Console)
  const customLinks = getResolvedCustomLinks(config.topbar?.customLinks, routeConfiguration);
  const homeLink = customLinks.find(isHomeTopbarLink);
  const homeRoute = homeLink?.route?.name
    ? homeLink.route
    : { name: 'CMSPage', params: { pageId: 'home' } };
  const homeLabel = homeLink?.text;
  const isHomeCurrent =
    resolvedCurrentPage === 'LandingPage' || resolvedCurrentPage === 'CMSPage:home';

  // Landing page: the bar is black while it is over the black hero and Why LineupBridge, and beige
  // over the rest of the page. It is always shown.
  const isLandingPage = resolvedCurrentPage === 'LandingPage';
  const [isOverDark, setIsOverDark] = useState(true);
  useEffect(() => {
    if (!isLandingPage) return undefined;
    let frame = null;

    const update = () => {
      frame = null;
      const darkEnd = document.getElementById(LANDING_DARK_END_ID);
      const barHeight =
        parseFloat(
          getComputedStyle(document.documentElement).getPropertyValue('--lb-topbar-height')
        ) || 60;
      setIsOverDark(darkEnd ? darkEnd.getBoundingClientRect().bottom > barHeight : false);
    };
    const onScroll = () => {
      if (frame === null) {
        frame = window.requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame !== null) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, [isLandingPage]);
  const isInverse = isLandingPage && isOverDark;

  const isFindDjCurrent = SEARCH_PAGES.includes(resolvedCurrentPage);
  const isMyProfileCurrent = resolvedCurrentPage === 'ManageListingsPage';
  const isAccountCurrent =
    resolvedCurrentPage === 'AccountSettingsPage' ||
    ACCOUNT_SETTINGS_PAGES.includes(resolvedCurrentPage);

  const hasUnread = notificationCount > 0;

  const createOwnListingURL = ownListing => {
    const id = ownListing?.id?.uuid;
    const title = ownListing?.attributes?.title;
    const state = ownListing?.attributes?.state;
    if (!id || !title) return null;

    const slug = createSlug(title);
    const variant =
      state === LISTING_STATE_PENDING_APPROVAL
        ? LISTING_PAGE_PENDING_APPROVAL_VARIANT
        : state === LISTING_STATE_DRAFT
        ? LISTING_PAGE_DRAFT_VARIANT
        : null;

    const linkProps = variant
      ? { name: 'ListingPageVariant', params: { id, slug, variant } }
      : { name: 'ListingPage', params: { id, slug } };

    return createResourceLocatorString(linkProps.name, routeConfiguration, linkProps.params, {});
  };

  const handleMyPublicProfileClick = () => {
    const publicProfilePath = currentUser?.id?.uuid
      ? createResourceLocatorString(
          'ProfilePage',
          routeConfiguration,
          { id: currentUser.id.uuid },
          {}
        )
      : null;
    const newPublicProfilePath = createResourceLocatorString(
      'NewListingPage',
      routeConfiguration,
      {},
      {}
    );

    // Pick "best" listing: published > pendingApproval > draft.
    return onQueryOwnListings({ page: 1, perPage: 20 })
      .then(response => {
        const listings = response?.data?.data || [];
        const firstPublished = listings.find(l => l?.attributes?.state === LISTING_STATE_PUBLISHED);
        const firstPending = listings.find(
          l => l?.attributes?.state === LISTING_STATE_PENDING_APPROVAL
        );
        const firstDraft = listings.find(l => l?.attributes?.state === LISTING_STATE_DRAFT);
        const chosen = firstPublished || firstPending || firstDraft;

        const url = chosen ? createOwnListingURL(chosen) : null;
        history.push(url || newPublicProfilePath || publicProfilePath);
      })
      .catch(() => history.push(newPublicProfilePath || publicProfilePath));
  };

  const marketplaceName = config.marketplaceName;
  const classes = classNames(rootClassName || css.root, className);

  const handleSkipToMainContent = e => {
    e.preventDefault();
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Focus the main content for screen readers
      mainContent.setAttribute('tabindex', '-1');
      mainContent.focus();
      // Remove tabindex after blur to avoid tabbing into it later
      mainContent.addEventListener(
        'blur',
        () => {
          mainContent.removeAttribute('tabindex');
        },
        { once: true }
      );
    }
  };

  const barLinkClasses = isCurrent =>
    classNames(buttonCss.linkHeader, css.barLink, { [css.barLinkCurrent]: isCurrent });
  const currentMaybe = isCurrent => (isCurrent ? { 'aria-current': 'page' } : {});

  const logoAlt = intl.formatMessage({ id: 'TopbarDesktop.logo' }, { marketplaceName });
  const navLabel = intl.formatMessage({ id: 'TopbarDesktop.screenreader.topbarNavigation' });

  const guestHeader = (
    <SiteHeader
      ariaLabel={navLabel}
      logoAlt={logoAlt}
      linkToExternalSite={config?.topbar?.logoLink}
      inverse={isInverse}
    >
      <NamedLink
        id="signup-link"
        name="SignupPage"
        className={classNames(buttonCss.linkHeader, css.barLink)}
      >
        <FormattedMessage id="TopbarDesktop.signup" />
      </NamedLink>
      <NamedLink
        id="login-link"
        name="LoginPage"
        className={classNames(buttonCss.linkHeader, css.barLink)}
      >
        <FormattedMessage id="TopbarDesktop.login" />
      </NamedLink>
      <HeaderMenu
        id="header-menu"
        phoneOnly
        ariaLabel={intl.formatMessage({ id: 'Topbar.menuIcon' })}
        trigger={<MenuIcon size={20} aria-hidden="true" />}
      >
        <HeaderMenuItem name="SignupPage">
          <FormattedMessage id="TopbarMobileMenu.signupLink" />
        </HeaderMenuItem>
        <HeaderMenuItem name="LoginPage">
          <FormattedMessage id="TopbarMobileMenu.loginLink" />
        </HeaderMenuItem>
      </HeaderMenu>
    </SiteHeader>
  );

  const firstName = currentUser?.attributes?.profile?.firstName;
  const loggedInHeader = (
    <SiteHeader
      ariaLabel={navLabel}
      logoAlt={logoAlt}
      logoLinkProps={{ name: homeRoute.name, params: homeRoute.params }}
      inverse={isInverse}
    >
      {homeLabel ? (
        <NamedLink
          name={homeRoute.name}
          params={homeRoute.params}
          to={homeRoute.to}
          className={barLinkClasses(isHomeCurrent)}
          {...currentMaybe(isHomeCurrent)}
        >
          {homeLabel}
          {hasUnread ? <span className={css.barDot} aria-hidden="true" /> : null}
        </NamedLink>
      ) : null}
      {isCustomer ? (
        <NamedLink
          id="find-dj-link"
          name="SearchPage"
          className={barLinkClasses(isFindDjCurrent)}
          {...currentMaybe(isFindDjCurrent)}
        >
          <FormattedMessage id="TopbarDesktop.findDjLink" />
        </NamedLink>
      ) : null}
      {isProvider ? (
        <button
          type="button"
          className={classNames(barLinkClasses(isMyProfileCurrent), css.barButton)}
          onClick={handleMyPublicProfileClick}
          {...currentMaybe(isMyProfileCurrent)}
        >
          <FormattedMessage id="TopbarDesktop.myPublicProfileLink" />
        </button>
      ) : null}
      <HeaderMenu
        id="header-menu"
        showDot={hasUnread}
        ariaLabel={intl.formatMessage({ id: 'TopbarDesktop.screenreader.profileMenu' })}
        trigger={
          <Avatar
            rootClassName={css.avatar}
            initialsClassName={css.avatarInitials}
            user={currentUser}
            disableProfileLink
          />
        }
      >
        {firstName ? (
          <HeaderMenuGreeting>
            <FormattedMessage id="TopbarMobileMenu.greeting" values={{ displayName: firstName }} />
          </HeaderMenuGreeting>
        ) : null}
        {homeLabel ? (
          <HeaderMenuItem
            phoneOnly
            name={homeRoute.name}
            params={homeRoute.params}
            to={homeRoute.to}
            current={isHomeCurrent}
          >
            {homeLabel}
          </HeaderMenuItem>
        ) : null}
        {isCustomer ? (
          <HeaderMenuItem phoneOnly name="SearchPage" current={isFindDjCurrent}>
            <FormattedMessage id="TopbarMobileMenu.findDjLink" />
          </HeaderMenuItem>
        ) : null}
        {isProvider ? (
          <HeaderMenuItem
            phoneOnly
            onClick={handleMyPublicProfileClick}
            current={isMyProfileCurrent}
          >
            <FormattedMessage id="TopbarMobileMenu.myPublicProfileLink" />
          </HeaderMenuItem>
        ) : null}
        <HeaderMenuItem name="AccountSettingsPage" current={isAccountCurrent}>
          <FormattedMessage id="TopbarDesktop.accountSettingsLink" />
        </HeaderMenuItem>
        <HeaderMenuItem onClick={handleLogout}>
          <FormattedMessage id="TopbarDesktop.logout" />
        </HeaderMenuItem>
      </HeaderMenu>
    </SiteHeader>
  );

  return (
    <div className={classes}>
      <Button onClick={handleSkipToMainContent} className={css.skipToMainContent}>
        <FormattedMessage id="Topbar.skipToMainContent" />
        <IconArrowHead direction="right" size="small" rootClassName={css.skiptoMainArrow} />
      </Button>
      <LimitedAccessBanner
        isAuthenticated={isAuthenticated}
        isLoggedInAs={isLoggedInAs}
        authScopes={authScopes}
        currentUser={currentUser}
        onLogout={handleLogout}
        currentPage={resolvedCurrentPage}
      />
      {isLoggedIn ? loggedInHeader : guestHeader}
      <ModalMissingInformation
        id="MissingInformationReminder"
        containerClassName={css.missingInformationModal}
        currentUser={currentUser}
        currentUserHasListings={currentUserHasListings}
        currentUserHasOrders={currentUserHasOrders}
        location={location}
        onManageDisableScrolling={onManageDisableScrolling}
        onResendVerificationEmail={onResendVerificationEmail}
        sendVerificationEmailInProgress={sendVerificationEmailInProgress}
        sendVerificationEmailError={sendVerificationEmailError}
      />

      <GenericError show={showGenericError} />
    </div>
  );
};

const Topbar = props => {
  const config = useConfiguration();
  const routeConfiguration = useRouteConfiguration();
  const intl = useIntl();
  return (
    <TopbarComponent
      config={config}
      routeConfiguration={routeConfiguration}
      intl={intl}
      {...props}
    />
  );
};

export default Topbar;
