import React from 'react';

// Import contexts and util modules
import { FormattedMessage } from '../../util/reactIntl';
import { createSlug } from '../../util/urlHelpers';

// Import shared components
import { NamedLink } from '../../components';

/** Listing title as a link to the listing page, shown as the page header eyebrow. */
export const HeadingDetails = props => {
  const { listing, listingTitle } = props;

  const listingTitleLink = (
    <NamedLink
      name="ListingPage"
      params={{ id: listing?.id?.uuid, slug: createSlug(listingTitle) }}
    >
      {listingTitle}
    </NamedLink>
  );

  return (
    <FormattedMessage
      id="RequestQuotePage.listingTitle"
      values={{ listingTitle: listingTitleLink }}
    />
  );
};

export default HeadingDetails;
