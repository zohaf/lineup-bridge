import React from 'react';

import { FormattedMessage, useIntl } from '../../../util/reactIntl';
import {
  getBusinessOfferType,
  getLatestBusinessOffer,
  transitions,
} from '../../../transactions/transactionProcessNegotiation';
import css from './OfferDetailsCard.module.css';

/**
 * Read-only display of the customer's offer details, structured into sections.
 * When proposedChanges exist in protectedData, they are rendered in red
 * alongside the original values so the customer can compare.
 *
 * @param {Object} props
 * @param {Object} props.transaction - The Sharetribe transaction entity.
 * @param {Object} props.customer - The customer user entity.
 */
const OfferDetailsCard = props => {
  const { transaction, customer } = props;

  const { showProposedChanges = true } = props;
  const intl = useIntl();

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
  const isReceivedDjCounterOffer =
    latestBusinessOffer?.by === 'provider' &&
    latestBusinessOffer?.transition === transitions.PROVIDER_MAKE_COUNTER_OFFER &&
    latestBusinessOfferType === 'counter-offer';
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

  return (
    <div className={css.root}>
      {hasProposedChanges ? (
        <div className={css.proposedBanner}>
          <FormattedMessage id="OfferDetailsCard.proposedChangesBanner" />
        </div>
      ) : null}

      <div className={css.section}>
        <h3 className={css.sectionTitle}>
          <FormattedMessage id="OfferDetailsCard.sectionEventDetails" />
        </h3>
        <div className={css.row}>
          <span className={css.rowLabel}>
            <FormattedMessage id="OfferDetailsCard.venueName" />
          </span>
          <span className={css.rowValue}>{venueName || notProvided}</span>
        </div>
        <div className={css.row}>
          <span className={css.rowLabel}>
            <FormattedMessage id="OfferDetailsCard.location" />
          </span>
          <span className={css.rowValue}>{eventLocation || notProvided}</span>
        </div>
        <div className={css.row}>
          <span className={css.rowLabel}>
            <FormattedMessage id="OfferDetailsCard.eventName" />
          </span>
          <span className={css.rowValue}>{eventName || notProvided}</span>
        </div>
        <div className={css.row}>
          <span className={css.rowLabel}>
            <FormattedMessage id="OfferDetailsCard.date" />
          </span>
          <span className={css.rowValue}>{formatDate(bookingDate)}</span>
        </div>
        <div className={css.row}>
          <span className={css.rowLabel}>
            <FormattedMessage id="OfferDetailsCard.startTime" />
          </span>
          <div className={css.rowValueStack}>
            <span className={css.rowValue}>{displayedBookingStartTime || notProvided}</span>
            {showProposedChanges &&
            proposedChanges?.proposedStartTime &&
            proposedChanges.proposedStartTime !== bookingStartTime ? (
              <ProposedValue>
                <FormattedMessage
                  id="OfferDetailsCard.proposedLabel"
                  values={{ value: proposedChanges.proposedStartTime }}
                />
              </ProposedValue>
            ) : null}
          </div>
        </div>
        <div className={css.row}>
          <span className={css.rowLabel}>
            <FormattedMessage id="OfferDetailsCard.endTime" />
          </span>
          <span className={css.rowValue}>{bookingEndTime || notProvided}</span>
        </div>
        <div className={css.row}>
          <span className={css.rowLabel}>
            <FormattedMessage id="OfferDetailsCard.expectedAttendance" />
          </span>
          <span className={css.rowValue}>{expectedAttendance || notProvided}</span>
        </div>
        {eventType ? (
          <div className={css.row}>
            <span className={css.rowLabel}>
              <FormattedMessage id="OfferDetailsCard.eventType" />
            </span>
            <span className={css.rowValue}>
              {intl.formatMessage({
                id: `RequestQuoteForm.eventType.${eventType.replace(/_([a-z])/g, (_, c) =>
                  c.toUpperCase()
                )}`,
                defaultMessage: eventType.replace(/_/g, ' '),
              })}
            </span>
          </div>
        ) : null}
        {description ? (
          <div className={css.descriptionBlock}>
            <p className={css.descriptionLabel}>
              <FormattedMessage id="OfferDetailsCard.eventDescription" />
            </p>
            <p className={css.descriptionValue}>{description}</p>
          </div>
        ) : null}
      </div>

      <div className={css.section}>
        <h3 className={css.sectionTitle}>
          <FormattedMessage id="OfferDetailsCard.sectionSetDetails" />
        </h3>
        {setTimeNeeded ? (
          <div className={css.row}>
            <span className={css.rowLabel}>
              <FormattedMessage id="OfferDetailsCard.setTimeNeeded" />
            </span>
            <span className={css.rowValue}>{formatSetTimeNeeded(setTimeNeeded)}</span>
          </div>
        ) : null}
        <div className={css.row}>
          <span className={css.rowLabel}>
            <FormattedMessage id="RequestQuoteForm.setStartTimeLabel" />
          </span>
          <span className={css.rowValue}>{setStartTime || notProvided}</span>
        </div>
        {durationHours ? (
          <div className={css.row}>
            <span className={css.rowLabel}>
              <FormattedMessage id="OfferDetailsCard.duration" />
            </span>
            <div className={css.rowValueStack}>
              <span className={css.rowValue}>
                <FormattedMessage
                  id="OfferDetailsCard.durationValue"
                  values={{ hours: displayedDurationHours }}
                />
              </span>
              {showProposedChanges &&
              proposedChanges?.proposedDuration &&
              proposedChanges.proposedDuration !== durationHours ? (
                <ProposedValue>
                  <FormattedMessage
                    id="OfferDetailsCard.proposedLabel"
                    values={{
                      value: intl.formatMessage(
                        { id: 'OfferDetailsCard.durationValue' },
                        { hours: proposedChanges.proposedDuration }
                      ),
                    }}
                  />
                </ProposedValue>
              ) : null}
            </div>
          </div>
        ) : null}
        {previousDj ? (
          <div className={css.row}>
            <span className={css.rowLabel}>
              <FormattedMessage id="OfferDetailsCard.previousDj" />
            </span>
            <span className={css.rowValue}>{previousDj}</span>
          </div>
        ) : null}
        <div className={css.row}>
          <span className={css.rowLabel}>
            <FormattedMessage id="OfferDetailsCard.headliner" />
          </span>
          <span className={css.rowValue}>{headliner || notProvided}</span>
        </div>
      </div>

      <div className={css.section}>
        <h3 className={css.sectionTitle}>
          <FormattedMessage id="OfferDetailsCard.sectionFeeLogistics" />
        </h3>
        <div className={css.row}>
          <span className={css.rowLabel}>
            <FormattedMessage id="OfferDetailsCard.fee" />
          </span>
          <div className={css.rowValueStack}>
            <span className={css.rowValueFee}>
              {displayedOfferAmount != null ? `€${displayedOfferAmount}` : notProvided}
            </span>
            {showProposedChanges &&
            proposedOfferAmount != null &&
            proposedOfferAmount !== offerAmount ? (
              <ProposedValue>
                <FormattedMessage
                  id="OfferDetailsCard.proposedLabel"
                  values={{ value: `€${proposedOfferAmount}` }}
                />
              </ProposedValue>
            ) : null}
          </div>
        </div>
        <div className={css.row}>
          <span className={css.rowLabel}>
            <FormattedMessage id="OfferDetailsCard.travelIncluded" />
          </span>
          <span className={css.rowValue}>{formatYesNo(travelIncluded)}</span>
        </div>
        <div className={css.row}>
          <span className={css.rowLabel}>
            <FormattedMessage id="OfferDetailsCard.accommodationIncluded" />
          </span>
          <span className={css.rowValue}>{formatYesNo(accommodationIncluded)}</span>
        </div>
        {showProposedChanges && proposedChanges?.proposedFeeNotes ? (
          <div className={css.descriptionBlock}>
            <p className={css.descriptionLabelProposed}>
              <FormattedMessage id="OfferDetailsCard.proposedFeeNotes" />
            </p>
            <p className={css.proposedDescriptionValue}>{proposedChanges.proposedFeeNotes}</p>
          </div>
        ) : null}
      </div>

      {hasTechnicalSection ? (
        <div className={css.section}>
          <h3 className={css.sectionTitle}>
            <FormattedMessage id="OfferDetailsCard.sectionTechnicalSetup" />
          </h3>
          {deckSetupDisplay ? (
            <div className={css.row}>
              <span className={css.rowLabel}>
                <FormattedMessage id="OfferDetailsCard.deckSetup" />
              </span>
              <span className={css.rowValue}>{deckSetupDisplay}</span>
            </div>
          ) : technicalSetup ? (
            <div className={css.row}>
              <span className={css.rowLabel}>
                <FormattedMessage id="OfferDetailsCard.technicalSetup" />
              </span>
              <span className={css.rowValue}>{technicalSetup}</span>
            </div>
          ) : null}
          {boothMonitorsAvailable ? (
            <div className={css.row}>
              <span className={css.rowLabel}>
                <FormattedMessage id="OfferDetailsCard.boothMonitors" />
              </span>
              <span className={css.rowValue}>{formatYesNo(boothMonitorsAvailable)}</span>
            </div>
          ) : null}
          {showProposedChanges && proposedChanges?.proposedNotes ? (
            <div className={css.descriptionBlock}>
              <p className={css.descriptionLabelProposed}>
                <FormattedMessage id="OfferDetailsCard.proposedTechnicalNotes" />
              </p>
              <p className={css.proposedDescriptionValue}>{proposedChanges.proposedNotes}</p>
            </div>
          ) : null}
        </div>
      ) : null}

      {includedDetails ? (
        <div className={css.section}>
          <h3 className={css.sectionTitle}>
            <FormattedMessage id="RequestQuoteForm.additionalNotesLabel" />
          </h3>
          <div className={css.descriptionBlock}>
            <p className={css.descriptionValue}>{includedDetails}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default OfferDetailsCard;
