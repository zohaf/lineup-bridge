import React from 'react';
import classNames from 'classnames';

import appSettings from '../../../config/settings';
import { useConfiguration } from '../../../context/configurationContext';
import { useRouteConfiguration } from '../../../context/routeConfigurationContext';

import { pickBy } from '../../../util/common';
import { FormattedMessage, useIntl } from '../../../util/reactIntl';
import { isMainSearchTypeKeywords, isOriginInUse } from '../../../util/search';
import {
  LISTING_PAGE_DRAFT_VARIANT,
  LISTING_PAGE_PENDING_APPROVAL_VARIANT,
  createSlug,
  parse,
  stringify,
} from '../../../util/urlHelpers';
import { createResourceLocatorString, matchPathname, pathByRouteName } from '../../../util/routes';
import {
  LISTING_STATE_DRAFT,
  LISTING_STATE_PENDING_APPROVAL,
  LISTING_STATE_PUBLISHED,
} from '../../../util/types';
import {
  Button,
  IconArrowHead,
  LimitedAccessBanner,
  LinkedLogo,
  Modal,
  ModalMissingInformation,
} from '../../../components';
import { getSearchPageResourceLocatorStringParams } from '../../SearchPage/SearchPage.shared';

import MenuIcon from './MenuIcon';
import SearchIcon from './SearchIcon';
import TopbarSearchForm from './TopbarSearchForm/TopbarSearchForm';
import TopbarMobileMenu from './TopbarMobileMenu/TopbarMobileMenu';
import TopbarDesktop from './TopbarDesktop/TopbarDesktop';

import css from './Topbar.module.css';
import { getCurrentUserTypeRoles } from '../../../util/userHelpers';

const MAX_MOBILE_SCREEN_WIDTH = 1024;

const SEARCH_DISPLAY_ALWAYS = 'always';
const SEARCH_DISPLAY_NOT_LANDING_PAGE = 'notLandingPage';
const SEARCH_DISPLAY_ONLY_SEARCH_PAGE = 'onlySearchPage';
const MOBILE_MENU_BUTTON_ID = 'mobileMenuButton';
const MOBILE_SEARCH_BUTTON_ID = 'mobileSearchButton';

const redirectToURLWithModalState = (history, location, modalStateParam) => {
  const { pathname, search, state } = location;
  const searchString = `?${stringify({ [modalStateParam]: 'open', ...parse(search) })}`;
  history.push(`${pathname}${searchString}`, state);
};

const redirectToURLWithoutModalState = (history, location, modalStateParam) => {
  const { pathname, search, state } = location;
  const queryParams = pickBy(parse(search), (v, k) => {
    return k !== modalStateParam;
  });
  const stringified = stringify(queryParams);
  const searchString = stringified ? `?${stringified}` : '';
  history.push(`${pathname}${searchString}`, state);
};

const isPrimary = o => o.group === 'primary';
const isSecondary = o => o.group === 'secondary';
const compareGroups = (a, b) => {
  const isAHigherGroupThanB = isPrimary(a) && isSecondary(b);
  const isALesserGroupThanB = isSecondary(a) && isPrimary(b);
  // Note: sort order is stable in JS
  return isAHigherGroupThanB ? -1 : isALesserGroupThanB ? 1 : 0;
};
// Returns links in order where primary links are returned first
const sortCustomLinks = customLinks => {
  const links = Array.isArray(customLinks) ? [...customLinks] : [];
  return links.sort(compareGroups);
};

// Resolves in-app links against route configuration
const getResolvedCustomLinks = (customLinks, routeConfiguration) => {
  const links = Array.isArray(customLinks) ? customLinks : [];
  return links.map(linkConfig => {
    const { type, href } = linkConfig;
    const isFullUrl = href && (href.startsWith('http://') || href.startsWith('https://'));
    // Hosted top-bar links often use "p/home" without a leading slash; that breaks URL parsing
    // and falls through to ExternalLink (new tab + relative URL → /inbox/p/home).
    const normalizedHref =
      href && !isFullUrl && !href.startsWith('/') && !href.startsWith('//')
        ? `/${href}`
        : href;

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
    const normalizedHref = h.startsWith('http://') || h.startsWith('https://') ? h : `http://x${h.startsWith('/') ? h : `/${h}`}`;
    const parsed = new URL(normalizedHref);
    const normalizedPath = (parsed.pathname || '').replace(/\/+$/, '') || '/';
    return normalizedPath === '/p/home' || normalizedPath === '/';
  } catch (e) {
    return false;
  }
};

const normalizeTopbarLinkText = link => {
  // Ensure consistent casing for "Home" label
  return isHomeTopbarLink(link) ? { ...link, text: 'Home' } : link;
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
    desktopClassName,
    mobileRootClassName,
    mobileClassName,
    isAuthenticated,
    isLoggedInAs,
    authScopes = [],
    authInProgress,
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

  const handleSubmit = values => {
    const { currentSearchParams, history, location, config, routeConfiguration } = props;

    const topbarSearchParams = () => {
      if (isMainSearchTypeKeywords(config)) {
        return { keywords: values?.keywords };
      }
      // topbar search defaults to 'location' search
      const { search, selectedPlace } = values?.location || {};
      const { origin, bounds } = selectedPlace || {};
      const originMaybe = isOriginInUse(config) ? { origin } : {};

      return {
        ...originMaybe,
        address: search,
        bounds,
      };
    };
    const searchParams = {
      ...currentSearchParams,
      ...topbarSearchParams(),
    };

    const { routeName, pathParams } = getSearchPageResourceLocatorStringParams(
      routeConfiguration,
      location
    );

    history.push(
      createResourceLocatorString(routeName, routeConfiguration, pathParams, searchParams)
    );
  };

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
  const showCreateListingsLink = false;
  const { customer: isCustomer, provider: isProvider } = getCurrentUserTypeRoles(
    config,
    currentUser
  );

  /**
   * Determine which tab to use in the inbox link:
   * - if only provider role – sales
   * - if only customer role – orders
   * - if both roles – determine by currentUserHasListings value
   */
  const topbarInboxTab = !isCustomer
    ? 'sales'
    : !isProvider
    ? 'orders'
    : currentUserHasListings
    ? 'sales'
    : 'orders';

  const { mobilemenu, mobilesearch, keywords, address, origin, bounds } = parse(location.search, {
    latlng: ['origin'],
    latlngBounds: ['bounds'],
  });

  // Custom links are sorted so that group="primary" are always at the beginning of the list.
  const sortedCustomLinks = sortCustomLinks(config.topbar?.customLinks);
  const customLinksResolved = getResolvedCustomLinks(sortedCustomLinks, routeConfiguration).map(
    normalizeTopbarLinkText
  );
  const resolvedCurrentPage = currentPage || getResolvedCurrentPage(location, routeConfiguration);

  // Logged-out users on the marketing landing page only see Sign up + Log in (no search, no custom links).
  const isEffectivelyAuthenticated = isAuthenticated && !logoutInProgress;
  const isLandingUnauthenticated = resolvedCurrentPage === 'LandingPage' && !isEffectivelyAuthenticated;

  // Home (/p/home) in the top bar only when logged in — not on signup/login flows for guests.
  const customLinksFilteredForAuth = isEffectivelyAuthenticated
    ? customLinksResolved
    : customLinksResolved.filter(
        link =>
          !isHomeTopbarLink(link) && String(link.text || '').trim().toLowerCase() !== 'home'
      );

  const customLinksForTopbar = isLandingUnauthenticated ? [] : customLinksFilteredForAuth;

  const notificationDot = notificationCount > 0 ? <div className={css.notificationDot} /> : null;

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

  const hasMatchMedia = typeof window !== 'undefined' && window?.matchMedia;
  const isMobileLayout = hasMatchMedia
    ? window.matchMedia(`(max-width: ${MAX_MOBILE_SCREEN_WIDTH}px)`)?.matches
    : true;
  const isMobileMenuOpen = isMobileLayout && mobilemenu === 'open';
  const isMobileSearchOpen = isMobileLayout && mobilesearch === 'open';

  const mobileMenu = (
    <TopbarMobileMenu
      isAuthenticated={isAuthenticated}
      currentUser={currentUser}
      onLogout={handleLogout}
      notificationCount={notificationCount}
      currentPage={resolvedCurrentPage}
      customLinks={customLinksForTopbar}
      showCreateListingsLink={showCreateListingsLink}
      inboxTab={topbarInboxTab}
      config={config}
      onMyPublicProfileClick={handleMyPublicProfileClick}
    />
  );

  const topbarSearcInitialValues = () => {
    if (isMainSearchTypeKeywords(config)) {
      return { keywords };
    }

    // Only render current search if full place object is available in the URL params
    const locationFieldsPresent = isOriginInUse(config)
      ? address && origin && bounds
      : address && bounds;
    return {
      location: locationFieldsPresent
        ? {
            search: address,
            selectedPlace: { address, origin, bounds },
          }
        : null,
    };
  };
  const initialSearchFormValues = topbarSearcInitialValues();

  const classes = classNames(rootClassName || css.root, className);

  const { display: searchFormDisplay = SEARCH_DISPLAY_ALWAYS } = config?.topbar?.searchBar || {};

  // Search form is shown conditionally depending on configuration and
  // the current page.
  const showSearchOnAllPages = searchFormDisplay === SEARCH_DISPLAY_ALWAYS;
  const showSearchOnSearchPage =
    searchFormDisplay === SEARCH_DISPLAY_ONLY_SEARCH_PAGE &&
    ['SearchPage', 'SearchPageWithListingType'].includes(resolvedCurrentPage);
  const showSearchNotOnLandingPage =
    searchFormDisplay === SEARCH_DISPLAY_NOT_LANDING_PAGE && resolvedCurrentPage !== 'LandingPage';

  // Search UI is rendered on-page (e.g. SearchCTA on SearchPage),
  // so we disable the Topbar search form completely.
  const showSearchForm = false;

  const mobileSearchButtonMaybe = showSearchForm ? (
    <Button
      id={MOBILE_SEARCH_BUTTON_ID}
      rootClassName={css.searchMenu}
      onClick={() => redirectToURLWithModalState(history, location, 'mobilesearch')}
      title={intl.formatMessage({ id: 'Topbar.searchIcon' })}
    >
      <SearchIcon
        className={css.searchMenuIcon}
        ariaLabel={intl.formatMessage({ id: 'Topbar.searchIcon' })}
      />
    </Button>
  ) : (
    <div className={css.searchMenu} />
  );

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
      <nav className={classNames(mobileRootClassName || css.container, mobileClassName)}>
        <Button
          id={MOBILE_MENU_BUTTON_ID}
          rootClassName={css.menu}
          onClick={() => redirectToURLWithModalState(history, location, 'mobilemenu')}
          title={intl.formatMessage({ id: 'Topbar.menuIcon' })}
        >
          <MenuIcon
            className={css.menuIcon}
            ariaLabel={intl.formatMessage({ id: 'Topbar.menuIcon' })}
          />
          {notificationDot}
        </Button>
        <LinkedLogo
          id="logo-topbar-mobile"
          layout={'mobile'}
          logoClassName={css.topbarMobileLogoRoot}
          logoImageClassName={css.topbarMobileLogoHalf}
          alt={intl.formatMessage({ id: 'Topbar.logoIcon' })}
          linkToExternalSite={config?.topbar?.logoLink}
        />
        {mobileSearchButtonMaybe}
      </nav>
      <div className={css.desktop}>
        <TopbarDesktop
          className={desktopClassName}
          currentUserHasListings={currentUserHasListings}
          currentUser={currentUser}
          currentPage={resolvedCurrentPage}
          initialSearchFormValues={initialSearchFormValues}
          intl={intl}
          isAuthenticated={isAuthenticated}
          notificationCount={notificationCount}
          onLogout={handleLogout}
          onSearchSubmit={handleSubmit}
          config={config}
          customLinks={customLinksForTopbar}
          showSearchForm={showSearchForm}
          showCreateListingsLink={showCreateListingsLink}
          inboxTab={topbarInboxTab}
          onMyPublicProfileClick={handleMyPublicProfileClick}
        />
      </div>
      <Modal
        id="TopbarMobileMenu"
        containerClassName={css.modalContainer}
        isOpen={isMobileMenuOpen}
        onClose={() => redirectToURLWithoutModalState(history, location, 'mobilemenu')}
        usePortal
        onManageDisableScrolling={onManageDisableScrolling}
        focusElementId={MOBILE_MENU_BUTTON_ID}
      >
        {authInProgress ? null : mobileMenu}
      </Modal>
      <Modal
        id="TopbarMobileSearch"
        containerClassName={css.modalContainerSearchForm}
        isOpen={isMobileSearchOpen}
        onClose={() => redirectToURLWithoutModalState(history, location, 'mobilesearch')}
        usePortal
        onManageDisableScrolling={onManageDisableScrolling}
        focusElementId={MOBILE_SEARCH_BUTTON_ID}
      >
        <div className={css.searchContainer}>
          <TopbarSearchForm
            onSubmit={handleSubmit}
            initialValues={initialSearchFormValues}
            isMobile
            appConfig={config}
          />
          <p className={css.mobileHelp}>
            <FormattedMessage id="Topbar.mobileSearchHelp" />
          </p>
        </div>
      </Modal>
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

/**
 * Topbar containing logo, main search and navigation links.
 *
 * @component
 * @param {Object} props
 * @param {string?} props.className add more style rules in addition to components own css.root
 * @param {string?} props.rootClassName overwrite components own css.root
 * @param {Object} props.desktopClassName add more style rules for TopbarDesktop
 * @param {Object} props.mobileRootClassName overwrite mobile layout root classes
 * @param {Object} props.mobileClassName add more style rules for mobile layout
 * @param {boolean} props.isAuthenticated
 * @param {boolean} props.isLoggedInAs
 * @param {Object} props.currentUser
 * @param {boolean} props.currentUserHasListings
 * @param {boolean} props.currentUserHasOrders
 * @param {string} props.currentPage
 * @param {number} props.notificationCount
 * @param {Function} props.onLogout
 * @param {Function} props.onManageDisableScrolling
 * @param {Function} props.onResendVerificationEmail
 * @param {Object} props.sendVerificationEmailInProgress
 * @param {Object} props.sendVerificationEmailError
 * @param {boolean} props.showGenericError
 * @param {Object} props.history
 * @param {Function} props.history.push
 * @param {Object} props.location
 * @param {string} props.location.search '?foo=bar'
 * @returns {JSX.Element} topbar component
 */
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
