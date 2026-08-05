import React from 'react';
import loadable from '@loadable/component';
import { useHistory } from 'react-router-dom';

import { bool, object } from 'prop-types';
import { arrayOf } from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import { fetchFeaturedListings } from '../../ducks/featuredListings.duck';
import { getMarketplaceEntities, getListingsById } from '../../ducks/marketplaceData.duck';
import { useConfiguration } from '../../context/configurationContext';
import { useRouteConfiguration } from '../../context/routeConfigurationContext';
import {
  ensurePaymentMethodCard,
  ensureStripeCustomer,
  getFeaturedListingsProps,
  userDisplayNameAsString,
} from '../../util/data';
import { FormattedMessage, useIntl } from '../../util/reactIntl';
import { formatMoney } from '../../util/currency';
import { LISTING_STATE_DRAFT, propTypes } from '../../util/types';
import { getCurrentUserTypeRoles, isUserAuthorized } from '../../util/userHelpers';
import {
  LISTING_PAGE_PARAM_TYPE_DRAFT,
  LISTING_PAGE_PARAM_TYPE_EDIT,
  createSlug,
} from '../../util/urlHelpers';
import { pathByRouteName } from '../../util/routes';
import { getOwnListingsById } from '../ManageListingsPage/ManageListingsPage.duck';
import ManageListingCard from '../ManageListingsPage/ManageListingCard/ManageListingCard';
import { NamedLink } from '../../components';
import {
  resolveLatestProcessName,
  isNegotiationProcess,
  TX_TRANSITION_ACTOR_CUSTOMER,
  TX_TRANSITION_ACTOR_PROVIDER,
} from '../../transactions/transaction';
import { states as negotiationStates } from '../../transactions/transactionProcessNegotiation';
import { getStateData } from '../InboxPage/InboxPage.stateData';

import NotFoundPage from '../../containers/NotFoundPage/NotFoundPage';
const PageBuilder = loadable(() =>
  import(/* webpackChunkName: "PageBuilder" */ '../PageBuilder/PageBuilder')
);

import css from './CMSPage.module.css';

const getStatusToneClass = (processState, cssModule) => {
  const state = String(processState || '').toLowerCase();
  if (!state) {
    return '';
  }

  if (
    state.includes('reject') ||
    state.includes('declin') ||
    state.includes('cancel') ||
    state.includes('disput') ||
    state.includes('expire')
  ) {
    return cssModule.offerCardStatusRejected;
  }

  if (
    state.includes('accept') ||
    state.includes('complete') ||
    state.includes('review') ||
    state.includes('confirm')
  ) {
    return cssModule.offerCardStatusAccepted;
  }

  return cssModule.offerCardStatusPending;
};

export const CMSPageComponent = props => {
  const {
    params,
    pageAssetsData,
    inProgress,
    error,
    currentUser,
    ownListings,
    ownListingsLoaded,
    transactions,
  } = props;
  const pageId = params.pageId || props.pageId;
  const isHomePage = String(pageId).toLowerCase() === 'home';

  if (!inProgress && error?.status === 404) {
    return <NotFoundPage staticContext={props.staticContext} />;
  }

  return (
    <>
      <PageBuilder
        pageAssetsData={pageAssetsData?.[pageId]?.data}
        inProgress={inProgress}
        schemaType="Article"
        featuredListings={getFeaturedListingsProps(pageId, props)}
        mainContentBefore={
          isHomePage && currentUser ? (
            <>
              <HomeNextSteps
                currentUser={currentUser}
                transactions={transactions}
                ownListings={ownListings}
                ownListingsLoaded={ownListingsLoaded}
                routeConfiguration={props.routeConfiguration}
              />
              <OwnListingsSummary
                ownListings={ownListings}
                ownListingsLoaded={ownListingsLoaded}
                currentUser={currentUser}
              />
            </>
          ) : null
        }
      />
    </>
  );
};

CMSPageComponent.propTypes = {
  pageAssetsData: object,
  inProgress: bool,
  error: propTypes.error,
  currentUser: propTypes.currentUser,
  ownListings: arrayOf(propTypes.ownListing),
  ownListingsLoaded: bool,
  transactions: arrayOf(propTypes.transaction),
};

CMSPageComponent.defaultProps = {
  transactions: [],
};

const HomeNextSteps = props => {
  const {
    currentUser,
    transactions = [],
    ownListings = [],
    ownListingsLoaded,
  } = props;
  const config = useConfiguration();
  const routeConfiguration = useRouteConfiguration() || [];
  const intl = useIntl();
  const history = useHistory();

  const displayName = userDisplayNameAsString(currentUser, '');
  const roles = getCurrentUserTypeRoles(config, currentUser);
  const isOrganizer = roles?.customer && !roles?.provider;
  const isDj = roles?.provider && !roles?.customer;
  const isApproved = isUserAuthorized(currentUser);

  const ensuredStripeCustomer = ensureStripeCustomer(currentUser?.stripeCustomer);
  const ensuredDefaultPaymentMethod = ensurePaymentMethodCard(
    ensuredStripeCustomer?.defaultPaymentMethod
  );
  const hasDefaultPaymentMethod =
    !!ensuredStripeCustomer?.attributes?.stripeCustomerId && !!ensuredDefaultPaymentMethod?.id;

  const hasPayoutDetails = !!currentUser?.attributes?.stripeConnected;
  const hasOwnListings = ownListingsLoaded && ownListings.length > 0;
  const firstOwnListing = hasOwnListings ? ownListings[0] : null;
  const firstOwnListingId = firstOwnListing?.id?.uuid;
  const firstOwnListingTitle = firstOwnListing?.attributes?.title || '';
  const firstOwnListingSlug =
    firstOwnListing?.attributes?.slug || createSlug(firstOwnListingTitle || 'listing');
  const firstOwnListingState = firstOwnListing?.attributes?.state;
  const firstOwnListingEditType =
    firstOwnListingState === LISTING_STATE_DRAFT
      ? LISTING_PAGE_PARAM_TYPE_DRAFT
      : LISTING_PAGE_PARAM_TYPE_EDIT;

  const showCompletePaymentCard =
    (isOrganizer && !hasDefaultPaymentMethod) || (isDj && !hasPayoutDetails);
  const activityTab = isDj ? 'sales' : 'orders';
  const inboxPath =
    routeConfiguration.length > 0
      ? pathByRouteName('InboxPage', routeConfiguration, { tab: activityTab })
      : null;

  const handleOpenInbox = () => {
    if (inboxPath) {
      history.push(inboxPath);
    }
  };

  const handleOpenInboxKeyDown = e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleOpenInbox();
    }
  };

  const djPrimaryCardTitleId = hasOwnListings
    ? 'Home.manageListingTitleDj'
    : 'Home.createListingTitleDj';
  const djPrimaryCardSubtitleId = hasOwnListings
    ? 'Home.manageListingSubtitleDj'
    : 'Home.createListingSubtitleDj';

  const offerTxs = isOrganizer
    ? (transactions || [])
        .filter(tx => {
          const processName = resolveLatestProcessName(tx?.attributes?.processName);
          return (
            isNegotiationProcess(processName) &&
            tx?.customer?.id?.uuid &&
            currentUser?.id?.uuid &&
            tx.customer.id.uuid === currentUser.id.uuid
          );
        })
        .slice(0, 6)
    : isDj
    ? (transactions || [])
        .filter(tx => {
          const processName = resolveLatestProcessName(tx?.attributes?.processName);
          return (
            isNegotiationProcess(processName) &&
            tx?.provider?.id?.uuid &&
            currentUser?.id?.uuid &&
            tx.provider.id.uuid === currentUser.id.uuid
          );
        })
        .slice(0, 6)
    : [];

  if (!isApproved) {
    const pendingApprovalTitleId = isDj
      ? 'Home.pendingApprovalTitleDj'
      : 'Home.pendingApprovalTitleOrganizer';
    const pendingApprovalMessageId = isDj
      ? 'Home.pendingApprovalMessageDj'
      : 'Home.pendingApprovalMessageOrganizer';
    const pendingApprovalCtaName = isDj ? 'StripePayoutPage' : 'PaymentMethodsPage';
    const pendingApprovalCtaId = isDj ? 'Home.pendingApprovalCtaDj' : 'Home.pendingApprovalCtaOrganizer';

    return (
      <section className={css.homeSection}>
        <div className={css.homeInner}>
          <p className={css.welcomeBack}>
            <FormattedMessage id="Home.welcomeBack" values={{ name: displayName }} />
          </p>

          <div className={css.pendingApprovalCard}>
            <div className={css.pendingApprovalMain}>
              <div className={css.pendingApprovalTitle}>
                <FormattedMessage id={pendingApprovalTitleId} />
              </div>
              <div className={css.pendingApprovalMessage}>
                <FormattedMessage id={pendingApprovalMessageId} />
              </div>
            </div>
            <div className={css.pendingApprovalCtaSlot}>
              <NamedLink className={css.pendingApprovalCta} name={pendingApprovalCtaName}>
                <FormattedMessage id={pendingApprovalCtaId} />
              </NamedLink>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={css.homeSection}>
      <div className={css.homeInner}>
        <p className={css.welcomeBack}>
          <FormattedMessage id="Home.welcomeBack" values={{ name: displayName }} />
        </p>
        <h2 className={css.whatsNextTitle}>
          <FormattedMessage id="Home.whatsNext" />
        </h2>

        <div className={css.nextCards}>
          <div className={css.nextCard}>
            <div className={css.nextCardMain}>
              <div className={css.nextCardTitle}>
                <FormattedMessage
                  id={
                    isOrganizer ? 'Home.completePaymentDetailsTitleOrganizer' : djPrimaryCardTitleId
                  }
                />
              </div>
              <div className={css.nextCardSubtitle}>
                <FormattedMessage
                  id={
                    isOrganizer
                      ? 'Home.completePaymentDetailsSubtitleOrganizer'
                      : djPrimaryCardSubtitleId
                  }
                />
              </div>
            </div>
            <div className={css.nextCardCtaSlot}>
              {isOrganizer && showCompletePaymentCard ? (
                <NamedLink
                  className={css.nextCardCta}
                  name={isOrganizer ? 'PaymentMethodsPage' : 'StripePayoutPage'}
                >
                  <FormattedMessage id="Home.ctaAdd" />
                </NamedLink>
              ) : null}
              {isDj && hasOwnListings && firstOwnListingId ? (
                <NamedLink
                  className={css.nextCardCta}
                  name="EditListingPage"
                  params={{
                    id: firstOwnListingId,
                    slug: firstOwnListingSlug,
                    type: firstOwnListingEditType,
                    tab: 'details',
                  }}
                >
                  <FormattedMessage id="Home.ctaEditListing" />
                </NamedLink>
              ) : null}
              {isDj && !hasOwnListings ? (
                <NamedLink className={css.nextCardCta} name="NewListingPage">
                  <FormattedMessage id="Home.ctaCreateListing" />
                </NamedLink>
              ) : null}
            </div>
          </div>

          <div
            className={`${css.nextCard} ${inboxPath ? css.nextCardClickable : ''}`}
            role={inboxPath ? 'link' : undefined}
            tabIndex={inboxPath ? 0 : -1}
            onClick={handleOpenInbox}
            onKeyDown={handleOpenInboxKeyDown}
          >
            <div className={css.nextCardMain}>
              <div className={css.nextCardTitle}>
                <FormattedMessage id="Home.viewMessagesTitle" />
              </div>
              <div className={css.nextCardSubtitle}>
                <FormattedMessage id="Home.viewMessagesSubtitle" />
              </div>
            </div>
            <div className={css.nextCardCtaSlot}>
              <NamedLink className={css.nextCardCta} name="InboxPage" params={{ tab: activityTab }}>
                <FormattedMessage id="Home.ctaView" />
              </NamedLink>
            </div>
          </div>
        </div>

        {(isOrganizer || isDj) && offerTxs.length > 0 ? (
          <div className={css.offersSection}>
            <h3 className={css.offersTitle}>
              <FormattedMessage id="Home.offersTitle" />
            </h3>
            <div className={css.offerCards}>
              {offerTxs.map(tx => {
                const isCustomerView = isOrganizer;
                const otherParty = isCustomerView ? tx?.provider : tx?.customer;
                const otherPartyName = userDisplayNameAsString(otherParty, '');
                const date = tx?.attributes?.lastTransitionedAt;
                const money = tx?.attributes?.payinTotal;
                const transactionRole = isCustomerView
                  ? TX_TRANSITION_ACTOR_CUSTOMER
                  : TX_TRANSITION_ACTOR_PROVIDER;
                let stateData = {};
                try {
                  stateData = getStateData({
                    transaction: tx,
                    transactionRole,
                    intl,
                  });
                } catch (e) {
                  stateData = {};
                }
                const pName = resolveLatestProcessName(tx?.attributes?.processName);
                const pState = stateData?.processState;
                const statusId = pName && pState ? `InboxPage.${pName}.${pState}.status` : null;
                const showPayCta =
                  isNegotiationProcess(pName) && pState === negotiationStates.PENDING_PAYMENT;
                const statusTone = getStatusToneClass(pState, css);
                const detailPageName = isCustomerView ? 'OrderDetailsPage' : 'SaleDetailsPage';
                const detailPagePath =
                  routeConfiguration.length > 0
                    ? pathByRouteName(detailPageName, routeConfiguration, {
                        id: tx.id.uuid,
                      })
                    : null;

                const handleOpenOffer = () => {
                  if (detailPagePath) {
                    history.push(detailPagePath);
                  }
                };

                const handleOfferKeyDown = e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleOpenOffer();
                  }
                };

                return (
                  <div
                    key={tx.id.uuid}
                    className={`${css.offerCard} ${showPayCta ? css.offerCardAction : ''} ${detailPagePath ? css.offerCardClickable : ''}`}
                    role={detailPagePath ? 'link' : undefined}
                    tabIndex={detailPagePath ? 0 : -1}
                    onClick={handleOpenOffer}
                    onKeyDown={handleOfferKeyDown}
                  >
                    <div className={css.offerCardMain}>
                      <div className={css.offerCardHeader}>
                        <div className={css.offerCardTitle}>
                          <FormattedMessage id="Home.offerFrom" values={{ name: otherPartyName }} />
                        </div>
                        <div className={css.offerCardRight}>
                          <div className={css.offerCardDate}>
                            {date
                              ? intl.formatDate(date, {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })
                              : '—'}
                          </div>
                          <div className={css.offerCardStatusRow}>
                            <div
                              className={[css.offerCardStatus, statusTone]
                                .filter(Boolean)
                                .join(' ')}
                            >
                              {statusId ? (
                                <FormattedMessage id={statusId} values={{ transactionRole }} />
                              ) : (
                                '—'
                              )}
                            </div>
                            {showPayCta && isCustomerView ? (
                              <NamedLink
                                className={css.nextCardCta}
                                name="OrderDetailsPage"
                                params={{ id: tx.id.uuid }}
                              >
                                <FormattedMessage id="Home.ctaPay" />
                              </NamedLink>
                            ) : null}
                          </div>
                        </div>
                      </div>
                      <div className={css.offerCardMeta}>
                        <div className={css.offerCardPrice}>
                          {money ? formatMoney(intl, money) : '—'}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
};

const OwnListingsSummary = props => {
  const { ownListings = [], ownListingsLoaded, currentUser } = props;
  const config = useConfiguration();
  const roles = getCurrentUserTypeRoles(config, currentUser);
  const isDj = roles?.provider && !roles?.customer;
  if (isDj) {
    return null;
  }
  const hasOwnListings = ownListingsLoaded && ownListings.length > 0;
  const hasNoOwnListings = ownListingsLoaded && ownListings.length === 0;
  const noop = () => null;

  const panelWidth = 62.5;
  const renderSizes = [
    `(max-width: 767px) 100vw`,
    `(max-width: 1920px) ${panelWidth / 2}vw`,
    `${panelWidth / 3}vw`,
  ].join(', ');

  return (
    <section className={css.ownListings}>
      <div className={css.ownListingsInner}>
        {hasOwnListings ? (
          <div className={css.ownListingsCards}>
            {ownListings.map(l => (
              <ManageListingCard
                key={l.id.uuid}
                listing={l}
                variant="home"
                isMenuOpen={false}
                actionsInProgressListingId={null}
                onToggleMenu={noop}
                onCloseListing={noop}
                onOpenListing={noop}
                onDiscardDraft={noop}
                hasOpeningError={false}
                hasClosingError={false}
                hasDiscardingError={false}
                renderSizes={renderSizes}
              />
            ))}
          </div>
        ) : hasNoOwnListings && isDj ? (
          <NamedLink className={css.emptyStateBox} name="NewListingPage">
            <span className={css.emptyStateLabel}>
              <FormattedMessage id="ManageListingsPage.createPublicProfile" />
            </span>
          </NamedLink>
        ) : null}
      </div>
    </section>
  );
};

const mapStateToProps = state => {
  const { pageAssetsData, inProgress, error } = state.hostedAssets || {};
  const featuredListingData = state.featuredListings || {};
  const { currentUser } = state.user || {};
  const { transactionRefs = [] } = state.InboxPage || {};
  const transactions = getMarketplaceEntities(state, transactionRefs);

  const manageListings = state.ManageListingsPage || {};
  const pagination = manageListings.pagination;
  const queryInProgress = manageListings.queryInProgress;
  const hasPaginationInfo = !!pagination && pagination.totalItems != null;
  const ownListingsLoaded = !queryInProgress && hasPaginationInfo;
  const ownListingIds = manageListings.currentPageResultIds || [];
  const ownListings = getOwnListingsById(state, ownListingIds);

  const getListingEntitiesById = listingIds => getListingsById(state, listingIds);

  return {
    pageAssetsData,
    featuredListingData,
    getListingEntitiesById,
    inProgress,
    error,
    currentUser,
    ownListings,
    ownListingsLoaded,
    transactions,
  };
};

const mapDispatchToProps = dispatch => ({
  onFetchFeaturedListings: (sectionId, parentPage, listingImageConfig, allSections) =>
    dispatch(fetchFeaturedListings({ sectionId, parentPage, listingImageConfig, allSections })),
});

const CMSPage = compose(
  withRouter,
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
)(CMSPageComponent);

export default CMSPage;
