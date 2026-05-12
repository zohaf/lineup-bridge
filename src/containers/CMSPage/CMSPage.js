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
import {
  ensurePaymentMethodCard,
  ensureStripeCustomer,
  getFeaturedListingsProps,
  userDisplayNameAsString,
} from '../../util/data';
import { FormattedMessage, useIntl } from '../../util/reactIntl';
import { formatMoney } from '../../util/currency';
import { propTypes } from '../../util/types';
import { getCurrentUserTypeRoles } from '../../util/userHelpers';
import { getOwnListingsById } from '../ManageListingsPage/ManageListingsPage.duck';
import ManageListingCard from '../ManageListingsPage/ManageListingCard/ManageListingCard';
import { NamedLink } from '../../components';
import {
  resolveLatestProcessName,
  isNegotiationProcess,
  TX_TRANSITION_ACTOR_CUSTOMER,
} from '../../transactions/transaction';
import { states as negotiationStates } from '../../transactions/transactionProcessNegotiation';
import { getStateData } from '../InboxPage/InboxPage.stateData';

import NotFoundPage from '../../containers/NotFoundPage/NotFoundPage';
const PageBuilder = loadable(() =>
  import(/* webpackChunkName: "PageBuilder" */ '../PageBuilder/PageBuilder')
);

import css from './CMSPage.module.css';

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
              <HomeNextSteps currentUser={currentUser} transactions={transactions} />
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
  const { currentUser, transactions = [] } = props;
  const config = useConfiguration();
  const intl = useIntl();

  const displayName = userDisplayNameAsString(currentUser, '');
  const roles = getCurrentUserTypeRoles(config, currentUser);
  const isOrganizer = roles?.customer && !roles?.provider;
  const isDj = roles?.provider && !roles?.customer;

  const ensuredStripeCustomer = ensureStripeCustomer(currentUser?.stripeCustomer);
  const ensuredDefaultPaymentMethod = ensurePaymentMethodCard(
    ensuredStripeCustomer?.defaultPaymentMethod
  );
  const hasDefaultPaymentMethod =
    !!ensuredStripeCustomer?.attributes?.stripeCustomerId && !!ensuredDefaultPaymentMethod?.id;

  const hasPayoutDetails = !!currentUser?.attributes?.stripeConnected;

  const showCompletePaymentCard =
    (isOrganizer && !hasDefaultPaymentMethod) || (isDj && !hasPayoutDetails);

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
    : [];

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
                    isOrganizer
                      ? 'Home.completePaymentDetailsTitleOrganizer'
                      : 'Home.completePaymentDetailsTitleDj'
                  }
                />
              </div>
              <div className={css.nextCardSubtitle}>
                <FormattedMessage
                  id={
                    isOrganizer
                      ? 'Home.completePaymentDetailsSubtitleOrganizer'
                      : 'Home.completePaymentDetailsSubtitleDj'
                  }
                />
              </div>
            </div>
            <div className={css.nextCardCtaSlot}>
              {showCompletePaymentCard ? (
                <NamedLink
                  className={css.nextCardCta}
                  name={isOrganizer ? 'PaymentMethodsPage' : 'StripePayoutPage'}
                >
                  <FormattedMessage id="Home.ctaAdd" />
                </NamedLink>
              ) : null}
            </div>
          </div>

          <div className={css.nextCard}>
            <div className={css.nextCardMain}>
              <div className={css.nextCardTitle}>
                <FormattedMessage id="Home.viewMessagesTitle" />
              </div>
              <div className={css.nextCardSubtitle}>
                <FormattedMessage id="Home.viewMessagesSubtitle" />
              </div>
            </div>
            <div className={css.nextCardCtaSlot}>
              <NamedLink className={css.nextCardCta} name="InboxPage" params={{ tab: 'orders' }}>
                <FormattedMessage id="Home.ctaView" />
              </NamedLink>
            </div>
          </div>
        </div>

        {isOrganizer && offerTxs.length > 0 ? (
          <div className={css.offersSection}>
            <h3 className={css.offersTitle}>
              <FormattedMessage id="Home.offersTitle" />
            </h3>
            <div className={css.offerCards}>
              {offerTxs.map(tx => {
                const providerName = userDisplayNameAsString(tx?.provider, '');
                const date = tx?.attributes?.lastTransitionedAt;
                const money = tx?.attributes?.payinTotal;
                let stateData = {};
                try {
                  stateData = getStateData({
                    transaction: tx,
                    transactionRole: TX_TRANSITION_ACTOR_CUSTOMER,
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

                return (
                  <div key={tx.id.uuid} className={css.offerCard}>
                    <div className={css.offerCardMain}>
                      <div className={css.offerCardTitle}>
                        <FormattedMessage id="Home.offerTo" values={{ name: providerName }} />
                      </div>
                      <div className={css.offerMeta}>
                        <div className={css.offerMetaRow}>
                          <span className={css.offerMetaLabel}>
                            <FormattedMessage id="Home.offerDateLabel" />
                          </span>
                          <span className={css.offerMetaValue}>
                            {date
                              ? intl.formatDate(date, {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })
                              : '—'}
                          </span>
                        </div>
                        <div className={css.offerMetaRow}>
                          <span className={css.offerMetaLabel}>
                            <FormattedMessage id="Home.offerPriceLabel" />
                          </span>
                          <span className={css.offerMetaValue}>
                            {money ? formatMoney(intl, money) : '—'}
                          </span>
                        </div>
                        <div className={css.offerMetaRow}>
                          <span className={css.offerMetaLabel}>
                            <FormattedMessage id="Home.offerStatusLabel" />
                          </span>
                          <span className={css.offerMetaValue}>
                            {statusId ? <FormattedMessage id={statusId} /> : '—'}
                          </span>
                        </div>
                      </div>
                    </div>
                    {showPayCta ? (
                      <div className={css.offerCardCtaSlot}>
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
  const { ownListings = [], ownListingsLoaded } = props;
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
        ) : hasNoOwnListings ? (
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
