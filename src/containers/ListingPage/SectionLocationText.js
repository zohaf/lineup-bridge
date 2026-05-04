import React from 'react';

import { FormattedMessage } from '../../util/reactIntl';
import { Heading } from '../../components';

import css from './ListingPage.module.css';

/**
 * Renders listing location as plain text (address) when available.
 *
 * @param {Object} props
 * @param {Object} [props.publicData] - Listing publicData
 * @param {string} [props.className] - Optional section className
 * @returns {JSX.Element|null}
 */
const SectionLocationText = props => {
  const { publicData, className } = props;
  const address = publicData?.location?.address;
  if (!address || !String(address).trim()) {
    return null;
  }

  return (
    <section className={className || css.sectionLocationText} id="listing-location">
      <Heading as="h2" rootClassName={css.sectionHeadingWithExtraMargin}>
        <FormattedMessage id="ListingPage.locationTitle" />
      </Heading>
      <p className={css.locationAddressText}>{address}</p>
    </section>
  );
};

export default SectionLocationText;
