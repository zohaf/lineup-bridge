import React, { useState } from 'react';
import classNames from 'classnames';

import { FormattedMessage, useIntl } from '../../../util/reactIntl';
import {
  getBusinessOfferType,
  getLatestBusinessOffer,
  transitions,
} from '../../../transactions/transactionProcessNegotiation';
import { ChevronDown } from 'lucide-react';

import { SectionCard } from '../../../components';

import css from './OfferDetailsCard.module.css';

/**
 * Read-only display of the customer's offer details, structured into sections.
 * When proposedChanges exist in protectedData, they are rendered in red
 * alongside the original values so the customer can compare.
 *
 * @param {Object} props
 * @param {Object} props.transaction - The Sharetribe transaction entity.
 * @param {Object} props.customer - The customer user entity.
 * @param {boolean} [props.collapsible] - One "Offer summary" card with a header (venue · date) that opens
 *   and closes; the sections become groups inside it.
 * @param {boolean} [props.defaultOpen] - With collapsible: open on load.
 * @param {'customer'|'provider'} [props.viewerRole] - Who is looking; the DJ gets the organizer's
 *   proposed-changes note while a final offer is pending.
 */
const OfferDetailsCard = props => {
  const { transaction, customer } = props;

  const {
    showProposedChanges: showProposedChangesProp = true,
    collapsible = false,
    defaultOpen = true,
    viewerRole,
  } = props;
  const intl = useIntl();
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const protectedData = transaction?.attributes?.protectedData || {};
  const listingTitle = transaction?.listing?.attributes?.title || '';

  const {
    bookingDate,
    bookingStartTime,
    bookingEndTime,
    setStartTime,
    durationHours,
    setTimeNeeded,
    previousDj,
    headliner,
    eventName,
    eventType,
    expectedAttendance,
    venueName,
    eventLocation,
    description,
    offerAmount,
    travelIncluded,
    accommodationIncluded,
    includedDetails,
    deckSetup,
    boothMonitorsAvailable,
    technicalSetup,
    proposedChanges,
  } = protectedData;

  const notProvided = (
    <span className={css.notProvided}>
      <FormattedMessage id="OfferDetailsCard.notProvided" />
    </span>
  );

  const latestBusinessOffer = getLatestBusinessOffer(transaction);
  const latestBusinessOfferType = getBusinessOfferType(latestBusinessOffer?.transition);

  // Final offer (offer 3) waiting for the DJ: the fee shows the previous priced offer struck
  // through and the final offer as the proposed value, for both sides. The DJ's earlier changes
  // then read as agreed values, not as proposals.
  const lastTransition = transaction?.attributes?.transitions?.at(-1)?.transition;
  const isFinalOfferPending =
    latestBusinessOfferType === 'final-offer' &&
    lastTransition === transitions.CUSTOMER_MAKE_COUNTER_OFFER;
  const pricedOffers = (transaction?.attributes?.metadata?.offers || []).filter(offer =>
    Number.isFinite(Number(offer?.offerInSubunits))
  );
  const previousPricedOffer = pricedOffers.length > 1 ? pricedOffers.at(-2) : null;
  const finalOfferPreviousAmount = previousPricedOffer
    ? Number(previousPricedOffer.offerInSubunits) / 100
    : proposedChanges?.proposedFee || offerAmount;
  const showProposedChanges = showProposedChangesProp && !isFinalOfferPending;
  const isReceivedDjCounterOffer =
    latestBusinessOffer?.by === 'provider' && latestBusinessOfferType === 'counter-offer';
  const latestOfferAmount = latestBusinessOffer?.amount
    ? latestBusinessOffer.amount / 100
    : offerAmount;
  const displayedOfferAmount =
    showProposedChanges && isReceivedDjCounterOffer ? offerAmount : latestOfferAmount;
  const proposedOfferAmount = proposedChanges?.proposedFee || latestOfferAmount;
  const displayedBookingStartTime = !showProposedChanges
    ? proposedChanges?.proposedStartTime || bookingStartTime
    : bookingStartTime;
  const displayedDurationHours = !showProposedChanges
    ? proposedChanges?.proposedDuration || durationHours
    : durationHours;
  const hasProposedChanges = showProposedChanges && isReceivedDjCounterOffer;

  const formatDate = dateStr => {
    if (!dateStr) return notProvided;
    try {
      const d = new Date(dateStr);
      return intl.formatDate(d, { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const formatYesNo = val => {
    if (val === 'yes') return intl.formatMessage({ id: 'RequestQuoteForm.yes' });
    if (val === 'no') return intl.formatMessage({ id: 'RequestQuoteForm.no' });
    return notProvided;
  };

  const formatSetTimeNeeded = val => {
    if (!val) return notProvided;
    const keyByValue = {
      opening: 'OfferDetailsCard.setTimeNeeded.opening',
      supporting: 'OfferDetailsCard.setTimeNeeded.supporting',
      peak_time: 'OfferDetailsCard.setTimeNeeded.peakTime',
      closing: 'OfferDetailsCard.setTimeNeeded.closing',
      all_night: 'OfferDetailsCard.setTimeNeeded.allNight',
    };
    const messageId = keyByValue[val];
    return messageId ? intl.formatMessage({ id: messageId }) : val;
  };

  const formatDeckSetup = keys => {
    if (!Array.isArray(keys) || keys.length === 0) return null;
    return keys
      .map(key =>
        intl.formatMessage({
          id: `RequestQuoteForm.deckSetup.${key}`,
          defaultMessage: key.replace(/_/g, ' '),
        })
      )
      .join(', ');
  };

  const formatSoundSystem = val => {
    if (!val) return notProvided;
    const keyByValue = {
      funktion_one: 'RequestQuoteForm.soundSystem.funktionOne',
      void: 'RequestQuoteForm.soundSystem.void',
      d_and_b: 'RequestQuoteForm.soundSystem.dAndB',
      l_acoustics: 'RequestQuoteForm.soundSystem.lAcoustics',
      other: 'RequestQuoteForm.soundSystem.other',
    };
    const messageId = keyByValue[val];
    return messageId ? intl.formatMessage({ id: messageId }) : val;
  };

  const deckSetupDisplay = formatDeckSetup(deckSetup);
  const hasTechnicalSection =
    deckSetupDisplay || boothMonitorsAvailable || technicalSetup || proposedChanges?.proposedNotes;

  const ProposedValue = ({ children }) => <span className={css.proposedValue}>{children}</span>;

  // One label/value pair. With a proposed value the current value is struck through.
  const Row = ({ label, value, proposed, full }) => (
    <div className={classNames(css.row, { [css.rowFull]: full, [css.rowChanged]: !!proposed })}>
      <dt className={css.rowLabel}>{label}</dt>
      <dd className={css.rowValue}>
        {proposed ? <span className={css.previousValue}>{value}</span> : value}
        {proposed ? <ProposedValue>{proposed}</ProposedValue> : null}
      </dd>
    </div>
  );

  const startTimeProposed =
    showProposedChanges &&
    proposedChanges?.proposedStartTime &&
    proposedChanges.proposedStartTime !== bookingStartTime ? (
      <FormattedMessage
        id="OfferDetailsCard.proposedLabel"
        values={{ value: proposedChanges.proposedStartTime }}
      />
    ) : null;

  const durationProposed =
    showProposedChanges &&
    proposedChanges?.proposedDuration &&
    proposedChanges.proposedDuration !== durationHours ? (
      <FormattedMessage
        id="OfferDetailsCard.proposedLabel"
        values={{
          value: intl.formatMessage(
            { id: 'OfferDetailsCard.durationValue' },
            { hours: proposedChanges.proposedDuration }
          ),
        }}
      />
    ) : null;

  const finalOfferProposed =
    isFinalOfferPending && latestBusinessOffer?.amount != null ? (
      <FormattedMessage
        id="OfferDetailsCard.proposedLabel"
        values={{ value: `€${latestBusinessOffer.amount / 100}` }}
      />
    ) : null;

  const feeProposed = finalOfferProposed ? (
    finalOfferProposed
  ) : showProposedChanges && proposedOfferAmount != null && proposedOfferAmount !== offerAmount ? (
    <FormattedMessage
      id="OfferDetailsCard.proposedLabel"
      values={{ value: `€${proposedOfferAmount}` }}
    />
  ) : null;

  const Note = ({ label, value, proposed }) => (
    <div className={classNames(css.row, css.rowFull, { [css.rowChanged]: proposed })}>
      <dt className={css.rowLabel}>{label}</dt>
      <dd className={classNames(css.rowValue, css.noteValue, { [css.proposedValue]: proposed })}>
        {value}
      </dd>
    </div>
  );

  // Standalone: one SectionCard per section. Collapsible: groups inside the one "Offer" card.
  const Section = ({ title, children }) =>
    collapsible ? (
      <section className={css.group}>
        <h3 className={css.groupTitle}>{title}</h3>
        {children}
      </section>
    ) : (
      <SectionCard title={title}>{children}</SectionCard>
    );

  const proposedNoteId = hasProposedChanges
    ? 'OfferDetailsCard.proposedChangesBanner'
    : isFinalOfferPending && viewerRole === 'provider'
    ? 'OfferDetailsCard.proposedChangesBannerOrganizer'
    : null;
  const proposedNote = proposedNoteId ? (
    <p className={css.proposedNote}>
      <FormattedMessage id={proposedNoteId} />
    </p>
  ) : null;

  const sections = (
    <>
      <Section title={<FormattedMessage id="OfferDetailsCard.sectionEventDetails" />}>
        <dl className={css.rows}>
          <Row
            label={<FormattedMessage id="OfferDetailsCard.venueName" />}
            value={venueName || notProvided}
          />
          <Row
            label={<FormattedMessage id="OfferDetailsCard.location" />}
            value={eventLocation || notProvided}
          />
          <Row
            full
            label={<FormattedMessage id="OfferDetailsCard.eventName" />}
            value={eventName || notProvided}
          />
          <Row
            full
            label={<FormattedMessage id="OfferDetailsCard.date" />}
            value={formatDate(bookingDate)}
          />
          <Row
            label={<FormattedMessage id="OfferDetailsCard.startTime" />}
            value={displayedBookingStartTime || notProvided}
            proposed={startTimeProposed}
          />
          <Row
            label={<FormattedMessage id="OfferDetailsCard.endTime" />}
            value={bookingEndTime || notProvided}
          />
          <Row
            full
            label={<FormattedMessage id="OfferDetailsCard.expectedAttendance" />}
            value={expectedAttendance || notProvided}
          />
          {eventType ? (
            <Row
              label={<FormattedMessage id="OfferDetailsCard.eventType" />}
              value={intl.formatMessage({
                id: `RequestQuoteForm.eventType.${eventType.replace(/_([a-z])/g, (_, c) =>
                  c.toUpperCase()
                )}`,
                defaultMessage: eventType.replace(/_/g, ' '),
              })}
            />
          ) : null}
          {description ? (
            <Note
              label={<FormattedMessage id="OfferDetailsCard.eventDescription" />}
              value={description}
            />
          ) : null}
        </dl>
      </Section>

      <Section title={<FormattedMessage id="OfferDetailsCard.sectionSetDetails" />}>
        <dl className={css.rows}>
          {setTimeNeeded ? (
            <Row
              label={<FormattedMessage id="OfferDetailsCard.setTimeNeeded" />}
              value={formatSetTimeNeeded(setTimeNeeded)}
            />
          ) : null}
          <Row
            label={<FormattedMessage id="RequestQuoteForm.setStartTimeLabel" />}
            value={setStartTime || notProvided}
          />
          {durationHours ? (
            <Row
              label={<FormattedMessage id="OfferDetailsCard.duration" />}
              value={
                <FormattedMessage
                  id="OfferDetailsCard.durationValue"
                  values={{ hours: displayedDurationHours }}
                />
              }
              proposed={durationProposed}
            />
          ) : null}
          {previousDj ? (
            <Row label={<FormattedMessage id="OfferDetailsCard.previousDj" />} value={previousDj} />
          ) : null}
          <Row
            label={<FormattedMessage id="OfferDetailsCard.headliner" />}
            value={headliner || notProvided}
          />
        </dl>
      </Section>

      <Section title={<FormattedMessage id="OfferDetailsCard.sectionFeeLogistics" />}>
        <dl className={css.rows}>
          <Row
            full
            label={<FormattedMessage id="OfferDetailsCard.fee" />}
            value={
              isFinalOfferPending
                ? `€${finalOfferPreviousAmount}`
                : displayedOfferAmount != null
                ? `€${displayedOfferAmount}`
                : notProvided
            }
            proposed={feeProposed}
          />
          <Row
            label={<FormattedMessage id="OfferDetailsCard.travelIncluded" />}
            value={formatYesNo(travelIncluded)}
          />
          <Row
            label={<FormattedMessage id="OfferDetailsCard.accommodationIncluded" />}
            value={formatYesNo(accommodationIncluded)}
          />
          {showProposedChanges && proposedChanges?.proposedFeeNotes ? (
            <Note
              proposed
              label={<FormattedMessage id="OfferDetailsCard.proposedFeeNotes" />}
              value={proposedChanges.proposedFeeNotes}
            />
          ) : null}
        </dl>
      </Section>

      {hasTechnicalSection ? (
        <Section title={<FormattedMessage id="OfferDetailsCard.sectionTechnicalSetup" />}>
          <dl className={css.rows}>
            {deckSetupDisplay ? (
              <Row
                full
                label={<FormattedMessage id="OfferDetailsCard.deckSetup" />}
                value={deckSetupDisplay}
              />
            ) : technicalSetup ? (
              <Row
                full
                label={<FormattedMessage id="OfferDetailsCard.technicalSetup" />}
                value={technicalSetup}
              />
            ) : null}
            {boothMonitorsAvailable ? (
              <Row
                label={<FormattedMessage id="OfferDetailsCard.boothMonitors" />}
                value={formatYesNo(boothMonitorsAvailable)}
              />
            ) : null}
            {showProposedChanges && proposedChanges?.proposedNotes ? (
              <Note
                proposed
                label={<FormattedMessage id="OfferDetailsCard.proposedTechnicalNotes" />}
                value={proposedChanges.proposedNotes}
              />
            ) : null}
          </dl>
        </Section>
      ) : null}

      {includedDetails ? (
        <Section title={<FormattedMessage id="RequestQuoteForm.additionalNotesLabel" />}>
          <p className={css.noteValue}>{includedDetails}</p>
        </Section>
      ) : null}
    </>
  );

  if (!collapsible) {
    return (
      <div className={css.root}>
        {proposedNote}
        {sections}
      </div>
    );
  }

  const bodyId = `offerDetails-${transaction?.id?.uuid || 'body'}`;
  const headerSummary = [venueName, bookingDate ? formatDate(bookingDate) : null].filter(Boolean);

  return (
    <section className={css.offer}>
      <h2 className={css.offerHeading}>
        <button
          type="button"
          className={css.offerToggle}
          aria-expanded={isOpen}
          aria-controls={bodyId}
          onClick={() => setIsOpen(open => !open)}
        >
          <span className={css.offerTitles}>
            <span className={css.offerTitle}>
              <FormattedMessage id="OfferDetailsCard.offerSummaryTitle" />
            </span>
            {headerSummary.length > 0 ? (
              <span className={css.offerSummary}>
                {headerSummary.map((item, i) => (
                  <React.Fragment key={i}>
                    {i > 0 ? <span aria-hidden="true"> · </span> : null}
                    {item}
                  </React.Fragment>
                ))}
              </span>
            ) : null}
          </span>
          <ChevronDown
            className={classNames(css.offerChevron, { [css.offerChevronOpen]: isOpen })}
            size={20}
            strokeWidth={2}
            absoluteStrokeWidth
            aria-hidden="true"
          />
        </button>
      </h2>
      {proposedNote}
      <div id={bodyId} className={css.offerBody} hidden={!isOpen}>
        {sections}
      </div>
    </section>
  );
};

export default OfferDetailsCard;
