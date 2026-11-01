import React from 'react';

import { FormattedMessage, useIntl } from '../../../util/reactIntl';
import { createSlug } from '../../../util/urlHelpers';

import {
  LayoutSplit,
  NamedLink,
  PageHeader,
  ResponsiveImage,
  SectionCard,
  UserDisplayName,
} from '../../../components';

import css from './NegotiationPanel.module.css';

const allowShowingExtraInfo = (showExtraInfo, party) => {
  const {
    isCustomer,
    isCustomerBanned,
    isCustomerDeleted,
    isProviderBanned,
    isProviderDeleted,
  } = party;
  return (
    !!showExtraInfo &&
    ((!isCustomer && !isCustomerBanned && !isCustomerDeleted) ||
      (isCustomer && !isProviderBanned && !isProviderDeleted))
  );
};

/**
 * Transaction page for the negotiation process (offer, counteroffer, final offer), in the
 * Split · summary layout: page header (DJ image, DJ name, state title and lead) above a
 * "Booking summary" card and the offer details. Actions sit in the summary card from 1024px;
 * below that, primary and tertiary go in a sticky bar and the secondary action becomes a text
 * link at the end of the page. Design: docs/3-journeys/booking.html.
 *
 * Same content and state data as TransactionPanel; only the presentation differs.
 *
 * @component
 * @param {Object} props
 * @param {ReactNode} props.topbar
 * @param {ReactNode} props.footer
 * @param {ReactNode?} props.children rendered after the page (modals)
 * @param {Object} props.listing
 * @param {Object} props.customer
 * @param {Object} props.provider
 * @param {'customer'|'provider'} props.transactionRole
 * @param {Object} props.stateData
 * @param {Object} props.config
 * @param {string?} props.headingTitleMessageId
 * @param {ReactNode?} props.orderBreakdown
 * @param {ReactNode?} props.orderPanel
 * @param {ReactNode?} props.offerDetailsSlot
 * @param {ReactNode?} props.requestQuote
 * @param {ReactNode?} props.transactionFieldsComponent
 * @param {Function} props.actionButtons (containerId, extraProps) => ActionButtons element
 * @param {boolean?} props.hasViewingRights
 * @param {boolean?} props.showListingImage
 * @param {boolean?} props.savePaymentMethodFailed
 * @returns {JSX.Element}
 */
const NegotiationPanel = props => {
  const intl = useIntl();
  const {
    topbar,
    footer,
    children,
    listing,
    customer,
    provider,
    transactionRole,
    stateData = {},
    config,
    headingTitleMessageId,
    orderBreakdown,
    orderPanel,
    offerDetailsSlot,
    requestQuote,
    transactionFieldsComponent,
    actionButtons,
    hasViewingRights,
    showListingImage = true,
    savePaymentMethodFailed = false,
  } = props;

  const isCustomer = transactionRole === 'customer';
  const listingDeleted = !!listing?.attributes?.deleted;
  const party = {
    isCustomer,
    isCustomerBanned: !!customer?.attributes?.banned,
    isCustomerDeleted: !!customer?.attributes?.deleted,
    isProviderBanned: !!provider?.attributes?.banned,
    isProviderDeleted: !!provider?.attributes?.deleted,
  };

  const listingTitle = listingDeleted
    ? intl.formatMessage({ id: 'TransactionPanel.deletedListingTitle' })
    : listing?.attributes?.title;
  const firstImage = listing?.images?.length > 0 ? listing.images[0] : null;
  const { variantPrefix = 'listing-card' } = config.layout.listingImage || {};
  const imageVariants = firstImage
    ? Object.keys(firstImage?.attributes?.variants || {}).filter(k => k.startsWith(variantPrefix))
    : [];

  // Title and lead: same message ids as PanelHeading
  const { processName, processState } = stateData;
  const titleId =
    stateData.headingTitleMessageId ||
    headingTitleMessageId ||
    `TransactionPage.${processName}.${transactionRole}.${processState}.title`;
  const extraInfoId =
    stateData.extraInfoMessageId ||
    `TransactionPage.${processName}.${transactionRole}.${processState}.extraInfo`;
  const nameValues = {
    customerName: <UserDisplayName user={customer} intl={intl} />,
    providerName: <UserDisplayName user={provider} intl={intl} />,
    breakline: <br />,
  };
  const lead =
    isCustomer && listingDeleted ? (
      <FormattedMessage id="TransactionPanel.messageDeletedListing" />
    ) : !listingDeleted && allowShowingExtraInfo(stateData.showExtraInfo, party) ? (
      <FormattedMessage id={extraInfoId} values={{ ...nameValues, deliveryMethod: 'none' }} />
    ) : null;

  const header = (
    <PageHeader
      image={
        showListingImage && firstImage ? (
          <ResponsiveImage alt={listingTitle} image={firstImage} variants={imageVariants} />
        ) : null
      }
      eyebrow={
        listingDeleted ? (
          listingTitle
        ) : (
          <NamedLink
            name="ListingPage"
            params={{ id: listing?.id?.uuid, slug: createSlug(listingTitle || '') }}
          >
            {listingTitle}
          </NamedLink>
        )
      }
      title={<FormattedMessage id={titleId} values={nameValues} />}
      lead={lead}
    />
  );

  const minimalPostBookingSuccess = !!stateData.minimalPostBookingRequestCustomerView;
  const showBreakDown = stateData.showBreakDown !== false && !!orderBreakdown;
  const showOrderPanel = stateData.showOrderPanel && hasViewingRights && !minimalPostBookingSuccess;
  const showActions = !!stateData.showActionButtons;

  // The secondary action (reject, withdraw) is a text link when there is a primary next to it.
  const hasPrimary = !!stateData.primaryButtonProps;
  const order = stateData.actionButtonOrder || ['primary', 'secondary', 'tertiary'];
  const mainOrder = order.filter(b => (hasPrimary ? b !== 'secondary' : true));
  const linkOrder = hasPrimary ? order.filter(b => b === 'secondary') : [];
  const deskOrder = [...mainOrder, ...linkOrder];

  // Desktop: the actions sit in the side column, under the total. Without line items (offer
  // sent / booking offer: request-quote sets no price yet) they sit in a card of their own there.
  const desktopActions = showActions ? (
    <div className={css.desktopActions}>
      {actionButtons('desktop', {
        variant: 'stack',
        actionButtonOrder: deskOrder,
        secondaryAsLink: hasPrimary,
      })}
    </div>
  ) : null;

  const side =
    showBreakDown || showOrderPanel || showActions ? (
      <>
        {showBreakDown ? (
          <SectionCard
            title={<FormattedMessage id="CheckoutPage.default-negotiation.orderBreakdown" />}
          >
            <div className={css.breakdown}>{orderBreakdown}</div>
            {desktopActions}
          </SectionCard>
        ) : showActions ? (
          <div className={css.actionsCard}>
            <SectionCard>{desktopActions}</SectionCard>
          </div>
        ) : null}
        {showOrderPanel ? orderPanel : null}
      </>
    ) : null;

  // Below 1024px: primary + tertiary in a sticky bar, the secondary as a link at the end
  const bar =
    showActions && mainOrder.length > 0 ? (
      <div className={css.bar}>
        {actionButtons('mobile', { variant: 'bar', actionButtonOrder: mainOrder })}
      </div>
    ) : null;

  return (
    <LayoutSplit
      sideAlign={offerDetailsSlot || savePaymentMethodFailed ? 'content' : 'title'}
      topbar={topbar}
      footer={footer}
      header={header}
      side={side}
      after={bar}
    >
      {requestQuote}
      {transactionFieldsComponent}
      {savePaymentMethodFailed ? (
        <p className={css.error}>
          <FormattedMessage
            id="TransactionPanel.savePaymentMethodFailed"
            values={{
              paymentMethodsPageLink: (
                <NamedLink name="PaymentMethodsPage">
                  <FormattedMessage id="TransactionPanel.paymentMethodsPageLink" />
                </NamedLink>
              ),
            }}
          />
        </p>
      ) : null}
      {offerDetailsSlot}
      {showActions && linkOrder.length > 0 ? (
        <div className={css.link}>
          {actionButtons('mobile', {
            variant: 'stack',
            actionButtonOrder: linkOrder,
            secondaryAsLink: true,
          })}
        </div>
      ) : null}
      {children}
    </LayoutSplit>
  );
};

export default NegotiationPanel;
