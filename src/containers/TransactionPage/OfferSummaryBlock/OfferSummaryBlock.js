import React from 'react';
import classNames from 'classnames';

import { FormattedMessage } from '../../../util/reactIntl';
import { LINE_ITEM_OFFER, LINE_ITEM_REQUEST } from '../../../util/types';
import { formatMoney } from '../../../util/currency';

import { Heading } from '../../../components';

import css from './OfferSummaryBlock.module.css';

const MAX_PREVIEW_LEN = 160;

/**
 * Compact offer summary for negotiation (DJ provider view): price and optional context.
 *
 * @param {Object} props
 * @param {propTypes.transaction} props.transaction
 * @param {propTypes.listing} props.listing
 * @param {import('../../../util/reactIntl').intlShape} props.intl
 * @param {Array} [props.messages] - Thread messages (optional preview of latest from counterparty)
 * @param {Object} [props.currentUser]
 * @param {string} [props.className]
 */
const OfferSummaryBlock = props => {
  const {
    transaction,
    listing,
    intl,
    messages = [],
    currentUser,
    className,
    rootClassName,
  } = props;

  const myId = currentUser?.id?.uuid;

  const lineItems = transaction?.attributes?.lineItems || [];
  const offerLineItem = lineItems.find(
    item => [LINE_ITEM_OFFER, LINE_ITEM_REQUEST].includes(item.code) && !item.reversal
  );
  const unitPrice = offerLineItem?.unitPrice;
  const lineTotal = offerLineItem?.lineTotal;
  const displayMoney = unitPrice || lineTotal;

  const protectedData = transaction?.attributes?.protectedData || {};
  const bookingStart = protectedData?.bookingStart;
  const bookingEnd = protectedData?.bookingEnd;

  const lastOtherMessage = [...messages]
    .reverse()
    .find(m => {
      const senderId = m?.attributes?.sender?.id?.uuid;
      const content = m?.attributes?.content?.trim();
      return content && senderId && senderId !== myId;
    });
  const previewRaw = lastOtherMessage?.attributes?.content?.trim() || '';
  const messagePreview =
    previewRaw.length > MAX_PREVIEW_LEN
      ? `${previewRaw.slice(0, MAX_PREVIEW_LEN)}…`
      : previewRaw;

  const listingPublic = listing?.attributes?.publicData || {};
  const eventHint =
    listingPublic.eventName ||
    listingPublic.eventTitle ||
    listingPublic.venueName ||
    null;

  const classes = classNames(rootClassName || css.root, className);

  if (!displayMoney) {
    return null;
  }

  const formattedPrice = formatMoney(intl, displayMoney);

  return (
    <section className={classes} aria-labelledby="OfferSummaryBlock-title">
      <Heading as="h2" rootClassName={css.title} id="OfferSummaryBlock-title">
        <FormattedMessage id="OfferSummaryBlock.title" />
      </Heading>
      <div className={css.price}>{formattedPrice}</div>
      {bookingStart && bookingEnd ? (
        <p className={css.detailLine}>
          <FormattedMessage
            id="OfferSummaryBlock.bookingRange"
            values={{
              start: intl.formatDate(bookingStart, { dateStyle: 'medium' }),
              end: intl.formatDate(bookingEnd, { dateStyle: 'medium' }),
            }}
          />
        </p>
      ) : null}
      {eventHint ? (
        <p className={css.detailLine}>
          <FormattedMessage id="OfferSummaryBlock.eventHint" values={{ hint: eventHint }} />
        </p>
      ) : null}
      {messagePreview ? (
        <div className={css.messagePreview}>
          <p className={css.messagePreviewLabel}>
            <FormattedMessage id="OfferSummaryBlock.latestMessage" />
          </p>
          <p>{messagePreview}</p>
        </div>
      ) : null}
    </section>
  );
};

export default OfferSummaryBlock;
