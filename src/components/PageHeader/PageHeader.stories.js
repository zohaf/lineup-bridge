import React from 'react';

import { FormattedMessage } from '../../util/reactIntl';

import PageHeader from './PageHeader';

// Text as used in StripePayoutPage, EditListingPhotosPanel and RequestQuotePage. The image is a
// placeholder square: on the pages it is the listing's first photo.
const image = <div style={{ width: '100%', height: '100%', background: 'var(--colorGrey100)' }} />;

export default {
  title: 'Components/PageHeader',
  component: PageHeader,
};

export const TitleOnly = {
  args: { title: <FormattedMessage id="StripePayoutPage.heading" /> },
};

export const WithLead = {
  args: {
    title: <FormattedMessage id="EditListingWizard.tabLabelPhotos" />,
    lead: <FormattedMessage id="EditListingPhotosPanel.intro" />,
  },
};

// On RequestQuotePage the eyebrow is the DJ's listing title (data), so it is left out here.
export const WithImage = {
  args: {
    image,
    title: <FormattedMessage id="RequestQuotePage.heading" />,
    lead: <FormattedMessage id="RequestQuotePage.helperText" />,
  },
};
