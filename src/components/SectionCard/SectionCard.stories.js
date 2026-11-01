import React from 'react';

import { FormattedMessage } from '../../util/reactIntl';

import SectionCard from './SectionCard';

// Titles as used in RequestQuoteForm and EditListingDetailsForm. The content box is a placeholder.
const content = <div style={{ height: 120, background: 'var(--colorGrey50)' }} />;

export default {
  title: 'Components/SectionCard',
  component: SectionCard,
};

export const Numbered = {
  args: {
    number: 1,
    title: <FormattedMessage id="RequestQuoteForm.sectionEventDetails" />,
    children: content,
  },
};

export const TitleOnly = {
  args: {
    title: <FormattedMessage id="EditListingDetailsForm.sectionLinks" />,
    children: content,
  },
};

export const NoTitle = {
  args: { children: content },
};
