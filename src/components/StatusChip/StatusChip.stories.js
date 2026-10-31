import React from 'react';

import { FormattedMessage } from '../../util/reactIntl';

import StatusChip from './StatusChip';

// Text and tones as used in the Home activity list (CMSPage).
export default {
  title: 'Components/StatusChip',
  component: StatusChip,
  argTypes: { tone: { control: 'inline-radio', options: ['neutral', 'active', 'success'] } },
};

export const Neutral = {
  args: { tone: 'neutral', children: <FormattedMessage id="Home.activityYouResponded" /> },
};

export const Active = {
  args: { tone: 'active', children: <FormattedMessage id="Home.activityNeedsYourAction" /> },
};

export const Success = {
  args: { tone: 'success', children: <FormattedMessage id="Home.activityFinalOfferAccepted" /> },
};
