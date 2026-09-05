import React from 'react';
import loadable from '@loadable/component';

import { bool, object } from 'prop-types';
import { arrayOf } from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import { fetchFeaturedListings } from '../../ducks/featuredListings.duck';
import { getMarketplaceEntities, getListingsById } from '../../ducks/marketplaceData.duck';
import { useConfiguration } from '../../context/configurationContext';
import { useRouteConfiguration } from '../../context/routeConfigurationContext';
import { getFeaturedListingsProps, userDisplayNameAsString } from '../../util/data';
import { FormattedMessage, useIntl } from '../../util/reactIntl';
import { formatMoney, formatMoneyWithoutCents } from '../../util/currency';
import { LISTING_STATE_DRAFT, LISTING_STATE_PUBLISHED, propTypes } from '../../util/types';
import { getCurrentUserTypeRoles, isUserAuthorized } from '../../util/userHelpers';
import { types as sdkTypes } from '../../util/sdkLoader';
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
import {
  getNegotiationSummary,
  states as negotiationStates,
} from '../../transactions/transactionProcessNegotiation';
import { getStateData } from '../InboxPage/InboxPage.stateData';

import NotFoundPage from '../../containers/NotFoundPage/NotFoundPage';
const PageBuilder = loadable(() =>
  import(/* webpackChunkName: "PageBuilder" */ '../PageBuilder/PageBuilder')
);

import css from './CMSPage.module.css';
const { Money } = sdkTypes;

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
    history,
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
                history={history}
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
  const { currentUser, transactions = [], ownListings = [], ownListingsLoaded, history } = props;
  const config = useConfiguration();
  const routeConfiguration = useRouteConfiguration() || [];
  const intl = useIntl();

  const displayName = userDisplayNameAsString(currentUser, '');
  const roles = getCurrentUserTypeRoles(config, currentUser);
  const isOrganizer = roles?.customer && !roles?.provider;
  const isDj = roles?.provider && !roles?.customer;
  const isApproved = isUserAuthorized(currentUser);

  const hasPayoutDetails = !!currentUser?.attributes?.stripeConnected;
  const hasOwnListings = ownListingsLoaded && ownListings.length > 0;
  const hasPublishedProfile =
    ownListingsLoaded &&
    ownListings.some(listing => listing?.attributes?.state === LISTING_STATE_PUBLISHED);
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

  const djPrimaryCardTitleId = hasOwnListings
    ? 'Home.manageListingTitleDj'
    : 'Home.createListingTitleDj';
  const djPrimaryCardSubtitleId = hasOwnListings
    ? 'Home.manageListingSubtitleDj'
    : 'Home.createListingSubtitleDj';

  const sortByLatestAction = txs =>
    [...txs].sort((left, right) => {
      const leftTime = new Date(left?.attributes?.lastTransitionedAt || 0).getTime();
      const rightTime = new Date(right?.attributes?.lastTransitionedAt || 0).getTime();
      return rightTime - leftTime;
    });

  const offerTxs = isOrganizer
    ? sortByLatestAction(
        (transactions || [])
        .filter(tx => {
          const processName = resolveLatestProcessName(tx?.attributes?.processName);
          return (
            isNegotiationProcess(processName) &&
            tx?.customer?.id?.uuid &&
            currentUser?.id?.uuid &&
            tx.customer.id.uuid === currentUser.id.uuid
          );
        })
        ).slice(0, 6)
    : isDj
      ? sortByLatestAction(
        (transactions || [])
        .filter(tx => {
          const processName = resolveLatestProcessName(tx?.attributes?.processName);
          return (
            isNegotiationProcess(processName) &&
            tx?.provider?.id?.uuid &&
            currentUser?.id?.uuid &&
            tx.provider.id.uuid === currentUser.id.uuid
          );
        })
      ).slice(0, 6)
    : [];

  if (!isApproved) {
    const pendingApprovalTitleId = isDj
      ? 'Home.pendingApprovalTitleDj'
      : 'Home.pendingApprovalTitleOrganizer';
    const pendingApprovalMessageId = isDj
      ? 'Home.pendingApprovalMessageDj'
      : 'Home.pendingApprovalMessageOrganizer';
    const pendingApprovalCtaName = isDj ? 'StripePayoutPage' : 'SearchPage';
    const pendingApprovalCtaId = isDj
      ? 'Home.pendingApprovalCtaDj'
      : 'Home.pendingApprovalCtaOrganizer';

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
        {(isOrganizer && offerTxs.length === 0) ||
        (isDj && (!hasPublishedProfile || !hasPayoutDetails)) ? (
          <>
            <h2 className={css.whatsNextTitle}>
              <FormattedMessage id="Home.whatsNext" />
            </h2>
            <div className={css.nextCards}>
              <div className={css.nextCard}>
                <div className={css.nextCardMain}>
                  <div className={css.nextCardTitle}>
                    <FormattedMessage
                      id={
                        isOrganizer
                          ? 'Home.findNextDjTitle'
                          : hasPublishedProfile
                          ? djPrimaryCardTitleId
                          : 'Home.approvedProfileTitleDj'
                      }
                    />
                  </div>
                  <div className={css.nextCardSubtitle}>
                    <FormattedMessage
                      id={
                        isOrganizer
                          ? 'Home.findNextDjSubtitle'
                          : hasPublishedProfile
                          ? djPrimaryCardSubtitleId
                          : 'Home.approvedProfileSubtitleDj'
                      }
                    />
                  </div>
                </div>
                <div className={css.nextCardCtaSlot}>
                  {isOrganizer ? (
                    <NamedLink className={css.nextCardCta} name="SearchPage">
                      <FormattedMessage id="Home.findDjCta" />
                    </NamedLink>
                  ) : null}
                  {isDj && hasPublishedProfile && hasOwnListings && firstOwnListingId ? (
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
                  {isDj && !hasPublishedProfile ? (
                    <NamedLink className={css.nextCardCta} name="NewListingPage">
                      <FormattedMessage id="Home.createProfileCtaDj" />
                    </NamedLink>
                  ) : null}
                </div>
              </div>

              {isDj && !hasPayoutDetails ? (
                <div className={css.nextCard}>
                  <div className={css.nextCardMain}>
                    <div className={css.nextCardTitle}>
                      <FormattedMessage
                        id={
                          offerTxs.length > 0
                            ? 'Home.blockedBookingTitleDj'
                            : 'Home.completePayoutTitleDj'
                        }
                      />
                    </div>
                    <div className={css.nextCardSubtitle}>
                      <FormattedMessage
                        id={
                          offerTxs.length > 0
                            ? 'Home.blockedBookingSubtitleDj'
                            : 'Home.profileReadyPayoutSubtitleDj'
                        }
                      />
                    </div>
                  </div>
                  <div className={css.nextCardCtaSlot}>
                    <NamedLink className={css.nextCardCta} name="StripePayoutPage">
                      <FormattedMessage id="Home.pendingApprovalCtaDj" />
                    </NamedLink>
                  </div>
                </div>
              ) : null}
            </div>
          </>
        ) : null}

        {(isOrganizer || isDj) && offerTxs.length > 0 ? (
          <div className={css.offersSection}>
            <h3 className={css.offersTitle}>
              <FormattedMessage id="Home.activityTitle" />
            </h3>
            <div className={css.offerCards}>
              {offerTxs.map(tx => {
                const isCustomerView = isOrganizer;
                const otherParty = isCustomerView ? tx?.provider : tx?.customer;
                const otherPartyName = userDisplayNameAsString(otherParty, '');
                const negotiationSummary = getNegotiationSummary(tx);
                const latestOffer = negotiationSummary.latestBusinessOffer;
                const offerCurrency =
                  tx?.attributes?.payinTotal?.currency ||
                  tx?.listing?.attributes?.price?.currency ||
                  config?.currency;
                const latestOfferIsFromCurrentUser =
                  latestOffer?.by ===
                  (isCustomerView ? TX_TRANSITION_ACTOR_CUSTOMER : TX_TRANSITION_ACTOR_PROVIDER);
                const offerTitlePrefix =
                  negotiationSummary.latestBusinessOfferType === 'final-offer'
                    ? 'Home.finalOffer'
                    : negotiationSummary.latestBusinessOfferType === 'counter-offer'
                    ? 'Home.counterOffer'
                    : 'Home.offer';
                const offerTitleId = `${offerTitlePrefix}${latestOfferIsFromCurrentUser ? 'To' : 'From'}`;
                const date = tx?.attributes?.lastTransitionedAt;
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
                const currentUserActor = isCustomerView
                  ? TX_TRANSITION_ACTOR_CUSTOMER
                  : TX_TRANSITION_ACTOR_PROVIDER;
                const latestActionActor = negotiationSummary.latestBusinessAction?.by;
                const finalOfferOutcome = ['final-offer-accepted', 'final-offer-rejected'].includes(
                  negotiationSummary.currentBusinessState?.businessState
                );
                const finalOfferAccepted =
                  negotiationSummary.currentBusinessState?.businessState === 'final-offer-accepted';
                const needsUserAction =
                  !finalOfferOutcome && latestActionActor !== currentUserActor;
                const activityStatusId = needsUserAction
                  ? 'Home.activityNeedsYourAction'
                  : finalOfferOutcome && latestActionActor !== currentUserActor
                  ? finalOfferAccepted
                    ? 'Home.activityFinalOfferAccepted'
                    : 'Home.activityFinalOfferRejected'
                  : latestActionActor === currentUserActor
                  ? 'Home.activityYouResponded'
                  : 'Home.activityWaitingForOtherParty';
                const showPayCta =
                  isNegotiationProcess(pName) && pState === negotiationStates.PENDING_PAYMENT;
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
                    className={`${css.offerCard} ${showPayCta ? css.offerCardAction : ''} ${
                      detailPagePath ? css.offerCardClickable : ''
                    }`}
                    role={detailPagePath ? 'link' : undefined}
                    tabIndex={detailPagePath ? 0 : -1}
                    onClick={handleOpenOffer}
                    onKeyDown={handleOfferKeyDown}
                  >
                    <div className={css.offerCardMain}>
                      <div className={css.offerCardHeader}>
                        <div className={css.offerCardTitle}>
                          <FormattedMessage id={offerTitleId} values={{ name: otherPartyName }} />
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
                          <div
                            className={`${css.offerCardStatus} ${
                              needsUserAction ? css.offerCardStatusPending : css.offerCardStatusAccepted
                            }`}
                          >
                            <FormattedMessage
                              id={activityStatusId}
                              values={{ name: otherPartyName }}
                            />
                          </div>
                          {showPayCta && isCustomerView ? (
                            <div className={css.offerCardStatusRow}>
                              <NamedLink
                                className={css.nextCardCta}
                                name="OrderDetailsPage"
                                params={{ id: tx.id.uuid }}
                              >
                                <FormattedMessage id="Home.ctaPay" />
                              </NamedLink>
                            </div>
                          ) : null}
                        </div>
                      </div>
                      <div className={css.offerCardMeta}>
                        <div className={css.offerCardPrice}>
                          {latestOffer?.amount != null && offerCurrency
                            ? formatMoneyWithoutCents(
                                intl,
                                new Money(latestOffer.amount, offerCurrency)
                              )
                            : tx?.attributes?.payinTotal
                            ? formatMoney(intl, tx.attributes.payinTotal)
                            : '—'}
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
