import React from 'react';

import { FormattedMessage } from '../../util/reactIntl';

import NoticeBanner from './NoticeBanner';

// Text as used in AccountSettingsPage (payout setup for DJs).
export default {
  title: 'Components/NoticeBanner',
  component: NoticeBanner,
};

export const WithAction = {
  args: {
    title: <FormattedMessage id="Home.completePayoutTitleDj" />,
    message: <FormattedMessage id="Home.completePayoutMessageDj" />,
    actionLabel: <FormattedMessage id="Home.pendingApprovalCtaDj" />,
    actionLinkProps: { name: 'StripePayoutPage' },
  },
};

export const WithoutAction = {
  args: {
    title: <FormattedMessage id="Home.completePayoutTitleDj" />,
    message: <FormattedMessage id="Home.completePayoutMessageDj" />,
  },
};
