import React from 'react';

import { FormattedMessage, useIntl } from '../../../util/reactIntl';
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

  const intl = useIntl();

  const protectedData = transaction?.attributes?.protectedData || {};
  const listingTitle = transaction?.listing?.attributes?.title || '';

  const {
    bookingDate,
    bookingStartTime,
    bookingEndTime,
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

  const hasProposedChanges = proposedChanges && Object.keys(proposedChanges).length > 0;

  const notProvided = (
    <span className={css.notProvided}>
      <FormattedMessage id="OfferDetailsCard.notProvided" />
    </span>
  );

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
    return messageId
      ? intl.formatMessage({ id: messageId })
      : val;
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
    deckSetupDisplay ||
    boothMonitorsAvailable ||
    soundSystem ||
    technicalSetup ||
    additionalNotes ||
    proposedChanges?.proposedNotes;

  const ProposedValue = ({ children }) => (
    <span className={css.proposedValue}>{children}</span>
  );

  return (
    <div className={css.root}>
      {/* Proposed changes banner */}
      {hasProposedChanges ? (
        <div className={css.proposedBanner}>
          <FormattedMessage id="OfferDetailsCard.proposedChangesBanner" />
        </div>
      ) : null}

      {/* Set details */}
      <div className={css.section}>
        <h3 className={css.sectionTitle}>
          <FormattedMessage id="OfferDetailsCard.sectionSetDetails" />
        </h3>
        <div className={css.row}>
          <span className={css.rowLabel}>
            <FormattedMessage id="OfferDetailsCard.date" />
          </span>
          <span className={css.rowValue}>{formatDate(bookingDate)}</span>
        </div>
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
            <FormattedMessage id="OfferDetailsCard.startTime" />
          </span>
          <div className={css.rowValueStack}>
            <span className={css.rowValue}>{bookingStartTime || notProvided}</span>
            {proposedChanges?.proposedStartTime &&
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
        {bookingEndTime ? (
          <div className={css.row}>
            <span className={css.rowLabel}>
              <FormattedMessage id="OfferDetailsCard.endTime" />
            </span>
            <span className={css.rowValue}>{bookingEndTime}</span>
          </div>
        ) : null}
        {durationHours ? (
          <div className={css.row}>
            <span className={css.rowLabel}>
              <FormattedMessage id="OfferDetailsCard.duration" />
            </span>
            <div className={css.rowValueStack}>
              <span className={css.rowValue}>
                <FormattedMessage
                  id="OfferDetailsCard.durationValue"
                  values={{ hours: durationHours }}
                />
              </span>
              {proposedChanges?.proposedDuration &&
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

      {/* Event details */}
      <div className={css.section}>
        <h3 className={css.sectionTitle}>
          <FormattedMessage id="OfferDetailsCard.sectionEventDetails" />
        </h3>
        <div className={css.row}>
          <span className={css.rowLabel}>
            <FormattedMessage id="OfferDetailsCard.eventName" />
          </span>
          <span className={css.rowValue}>{eventName || notProvided}</span>
        </div>
        <div className={css.row}>
          <span className={css.rowLabel}>
            <FormattedMessage id="OfferDetailsCard.eventType" />
          </span>
          <span className={css.rowValue}>
            {eventType
              ? intl.formatMessage({
                  id: `RequestQuoteForm.eventType.${eventType.replace(/_([a-z])/g, (_, c) => c.toUpperCase())}`,
                  defaultMessage: eventType.replace(/_/g, ' '),
                })
              : notProvided}
          </span>
        </div>
        <div className={css.row}>
          <span className={css.rowLabel}>
            <FormattedMessage id="OfferDetailsCard.expectedAttendance" />
          </span>
          <span className={css.rowValue}>{expectedAttendance || notProvided}</span>
        </div>
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
        {description ? (
          <div className={css.descriptionBlock}>
            <p className={css.descriptionLabel}>
              <FormattedMessage id="OfferDetailsCard.eventDescription" />
            </p>
            <p className={css.descriptionValue}>{description}</p>
          </div>
        ) : null}
      </div>

      {/* Fee & logistics */}
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
              {offerAmount != null ? `€${offerAmount}` : notProvided}
            </span>
            {proposedChanges?.proposedFee &&
              proposedChanges.proposedFee !== offerAmount ? (
              <ProposedValue>
                <FormattedMessage
                  id="OfferDetailsCard.proposedLabel"
                  values={{ value: `€${proposedChanges.proposedFee}` }}
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
        {includedDetails ? (
          <div className={css.descriptionBlock}>
            <p className={css.descriptionLabel}>
              <FormattedMessage id="OfferDetailsCard.additionalInclusions" />
            </p>
            <p className={css.descriptionValue}>{includedDetails}</p>
          </div>
        ) : null}
        {proposedChanges?.proposedFeeNotes ? (
          <div className={css.descriptionBlock}>
            <p className={css.descriptionLabelProposed}>
              <FormattedMessage id="OfferDetailsCard.proposedFeeNotes" />
            </p>
            <p className={css.proposedDescriptionValue}>{proposedChanges.proposedFeeNotes}</p>
          </div>
        ) : null}
      </div>

      {/* Technical setup */}
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
          {proposedChanges?.proposedNotes ? (
            <div className={css.descriptionBlock}>
              <p className={css.descriptionLabelProposed}>
                <FormattedMessage id="OfferDetailsCard.proposedTechnicalNotes" />
              </p>
              <p className={css.proposedDescriptionValue}>{proposedChanges.proposedNotes}</p>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

export default OfferDetailsCard;
